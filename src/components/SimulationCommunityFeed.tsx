import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Heart, 
  MessageSquare, 
  Share2, 
  PlusCircle, 
  Sparkles, 
  Send, 
  Code2, 
  Play, 
  Video, 
  Image as ImageIcon, 
  X, 
  Flame, 
  Check, 
  ExternalLink,
  Sliders,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CommunityPost, PostComment } from '../types';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  arrayUnion, 
  arrayRemove, 
  increment,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import confetti from 'canvas-confetti';

interface Props {
  onOpenSimulation?: (simType: string, customCode?: string) => void;
  onOpenProfile?: (uid: string) => void;
  onOpenAuthModal?: () => void;
  onOpenLiveStream?: () => void;
}

export const SimulationCommunityFeed: React.FC<Props> = ({
  onOpenSimulation,
  onOpenProfile,
  onOpenAuthModal,
  onOpenLiveStream
}) => {
  const { currentUser, userProfile } = useAuth();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Post form state
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('robotics');
  const [postMediaType, setPostMediaType] = useState<'simulation' | 'video' | 'text' | 'code'>('simulation');
  const [postVideoUrl, setPostVideoUrl] = useState('');
  const [postCodeSnippet, setPostCodeSnippet] = useState('');

  // Comment Modal state
  const [activeCommentPost, setActiveCommentPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // 1. Listen for posts stream in real-time
  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, limit(30));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: CommunityPost[] = [];
      snapshot.forEach((d) => {
        loaded.push({ id: d.id, ...d.data() } as CommunityPost);
      });
      // Sort client side
      loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(loaded);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Listen for comments when a post is opened
  useEffect(() => {
    if (!activeCommentPost) {
      setComments([]);
      return;
    }

    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('postId', '==', activeCommentPost.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: PostComment[] = [];
      snapshot.forEach(d => {
        loaded.push({ id: d.id, ...d.data() } as PostComment);
      });
      loaded.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setComments(loaded);
    });

    return () => unsubscribe();
  }, [activeCommentPost?.id]);

  // Create new Post
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    if (!postContent.trim()) return;

    try {
      const newPostData = {
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || currentUser.displayName || 'গবেষক',
        authorPhoto: userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`,
        authorTitle: userProfile?.title || 'সিমুলেশন ক্রিয়েটর',
        content: postContent.trim(),
        category: postCategory,
        mediaType: postMediaType,
        mediaUrl: postMediaType === 'video' ? postVideoUrl.trim() : undefined,
        simulationType: postMediaType === 'simulation' ? postCategory : undefined,
        simulationCode: postMediaType === 'code' ? postCodeSnippet.trim() : undefined,
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'posts'), newPostData);
      
      // Reset form
      setPostContent('');
      setPostVideoUrl('');
      setPostCodeSnippet('');
      setIsCreatingPost(false);
      
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  // Toggle Like
  const handleToggleLike = async (post: CommunityPost) => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    const postRef = doc(db, 'posts', post.id);
    const hasLiked = post.likes && post.likes.includes(currentUser.uid);

    try {
      if (hasLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid),
          likesCount: increment(-1)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid),
          likesCount: increment(1)
        });
        confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Share Post
  const handleSharePost = async (post: CommunityPost) => {
    const link = `${window.location.origin}/?post=${post.id}`;
    navigator.clipboard.writeText(link);
    setCopiedPostId(post.id);
    setTimeout(() => setCopiedPostId(null), 2000);

    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        sharesCount: increment(1)
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    if (!commentInput.trim() || !activeCommentPost) return;

    try {
      const commentData = {
        postId: activeCommentPost.id,
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || currentUser.displayName || 'গবেষক',
        authorPhoto: userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`,
        content: commentInput.trim(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'comments'), commentData);
      
      // Increment comment count on post
      await updateDoc(doc(db, 'posts', activeCommentPost.id), {
        commentsCount: increment(1)
      });

      setCommentInput('');
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Create Post Trigger */}
      <div className="p-5 sm:p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={userProfile?.photoURL || (currentUser ? `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}` : 'https://api.dicebear.com/7.x/bottts/svg?seed=guest')}
              alt="Avatar"
              className="w-12 h-12 rounded-2xl bg-neutral-800 border-2 border-indigo-500/50 object-cover"
            />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>ম্যাথ ও সিমুলেশন কমিউনিটি ফিড</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px]">
                  লাইভ সোশ্যাল হাব
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                আপনার সিমুলেশন, অ্যালগরিদম ও ভিডিও শেয়ার করুন এবং অন্য গবেষকদের প্রোফাইল ভিজিট করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenLiveStream && (
              <button
                onClick={onOpenLiveStream}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                <span>লাইভ স্ট্রীম দেখুন</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!currentUser && onOpenAuthModal) {
                  onOpenAuthModal();
                } else {
                  setIsCreatingPost(!isCreatingPost);
                }
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন পোস্ট করুন</span>
            </button>
          </div>
        </div>

        {/* Post Creation Box */}
        {isCreatingPost && (
          <form onSubmit={handlePublishPost} className="mt-5 pt-5 border-t border-neutral-800 space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <textarea
                rows={3}
                required
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="আজকে আপনি কোন সমীকরণ বা সিমুলেশন তৈরি করেছেন? বিস্তারিত শেয়ার করুন..."
                className="w-full p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-400">ক্যাটাগরি</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"
                >
                  <option value="robotics">Robotics & Inverse Kinematics</option>
                  <option value="mechanics">Mechanics & Chaos (Double Pendulum)</option>
                  <option value="matrix">Linear Algebra & Matrix</option>
                  <option value="trigonometry">Trigonometry & Lissajous</option>
                  <option value="calculus_ode_pde">Calculus & Lorenz Attractor</option>
                  <option value="fourier">Fourier Harmonic Wave</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400">মিডিয়া / সংযুক্তির ধরন</label>
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setPostMediaType('simulation')}
                    className={`py-1.5 rounded-lg text-xs font-semibold border ${
                      postMediaType === 'simulation' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    সিমুলেশন
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostMediaType('video')}
                    className={`py-1.5 rounded-lg text-xs font-semibold border ${
                      postMediaType === 'video' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    ভিডিও লিংক
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostMediaType('code')}
                    className={`py-1.5 rounded-lg text-xs font-semibold border ${
                      postMediaType === 'code' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    স্ক্রিপ্ট কোড
                  </button>
                </div>
              </div>
            </div>

            {postMediaType === 'video' && (
              <div className="space-y-1">
                <input
                  type="text"
                  value={postVideoUrl}
                  onChange={(e) => setPostVideoUrl(e.target.value)}
                  placeholder="YouTube বা MP4 ভিডিও লিংক (e.g. https://youtu.be/...)"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>
            )}

            {postMediaType === 'code' && (
              <div className="space-y-1">
                <textarea
                  rows={4}
                  value={postCodeSnippet}
                  onChange={(e) => setPostCodeSnippet(e.target.value)}
                  placeholder="// আপনার কাস্টম জাভাস্ক্রিপ্ট সিমুলেশন স্ক্রিপ্ট পেস্ট করুন..."
                  className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono text-xs"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingPost(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-400 text-xs font-semibold hover:text-white"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>পোস্ট পাবলিশ করুন</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-neutral-400">কমিউনিটি পোস্টসমূহ লোড হচ্ছে...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center bg-neutral-900/50 rounded-3xl border border-neutral-800/80 space-y-3">
            <Sparkles className="w-10 h-10 mx-auto text-indigo-400" />
            <h4 className="text-base font-bold text-white">এখনো কোনো পোস্ট করা হয়নি!</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              আপনিই প্রথম ব্যক্তি হিসেবে আপনার প্রিয় ম্যাথমেটিক্যাল সিমুলেশন বা গবেষণা শেয়ার করুন।
            </p>
          </div>
        ) : (
          posts.map(post => {
            const hasLiked = currentUser && post.likes && post.likes.includes(currentUser.uid);

            return (
              <div
                key={post.id}
                className="p-5 sm:p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 hover:border-neutral-700/80 transition-all shadow-xl"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div 
                    onClick={() => onOpenProfile && onOpenProfile(post.authorId)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={post.authorPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.authorId}`}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 group-hover:border-indigo-500 transition-colors object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                        <span>{post.authorName}</span>
                        <Award className="w-3.5 h-3.5 text-indigo-400" />
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        {post.authorTitle || 'সিমুলেশন ক্রিয়েটর'} • {new Date(post.createdAt).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-[11px] text-indigo-300 font-semibold uppercase">
                    {post.category || 'General'}
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Media Attachment */}
                {post.simulationType && (
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-indigo-900/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white">
                          সংযুক্ত ইন্টারেক্টিভ সিমুলেশন ({post.simulationType.toUpperCase()})
                        </h5>
                        <p className="text-[11px] text-neutral-400">
                          ক্লিক করে সরাসরি লাইভ ল্যাবে রান করুন
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (onOpenSimulation) {
                          onOpenSimulation(post.simulationType || 'robotics', post.simulationCode);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>সিমুলেশন খুলুন</span>
                    </button>
                  </div>
                )}

                {post.mediaType === 'video' && post.mediaUrl && (
                  <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400 font-medium">
                      <Video className="w-4 h-4" />
                      <span className="truncate max-w-xs">{post.mediaUrl}</span>
                    </div>
                    <a
                      href={post.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>ভিডিও দেখুন</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {post.simulationCode && (
                  <pre className="p-3.5 rounded-2xl bg-[#0d1117] border border-neutral-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-36">
                    {post.simulationCode}
                  </pre>
                )}

                {/* Action Bar (Like, Comment, Share, Profile Visit) */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleLike(post)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                        hasLiked 
                          ? 'bg-rose-950/60 border-rose-800 text-rose-400' 
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likesCount || 0} লাইক</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentPost(post)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount || 0} মন্তব্য</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSharePost(post)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white transition-all"
                      title="পোস্ট লিংক কপি করুন"
                    >
                      {copiedPostId === post.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                      <span>{copiedPostId === post.id ? 'কপিকৃত' : 'শেয়ার'}</span>
                    </button>

                    <button
                      onClick={() => onOpenProfile && onOpenProfile(post.authorId)}
                      className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-950/50 border border-indigo-800/50 text-indigo-300 hover:text-white transition-all font-medium"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>প্রোফাইল দেখুন</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* COMMENTS MODAL */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">মন্তব্যসমূহ ({comments.length})</h4>
              </div>
              <button
                onClick={() => setActiveCommentPost(null)}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {comments.length === 0 ? (
                <div className="py-10 text-center text-xs text-neutral-500">
                  এখনো কোনো মন্তব্য করা হয়নি। প্রথম মন্তব্যটি আপনিই করুন!
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div 
                        onClick={() => {
                          if (onOpenProfile) onOpenProfile(c.authorId);
                        }}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <img
                          src={c.authorPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.authorId}`}
                          alt={c.authorName}
                          className="w-6 h-6 rounded-full bg-neutral-800 object-cover"
                        />
                        <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {c.authorName}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(c.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 pl-8 leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input Box */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={currentUser ? "আপনার মন্তব্য লিখুন..." : "মন্তব্য করতে লগইন প্রয়োজন"}
                disabled={!currentUser}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!currentUser || !commentInput.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
