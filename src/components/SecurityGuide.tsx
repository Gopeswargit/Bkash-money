import React from 'react';
import { ShieldAlert, AlertTriangle, Lock, EyeOff, PhoneCall, CheckCircle, XCircle } from 'lucide-react';

export const SecurityGuide: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Alert Header */}
      <div className="bg-gradient-to-r from-red-950/40 via-neutral-900 to-neutral-900 border border-red-900/40 rounded-3xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>অ্যাকাউন্ট ও ফান্ড সুরক্ষা</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          বিকাশ একাউন্টের নিরাপত্তা ও প্রতারক চক্র থেকে বাঁচার উপায়
        </h2>
        <p className="text-neutral-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          অনলাইনে আয়ের সুযোগ খুঁজতে গিয়ে অনেক সময় মানুষ ভুয়া স্ক্যামের ফাঁদে পড়ে নিজেদের বিকাশ একাউন্টের টাকা হারায়। নিচের সতর্কবার্তাগুলো সবসময় মনে রাখুন।
        </p>
      </div>

      {/* Do's and Don'ts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* DO NOT */}
        <div className="bg-neutral-900/80 border border-red-900/30 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-400 font-bold text-base border-b border-red-900/30 pb-3">
            <XCircle className="w-5 h-5" />
            <span>যেসব ফাঁদে কখনো পা দিবেন না (Scam Traps):</span>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-neutral-300">
            <li className="flex items-start gap-2.5">
              <span className="text-red-400 font-bold shrink-0">❌</span>
              <span><strong>"টাকা ইনভেস্ট করে দ্বিগুণ আয়":</strong> ৫০০ টাকা দিলে দৈনিক ১০০০ টাকা দিবে এমন সাইট বা টেলিগ্রাম গ্রুপ সম্পূর্ণ ১০০% ভুয়া প্রতারণা।</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-red-400 font-bold shrink-0">❌</span>
              <span><strong>OTP বা ৫-ডিজিট পিন দেওয়া:</strong> বিকাশ হেড অফিস বা পুলিশ পরিচয় দিয়ে ফোন করে কেউ OTP বা পিন চাইলে কখনো দিবেন না।</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-red-400 font-bold shrink-0">❌</span>
              <span><strong>ভুল করে টাকা পাঠানোর ভুয়া SMS:</strong> সাধারণ মোবাইল নম্বর থেকে আসা কোনো ফেক SMS দেখে কাউকে টাকা ফেরত পাঠাবেন না। বিকাশ অ্যাপে ব্যালেন্স চেক করুন।</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-red-400 font-bold shrink-0">❌</span>
              <span><strong>ভিডিও দেখে বা অ্যাড ক্লিক করে লাখ টাকা:</strong> এমন সাইট শুধু সময় নষ্ট করায় এবং পরে উইথড্র করার নামে আপনার থেকেই টাকা চায়।</span>
            </li>
          </ul>
        </div>

        {/* DO's */}
        <div className="bg-neutral-900/80 border border-emerald-900/30 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base border-b border-emerald-900/30 pb-3">
            <CheckCircle className="w-5 h-5" />
            <span>নিরাপদ থাকার নিয়ম (Safe Practices):</span>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-neutral-300">
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0">✅</span>
              <span><strong>শুধু নিজের স্কিল বিক্রি করুন:</strong> যা আপনি নিজে বানাতে পারেন (যেমন গ্রাফিক্স, লেখা, ভিডিও বা কোড) কেবল সেটার জন্য পেমেন্ট গ্রহণ করুন।</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0">✅</span>
              <span><strong>পেমেন্ট অ্যাপে স্টেটমেন্ট চেক:</strong> কাস্টমার টাকা পাঠিয়েছে বললে বিকাশ অ্যাপে লগইন করে স্টেটমেন্টে TrxID ও ব্যালেন্স কনফার্ম করুন।</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0">✅</span>
              <span><strong>অফিসিয়াল হেল্পলাইন ১৬২৪৭:</strong> যেকোনো সন্দেহজনক লেনদেন বা কল পেলে সরাসরি বিকাশ হেল্পলাইন <strong>16247</strong> এ কল দিন।</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0">✅</span>
              <span><strong>স্ট্রং পিন কোড:</strong> আপনার জন্মসাল বা সহজ ১২৩৪৫ এর বদলে জটিল ৫ ডিজিটের গোপন পিন ব্যবহার করুন।</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Emergency Contact */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">বিকাশ অফিসিয়াল কাস্টমার কেয়ার</div>
            <div className="text-xs text-neutral-400">২৪ ঘণ্টা যেকোনো সহায়তার জন্য কল করুন 16247</div>
          </div>
        </div>
        <a
          href="tel:16247"
          className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-mono font-semibold transition-all"
        >
          Dial 16247
        </a>
      </div>
    </div>
  );
};
