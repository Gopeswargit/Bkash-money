import React, { useState } from 'react';
import { EARNING_IDEAS } from '../data/ideas';
import { EarningIdea, CategoryType } from '../types';
import { Smartphone, Monitor, Sparkles, ChevronRight, CheckCircle2, DollarSign, Wrench, Send, HelpCircle, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onSelectForInvoice: (serviceName: string, estimatedAmount: number) => void;
}

export const IdeaExplorer: React.FC<Props> = ({ onSelectForInvoice }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'mobile_only' | 'computer'>('all');
  const [selectedIdea, setSelectedIdea] = useState<EarningIdea | null>(EARNING_IDEAS[0]);

  const filteredIdeas = EARNING_IDEAS.filter((idea) => {
    const matchesCategory = selectedCategory === 'all' || idea.category === selectedCategory;
    const matchesDevice = deviceFilter === 'all' || idea.requirement === deviceFilter || idea.requirement === 'both';
    return matchesCategory && matchesDevice;
  });

  const parseAmount = (earningStr: string): number => {
    const match = earningStr.match(/(\d+[,.]?\d*)/);
    if (match) {
      return parseInt(match[0].replace(/,/g, ''), 10) || 500;
    }
    return 500;
  };

  return (
    <div className="space-y-8">
      {/* Introduction Hero Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>বাস্তবধর্মী আয়ের আইডিয়া গাইড</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            মানুষ আপনার বিকাশ একাউন্টে কেন টাকা পাঠাবে?
          </h2>
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
            কেউ বিনা কারণে টাকা দেয় না। কিন্তু আপনি যদি এমন কোনো <span className="text-emerald-400 font-semibold">ডিজিটাল সার্ভিস</span>, <span className="text-pink-400 font-semibold">ডিজিটাল প্রডাক্ট (PDF নোট/টেমপ্লেট)</span> বা <span className="text-amber-400 font-semibold">প্রয়োজনীয় সমাধান</span> বানিয়ে দেন যা মানুষের সময় বাঁচায় বা সমস্যা দূর করে—তাহলে তারা সানন্দে আপনার বিকাশ একাউন্টে টাকা পাঠাবে।
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'সব আইডিয়া' },
              { id: 'math_projects', label: '📐 গণিত প্রজেক্ট ও সিমুলেশন' },
              { id: 'services', label: 'ডিজিটাল সার্ভিস' },
              { id: 'digital_products', label: 'ডিজিটাল প্রডাক্ট (PDF/নোট)' },
              { id: 'tutoring', label: 'অনলাইন টিউশনি ও কোচিং' },
              { id: 'ecommerce', label: 'লোকাল প্রডাক্ট ও গিফট' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-emerald-500 text-neutral-950 font-semibold shadow-md shadow-emerald-500/20'
                    : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Device Toggle */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setDeviceFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                deviceFilter === 'all' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'
              }`}
            >
              সব ডিভাইস
            </button>
            <button
              onClick={() => setDeviceFilter('mobile_only')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                deviceFilter === 'mobile_only' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>শুধু মোবাইল</span>
            </button>
            <button
              onClick={() => setDeviceFilter('computer')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                deviceFilter === 'computer' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>কম্পিউটার</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Grid: Idea List (Left) + Detailed Deep Dive (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Idea Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
            উপলব্ধ আয়ের উপায় ({filteredIdeas.length}টি)
          </div>

          {filteredIdeas.map((idea) => {
            const isSelected = selectedIdea?.id === idea.id;
            return (
              <button
                key={idea.id}
                onClick={() => setSelectedIdea(idea)}
                className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-neutral-900 border-emerald-500/70 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                    : 'bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-800/60 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        idea.requirement === 'mobile_only'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : idea.requirement === 'computer'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {idea.requirement === 'mobile_only' ? '📱 শুধু মোবাইল' : idea.requirement === 'computer' ? '💻 কম্পিউটার' : '📱+💻 উভয়ই'}
                      </span>
                      <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                        লেভেল: {idea.difficulty}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-neutral-100 leading-snug pt-1">
                      {idea.titleBn}
                    </h3>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-emerald-400 translate-x-1' : 'text-neutral-600'}`} />
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1 border-t border-neutral-800/60 mt-1">
                  <span className="text-emerald-400 font-medium font-mono text-[11px]">
                    {idea.estimatedEarnings}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    বিস্তারিত দেখুন →
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Idea Details */}
        <div className="lg:col-span-7">
          {selectedIdea ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 space-y-6 sticky top-6 shadow-xl">
              
              {/* Header */}
              <div className="border-b border-neutral-800 pb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    {selectedIdea.category === 'services' ? 'ডিজিটাল সার্ভিস' : selectedIdea.category === 'digital_products' ? 'ডিজিটাল প্রডাক্ট' : 'কোচিং ও টিচিং'}
                  </span>
                  <span className="text-xs font-mono text-neutral-400 bg-neutral-800 px-2.5 py-1 rounded-md">
                    সম্ভাব্য আয়: {selectedIdea.estimatedEarnings}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {selectedIdea.titleBn}
                </h3>
                <p className="text-xs text-neutral-400 font-mono">
                  {selectedIdea.titleEn}
                </p>
              </div>

              {/* Step 1: What to Build */}
              <div className="space-y-2 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/80">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <Wrench className="w-4 h-4" />
                  <span>১. কি বানাবেন ও কিভাবে তৈরি করবেন?</span>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {selectedIdea.whatToBuild}
                </p>
                <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-neutral-400 font-medium">প্রয়োজনীয় টুলস:</span>
                  {selectedIdea.toolsNeeded.map((t, i) => (
                    <span key={i} className="bg-neutral-800 text-neutral-200 px-2.5 py-0.5 rounded-md font-mono text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step 2: How to Sell */}
              <div className="space-y-2 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/80">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
                  <BookOpen className="w-4 h-4" />
                  <span>২. ক্লায়েন্ট বা ক্রেতা কোথায় ও কিভাবে পাবেন?</span>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {selectedIdea.howToSell}
                </p>
              </div>

              {/* Step 3: What to tell for bKash Payment */}
              <div className="space-y-2 bg-pink-950/20 p-4 rounded-2xl border border-pink-900/30">
                <div className="flex items-center gap-2 text-sm font-semibold text-pink-400">
                  <Send className="w-4 h-4" />
                  <span>৩. বিকাশে টাকা নেওয়ার জন্য কি বলে মেসেজ দিবেন?</span>
                </div>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 leading-relaxed select-all">
                  "{selectedIdea.paymentPitchExample}"
                </div>
                <p className="text-[11px] text-pink-300/80">
                  💡 ক্লায়েন্টকে নম্বর ও কাজের স্পষ্ট বাজেট বুঝিয়ে দিলে তারা সহজে বিকাশে অগ্রিম বা ডেলিভারি পেমেন্ট করে দেয়।
                </p>
              </div>

              {/* Pro Tips */}
              <div className="text-xs text-neutral-400 bg-neutral-800/40 p-3.5 rounded-xl border border-neutral-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-200">বিশেষ টিপস: </strong>
                  {selectedIdea.tips}
                </div>
              </div>

              {/* Action Button: Jump to Invoice Generator with this idea */}
              <button
                onClick={() => {
                  const amt = parseAmount(selectedIdea.estimatedEarnings);
                  onSelectForInvoice(selectedIdea.titleBn, amt);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold text-sm transition-all shadow-lg shadow-pink-600/25 active:scale-98"
              >
                <span>এই সার্ভিসের জন্য বিকাশ পেমেন্ট কার্ড তৈরি করুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center text-neutral-500">
              বাম পাশের যেকোনো একটি আয়ের উপায়ে ক্লিক করুন।
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
