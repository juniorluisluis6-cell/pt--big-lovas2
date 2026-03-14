export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_premium: boolean;
  is_banned?: boolean;
  banned_at?: string;
  avatar_url?: string;
  bi_number?: string;
  birth_date?: string;
  age?: number;
  gender?: string;
  address?: string;
  phone?: string;
  height?: string;
  following_count?: number;
  followers_count?: number;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  type: 'photo' | 'video';
  url: string;
  caption: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  post_id: string;
  content: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: 'text' | 'image' | 'audio';
  created_at: string;
}
