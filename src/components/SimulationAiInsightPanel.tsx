import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Bot, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Send, 
  Mic, 
  MicOff, 
  RotateCcw, 
  Lightbulb, 
  Layers, 
  Cpu, 
  Code2, 
  Share2, 
  ExternalLink,
  DollarSign,
  Flame,
  ArrowRight
} from 'lucide-react';
import { SIMULATION_KNOWLEDGE_BASE, SimulationKnowledge, SimulationQnAItem } from '../data/simulationKnowledge';

interface Props {
  simulationKey: string;
  activeCategory: string;
  customCodeString?: string;
  onSelectForInvoice?: (title: string, amount: number) => void;
}

export const SimulationAiInsightPanel: React.FC<Props> = ({
  simulationKey,
  activeCategory,
  customCodeString,
  onSelectForInvoice
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'qna' | 'ask_ai' | 'monetization'>('summary');
  const [expandedQnaId, setExpandedQnaId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live AI Q&A Assistant State
  const [userQuestion, setUserQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Get current simulation knowledge object
  const currentKnowledge: SimulationKnowledge = 
    SIMULATION_KNOWLEDGE_BASE[simulationKey] || 
    SIMULATION_KNOWLEDGE_BASE[activeCategory] || 
    SIMULATION_KNOWLEDGE_BASE['robotics'];

  // Reset tab and expanded items on simulation change
  useEffect(() => {
    if (currentKnowledge.qnaList && currentKnowledge.qnaList.length > 0) {
      setExpandedQnaId(currentKnowledge.qnaList[0].id);
    }
  }, [simulationKey, activeCategory]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatHistory, isAiLoading]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Voice recording using Web Speech API
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('আপনার ব্রাউজারে ভয়েস রিকগনিশন সাপোর্ট নেই। অনুগ্রহ করে ক্রোম ব্রাউজার ব্যবহার করুন বা টাইপ করুন।');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  // Send Question to Server-side Gemini API (/api/simulation-ai)
  const handleSendQuestion = async (queryText?: string) => {
    const textToSend = queryText || userQuestion;
    if (!textToSend.trim() || isAiLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiChatHistory((prev) => [...prev, userMsg]);
    if (!queryText) setUserQuestion('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/simulation-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationTitle: currentKnowledge.title,
          simulationKey: currentKnowledge.key,
          category: currentKnowledge.category,
          question: textToSend,
          mode: 'ask',
          contextData: {
            equations: currentKnowledge.summary.governingEquations,
            principles: currentKnowledge.summary.corePrinciples,
            parameters: currentKnowledge.summary.parameterBreakdown
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const aiResponseText = data.answer || 'উত্তরে কোনো তথ্য পাওয়া যায়নি।';

      setAiChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiResponseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error('Error querying simulation AI:', err);
      // Helpful fallback response
      setAiChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `[অফলাইন এআই সমাধান]: "${currentKnowledge.title}" প্রজেক্টের জন্য "${textToSend}" বিষয়ে:\n\nএই প্রজেক্টের প্রধান গাণিতিক চালিকাশক্তি হলো এর ডিফারেনশিয়াল ও কাইনামেটিক্স সমীকরণ। আপনি ল্যাব ক্যানভাসে প্যারামিটার পরিবর্তন করে সরাসরি এর প্রভাব দেখতে পারেন। আরও নিখুঁত বিশদ জানার জন্য উপরের "সারসংক্ষেপ ও তত্ত্ব" ও "প্রশ্নোত্তর ব্যাংক" ট্যাবগুলো দেখুন।`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-6 mt-4 transition-all duration-300">
      
      {/* Header with glowing badge & Simulation identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-pink-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 ring-2 ring-white/10 shrink-0">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {currentKnowledge.tag} • AI প্রজেক্ট রিসার্চ হাব
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Simulation
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
              {currentKnowledge.title}
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              {currentKnowledge.subtitle}
            </p>
          </div>
        </div>

        {/* Quick Tabs Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-950 border border-neutral-800/80 overflow-x-auto self-start sm:self-auto max-w-full">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>সারসংক্ষেপ ও তত্ত্ব</span>
          </button>

          <button
            onClick={() => setActiveTab('qna')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'qna'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>প্রশ্নোত্তর ব্যাংক ({currentKnowledge.qnaList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ask_ai')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'ask_ai'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/20 ring-1 ring-pink-400/30'
                : 'text-neutral-400 hover:text-pink-300 hover:bg-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-spin" />
            <span>AI কে প্রশ্ন করুন</span>
          </button>

          <button
            onClick={() => setActiveTab('monetization')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'monetization'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-emerald-300 hover:bg-neutral-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>আয়ের সুযোগ ও ফি</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: প্রজেক্টের সারসংক্ষেপ ও গাণিতিক তত্ত্ব (SUMMARY & GOVERNING THEORY) */}
      {/* ========================================================================= */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          
          {/* Abstract / Overview Card */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>প্রজেক্ট সারসংক্ষেপ ও বৈজ্ঞানিক উদ্দেশ্য (Executive Overview)</span>
            </div>
            <p className="text-neutral-300 text-sm leading-relaxed font-sans">
              {currentKnowledge.summary.overview}
            </p>
          </div>

          {/* Governing Equations Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>প্রধান গাণিতিক ও পদার্থবিজ্ঞানের সমীকরণসমূহ (Governing Equations)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentKnowledge.summary.governingEquations.map((eq, idx) => (
                <div 
                  key={idx}
                  className="bg-neutral-950 border border-neutral-800/90 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-indigo-500/40 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-300 group-hover:text-indigo-200">
                        {eq.name}
                      </span>
                      <button
                        onClick={() => handleCopy(eq.equation, `eq_${idx}`)}
                        className="text-neutral-500 hover:text-white p-1 rounded-lg hover:bg-neutral-800 text-xs flex items-center gap-1"
                        title="সমীকরণ কপি করুন"
                      >
                        {copiedId === `eq_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="bg-black/60 border border-neutral-800 rounded-xl p-3 font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed">
                      {eq.equation}
                    </div>
                  </div>

                  <p className="text-[12px] text-neutral-400 leading-relaxed border-t border-neutral-800/60 pt-2">
                    💡 {eq.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Core Principles & Parameter Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Core Principles */}
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>মূল টেকনিক্যাল নীতিসমূহ (Core Principles)</span>
              </h4>
              <ul className="space-y-2 text-xs text-neutral-300 leading-relaxed">
                {currentKnowledge.summary.corePrinciples.map((principle, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                      ✓
                    </span>
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* System Parameters & Variables */}
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>সিস্টেম প্যারামিটার ও ভেরিয়েবল (System Parameters)</span>
              </h4>
              <div className="space-y-2">
                {currentKnowledge.summary.parameterBreakdown.map((param, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                    <div>
                      <strong className="text-white font-mono">{param.param}</strong>
                      <span className="text-neutral-400 text-[11px] block">{param.meaning}</span>
                    </div>
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                      {param.defaultVal}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Real-world Engineering Use Cases */}
          <div className="bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-900/40 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>বাস্তব ইন্ডাস্ট্রি ও ইঞ্জিনিয়ারিং অ্যাপ্লিকেশন (Real-World Applications)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-300">
              {currentKnowledge.summary.engineeringUseCases.map((useCase, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  <span>{useCase}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: প্রশ্নোত্তর ব্যাংক ও এফএকিউ (CURATED TECHNICAL Q&A / FAQS) */}
      {/* ========================================================================= */}
      {activeTab === 'qna' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-pink-400" />
              <span>{currentKnowledge.title} — গুরুত্বপূর্ণ টেকনিক্যাল প্রশ্নোত্তর</span>
            </h4>
            <span className="text-xs text-neutral-400">
              মোট {currentKnowledge.qnaList.length}টি প্রশ্ন
            </span>
          </div>

          <div className="space-y-3">
            {currentKnowledge.qnaList.map((item, idx) => {
              const isExpanded = expandedQnaId === item.id;
              return (
                <div 
                  key={item.id}
                  className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setExpandedQnaId(isExpanded ? null : item.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-neutral-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-indigo-500/20">
                        Q{idx + 1}
                      </span>
                      <span className="font-semibold text-sm text-neutral-100">
                        {item.question}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-neutral-800/80 space-y-3 bg-neutral-950/40">
                      <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        {item.answer}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/40">
                        <span className="text-[11px] text-neutral-500">
                          প্রজেক্ট: {currentKnowledge.subtitle}
                        </span>
                        <button
                          onClick={() => handleCopy(`${item.question}\n\nউত্তর:\n${item.answer}`, item.id)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-300 flex items-center gap-1.5 transition-all border border-neutral-700/60"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">কপি সম্পন্ন!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>উত্তর কপি করুন</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Call to action for custom question */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>আপনার কি এই প্রজেক্ট সম্পর্কে আরও কোনো নির্দিষ্ট প্রশ্ন আছে?</span>
            </div>
            <button
              onClick={() => setActiveTab('ask_ai')}
              className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-all flex items-center gap-1"
            >
              <span>AI কে জিজ্ঞেস করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: লাইভ AI প্রশ্নোত্তর সহকারী (INTERACTIVE GEMINI AI Q&A ASSISTANT)  */}
      {/* ========================================================================= */}
      {activeTab === 'ask_ai' && (
        <div className="space-y-4">
          
          {/* Quick Suggested One-Click Prompts */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-400 block">
              💡 এই প্রজেক্ট সম্পর্কে সরাসরি এক ক্লিকে AI-কে জিজ্ঞেস করুন:
            </span>
            <div className="flex flex-wrap gap-2">
              {currentKnowledge.suggestedAiPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuestion(prompt)}
                  disabled={isAiLoading}
                  className="text-xs px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-pink-500/40 transition-all flex items-center gap-1.5 text-left disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3 text-pink-400 shrink-0" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Chat History Container */}
          <div className="min-h-[220px] max-h-[380px] overflow-y-auto bg-neutral-950 border border-neutral-800/90 rounded-2xl p-4 space-y-4">
            {aiChatHistory.length === 0 ? (
              <div className="h-full py-8 flex flex-col items-center justify-center text-center space-y-2 text-neutral-400">
                <Bot className="w-10 h-10 text-indigo-400/60" />
                <p className="text-sm font-medium text-neutral-300">
                  "{currentKnowledge.title}" সম্পর্কে যেকোনো প্রশ্ন জিজ্ঞাসা করুন
                </p>
                <p className="text-xs text-neutral-500 max-w-md">
                  গাণিতিক ডেরিভেশন, কোড ব্যাখ্যা, বাস্তব ইঞ্জিনিয়ারিং প্রয়োগ, থিসিস রাইটিং বা কাস্টম অ্যালগরিদম সম্পর্কে প্রশ্ন করতে পারেন।
                </p>
              </div>
            ) : (
              aiChatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 border-b border-white/10 pb-1 mb-1">
                      <span>{msg.sender === 'user' ? 'আপনি' : 'AI STEM Expert (Gemini)'}</span>
                      <span>{msg.time}</span>
                    </div>
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.text}
                    </div>
                    {msg.sender === 'ai' && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleCopy(msg.text, `ai_msg_${idx}`)}
                          className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800"
                        >
                          {copiedId === `ai_msg_${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>কপি</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isAiLoading && (
              <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl w-fit">
                <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-neutral-300 animate-pulse">
                  "{currentKnowledge.title}" এর গাণিতিক মডেল ও ডেটা বিশ্লেষণ করছে...
                </span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Question Input Box with Voice Mic & Send Button */}
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendQuestion();
              }}
              placeholder={`"${currentKnowledge.title}" সম্পর্কে যে কোনো প্রশ্ন লিখুন...`}
              disabled={isAiLoading}
              className="flex-1 bg-neutral-950 border border-neutral-700/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all pr-24"
            />

            <div className="absolute right-2 flex items-center gap-1.5">
              {/* Voice Input Button */}
              <button
                onClick={handleToggleVoice}
                className={`p-2 rounded-xl border text-xs transition-all ${
                  isRecording 
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse ring-2 ring-rose-400/50' 
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-700'
                }`}
                title={isRecording ? 'ভয়েস রেকর্ডিং চলছে...' : 'মুখে বাংলায় প্রশ্ন বলুন (ভয়েস ইনপুট)'}
              >
                {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Submit Button */}
              <button
                onClick={() => handleSendQuestion()}
                disabled={!userQuestion.trim() || isAiLoading}
                className="px-3.5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-lg shadow-pink-600/30 transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">সেন্ড</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: প্রজেক্ট থেকে আয় ও ফ্রিল্যান্সিং গাইড (MONETIZATION & DELIVERABLES) */}
      {/* ========================================================================= */}
      {activeTab === 'monetization' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1.5">
              <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                টার্গেট ক্লায়েন্ট ও অডিয়েন্স
              </span>
              <p className="text-white font-medium">
                {currentKnowledge.monetizationInfo.targetAudience}
              </p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1.5">
              <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                সম্ভাব্য প্রজেক্ট ফি / পারিশ্রমিক
              </span>
              <p className="text-emerald-400 font-bold text-sm">
                {currentKnowledge.monetizationInfo.expectedFee}
              </p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-1.5">
              <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider block">
                ডেলিভারেবল ফাইল ও ম্যাটেরিয়াল
              </span>
              <ul className="text-neutral-300 list-disc list-inside space-y-0.5">
                {currentKnowledge.monetizationInfo.deliverables.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* Ready to send pitch */}
          <div className="bg-pink-950/20 border border-pink-900/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>ক্লায়েন্টকে পাঠানোর প্রস্তুত বিকাশ পিচ বার্তা</span>
              </h5>
              <button
                onClick={() => handleCopy(currentKnowledge.monetizationInfo.pitchMessage, 'pitch_msg')}
                className="px-2.5 py-1 rounded-lg bg-pink-900/40 hover:bg-pink-900/60 text-pink-200 text-xs flex items-center gap-1"
              >
                {copiedId === 'pitch_msg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>পিচ কপি</span>
              </button>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-300 italic">
              "{currentKnowledge.monetizationInfo.pitchMessage}"
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (onSelectForInvoice) {
                  const feeMatch = currentKnowledge.monetizationInfo.expectedFee.match(/\d+[\d,]*/);
                  const amount = feeMatch ? parseInt(feeMatch[0].replace(/,/g, ''), 10) || 3000 : 3000;
                  onSelectForInvoice(currentKnowledge.title, amount);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-600/30 transition-all active:scale-95"
            >
              <DollarSign className="w-4 h-4" />
              <span>এই প্রজেক্টের জন্য বিকাশ পেমেন্ট স্লিপ তৈরি করুন</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
