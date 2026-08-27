import React, { useState } from 'react';
import { PITCH_TEMPLATES } from '../data/templates';
import { ClientMessageTemplate } from '../types';
import { Copy, Check, MessageSquare, Send, Share2, Sparkles, User, Tag, DollarSign, Share, ExternalLink } from 'lucide-react';
import { CREATOR_PROFILE } from '../data/socialLinks';
import confetti from 'canvas-confetti';

export const PitchGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ClientMessageTemplate>(PITCH_TEMPLATES[0]);
  const [clientName, setClientName] = useState<string>('ভাই/আপু');
  const [service, setService] = useState<string>('রোবোটিক্স ও ফিজিক্স সিমুলেশন প্রজেক্ট');
  const [amount, setAmount] = useState<number>(3500);
  const [bKashNumber, setBKashNumber] = useState<string>('01728045202');
  const [includeSocialLinks, setIncludeSocialLinks] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  let rawGeneratedText = selectedTemplate.template({
    bKashNumber,
    service,
    amount,
    clientName
  });

  if (includeSocialLinks) {
    rawGeneratedText += `\n\n🌐 আমার ভেরিফাইড প্রোফাইল ও কাজের পোর্টফোলিও:
• GitHub: https://github.com/Gopeswargit
• Facebook: https://www.facebook.com/share/1DeZJL2g74/
• YouTube: https://www.youtube.com/@GopeswarRoyjq9yi
• Instagram: https://www.instagram.com/gopeswarroy2?igsi=MWZibnVxejllNmx3ag==`;
  }

  const generatedText = rawGeneratedText;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.8 }
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(generatedText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>রেডিমেড ক্লায়েন্ট পিচ ও বিকাশ পেমেন্ট মেসেজ</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          ক্লায়েন্টকে কি লিখে মেসেজ পাঠাবেন?
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          কাস্টমার বা ক্লায়েন্টকে সার্ভিস অফার করার সময় অথবা টাকা চাওয়ার সময় প্রফেশনাল মেসেজ পাঠালে তারা দ্রুত বিশ্বাস করে এবং বিকাশে টাকা পাঠায়।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Template Selector & Inputs Left */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
            টেমপ্লেট নির্বাচন করুন
          </div>

          <div className="space-y-2">
            {PITCH_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate.id === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-neutral-900 border-blue-500 text-white ring-1 ring-blue-500/30'
                      : 'bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-800/60 text-neutral-300'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                    {tmpl.category}
                  </div>
                  <div className="font-semibold text-sm text-neutral-100 mt-0.5">
                    {tmpl.title}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 line-clamp-1">
                    {tmpl.description}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Customizer Inputs */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 space-y-3.5 text-xs text-neutral-300">
            <div className="font-semibold text-neutral-100 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
              <span>তথ্য কাস্টমাইজ করুন</span>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">ক্লায়েন্টের নাম</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="যেমন: রাশেদ ভাই"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">সার্ভিস / প্রডাক্টের নাম</label>
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="যেমন: ৩টি ফেসবুক ব্যানার"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-neutral-400 mb-1">টাকার পরিমাণ (৳)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">বিকাশ নম্বর</label>
                <input
                  type="text"
                  value={bKashNumber}
                  onChange={(e) => setBKashNumber(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Social Links Toggle */}
            <div className="pt-2 border-t border-neutral-800">
              <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={includeSocialLinks}
                  onChange={(e) => setIncludeSocialLinks(e.target.checked)}
                  className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-blue-600 focus:ring-blue-500 rounded-md"
                />
                <span className="text-[11px]">মেসেজে আমার ভেরিফাইড সোস্যাল মিডিয়া ও গিটহাব লিংক যুক্ত করুন</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Preview Box Right */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
            রেডি মেসেজ প্রিভিউ (Messenger / WhatsApp / Facebook এ পাঠানোর জন্য)
          </div>

          <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 relative flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-neutral-300">
                    তৈরিকৃত মেসেজ
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500">
                  {selectedTemplate.category}
                </span>
              </div>

              {/* Message Bubble Box */}
              <div className="bg-neutral-950 rounded-2xl p-5 border border-neutral-800/80 font-sans text-sm text-neutral-200 leading-relaxed whitespace-pre-line select-all">
                {generatedText}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-neutral-800 flex flex-wrap gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'মেসেজ কপি হয়েছে!' : 'এক ক্লিকে কপি করুন'}</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp এ পাঠান</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
