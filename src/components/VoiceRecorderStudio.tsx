import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Scissors, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Sliders, 
  Check, 
  AlertCircle,
  Radio,
  FileAudio,
  FastForward
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  simulationTitle: string;
  isOpen: boolean;
  onToggle: () => void;
}

// Convert AudioBuffer to WAV Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit precision

  setUint32(0x61746164); // "data" chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

export const VoiceRecorderStudio: React.FC<Props> = ({ simulationTitle, isOpen, onToggle }) => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [recordingTimer, setRecordingTimer] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [volumeBoost, setVolumeBoost] = useState<number>(1.0); // 1.0 = 0dB, 1.5 = +3dB, 2.0 = +6dB
  const [isTrimming, setIsTrimming] = useState<boolean>(false);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [liveVolume, setLiveVolume] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio analysis for real-time waveform
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setLiveVolume(Math.min(100, Math.round((avg / 255) * 100)));
        }
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(recordedBlob);
        setAudioBlob(recordedBlob);
        setAudioUrl(url);
        setRecordingState('stopped');

        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setLiveVolume(0);
      };

      mediaRecorder.start(200);
      setRecordingState('recording');
      setRecordingTimer(0);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTimer(prev => prev + 1);
      }, 1000);

    } catch (err: unknown) {
      console.error('Microphone access failed:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setMicError(`মাইক্রোফোনে প্রবেশাধিকার পাওয়া যায়নি (${message})। দয়া করে ব্রাউজার পারমিশন দিন।`);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTimer(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (recordingState === 'recording' || recordingState === 'paused')) {
      mediaRecorderRef.current.stop();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // Audio Playback Controls
  const togglePlay = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.playbackRate = playbackSpeed;
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioElementRef.current) {
      const dur = audioElementRef.current.duration;
      if (!isNaN(dur) && dur > 0) {
        setAudioDuration(dur);
        setTrimEnd(dur);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioElementRef.current) {
      setCurrentTime(audioElementRef.current.currentTime);
      if (isTrimming && trimEnd > 0 && audioElementRef.current.currentTime >= trimEnd) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = trimStart;
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (time: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Apply Trim & Crop using Web Audio API
  const handleApplyTrim = async () => {
    if (!audioBlob) return;
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);

      const sampleRate = decoded.sampleRate;
      const startOffset = Math.max(0, Math.floor(trimStart * sampleRate));
      const endOffset = Math.min(decoded.length, Math.floor(trimEnd * sampleRate));
      const frameCount = Math.max(1, endOffset - startOffset);

      const trimmedBuffer = audioCtx.createBuffer(
        decoded.numberOfChannels,
        frameCount,
        sampleRate
      );

      for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
        const sourceData = decoded.getChannelData(channel);
        const targetData = trimmedBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          targetData[i] = sourceData[startOffset + i] * volumeBoost;
        }
      }

      const trimmedWavBlob = audioBufferToWav(trimmedBuffer);
      const newUrl = URL.createObjectURL(trimmedWavBlob);

      setAudioBlob(trimmedWavBlob);
      setAudioUrl(newUrl);
      setAudioDuration(trimmedBuffer.duration);
      setTrimStart(0);
      setTrimEnd(trimmedBuffer.duration);
      setCurrentTime(0);
      setIsTrimming(false);

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 }
      });
    } catch (err) {
      console.error('Trimming error:', err);
    }
  };

  // Download Audio File
  const handleDownloadAudio = () => {
    if (!audioBlob) return;
    const link = document.createElement('a');
    link.href = audioUrl || '';
    link.download = `${simulationTitle.replace(/\s+/g, '_')}_Voice_Explanation.wav`;
    link.click();
  };

  const handleReset = () => {
    setRecordingState('idle');
    setAudioUrl(null);
    setAudioBlob(null);
    setAudioDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setRecordingTimer(0);
    setIsTrimming(false);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
      
      {/* Studio Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>ভয়েস রেকর্ডার ও অডিও এডিটিং স্টুডিও</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                Live Voice Over
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              সিমুলেশন চালানোর সাথে সাথে মুখে ব্যাখ্যা রেকর্ড করুন ও অডিও ফাইন টিউন করুন
            </p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-all"
        >
          বন্ধ করুন
        </button>
      </div>

      {micError && (
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* Hidden Native Audio Element */}
      {audioUrl && (
        <audio
          ref={audioElementRef}
          src={audioUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Recording Stage (State: IDLE / RECORDING / PAUSED) */}
      {recordingState !== 'stopped' && (
        <div className="space-y-4">
          
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center">
            
            {/* Live Volume VU / Pulse Visualizer */}
            <div className="relative flex items-center justify-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-150 ${
                  recordingState === 'recording'
                    ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/40'
                    : recordingState === 'paused'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
                style={{
                  transform: recordingState === 'recording' ? `scale(${1 + liveVolume * 0.003})` : 'scale(1)'
                }}
              >
                {recordingState === 'recording' ? (
                  <Radio className="w-10 h-10 animate-pulse" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </div>

              {recordingState === 'recording' && (
                <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  REC
                </span>
              )}
            </div>

            {/* Timer Display */}
            <div className="space-y-1">
              <div className="text-3xl font-mono font-bold text-white tracking-wider">
                {formatTime(recordingTimer)}
              </div>
              <p className="text-xs text-neutral-400">
                {recordingState === 'idle' && 'মাইক্রোফোন অন করতে "রেকর্ড শুরু করুন" চাপুন'}
                {recordingState === 'recording' && 'রেকর্ডিং চলছে... সিমুলেশন ও হোয়াইটবোর্ডে ড্রয়িং করে কথা বলুন'}
                {recordingState === 'paused' && 'রেকর্ডিং সাময়িক পজ করা হয়েছে'}
              </p>
            </div>

            {/* Visualizer Bar */}
            {recordingState === 'recording' && (
              <div className="w-full max-w-xs space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>ভয়েস সিগন্যাল লেভেল</span>
                  <span>{liveVolume}%</span>
                </div>
                <div className="h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500 transition-all duration-75"
                    style={{ width: `${liveVolume}%` }}
                  />
                </div>
              </div>
            )}

            {/* Main Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {recordingState === 'idle' && (
                <button
                  onClick={startRecording}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Mic className="w-4 h-4" />
                  <span>রেকর্ড শুরু করুন</span>
                </button>
              )}

              {recordingState === 'recording' && (
                <>
                  <button
                    onClick={pauseRecording}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Pause className="w-4 h-4" />
                    <span>পজ (Pause)</span>
                  </button>

                  <button
                    onClick={stopRecording}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
                  >
                    <Square className="w-4 h-4" />
                    <span>রেকর্ডিং শেষ করুন ও এডিট করুন</span>
                  </button>
                </>
              )}

              {recordingState === 'paused' && (
                <>
                  <button
                    onClick={resumeRecording}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                  >
                    <Play className="w-4 h-4" />
                    <span>চালু রাখুন (Resume)</span>
                  </button>

                  <button
                    onClick={stopRecording}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20"
                  >
                    <Square className="w-4 h-4" />
                    <span>সম্পন্ন করুন</span>
                  </button>
                </>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Audio Editor & Playback Stage (State: STOPPED / RECORDED) */}
      {recordingState === 'stopped' && audioUrl && (
        <div className="space-y-4">
          
          {/* Waveform & Scrubber Box */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4">
            
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <FileAudio className="w-4 h-4 text-emerald-400" />
                <span>রেকর্ডকৃত ভয়েস ট্র্যাক: {formatTime(currentTime)} / {formatTime(audioDuration)}</span>
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                স্পিড: {playbackSpeed}x • বুস্ট: {volumeBoost === 1 ? 'স্ট্যান্ডার্ড' : `+${Math.round((volumeBoost - 1) * 6)}dB`}
              </span>
            </div>

            {/* Custom Interactive Waveform / Timeline Scrubber */}
            <div className="space-y-2">
              <div className="relative h-12 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 flex items-center px-3 cursor-pointer">
                
                {/* Simulated Waveform Bars */}
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-40 pointer-events-none">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full"
                      style={{
                        height: `${Math.max(15, Math.sin(i * 0.4) * 35 + (i % 3) * 8)}%`
                      }}
                    />
                  ))}
                </div>

                {/* Trim Selection Shade */}
                {isTrimming && audioDuration > 0 && (
                  <div
                    className="absolute top-0 bottom-0 bg-emerald-500/20 border-x-2 border-emerald-400 pointer-events-none"
                    style={{
                      left: `${(trimStart / audioDuration) * 100}%`,
                      width: `${((trimEnd - trimStart) / audioDuration) * 100}%`
                    }}
                  />
                )}

                {/* Progress Bar Playhead */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-rose-500/30 border-r-2 border-rose-500 pointer-events-none transition-all duration-75"
                  style={{ width: audioDuration > 0 ? `${(currentTime / audioDuration) * 100}%` : '0%' }}
                />

                {/* Timeline Range Input */}
                <input
                  type="range"
                  min="0"
                  max={audioDuration || 100}
                  step="0.05"
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full relative z-10 opacity-0 cursor-pointer h-full"
                />
              </div>
            </div>

            {/* Playback Controls & Trimming Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'পজ' : 'প্লে করুন'}</span>
                </button>

                <button
                  onClick={() => handleSeek(0)}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-all"
                  title="প্রথম থেকে শুরু"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Playback Speed Selector */}
                <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1.5 rounded-xl border border-neutral-800 text-xs">
                  <FastForward className="w-3.5 h-3.5 text-neutral-400" />
                  {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        setPlaybackSpeed(speed);
                        if (audioElementRef.current) audioElementRef.current.playbackRate = speed;
                      }}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-all ${
                        playbackSpeed === speed ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Trimming & Sound Enhance Tools */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTrimming(!isTrimming)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isTrimming
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isTrimming ? 'ট্রিমিং বন্ধ করুন' : 'অডিও ট্রিম / কাট'}</span>
                </button>

                <button
                  onClick={handleDownloadAudio}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
                  title="রেকর্ডকৃত ভয়েস ডাউনলোড"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>অডিও ডাউনলোড</span>
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all"
                  title="নতুন করে রেকর্ড করুন"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Trimming Adjusters Sub-Panel */}
            {isTrimming && (
              <div className="bg-neutral-900/90 border border-amber-500/40 rounded-xl p-3.5 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs text-amber-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Scissors className="w-4 h-4" />
                    <span>অডিও ক্রপ করার রেঞ্জ সিলেক্ট করুন</span>
                  </span>
                  <span className="font-mono text-[11px]">
                    সিলেকশন: {formatTime(trimStart)} থেকে {formatTime(trimEnd)} ({((trimEnd - trimStart)).toFixed(1)} সেকেন্ড)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400 flex justify-between">
                      <span>শুরুর সময় (Start Offset):</span>
                      <span className="font-mono text-white">{trimStart.toFixed(2)}s</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, trimEnd - 0.5)}
                      step="0.1"
                      value={trimStart}
                      onChange={(e) => setTrimStart(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400 flex justify-between">
                      <span>শেষের সময় (End Offset):</span>
                      <span className="font-mono text-white">{trimEnd.toFixed(2)}s</span>
                    </label>
                    <input
                      type="range"
                      min={Math.min(audioDuration, trimStart + 0.5)}
                      max={audioDuration}
                      step="0.1"
                      value={trimEnd}
                      onChange={(e) => setTrimEnd(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Volume Boost Option */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>ভয়েস অ্যাম্প্লিফাই (Voice Boost):</span>
                    <select
                      value={volumeBoost}
                      onChange={(e) => setVolumeBoost(Number(e.target.value))}
                      className="bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      <option value="1.0">স্ট্যান্ডার্ড (0 dB)</option>
                      <option value="1.4">পরিষ্কার মাইক (+3 dB)</option>
                      <option value="1.8">হাই ভলিউম (+6 dB)</option>
                      <option value="2.5">স্টুডিও লাউড (+10 dB)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleApplyTrim}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>সিলেকশন ক্রপ ও সেভ করুন</span>
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
