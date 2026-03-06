export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_premium: number;
  bi_number?: string;
  birth_date?: string;
  age?: number;
  gender?: string;
  address?: string;
  phone?: string;
  height?: string;
  created_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  user_name: string;
  type: 'photo' | 'video';
  url: string;
  caption: string;
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  type: 'text' | 'image' | 'audio';
  created_at: string;
}

export interface Payment {
  id: number;
  user_id: number;
  user_name: string;
  status: 'pending' | 'approved';
  amount: number;
  method: string;
  created_at: string;
}
