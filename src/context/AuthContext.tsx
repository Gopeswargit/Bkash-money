import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginAnonymously: (guestName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
  fetchOtherUserProfile: (uid: string) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Listen or fetch Firestore Profile
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeProfile = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // Initialize basic profile in Firestore
            const initialProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || (user.isAnonymous ? 'অতিথি গবেষক' : user.email?.split('@')[0] || 'ইউজার'),
              email: user.email || 'guest@simulation.community',
              photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
              bio: 'ম্যাথ ও ফিজিক্স সিমুলেশন গবেষক ও ক্রিয়েটর।',
              title: 'সিমুলেশন অ্যানালাইজার',
              specialties: ['Mathematics', 'Robotics', 'Kinematics'],
              followersCount: 0,
              followingCount: 0,
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, initialProfile, { merge: true });
            setUserProfile(initialProfile);
          }
        });
        setLoading(false);
        return () => unsubscribeProfile();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Save to Firestore
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'গবেষক',
        email: user.email || '',
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        bio: 'ম্যাথ, রোবোটিক্স এবং ফিজিক্স সিমুলেশন এক্সপ্লোরার।',
        title: 'সিমুলেশন ইঞ্জিনিয়ার',
        specialties: ['Physics', 'Kinematics', 'Algorithms'],
        followersCount: 0,
        followingCount: 0,
        createdAt: new Date().toISOString()
      };
      await setDoc(userRef, newProfile);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, {
      displayName: name,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${result.user.uid}`
    });
    
    const userRef = doc(db, 'users', result.user.uid);
    const newProfile: UserProfile = {
      uid: result.user.uid,
      displayName: name,
      email: email,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${result.user.uid}`,
      bio: 'ম্যাথ ও রোবোটিক্স সিমুলেশন স্টুডিও মেম্বার।',
      title: 'সিমুলেশন ক্রিয়েটর',
      specialties: ['Mathematics', 'Robotics'],
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString()
    };
    await setDoc(userRef, newProfile);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const loginAnonymously = async (guestName?: string) => {
    const result = await signInAnonymously(auth);
    const name = guestName || `অতিথি-${Math.floor(1000 + Math.random() * 9000)}`;
    await updateProfile(result.user, {
      displayName: name,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${result.user.uid}`
    });
    const userRef = doc(db, 'users', result.user.uid);
    const guestProfile: UserProfile = {
      uid: result.user.uid,
      displayName: name,
      email: 'guest@simulation.local',
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${result.user.uid}`,
      bio: 'লাইভ গেস্ট ভিজিটর ও সিমুলেশন শিক্ষার্থী।',
      title: 'গেস্ট রিসার্চার',
      specialties: ['Simulations'],
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString()
    };
    await setDoc(userRef, guestProfile);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const updateUserProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, data);
    setUserProfile(prev => prev ? ({ ...prev, ...data }) : null);
  };

  const fetchOtherUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (e) {
      console.error('Error fetching profile:', e);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      signInWithGoogle,
      signUpWithEmail,
      loginWithEmail,
      loginAnonymously,
      logout,
      updateUserProfileData,
      fetchOtherUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
