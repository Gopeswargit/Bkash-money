export type CategoryType = 'math_projects' | 'services' | 'digital_products' | 'tutoring' | 'ecommerce' | 'creator';

export interface EarningIdea {
  id: string;
  category: CategoryType;
  titleBn: string;
  titleEn: string;
  requirement: 'mobile_only' | 'computer' | 'both';
  difficulty: 'সহজ' | 'মাঝারি' | 'এডভান্স';
  estimatedEarnings: string;
  whatToBuild: string;
  howToSell: string;
  paymentPitchExample: string;
  toolsNeeded: string[];
  tips: string;
}

export interface InvoiceData {
  bKashNumber: string;
  accountType: 'Personal' | 'Merchant' | 'Agent';
  clientName: string;
  serviceOrProduct: string;
  amount: number;
  invoiceNumber: string;
  date: string;
  notes: string;
}

export interface ClientMessageTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  template: (data: { bKashNumber: string; service: string; amount: number; clientName: string }) => string;
}

// --- SOCIAL, COMMUNITY, LIVE STREAM & PROFILE TYPES ---

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  title?: string;
  bKashNumber?: string;
  website?: string;
  github?: string;
  facebook?: string;
  specialties?: string[];
  followersCount?: number;
  followingCount?: number;
  createdAt?: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  authorTitle?: string;
  content: string;
  category?: string;
  mediaType?: 'text' | 'simulation' | 'video' | 'code' | 'image';
  mediaUrl?: string;
  simulationType?: string;
  simulationConfig?: Record<string, unknown>;
  simulationCode?: string;
  likes: string[]; // array of user uids
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  createdAt: string;
}

export interface LiveStreamSession {
  id: string;
  hostId: string;
  hostName: string;
  hostPhoto?: string;
  title: string;
  description?: string;
  category: string;
  simulationType: string;
  status: 'live' | 'ended' | 'scheduled';
  streamType: 'webcam' | 'screen' | 'simulation_sync';
  viewerCount: number;
  likesCount: number;
  createdAt: string;
}

export interface LiveStreamMessage {
  id: string;
  streamId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  message: string;
  type?: 'chat' | 'reaction' | 'superchat';
  createdAt: string;
}
