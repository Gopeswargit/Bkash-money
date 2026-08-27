import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Video, 
  Tv, 
  Users, 
  Heart, 
  Send, 
  MessageSquare, 
  Sparkles, 
  X, 
  Play, 
  StopCircle, 
  Share2, 
  Eye, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LiveStreamSession, LiveStreamMessage } from '../types';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  increment, 
  serverTimestamp, 
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentSimCategory?: string;
  onOpenProfile?: (uid: string) => void;
}

export const LiveStreamingHub: React.FC<Props> = ({
  isOpen,
  onClose,
  currentSimCategory = 'robotics',
  onOpenProfile
}) => {
  const { currentUser, userProfile } = useAuth();
  
  // Streaming state
  const [activeStreams, setActiveStreams] = useState<LiveStreamSession[]>([]);
  const [currentStream, setCurrentStream] = useState<LiveStreamSession | null>(null);
  const [isHosting, setIsHosting] = useState<boolean>(false);
  
  // Host broadcast setup
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [streamCategory, setStreamCategory] = useState(currentSimCategory);
  const [isWebcamActive, setIsWebcamActive] = useState(true);
  const [isMicActive, setIsMicActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'watch' | 'create'>('watch');

  // Interactive Live Chat
  const [chatMessages, setChatMessages] = useState<LiveStreamMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Local media stream refs
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // 1. Listen for active live streams
  useEffect(() => {
    if (!isOpen) return;

    const streamsRef = collection(db, 'liveStreams');
    const q = query(streamsRef, where('status', '==', 'live'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const streams: LiveStreamSession[] = [];
      snapshot.forEach(docSnap => {
        streams.push({ id: docSnap.id, ...docSnap.data() } as LiveStreamSession);
      });
      // Sort newest first
      streams.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setActiveStreams(streams);

      // If user is watching a stream, keep current updated
      if (currentStream) {
        const found = streams.find(s => s.id === currentStream.id);
        if (found) {
          setCurrentStream(found);
        }
      }
    });

    return () => unsubscribe();
  }, [isOpen, currentStream?.id]);

  // 2. Listen for chat messages when watching/hosting a stream
  useEffect(() => {
    if (!currentStream) {
      setChatMessages([]);
      return;
    }

    const msgsRef = collection(db, 'liveStreamMessages');
    const q = query(
      msgsRef, 
      where('streamId', '==', currentStream.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: LiveStreamMessage[] = [];
      snapshot.forEach(docSnap => {
        msgs.push({ id: docSnap.id, ...docSnap.data() } as LiveStreamMessage);
      });
      msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setChatMessages(msgs);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [currentStream?.id]);

  // 3. Handle camera preview for host
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isWebcamActive,
        audio: isMicActive
      });
      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn('Camera access not granted or unavailable:', e);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Start Live Streaming as Host
  const handleStartBroadcast = async () => {
    if (!currentUser) return;
    if (!streamTitle.trim()) return;

    try {
      const newStreamData = {
        hostId: currentUser.uid,
        hostName: userProfile?.displayName || currentUser.displayName || 'হোস্ট গবেষক',
        hostPhoto: userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`,
        title: streamTitle.trim(),
        description: streamDescription.trim(),
        category: streamCategory,
        simulationType: streamCategory,
        status: 'live',
        streamType: isWebcamActive ? 'webcam' : 'simulation_sync',
        viewerCount: 1,
        likesCount: 0,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'liveStreams'), newStreamData);
      const createdStream: LiveStreamSession = { id: docRef.id, ...newStreamData as any };
      
      setCurrentStream(createdStream);
      setIsHosting(true);
      setActiveTab('watch');
      
      // Start camera
      await startCamera();

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Error starting live stream:', err);
    }
  };

  // Stop Live Broadcast
  const handleEndBroadcast = async () => {
    if (!currentStream) return;
    try {
      await updateDoc(doc(db, 'liveStreams', currentStream.id), {
        status: 'ended'
      });
      stopCamera();
      setIsHosting(false);
      setCurrentStream(null);
    } catch (e) {
      console.error('Error ending stream:', e);
    }
  };

  // Send Live Chat Message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !currentStream || !currentUser) return;

    try {
      const msgData: Omit<LiveStreamMessage, 'id'> = {
        streamId: currentStream.id,
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || currentUser.displayName || 'অতিথি',
        senderPhoto: userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`,
        message: inputMsg.trim(),
        type: 'chat',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'liveStreamMessages'), msgData);
      setInputMsg('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Send Live Heart/Reaction
  const handleSendHeart = async () => {
    if (!currentStream) return;
    try {
      await updateDoc(doc(db, 'liveStreams', currentStream.id), {
        likesCount: increment(1)
      });
      confetti({ particleCount: 20, spread: 45, origin: { x: 0.8, y: 0.7 } });
    } catch (e) {
      console.error('Heart error:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  ম্যাথ ও সিমুলেশন লাইভ স্ট্রিমিং হাব
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>{activeStreams.length} টি লাইভ চলছে</span>
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                অন্যান্য গবেষকদের লাইভ গবেষণা দেখুন অথবা নিজে লাইভ ব্রডকাস্ট শুরু করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setActiveTab('watch')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'watch' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                লাইভ রুমসমূহ
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  activeTab === 'create' ? 'bg-rose-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>লাইভে যান</span>
              </button>
            </div>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* TAB 1: WATCHING OR HOSTING STREAM */}
          {activeTab === 'watch' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Main Player & Details */}
              <div className="lg:col-span-2 space-y-4">
                {currentStream ? (
                  <div className="space-y-4">
                    {/* Live Player Screen */}
                    <div className="relative aspect-video rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center shadow-inner">
                      {isHosting ? (
                        <video
                          ref={videoPreviewRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-neutral-900 via-indigo-950/40 to-neutral-900 flex flex-col items-center justify-center p-6 text-center space-y-3">
                          <div className="w-16 h-16 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
                            <Radio className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white">{currentStream.title}</h4>
                            <p className="text-xs text-neutral-400 mt-1">
                              হোস্ট: <strong className="text-indigo-400">{currentStream.hostName}</strong> ({currentStream.category.toUpperCase()})
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Top Badges overlay */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[11px] font-bold tracking-wider flex items-center gap-1 shadow">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <span>LIVE</span>
                        </span>
                        <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                          <Eye className="w-3 h-3 text-neutral-300" />
                          <span>{currentStream.viewerCount || 1} দর্শক</span>
                        </span>
                      </div>

                      {/* Bottom Floating Reaction */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <button
                          onClick={handleSendHeart}
                          className="p-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 transition-transform active:scale-125 flex items-center gap-1 font-bold text-xs"
                        >
                          <Heart className="w-4 h-4 fill-white" />
                          <span>{currentStream.likesCount || 0}</span>
                        </button>
                      </div>
                    </div>

                    {/* Stream Info & Controls */}
                    <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentStream.hostPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentStream.hostId}`}
                          alt={currentStream.hostName}
                          onClick={() => onOpenProfile && onOpenProfile(currentStream.hostId)}
                          className="w-11 h-11 rounded-xl bg-neutral-800 border border-neutral-700 cursor-pointer hover:border-indigo-500 transition-colors"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{currentStream.title}</h4>
                          <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                            <span 
                              onClick={() => onOpenProfile && onOpenProfile(currentStream.hostId)}
                              className="text-indigo-400 hover:underline cursor-pointer font-medium"
                            >
                              {currentStream.hostName}
                            </span>
                            <span>•</span>
                            <span className="text-neutral-500">ক্যাটাগরি: {currentStream.category}</span>
                          </p>
                        </div>
                      </div>

                      {isHosting ? (
                        <button
                          onClick={handleEndBroadcast}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
                        >
                          <StopCircle className="w-4 h-4" />
                          <span>লাইভ সমাপ্ত করুন</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentStream(null)}
                          className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold"
                        >
                          অন্যান্য লাইভে যান
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* List of all active streams */
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Tv className="w-4 h-4 text-rose-400" />
                      <span>চলমান লাইভ স্ট্রীম ও সিমুলেশন শো ({activeStreams.length})</span>
                    </h4>

                    {activeStreams.length === 0 ? (
                      <div className="py-14 text-center bg-neutral-900/50 rounded-2xl border border-neutral-800/80 space-y-3">
                        <Radio className="w-10 h-10 mx-auto text-neutral-600" />
                        <p className="text-sm text-neutral-400">বর্তমানে কোনো লাইভ স্ট্রীম চলছে না।</p>
                        <button
                          onClick={() => setActiveTab('create')}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
                        >
                          প্রথম লাইভ স্ট্রিমার হিসেবে শুরু করুন
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeStreams.map(stream => (
                          <div
                            key={stream.id}
                            onClick={() => setCurrentStream(stream)}
                            className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer group space-y-3 shadow-lg"
                          >
                            <div className="relative aspect-video rounded-xl bg-neutral-950 flex items-center justify-center overflow-hidden border border-neutral-800/80">
                              <Radio className="w-8 h-8 text-rose-500 animate-pulse group-hover:scale-110 transition-transform" />
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                                LIVE
                              </div>
                              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-neutral-300 text-[10px]">
                                {stream.category}
                              </div>
                            </div>

                            <div>
                              <h5 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                                {stream.title}
                              </h5>
                              <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
                                <span>হোস্ট:</span>
                                <strong className="text-neutral-300">{stream.hostName}</strong>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Col: Live Chat & Real-Time Interaction */}
              <div className="flex flex-col h-[480px] bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden">
                
                {/* Chat Header */}
                <div className="p-3.5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">লাইভ স্ট্রীম চ্যাট</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">রিয়েল-টাইম</span>
                </div>

                {/* Messages Box */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                  {!currentStream ? (
                    <div className="h-full flex items-center justify-center text-center text-neutral-500 text-xs px-4">
                      লাইভ চ্যাটে অংশ নিতে একটি স্ট্রীম সিলেক্ট করুন
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-neutral-500 text-xs px-4">
                      এখনো কোনো চ্যাট বার্তা নেই। প্রথম মেসেজটি আপনিই পাঠান!
                    </div>
                  ) : (
                    chatMessages.map(msg => (
                      <div key={msg.id} className="flex items-start gap-2 bg-neutral-950/60 p-2 rounded-xl border border-neutral-850">
                        <img
                          src={msg.senderPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.senderId}`}
                          alt={msg.senderName}
                          onClick={() => onOpenProfile && onOpenProfile(msg.senderId)}
                          className="w-6 h-6 rounded-full bg-neutral-800 cursor-pointer"
                        />
                        <div className="flex-1 leading-tight">
                          <div className="flex items-center justify-between">
                            <span 
                              onClick={() => onOpenProfile && onOpenProfile(msg.senderId)}
                              className="text-[11px] font-bold text-indigo-300 hover:underline cursor-pointer"
                            >
                              {msg.senderName}
                            </span>
                            <span className="text-[9px] text-neutral-600">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-200 mt-1">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input */}
                {currentStream && (
                  <form onSubmit={handleSendChat} className="p-2.5 border-t border-neutral-800 bg-neutral-950 flex items-center gap-2">
                    <input
                      type="text"
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      placeholder={currentUser ? "বার্তা লিখুন..." : "চ্যাট করতে লগইন প্রয়োজন"}
                      disabled={!currentUser}
                      className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!currentUser || !inputMsg.trim()}
                      className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}

              </div>

            </div>
          )}

          {/* TAB 2: CREATE / GO LIVE BROADCAST */}
          {activeTab === 'create' && (
            <div className="max-w-xl mx-auto space-y-5 py-4">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-white">লাইভ স্ট্রীম সেটআপ করুন</h4>
                <p className="text-xs text-neutral-400">
                  আপনার ক্যামেরা, স্ক্রিন বা লাইভ সিমুলেশন অডিয়েন্সের সাথে ব্রডকাস্ট করুন
                </p>
              </div>

              {!currentUser ? (
                <div className="p-6 text-center bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                  <AlertCircle className="w-8 h-8 mx-auto text-amber-400" />
                  <p className="text-sm text-neutral-300">
                    লাইভ স্ট্রিম শুরু করতে আপনাকে অবশ্যই একাউন্টে লগইন বা রেজিস্ট্রেশন করতে হবে।
                  </p>
                </div>
              ) : (
                <div className="space-y-4 bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">স্ট্রীমের শিরোনাম (Title)</label>
                    <input
                      type="text"
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                      placeholder="যেমন: রোবোটিক্স ইনভার্স কাইনামেটিক্স লাইভ ডেমো"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-300">সিমুলেশন ক্যাটাগরি</label>
                      <select
                        value={streamCategory}
                        onChange={(e) => setStreamCategory(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-rose-500"
                      >
                        <option value="robotics">Robotics & IK</option>
                        <option value="mechanics">Mechanics & Chaos</option>
                        <option value="matrix">Linear Algebra & Matrix</option>
                        <option value="trigonometry">Trigonometry Lab</option>
                        <option value="calculus_ode_pde">Calculus & ODEs</option>
                        <option value="fourier">Fourier Harmonics</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-neutral-300">ক্যামেরা ও মিডিয়া মোড</label>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsWebcamActive(!isWebcamActive)}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                            isWebcamActive ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          {isWebcamActive ? <Camera className="w-3.5 h-3.5 text-emerald-400" /> : <CameraOff className="w-3.5 h-3.5" />}
                          <span>ক্যামেরা {isWebcamActive ? 'চালু' : 'বন্ধ'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-300">বর্ণনা (Optional)</label>
                    <textarea
                      rows={2}
                      value={streamDescription}
                      onChange={(e) => setStreamDescription(e.target.value)}
                      placeholder="দর্শকদের জন্য আজকের গবেষণার সংক্ষিপ্ত বিষয়..."
                      className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    onClick={handleStartBroadcast}
                    disabled={!streamTitle.trim()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>এখনই লাইভ ব্রডকাস্ট শুরু করুন</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
