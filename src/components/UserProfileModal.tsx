import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Globe, 
  Github, 
  Facebook, 
  Award, 
  Share2, 
  Check, 
  Phone, 
  Sparkles, 
  Code, 
  Flame,
  Users,
  Eye,
  Camera,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, CommunityPost } from '../types';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import confetti from 'canvas-confetti';

interface Props {
  targetUserId?: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenSimulation?: (simType: string, code?: string) => void;
}

export const UserProfileModal: React.FC<Props> = ({ 
  targetUserId, 
  isOpen, 
  onClose,
  onOpenSimulation 
}) => {
  const { currentUser, userProfile, updateUserProfileData, fetchOtherUserProfile } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit states
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editBkash, setEditBkash] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editFacebook, setEditFacebook] = useState('');
  const [editSpecialties, setEditSpecialties] = useState('');

  const isOwnProfile = !targetUserId || (currentUser && targetUserId === currentUser.uid);

  useEffect(() => {
    if (!isOpen) return;

    const loadProfile = async () => {
      setLoading(true);
      const uidToFetch = targetUserId || currentUser?.uid;
      
      if (!uidToFetch) {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (isOwnProfile && userProfile) {
        setProfile(userProfile);
        setEditName(userProfile.displayName || '');
        setEditTitle(userProfile.title || '');
        setEditBio(userProfile.bio || '');
        setEditBkash(userProfile.bKashNumber || '');
        setEditWebsite(userProfile.website || '');
        setEditGithub(userProfile.github || '');
        setEditFacebook(userProfile.facebook || '');
        setEditSpecialties((userProfile.specialties || []).join(', '));
      } else {
        const fetched = await fetchOtherUserProfile(uidToFetch);
        setProfile(fetched);
      }

      // Load user's shared posts
      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('authorId', '==', uidToFetch));
        const snap = await getDocs(q);
        const posts: CommunityPost[] = [];
        snap.forEach(d => {
          posts.push({ id: d.id, ...d.data() } as CommunityPost);
        });
        // Sort client side
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserPosts(posts);
      } catch (err) {
        console.error('Error fetching user posts:', err);
      }

      setLoading(false);
    };

    loadProfile();
  }, [isOpen, targetUserId, currentUser, userProfile]);

  if (!isOpen) return null;

  const handleSaveProfile = async () => {
    try {
      const updatedData: Partial<UserProfile> = {
        displayName: editName.trim(),
        title: editTitle.trim(),
        bio: editBio.trim(),
        bKashNumber: editBkash.trim(),
        website: editWebsite.trim(),
        github: editGithub.trim(),
        facebook: editFacebook.trim(),
        specialties: editSpecialties.split(',').map(s => s.trim()).filter(Boolean)
      };

      await updateUserProfileData(updatedData);
      setProfile(prev => prev ? ({ ...prev, ...updatedData }) : null);
      setIsEditing(false);
      
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch (e) {
      console.error('Failed to update profile:', e);
    }
  };

  const handleCopyProfileLink = () => {
    const link = `${window.location.origin}/?user=${profile?.uid || ''}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-neutral-400">প্রোফাইল ডাটা লোড হচ্ছে...</p>
          </div>
        ) : !profile ? (
          <div className="py-16 text-center text-neutral-400 space-y-3">
            <User className="w-12 h-12 mx-auto text-neutral-600" />
            <p>প্রোফাইল খুঁজে পাওয়া যায়নি বা ব্যবহারকারী এখনো নিবন্ধন করেননি।</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Top Cover & Avatar Banner */}
            <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-neutral-900 border border-indigo-900/30 p-6 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                <div className="relative">
                  <img
                    src={profile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.uid}`}
                    alt={profile.displayName}
                    className="w-24 h-24 rounded-2xl bg-neutral-800 border-2 border-indigo-500 shadow-xl object-cover"
                  />
                  {isOwnProfile && (
                    <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-indigo-600 text-white shadow">
                      <Camera className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xl font-bold text-white">
                      {profile.displayName || 'গবেষক'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold">
                      ভেরিফাইড ক্রিয়েটর
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300 font-medium">
                    {profile.title || 'ম্যাথ ও ফিজিক্স সিমুলেশন ইঞ্জিনিয়ার'}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    মেম্বার আইডি: <span className="font-mono text-neutral-500">{profile.uid.substring(0, 8)}...</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyProfileLink}
                  className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="প্রোফাইল লিংক শেয়ার করুন"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'কপিকৃত' : 'শেয়ার'}</span>
                </button>

                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'এডিট বাতিল' : 'প্রোফাইল সাজান'}</span>
                  </button>
                )}
              </div>

            </div>

            {/* Profile Edit Mode Form */}
            {isEditing ? (
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-2">
                  <Edit3 className="w-4 h-4 text-indigo-400" />
                  <span>প্রোফাইল তথ্য আপডেট করুন</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400">নাম</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400">টাইটেল / পদবী</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="রোবোটিক্স গবেষক / গণিত শিক্ষক"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400">বিকাশ পার্সোনাল / মার্চেন্ট নম্বর</label>
                    <input
                      type="text"
                      value={editBkash}
                      onChange={(e) => setEditBkash(e.target.value)}
                      placeholder="017XXXXXXXX (টিপস ও আর্নিং এর জন্য)"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400">স্পেশালিটিস (কমা দিয়ে লিখুন)</label>
                    <input
                      type="text"
                      value={editSpecialties}
                      onChange={(e) => setEditSpecialties(e.target.value)}
                      placeholder="Robotics, Calculus, Linear Algebra"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">বায়ো / নিজের সম্পর্কে বিস্তারিত</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="আপনার কাজের অভিজ্ঞতা ও পছন্দের ফিল্ড সম্পর্কে লিখুন..."
                    className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="ওয়েবসাইট লিংক"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs"
                  />
                  <input
                    type="text"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    placeholder="GitHub প্রোফাইল"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs"
                  />
                  <input
                    type="text"
                    value={editFacebook}
                    onChange={(e) => setEditFacebook(e.target.value)}
                    placeholder="Facebook প্রোফাইল"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-400 text-xs font-semibold hover:text-white"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Profile Details View */
              <div className="space-y-4">
                
                {/* Bio */}
                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
                  <p>{profile.bio || 'এখনো বায়ো যোগ করা হয়নি।'}</p>
                </div>

                {/* Badges & Specialties */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {(profile.specialties || ['Physics', 'Robotics', 'Mathematics']).map((spec, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-cyan-400 text-[11px] font-medium flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>{spec}</span>
                    </span>
                  ))}
                  {profile.bKashNumber && (
                    <span className="px-2.5 py-1 rounded-lg bg-pink-950/40 border border-pink-800/60 text-pink-300 text-[11px] font-semibold flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>বিকাশ: {profile.bKashNumber}</span>
                    </span>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 pt-1">
                  {profile.website && (
                    <a
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-indigo-400 flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>ওয়েবসাইট</span>
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-indigo-400 flex items-center gap-1.5"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profile.facebook && (
                    <a
                      href={profile.facebook.startsWith('http') ? profile.facebook : `https://facebook.com/${profile.facebook}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-indigo-400 flex items-center gap-1.5"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      <span>Facebook</span>
                    </a>
                  )}
                </div>

              </div>
            )}

            {/* Shared Simulations & Posts */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>ব্যবহারকারীর শেয়ারকৃত পোস্ট ও সিমুলেশনসমূহ ({userPosts.length})</span>
                </h4>
              </div>

              {userPosts.length === 0 ? (
                <div className="p-8 text-center bg-neutral-950/50 rounded-2xl border border-neutral-850 text-neutral-500 text-xs">
                  এখনো কোনো সিমুলেশন বা পোস্ট শেয়ার করা হয়নি।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userPosts.map(post => (
                    <div
                      key={post.id}
                      className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5 hover:border-neutral-700 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/60 text-[10px] font-semibold uppercase">
                          {post.category || 'Simulation'}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(post.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-200 line-clamp-2">
                        {post.content}
                      </p>

                      {post.simulationType && (
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => {
                              if (onOpenSimulation) {
                                onOpenSimulation(post.simulationType || 'robotics', post.simulationCode);
                                onClose();
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>সিমুলেশনটি রান করুন</span>
                          </button>
                          <span className="text-[11px] text-neutral-400">
                            ❤️ {post.likesCount || 0} লাইক
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
