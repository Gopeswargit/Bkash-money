import React, { useState } from 'react';
import { 
  Facebook, 
  Github, 
  Youtube, 
  Instagram, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Sparkles, 
  X, 
  Send,
  Code2,
  Camera,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { CREATOR_PROFILE } from '../data/socialLinks';
import confetti from 'canvas-confetti';

export interface SimulationShareData {
  id: string;
  titleBn: string;
  titleEn: string;
  categoryName: string;
  equations: string[];
  keyFeatures: string[];
  sampleCode: string;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: SimulationShareData;
}

export const SimulationShareModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const [activePlatform, setActivePlatform] = useState<'facebook' | 'github' | 'youtube' | 'instagram'>('facebook');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAppUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-c4jcsemnhazx3phm6tqp3u-525848690000.asia-southeast1.run.app';

  // Customized Post Captions for each platform
  const getFacebookPostText = () => {
    return `🚀 [নতুন স্টেম ও রোবোটিক্স প্রজেক্ট সিমুলেশন]
${data.titleBn} (${data.titleEn})

📐 সমীকরণ ও প্রযুক্তি:
${data.equations.map(eq => `• ${eq}`).join('\n')}

✨ প্রধান বৈশিষ্ট্য:
${data.keyFeatures.map(f => `✔ ${f}`).join('\n')}

👨‍💻 ডেভেলপার: ${CREATOR_PROFILE.name}
🔗 গিটহাব কোড: https://github.com/Gopeswargit
🎥 ইউটিউব চ্যানেল: https://www.youtube.com/@GopeswarRoyjq9yi
📸 ইনস্টাগ্রাম: https://www.instagram.com/gopeswarroy2?igsi=MWZibnVxejllNmx3ag==
💼 প্রজেক্ট ও কনসালটেন্সি বিকাশ: 01728045202

#STEM #Robotics #Mathematics #Physics #WebSimulation #Engineering #Coding #GopeswarRoy`;
  };

  const getGithubReadmeText = () => {
    return `# ${data.titleEn}
> ${data.titleBn} | Built by [${CREATOR_PROFILE.name}](https://github.com/Gopeswargit)

## 📌 Overview
An interactive physical simulation and mathematical modeling engine for **${data.titleEn}**.

## 🧮 Mathematical Formulations
\`\`\`math
${data.equations.join('\n')}
\`\`\`

## 🚀 Key Features
${data.keyFeatures.map(f => `- [x] ${f}`).join('\n')}

## 💻 Implementation Snippet
\`\`\`javascript
${data.sampleCode}
\`\`\`

## 📬 Connect & Support
- **Author**: ${CREATOR_PROFILE.name}
- **Facebook**: [Facebook Profile](https://www.facebook.com/share/1DeZJL2g74/)
- **YouTube**: [@GopeswarRoyjq9yi](https://www.youtube.com/@GopeswarRoyjq9yi)
- **Instagram**: [@gopeswarroy2](https://www.instagram.com/gopeswarroy2?igsi=MWZibnVxejllNmx3ag==)
- **bKash (Project Sponsorship / Order)**: \`01728045202\`
`;
  };

  const getYouTubeDescription = () => {
    return `🔴 ${data.titleBn} (${data.titleEn}) - লাইভ ডেমো ও অ্যালগরিদম ব্যাখ্যা

ভিডিওটিতে ${data.titleBn} এর গাণিতিক সূত্র ও সিমুলেশনের প্রতিটি স্টেপ বিস্তারিত দেখানো হয়েছে।

⏱ গাণিতিক সমীকরণ:
${data.equations.map(eq => `• ${eq}`).join('\n')}

👨‍💻 ডেভেলপার পরিচিতি:
• ডেভেলপার: ${CREATOR_PROFILE.name}
• সাবস্ক্রাইব করুন: https://www.youtube.com/@GopeswarRoyjq9yi
• সম্পূর্ণ সোর্স কোড (GitHub): https://github.com/Gopeswargit
• ফেসবুক কানেক্ট: https://www.facebook.com/share/1DeZJL2g74/
• ইনস্টাগ্রাম: https://www.instagram.com/gopeswarroy2?igsi=MWZibnVxejllNmx3ag==

💰 থিসিস বা একাডেমি প্রজেক্ট অর্ডারের জন্য বিকাশ: 01728045202

#${data.id.replace(/-/g, '')} #Robotics #Simulation #PhysicsAnimation #Mathematics #GopeswarRoy #ScienceLab`;
  };

  const getInstagramCaption = () => {
    return `⚡ ${data.titleBn} ⚡
(${data.titleEn})

Interactively exploring the mathematics and physics of:
${data.equations.slice(0, 2).map(e => `👉 ${e}`).join('\n')}

🔥 Follow @gopeswarroy2 for more STEM simulations & robotics algorithms!
💻 Full Source Code on GitHub: @Gopeswargit
🎥 Video breakdowns on YouTube: @GopeswarRoyjq9yi

Project inquiry / Order: bKash 01728045202 🇧🇩

#robotics #kinematics #physicslab #simulation #mathart #engineering #tech #bangladesh #gopeswarroy #stem`;
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.7 }
    });
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadSnapshot = () => {
    if (!data.canvasRef || !data.canvasRef.current) return;
    try {
      const canvas = data.canvasRef.current;
      const imageUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${data.id}-simulation-snapshot.png`;
      link.href = imageUri;
      link.click();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error('Canvas export error:', e);
    }
  };

  const handleOpenFacebookShare = () => {
    const quote = encodeURIComponent(getFacebookPostText());
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentAppUrl)}&quote=${quote}`;
    window.open(shareUrl, '_blank', 'width=600,height=500');
  };

  const handleOpenGithub = () => {
    window.open('https://github.com/Gopeswargit?tab=repositories', '_blank');
  };

  const handleOpenYouTube = () => {
    window.open('https://www.youtube.com/@GopeswarRoyjq9yi', '_blank');
  };

  const handleOpenInstagram = () => {
    window.open('https://www.instagram.com/gopeswarroy2?igsi=MWZibnVxejllNmx3ag==', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-pink-600/20">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>সোস্যাল মিডিয়া শেয়ার ও পোস্ট সেন্টার</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/30">
                Gopeswar Roy
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              প্রজেক্ট: <strong className="text-neutral-200">{data.titleBn}</strong>
            </p>
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActivePlatform('facebook')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
              activePlatform === 'facebook'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-600/20'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
            }`}
          >
            <Facebook className="w-4 h-4 text-blue-400" />
            <span>Facebook</span>
          </button>

          <button
            onClick={() => setActivePlatform('github')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
              activePlatform === 'github'
                ? 'bg-neutral-800 border-neutral-500 text-white shadow-md'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
            }`}
          >
            <Github className="w-4 h-4 text-neutral-200" />
            <span>GitHub</span>
          </button>

          <button
            onClick={() => setActivePlatform('youtube')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
              activePlatform === 'youtube'
                ? 'bg-red-600/20 border-red-500 text-red-300 shadow-md shadow-red-600/20'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-400" />
            <span>YouTube</span>
          </button>

          <button
            onClick={() => setActivePlatform('instagram')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
              activePlatform === 'instagram'
                ? 'bg-pink-600/20 border-pink-500 text-pink-300 shadow-md shadow-pink-600/20'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
            }`}
          >
            <Instagram className="w-4 h-4 text-pink-400" />
            <span>Instagram</span>
          </button>
        </div>

        {/* Content Box per Selected Platform */}
        <div className="space-y-4">
          
          {/* FACEBOOK */}
          {activePlatform === 'facebook' && (
            <div className="space-y-3 bg-neutral-950 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                  <Facebook className="w-4 h-4" />
                  <span>ফেসবুকে পোস্ট করার রেডিমেড ক্যাপশন</span>
                </span>
                <span className="text-[11px] text-neutral-500">প্রোফাইল: Gopeswar Roy</span>
              </div>

              <textarea
                readOnly
                rows={7}
                value={getFacebookPostText()}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 font-sans focus:outline-none select-all"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(getFacebookPostText(), 'fb')}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
                  >
                    {copiedKey === 'fb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'fb' ? 'কপি হয়েছে!' : 'ক্যাপশন কপি'}</span>
                  </button>

                  {data.canvasRef && (
                    <button
                      onClick={handleDownloadSnapshot}
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5 transition-all"
                      title="পোস্ট করার জন্য সিমুলেশন গ্রাফিক্স ডাউনলোড"
                    >
                      <Camera className="w-3.5 h-3.5 text-pink-400" />
                      <span>ইমেজ সেভ</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenFacebookShare}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-95 transition-all"
                  >
                    <span>ফেসবুকে সরাসরি শেয়ার করুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GITHUB */}
          {activePlatform === 'github' && (
            <div className="space-y-3 bg-neutral-950 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-white" />
                  <span>GitHub README.md ও প্রজেক্ট ডকুমেন্টেশন</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-400">@Gopeswargit</span>
              </div>

              <textarea
                readOnly
                rows={7}
                value={getGithubReadmeText()}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 font-mono focus:outline-none select-all"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => handleCopy(getGithubReadmeText(), 'github')}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
                >
                  {copiedKey === 'github' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'github' ? 'মার্কডাউন কপি হয়েছে!' : 'README মার্কডাউন কপি'}</span>
                </button>

                <button
                  onClick={handleOpenGithub}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                >
                  <span>আমার GitHub প্রোফাইল ওপেন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* YOUTUBE */}
          {activePlatform === 'youtube' && (
            <div className="space-y-3 bg-neutral-950 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold text-red-400 flex items-center gap-1.5">
                  <Youtube className="w-4 h-4" />
                  <span>ইউটিউব ভিডিও ডেসক্রিপশন ও ট্যাগস</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-400">@GopeswarRoyjq9yi</span>
              </div>

              <textarea
                readOnly
                rows={7}
                value={getYouTubeDescription()}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 font-sans focus:outline-none select-all"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => handleCopy(getYouTubeDescription(), 'yt')}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
                >
                  {copiedKey === 'yt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'yt' ? 'ডেসক্রিপশন কপি হয়েছে!' : 'ইউটিউব টেক্সট কপি'}</span>
                </button>

                <button
                  onClick={handleOpenYouTube}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all"
                >
                  <span>ইউটিউব চ্যানেল ওপেন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* INSTAGRAM */}
          {activePlatform === 'instagram' && (
            <div className="space-y-3 bg-neutral-950 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold text-pink-400 flex items-center gap-1.5">
                  <Instagram className="w-4 h-4" />
                  <span>ইনস্টাগ্রাম ক্যাপশন ও রিলস / পোস্ট ট্যাগ</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-400">@gopeswarroy2</span>
              </div>

              <textarea
                readOnly
                rows={6}
                value={getInstagramCaption()}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 font-sans focus:outline-none select-all"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(getInstagramCaption(), 'ig')}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
                  >
                    {copiedKey === 'ig' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'ig' ? 'ক্যাপশন কপি হয়েছে!' : 'ইনস্টাগ্রাম ক্যাপশন কপি'}</span>
                  </button>

                  {data.canvasRef && (
                    <button
                      onClick={handleDownloadSnapshot}
                      className="px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-pink-600/20 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>পোস্ট ইমেজ ডাউনলোড</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={handleOpenInstagram}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                >
                  <span>ইনস্টাগ্রাম ওপেন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Creator Info Footer */}
        <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{CREATOR_PROFILE.name}</span>
            <span>•</span>
            <span className="font-mono text-pink-400">bKash: 01728045202</span>
          </div>
          <button
            onClick={() => {
              const allText = `Project: ${data.titleBn} (${data.titleEn})\n\nFacebook: https://www.facebook.com/share/1DeZJL2g74/\nGitHub: https://github.com/Gopeswargit\nYouTube: https://www.youtube.com/@GopeswarRoyjq9yi\nInstagram: https://www.instagram.com/gopeswarroy2?igsi=MWZibnVxejllNmx3ag==\nbKash: 01728045202`;
              handleCopy(allText, 'all');
            }}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {copiedKey === 'all' ? '✓ লিংক কপি হয়েছে' : 'সব সোস্যাল লিংক কপি করুন'}
          </button>
        </div>

      </div>
    </div>
  );
};
