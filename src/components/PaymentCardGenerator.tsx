import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  Copy, 
  Check, 
  QrCode, 
  Download, 
  ShieldCheck, 
  CreditCard, 
  Sparkles, 
  Send, 
  FileText, 
  ArrowRight,
  ExternalLink,
  Facebook,
  Github,
  Youtube,
  Instagram,
  UserCheck
} from 'lucide-react';
import { InvoiceData } from '../types';
import { CREATOR_PROFILE } from '../data/socialLinks';

interface Props {
  initialService?: string;
  initialAmount?: number;
}

export const PaymentCardGenerator: React.FC<Props> = ({
  initialService = 'ফেসবুক পোস্ট ডিজাইন ও ব্যানার সার্ভিস',
  initialAmount = 500
}) => {
  const [formData, setFormData] = useState<InvoiceData>({
    bKashNumber: '01728045202',
    accountType: 'Personal',
    clientName: 'সম্মানিত ক্লায়েন্ট',
    serviceOrProduct: initialService,
    amount: initialAmount,
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    notes: 'টাকা পাঠানোর পর অনুগ্রহ করে TrxID বা লাস্ট ৩ ডিজিট কনফার্ম করুন।'
  });

  const [qrUrl, setQrUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const printableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialService) {
      setFormData(prev => ({ ...prev, serviceOrProduct: initialService, amount: initialAmount }));
    }
  }, [initialService, initialAmount]);

  useEffect(() => {
    // Generate QR code encoding payment details or tel/intent
    const qrPayload = `bKash Payment Request\nNumber: ${formData.bKashNumber}\nType: ${formData.accountType}\nAmount: BDT ${formData.amount}\nRef: ${formData.serviceOrProduct}\nInv: ${formData.invoiceNumber}`;
    
    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 1.5,
      color: {
        dark: '#D12053', // bKash iconic magenta color
        light: '#FFFFFF'
      }
    })
      .then(url => setQrUrl(url))
      .catch(err => console.error(err));
  }, [formData]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.85 }
    });
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const bKashShareText = `💳 *বিকাশ পেমেন্ট রিকোয়েস্ট*\n\n` +
    `👤 প্রাপক/সার্ভিস: ${formData.serviceOrProduct}\n` +
    `💰 টাকার পরিমাণ: ৳${formData.amount} BDT\n` +
    `📱 বিকাশ নম্বর: ${formData.bKashNumber} (${formData.accountType})\n` +
    `📝 ইনভয়েস: ${formData.invoiceNumber}\n` +
    `📌 নোট: ${formData.notes}\n\n` +
    `টাকা সেন্ড করার পর TrxID পাঠিয়ে পেমেন্ট নিশ্চিত করুন। ধন্যবাদ!`;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-950/40 via-neutral-900 to-neutral-900 border border-pink-900/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>প্রফেশনাল বিকাশ পেমেন্ট কার্ড ও ইনভয়েস মেকার</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            ক্লায়েন্টকে প্রফেশনালভাবে বিকাশ পেমেন্ট রিকোয়েস্ট পাঠান
          </h2>
          <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
            কোনো ক্লায়েন্টের সাথে কাজ চূড়ান্ত হলে বা ডিজিটাল প্রডাক্ট বিক্রির সময় নিচের কার্ডটি তৈরি করে স্ক্রিনশট, প্রিন্ট বা মেসেজে টেক্সট কপি করে পাঠিয়ে দিন।
          </p>
        </div>
      </div>

      {/* Grid: Editor Left, Live Slip Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-5 bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-pink-400" />
              <span>পেমেন্ট ও সার্ভিসের তথ্য এডিট করুন</span>
            </h3>
            <span className="text-xs text-neutral-500 bg-neutral-800/80 px-2.5 py-1 rounded-md">
              লাইভ প্রিভিউ
            </span>
          </div>

          <div className="space-y-4 text-sm">
            {/* bKash Number */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                আপনার বিকাশ নম্বর (bKash Number)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.bKashNumber}
                  onChange={(e) => setFormData({ ...formData, bKashNumber: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-4 py-2.5 text-neutral-100 focus:outline-none focus:border-pink-500 font-mono tracking-wider text-base"
                  placeholder="01728045202"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">
                  {formData.accountType}
                </span>
              </div>
            </div>

            {/* Service / Product Name */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                সার্ভিস বা ডিজিটাল পণ্যের নাম (What are you selling/building?)
              </label>
              <input
                type="text"
                value={formData.serviceOrProduct}
                onChange={(e) => setFormData({ ...formData, serviceOrProduct: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-4 py-2.5 text-neutral-100 focus:outline-none focus:border-pink-500"
                placeholder="যেমন: ফেসবুক কভার ডিজাইন বা PDF স্টাডি গাইড"
              />
            </div>

            {/* Amount & Client Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  টাকার পরিমাণ (৳ BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-neutral-400 font-bold">৳</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl pl-8 pr-4 py-2.5 text-neutral-100 focus:outline-none focus:border-pink-500 font-semibold"
                    placeholder="500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  ক্লায়েন্ট / ক্রেতার নাম
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-4 py-2.5 text-neutral-100 focus:outline-none focus:border-pink-500"
                  placeholder="যেমন: মোঃ তামিম ইকবাল"
                />
              </div>
            </div>

            {/* Account Type & Invoice ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  একাউন্ট ধরন
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2.5 text-neutral-100 focus:outline-none focus:border-pink-500"
                >
                  <option value="Personal">Personal (সেন্ড মানি / Send Money)</option>
                  <option value="Merchant">Merchant (পেমেন্ট / Make Payment)</option>
                  <option value="Agent">Agent (ক্যাশ ইন / Cash In)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  ইনভয়েস রেফারেন্স কোড
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-4 py-2.5 text-neutral-100 focus:outline-none focus:border-pink-500 font-mono text-xs"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                ক্লায়েন্টের জন্য বিশেষ নির্দেশিকা / নোট
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-4 py-2 text-neutral-100 focus:outline-none focus:border-pink-500 text-xs"
              />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => copyToClipboard(bKashShareText, 'shareText')}
              className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs transition-all shadow-lg shadow-pink-600/20 active:scale-95"
            >
              {copiedField === 'shareText' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedField === 'shareText' ? 'মেসেজ কপি হয়েছে!' : 'মেসেজ টেক্সট কপি করুন'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>কার্ড প্রিন্ট / PDF</span>
            </button>
          </div>
        </div>

        {/* Live Visual Card Right */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div 
            ref={printableRef}
            className="w-full max-w-md bg-gradient-to-b from-[#E2136E] to-[#B80D57] rounded-3xl p-6 text-white shadow-2xl shadow-pink-950/50 border border-pink-400/30 relative overflow-hidden"
          >
            {/* bKash Header Brand */}
            <div className="flex items-center justify-between border-b border-pink-300/30 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white text-[#E2136E] flex items-center justify-center font-black text-lg shadow-md">
                  b
                </div>
                <div>
                  <h4 className="font-bold text-lg tracking-tight leading-none text-white">bKash Payment</h4>
                  <span className="text-[10px] text-pink-100 tracking-wider uppercase font-semibold">Official Payment Slip</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono bg-pink-900/60 px-2.5 py-1 rounded-md border border-pink-300/20">
                  {formData.invoiceNumber}
                </span>
              </div>
            </div>

            {/* Service & Amount Focus */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 mb-5">
              <div className="text-xs text-pink-100 font-medium">প্রদেয় সার্ভিসের বিবরণ:</div>
              <div className="text-base font-semibold text-white mt-0.5 leading-snug">
                {formData.serviceOrProduct || 'সার্ভিস নেম'}
              </div>
              <div className="mt-3 pt-3 border-t border-white/15 flex items-baseline justify-between">
                <span className="text-xs text-pink-200">মোট প্রদেয় টাকা:</span>
                <span className="text-3xl font-black tracking-tight text-white flex items-center gap-1">
                  <span className="text-xl">৳</span>
                  {formData.amount.toLocaleString('en-US')}
                  <span className="text-xs font-normal text-pink-100 ml-1">BDT</span>
                </span>
              </div>
            </div>

            {/* bKash Number & Copy Action */}
            <div className="bg-white rounded-2xl p-4 text-neutral-900 shadow-lg mb-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                <span>টাকা পাঠানোর বিকাশ একাউন্ট:</span>
                <span className="bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded text-[11px]">
                  {formData.accountType} (Send Money)
                </span>
              </div>

              <div className="flex items-center justify-between bg-neutral-100 rounded-xl p-2.5 border border-neutral-200">
                <div className="font-mono text-xl font-bold tracking-wider text-neutral-900 pl-1">
                  {formData.bKashNumber}
                </div>
                <button
                  onClick={() => copyToClipboard(formData.bKashNumber, 'numberOnly')}
                  className="px-3 py-1.5 rounded-lg bg-[#E2136E] hover:bg-pink-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  {copiedField === 'numberOnly' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'numberOnly' ? 'কপি হয়েছে' : 'নম্বর কপি'}</span>
                </button>
              </div>

              {/* QR Code section */}
              {qrUrl && (
                <div className="pt-2 flex items-center gap-4 border-t border-neutral-100">
                  <img
                    src={qrUrl}
                    alt="bKash QR"
                    className="w-20 h-20 rounded-lg border border-neutral-200 shadow-sm"
                  />
                  <div className="text-[11px] text-neutral-600 leading-relaxed">
                    <p className="font-semibold text-neutral-800 flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-[#E2136E]" />
                      <span>বিকাশ স্ক্যান ও ভেরিফাই</span>
                    </p>
                    <p className="mt-0.5 text-neutral-500">
                      বিকাশ অ্যাপ ওপেন করে QR স্ক্যান করে সরাসরি পেমেন্ট তথ্য দেখতে পারেন।
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* How to Send Money Guide */}
            <div className="bg-pink-950/40 rounded-xl p-3.5 border border-pink-300/20 text-xs text-pink-100 space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5 text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>টাকা পাঠানোর সহজ ৩ ধাপ:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-pink-200">
                <li>বিকাশ অ্যাপে গিয়ে <strong>"Send Money"</strong> অপশনে যান।</li>
                <li>প্রাপকের নম্বরে <strong>{formData.bKashNumber}</strong> দিন ও <strong>৳{formData.amount}</strong> লিখুন।</li>
                <li>টাকা সেন্ড করে ট্রানজেকশন আইডি (TrxID) নিশ্চিত করুন।</li>
              </ol>
            </div>

            {/* Verified Creator & Social Links in Slip */}
            <div className="mt-4 pt-3 border-t border-pink-300/30">
              <div className="flex items-center justify-between text-[11px] text-pink-100 mb-2">
                <span className="font-semibold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                  ভেরিফাইড ডেভেলপার: {CREATOR_PROFILE.name}
                </span>
                <span className="text-[10px] text-pink-200">অফিসিয়াল প্রোফাইল</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <a
                  href="https://www.facebook.com/share/1DeZJL2g74/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 rounded-lg py-1 px-1.5 text-[10px] text-white flex items-center justify-center gap-1 transition-all"
                >
                  <Facebook className="w-3 h-3" />
                  <span>Facebook</span>
                </a>
                <a
                  href="https://github.com/Gopeswargit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 rounded-lg py-1 px-1.5 text-[10px] text-white flex items-center justify-center gap-1 transition-all"
                >
                  <Github className="w-3 h-3" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.youtube.com/@GopeswarRoyjq9yi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 rounded-lg py-1 px-1.5 text-[10px] text-white flex items-center justify-center gap-1 transition-all"
                >
                  <Youtube className="w-3 h-3" />
                  <span>YouTube</span>
                </a>
                <a
                  href="https://www.instagram.com/gopeswarroy2?igsi=MWZibnVxejllNmx3ag=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 rounded-lg py-1 px-1.5 text-[10px] text-white flex items-center justify-center gap-1 transition-all"
                >
                  <Instagram className="w-3 h-3" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center text-[10px] text-pink-200/80">
              ক্লায়েন্ট: {formData.clientName} • তারিখ: {formData.date}
            </div>
          </div>

          <div className="mt-4 w-full max-w-md bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 text-xs text-neutral-300">
            <div className="flex items-center justify-between font-semibold text-white mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>{CREATOR_PROFILE.name} সোস্যাল মিডিয়া</span>
              </span>
              <span className="text-[10px] text-emerald-400">01728045202 (bKash)</span>
            </div>
            <p className="text-[11px] text-neutral-400 mb-3">
              ক্লায়েন্টকে কাজ ডেলিভারি বা ট্রাস্ট প্রুফের জন্য আপনার ফেসবুক, গিটহাব, ইউটিউব বা ইনস্টাগ্রাম লিংক সরাসরি দিন:
            </p>
            <div className="flex flex-wrap gap-2">
              {CREATOR_PROFILE.socialLinks.map(social => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white transition-all text-[11px]"
                >
                  <span>{social.name}</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-3 text-xs text-neutral-400 text-center max-w-sm">
            💡 আপনি এই কার্ডের স্ক্রিনশট নিয়ে মেসেঞ্জারে বা হোয়াটসঅ্যাপে ক্লায়েন্টকে পাঠিয়ে দিলে ক্লায়েন্ট দ্রুত বিকাশ পেমেন্ট করে দেয়।
          </div>
        </div>

      </div>
    </div>
  );
};
