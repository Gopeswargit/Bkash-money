export interface SocialLink {
  id: string;
  name: string;
  username: string;
  url: string;
  iconName: 'Instagram' | 'Github' | 'Youtube' | 'Facebook';
  color: string;
  bgGradient: string;
  description: string;
}

export const CREATOR_PROFILE = {
  name: 'Gopeswar Roy',
  title: 'Mathematics, STEM & Robotics Developer',
  email: 'gopeswarroy2@gmail.com',
  bKashNumber: '01728045202',
  socialLinks: [
    {
      id: 'facebook',
      name: 'Facebook',
      username: 'Gopeswar Roy',
      url: 'https://www.facebook.com/share/1DeZJL2g74/',
      iconName: 'Facebook',
      color: '#1877F2',
      bgGradient: 'from-blue-600/20 to-blue-500/10 border-blue-500/30 hover:border-blue-500/60',
      description: 'ফেসবুক প্রোফাইল ও ডিরেক্ট মেসেজ'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      username: '@GopeswarRoyjq9yi',
      url: 'https://www.youtube.com/@GopeswarRoyjq9yi',
      iconName: 'Youtube',
      color: '#FF0000',
      bgGradient: 'from-red-600/20 to-rose-500/10 border-red-500/30 hover:border-red-500/60',
      description: 'ভিডিও টিউটোরিয়াল ও সিমুলেশন ডেমো'
    },
    {
      id: 'github',
      name: 'GitHub',
      username: 'Gopeswargit',
      url: 'https://github.com/Gopeswargit',
      iconName: 'Github',
      color: '#F0F6FC',
      bgGradient: 'from-neutral-700/20 to-neutral-800/20 border-neutral-600/30 hover:border-neutral-400/60',
      description: 'ওপেন-সোর্স কোড ও রিপোজিটরি'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      username: '@gopeswarroy2',
      url: 'https://www.instagram.com/gopeswarroy2?igsi=MWZibnVxejllNmx3ag==',
      iconName: 'Instagram',
      color: '#E4405F',
      bgGradient: 'from-pink-600/20 via-purple-600/20 to-orange-500/10 border-pink-500/30 hover:border-pink-500/60',
      description: 'ভিজুয়াল আপডেট ও পার্সোনাল কানেক্ট'
    }
  ] as SocialLink[]
};
