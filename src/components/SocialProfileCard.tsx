import React, { useState } from 'react';
import { 
  Instagram, 
  Github, 
  Youtube, 
  Facebook, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  UserCheck, 
  Share2, 
  Phone, 
  Mail, 
  Code2,
  CheckCircle2
} from 'lucide-react';
import { CREATOR_PROFILE, SocialLink } from '../data/socialLinks';
import confetti from 'canvas-confetti';

export const SocialProfileCard: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getIcon = (iconName: SocialLink['iconName']) => {
    switch (iconName) {
      case 'Instagram':
        return <Instagram className="w-5 h-5 text-pink-400" />;
      case 'Github':
        return <Github className="w-5 h-5 text-neutral-200" />;
      case 'Youtube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'Facebook':
        return <Facebook className="w-5 h-5 text-blue-400" />;
      default:
        return <ExternalLink className="w-5 h-5 text-indigo-400" />;
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 }
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      {/* Subtle background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-pink-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-pink-600/20">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center font-bold text-xl text-white font-mono">
              GR
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {CREATOR_PROFILE.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Verified Creator
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              {CREATOR_PROFILE.title}
            </p>
          </div>
        </div>

        {/* Contact Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono">
            <Phone className="w-3.5 h-3.5 text-pink-400" />
            <span>01728045202 (bKash)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span>{CREATOR_PROFILE.email}</span>
          </div>
        </div>
      </div>

      {/* Social Media Grid Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-pink-400" />
            <span>অফিসিয়াল সোস্যাল মিডিয়া ও পোর্টফোলিও লিংক</span>
          </h3>
          <span className="text-[11px] text-neutral-400">
            যেকোনো প্রজেক্ট বা সহযোগিতার জন্য কানেক্ট করুন
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CREATOR_PROFILE.socialLinks.map((social) => {
            const isCopied = copiedId === social.id;
            return (
              <div
                key={social.id}
                className={`group relative rounded-2xl p-4.5 bg-gradient-to-b ${social.bgGradient} border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-center shadow-md">
                      {getIcon(social.iconName)}
                    </div>
                    <button
                      onClick={() => handleCopy(social.url, social.id)}
                      className="p-1.5 rounded-lg bg-neutral-950/60 hover:bg-neutral-950 border border-neutral-800/60 text-neutral-400 hover:text-white transition-all text-xs flex items-center gap-1"
                      title="লিংক কপি করুন"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px] hidden group-hover:inline">কপি</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h4 className="font-semibold text-sm text-white flex items-center gap-1.5">
                    <span>{social.name}</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-mono truncate mt-0.5">
                    {social.username}
                  </p>
                  <p className="text-xs text-neutral-300/80 mt-2 line-clamp-2">
                    {social.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800/40 flex items-center justify-between">
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-950/90 hover:bg-white hover:text-neutral-950 border border-neutral-700/60 text-xs font-semibold text-white transition-all shadow-sm group-hover:border-neutral-500"
                  >
                    <span>প্রোফাইল ভিজিট</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Direct Quick Connection Bar */}
      <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-white font-medium">ক্লায়েন্টদের সাথে প্রোফাইল শেয়ার করার সুবিধা</span>
            <p className="text-neutral-400 text-[11px]">পেমেন্ট স্লিপ এবং কাজের পিচের সাথে আপনার ফেসবুক বা গিটহাব লিংক দিয়ে দ্রুত বিশ্বাসযোগ্যতা অর্জন করুন।</p>
          </div>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <button
            onClick={() => handleCopy(
              `Gopeswar Roy | Social Profiles:\nFacebook: https://www.facebook.com/share/1DeZJL2g74/\nGitHub: https://github.com/Gopeswargit\nYouTube: https://www.youtube.com/@GopeswarRoyjq9yi\nInstagram: https://www.instagram.com/gopeswarroy2?igsi=MWZibnVxejllNmx3ag==\nbKash: 01728045202`,
              'all-links'
            )}
            className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold transition-all shadow-md shadow-pink-600/20 active:scale-95 flex items-center gap-1.5"
          >
            {copiedId === 'all-links' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'all-links' ? 'সব লিংক কপি হয়েছে!' : 'সবগুলো লিংক একসাথে কপি'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
