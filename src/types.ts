export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  category: 'core' | 'coordinator' | 'lead';
  phone: string;
  image: string;
  village: string;
}

export interface WorkUpdate {
  id: string;
  day: number;
  title: string;
  date: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Scheduled';
  progress: number;
  photos: string[];
  lead: string;
}

export interface LiveUpdatePost {
  id: string;
  author: string;
  role: string;
  title: string;
  content: string;
  timestamp: string;
  tag: 'Announcement' | 'Pooja' | 'Work' | 'Cultural' | 'Prasadam' | 'Important';
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  reactions: {
    pranam: number;
    heart: number;
    fire: number;
  };
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Festival' | 'Preparation' | 'Committee' | 'Volunteers' | 'Decoration' | 'Lighting' | 'Pooja' | 'Crowd';
  imageUrl: string;
  description: string;
  year?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  company: string;
  tier: 'Title Sponsor' | 'Platinum' | 'Gold' | 'Silver' | 'Community Patron';
  contribution: string;
  logo: string;
  message?: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  village: string;
  amount: number;
  paymentMethod: 'UPI / PhonePe' | 'Google Pay' | 'Paytm' | 'Bank Transfer' | 'Cash / Offline';
  date: string;
  time: string;
  status: 'Verified' | 'Pending Verification';
  receiptNo: string;
  message?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  responsibility: string;
  phone: string;
  image: string;
  wing: string;
}

export interface ScheduleEvent {
  time: string;
  title: string;
  description: string;
  venue: string;
  category: 'Pooja' | 'Annadanam' | 'Cultural' | 'Procession';
}
