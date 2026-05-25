export interface Profile {
  id: string;
  username: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  referral_code: string;
  created_at: string;
  email?: string | null;
}

export interface Platform {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
  password_count?: number; // helper field computed on fly
}

export interface PasswordLevel {
  label: string;
  value: string; // encrypted
}

export interface Password {
  id: string;
  user_id: string;
  platform_id: string | null;
  account_name: string;
  password_levels: PasswordLevel[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TelegramConfig {
  id: string;
  user_id: string;
  bot_token: string | null;
  chat_id: string | null;
  is_active: boolean;
  notify_new_password: boolean;
  notify_suspicious_login: boolean;
  notify_system_update: boolean;
  created_at: string;
}

export type Language = 'vi' | 'en' | 'zh';

export interface TelegramMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  created_at: string;
}
