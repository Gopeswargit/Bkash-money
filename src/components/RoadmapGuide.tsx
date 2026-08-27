import React from 'react';
import { Target, CheckCircle2, Award, Zap, TrendingUp, Sparkles, HelpCircle } from 'lucide-react';

export const RoadmapGuide: React.FC = () => {
  const steps = [
    {
      step: '১ম ধাপ',
      title: 'একটি নির্দিষ্ট ডিজিটাল স্কিল বা পণ্য নির্বাচন',
      desc: 'সবকিছু একসাথে না করে মাত্র ১টি সহজ কাজ শিখুন। যেমন: ক্যানভা (Canva) দিয়ে ফেসবুক ব্যানার ডিজাইন, অথবা বিসিএস/পড়ার ২০ পৃষ্ঠার একটি হ্যান্ডনোট PDF তৈরি করা।',
      timeframe: '১ থেকে ৩ দিন',
      tools: 'Canva, Google Docs, CapCut'
    },
    {
      step: '২য় ধাপ',
      title: '৩-৫টি আকর্ষণীয় স্যাম্পল বা ডেমো তৈরি',
      desc: 'কাউকে কাজ অফার করার আগে তাকে দেখানোর জন্য নিজের তৈরি ৩-৪টি স্যাম্পল ফাইল ড্রাইভ লিংক বা ইমেজে রেডি রাখুন। স্যাম্পল ছাড়া কেউ বিশ্বাস করে অগ্রিম টাকা দিবে না।',
      timeframe: '২ দিন',
      tools: 'Google Drive, Facebook Page'
    },
    {
      step: '৩য় ধাপ',
      title: 'টার্গেটেড ক্লায়েন্ট বা কাস্টমারকে মেসেজ পাঠানো',
      desc: 'ফেসবুক গ্রুপ, পেজ ওনার বা বন্ধুদের আপনার সার্ভিস বা নোটের উপকারিতা বুঝিয়ে মেসেজ দিন। প্রথম ২ জনকে বিশেষ ছাড়ে বা ট্রায়াল হিসেবে কাজ দিন।',
      timeframe: 'নিয়মিত দৈনিক ৩০ মিনিট',
      tools: 'Messenger, WhatsApp'
    },
    {
      step: '৪র্থ ধাপ',
      title: 'বিকাশে ৫০% অগ্রিম বা ডেলিভারি পেমেন্ট গ্রহণ',
      desc: 'কাজ চূড়ান্ত হলে আমাদের পেমেন্ট কার্ড বা মেসেজ টেমপ্লেট দিয়ে আপনার বিকাশ নম্বর দিন। টাকা কনফার্ম করে সুন্দরভাবে নির্দিষ্ট সময়ে কাজ ডেলিভারি দিন।',
      timeframe: 'প্রজেক্ট অনুযায়ী',
      tools: 'bKash App (*247#)'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>বাস্তব অ্যাকশন প্ল্যান</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          ০ থেকে বিকাশে প্রথম ৳১০,০০০ আয়ের রোডম্যাপ
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          কোনো ভুয়া ক্লিক সাইট বা জুয়া নয়—একটি সহজ বাস্তব স্কিল শিখে কিভাবে প্রথম ক্লায়েন্ট থেকে টাকা বিকাশ পর্যন্ত আনবেন তার পরিষ্কার নির্দেশিকা।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  {item.step}
                </span>
                <span className="text-[11px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                  সময়: {item.timeframe}
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-100 tracking-tight">
                {item.title}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
              <span>প্রয়োজনীয়: <strong className="text-neutral-300 font-mono">{item.tools}</strong></span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Golden Rule Formula Box */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-900/30 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-lg">
          <Zap className="w-5 h-5" />
          <span>আয়ের গোল্ডেন ফর্মুলা (The Golden Rule):</span>
        </div>
        <div className="text-xl sm:text-2xl font-semibold text-white tracking-tight bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800 text-center font-mono">
          মূল্যবান কাজ বা প্রডাক্ট (Value) + সঠিক প্রচার (Reach) = বিকাশে স্থায়ী আয় (Income)
        </div>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed text-center max-w-2xl mx-auto">
          আপনি যত ভালো সমাধান কাউকে তৈরি করে দিতে পারবেন, সে তত দ্রুত আপনার বিকাশে পারিশ্রমিক পাঠাবে।
        </p>
      </div>
    </div>
  );
};
