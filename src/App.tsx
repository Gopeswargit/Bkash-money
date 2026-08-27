import React, { useState } from 'react';
import { IdeaExplorer } from './components/IdeaExplorer';
import { MathSimulationStudio } from './components/MathSimulationStudio';
import { PaymentCardGenerator } from './components/PaymentCardGenerator';
import { PitchGenerator } from './components/PitchGenerator';
import { RoadmapGuide } from './components/RoadmapGuide';
import { SecurityGuide } from './components/SecurityGuide';
import { SocialProfileCard } from './components/SocialProfileCard';
import { SimulationCommunityFeed } from './components/SimulationCommunityFeed';
import { LiveStreamingHub } from './components/LiveStreamingHub';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CREATOR_PROFILE } from './data/socialLinks';
import { 
  Sparkles, 
  CreditCard, 
  Lightbulb, 
  MessageSquare, 
  Compass, 
  ShieldCheck, 
  Phone,
  Layers,
  ChevronRight,
  TrendingUp,
  Wallet,
  FunctionSquare,
  User,
  Users,
  Radio,
  LogIn,
  LogOut,
  PlusCircle,
  Facebook,
  Github,
  Youtube,
  Instagram,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { currentUser, userProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'math_studio' | 'community' | 'livestream' | 'ideas' | 'card' | 'pitch' | 'roadmap' | 'security' | 'profile'>('math_studio');
  const [selectedServiceForCard, setSelectedServiceForCard] = useState<string>('ক্যালকুলাস ও ফিজিক্স সিমুলেশন প্রজেক্ট');
  const [selectedAmountForCard, setSelectedAmountForCard] = useState<number>(2500);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [targetProfileUid, setTargetProfileUid] = useState<string | undefined>(undefined);
  const [isLiveHubOpen, setIsLiveHubOpen] = useState<boolean>(false);

  const handleSelectForInvoice = (serviceName: string, amount: number) => {
    setSelectedServiceForCard(serviceName);
    setSelectedAmountForCard(amount);
    setActiveTab('card');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenUserProfile = (uid: string) => {
    setTargetProfileUid(uid);
    setIsProfileModalOpen(true);
  };

  const handleOpenSimulationDirect = (simType: string) => {
    setActiveTab('math_studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'math_studio', label: 'স্টেম ও ফিজিক্স ল্যাব', icon: FunctionSquare, badge: '৬টি ইঞ্জিন 🤖' },
    { id: 'community', label: 'কমিউনিটি ফিড ও সোশ্যাল', icon: Users, badge: 'লাইক • কমেন্ট' },
    { id: 'livestream', label: 'লাইভ স্ট্রিমিং ও চ্যাট', icon: Radio, badge: 'LIVE 🔴' },
    { id: 'profile', label: 'আমার প্রোফাইল', icon: User, badge: userProfile?.displayName || 'Gopeswar Roy' },
    { id: 'ideas', label: 'আয়ের আইডিয়া', icon: Lightbulb, badge: '১৬+ স্কিল' },
    { id: 'card', label: 'বিকাশ পেমেন্ট স্লিপ', icon: CreditCard, badge: '01728045202' },
    { id: 'pitch', label: 'মেসেজ জেনারেটর', icon: MessageSquare, badge: 'রেডিমেড' },
    { id: 'roadmap', label: 'রোডম্যাপ', icon: Compass, badge: '০ থেকে আয়' },
    { id: 'security', label: 'নিরাপত্তা', icon: ShieldCheck, badge: 'জরুরি' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0D12] text-neutral-100 flex flex-col antialiased selection:bg-pink-500 selection:text-white font-sans">
      
      {/* Top Notification Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E2136E] to-rose-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-pink-600/30 ring-1 ring-pink-400/40">
              b
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white">
                  বিকাশ ডিজিটাল আয় ও সোশ্যাল স্টুডিও
                </h1>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 hidden sm:inline-block">
                  Live Network
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Gopeswar Roy • স্টেম সিমুলেশন, লাইভ স্ট্রিমিং ও কমিউনিটি নেটওয়ার্ক
              </p>
            </div>
          </div>

          {/* User Auth & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            {/* Live Streaming Quick Launch Button */}
            <button
              onClick={() => setIsLiveHubOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>লাইভ স্ট্রীম</span>
            </button>

            {/* Auth Profile Section */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-1 pr-2">
                <img
                  src={userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`}
                  alt={userProfile?.displayName || 'User'}
                  onClick={() => handleOpenUserProfile(currentUser.uid)}
                  className="w-8 h-8 rounded-xl bg-neutral-800 border border-indigo-500/50 cursor-pointer object-cover"
                  title="আপনার প্রোফাইল খুলুন"
                />
                <div 
                  onClick={() => handleOpenUserProfile(currentUser.uid)}
                  className="text-left cursor-pointer hidden md:block"
                >
                  <div className="text-xs font-bold text-white hover:text-indigo-400 transition-colors line-clamp-1 max-w-[110px]">
                    {userProfile?.displayName || 'গবেষক'}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    মেম্বার প্রোফাইল
                  </div>
                </div>

                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-all ml-1"
                  title="লগআউট করুন"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>রেজিস্ট্রেশন / লগইন</span>
              </button>
            )}

            {/* bKash Quick Card */}
            <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 rounded-2xl px-2.5 py-1 hidden sm:flex">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-neutral-200">01728045202</span>
            </div>

          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2 border-t border-neutral-800/40">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-pink-400' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-pink-500/20 text-pink-300 font-semibold' : 'bg-neutral-800/60 text-neutral-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          
          {/* TAB: MATH STUDIO */}
          {activeTab === 'math_studio' && (
            <motion.div
              key="math_studio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <MathSimulationStudio onSelectForInvoice={handleSelectForInvoice} />
            </motion.div>
          )}

          {/* TAB: COMMUNITY FEED */}
          {activeTab === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <SimulationCommunityFeed
                onOpenSimulation={handleOpenSimulationDirect}
                onOpenProfile={handleOpenUserProfile}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onOpenLiveStream={() => setIsLiveHubOpen(true)}
              />
            </motion.div>
          )}

          {/* TAB: LIVE STREAMING */}
          {activeTab === 'livestream' && (
            <motion.div
              key="livestream"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-4">
                <Radio className="w-12 h-12 mx-auto text-rose-500 animate-pulse" />
                <h3 className="text-xl font-bold text-white">লাইভ ব্রডকাস্টিং ও সিমুলেশন শো রুম</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  রিয়েল-টাইম ক্যামেরা, স্ক্রিন শেয়ারিং ও লাইভ চ্যাট মেসেজিংয়ের মাধ্যমে ইন্টারঅ্যাক্ট করুন।
                </p>
                <button
                  onClick={() => setIsLiveHubOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 inline-flex items-center gap-2"
                >
                  <Radio className="w-4 h-4" />
                  <span>ফুলস্ক্রিন লাইভ হাব খুলুন</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {currentUser && (
                <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={userProfile?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`}
                      alt="User"
                      className="w-12 h-12 rounded-2xl bg-neutral-800 border border-indigo-500 object-cover"
                    />
                    <div>
                      <h4 className="text-base font-bold text-white">{userProfile?.displayName || 'আমার প্রোফাইল'}</h4>
                      <p className="text-xs text-neutral-400">{currentUser.email || 'অতিথি অ্যাকাউন্ট'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenUserProfile(currentUser.uid)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    আমার প্রোফাইল এডিট ও প্রিভিউ করুন
                  </button>
                </div>
              )}
              <SocialProfileCard />
            </motion.div>
          )}

          {/* TAB: IDEAS */}
          {activeTab === 'ideas' && (
            <motion.div
              key="ideas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <IdeaExplorer onSelectForInvoice={handleSelectForInvoice} />
            </motion.div>
          )}

          {/* TAB: CARD */}
          {activeTab === 'card' && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <PaymentCardGenerator
                initialService={selectedServiceForCard}
                initialAmount={selectedAmountForCard}
              />
            </motion.div>
          )}

          {/* TAB: PITCH */}
          {activeTab === 'pitch' && (
            <motion.div
              key="pitch"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <PitchGenerator />
            </motion.div>
          )}

          {/* TAB: ROADMAP */}
          {activeTab === 'roadmap' && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <RoadmapGuide />
            </motion.div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <SecurityGuide />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-8 px-4 sm:px-6 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="font-semibold text-white text-sm flex items-center justify-center md:justify-start gap-2">
              <span>{CREATOR_PROFILE.name}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-pink-400 font-mono">01728045202</span>
            </div>
            <p className="text-neutral-500 mt-1 text-[11px]">
              বিকাশ ডিজিটাল আয় ও স্টেম সিমুলেশন হাব • সম্পূর্ণ সিকিউরড ও অফিশিয়াল গাইড
            </p>
          </div>

          {/* Social Profiles in Footer */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.facebook.com/share/1DeZJL2g74/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-blue-600/20 border border-neutral-800 text-neutral-300 hover:text-blue-400 transition-all text-xs"
            >
              <Facebook className="w-3.5 h-3.5" />
              <span>Facebook</span>
            </a>
            <a
              href="https://github.com/Gopeswargit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all text-xs"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.youtube.com/@GopeswarRoyjq9yi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-red-600/20 border border-neutral-800 text-neutral-300 hover:text-red-400 transition-all text-xs"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube</span>
            </a>
            <a
              href="https://www.instagram.com/gopeswarroy2?igsi=MWZibnVxejllNmx3ag=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-pink-600/20 border border-neutral-800 text-neutral-300 hover:text-pink-400 transition-all text-xs"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>হেল্পলাইন: 16247</span>
            <span>•</span>
            <button onClick={() => setActiveTab('security')} className="hover:underline text-pink-400">
              নিরাপত্তা নির্দেশিকা
            </button>
          </div>
        </div>
      </footer>

      {/* POPUP MODALS */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        targetUserId={targetProfileUid}
        onClose={() => {
          setIsProfileModalOpen(false);
          setTargetProfileUid(undefined);
        }}
        onOpenSimulation={handleOpenSimulationDirect}
      />

      <LiveStreamingHub
        isOpen={isLiveHubOpen}
        onClose={() => setIsLiveHubOpen(false)}
        onOpenProfile={handleOpenUserProfile}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
