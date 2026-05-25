import { createClient } from '@supabase/supabase-js';
import { Profile, Platform, Password, TelegramConfig } from '../types';
import { isFirebaseConfigured, firebaseDatabaseService, auth } from './firebase';

// Detect if Supabase is validly configured
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  supabaseUrl.startsWith('https://');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;


// ==========================================
// HIGH FIDELITY OFFLINE/LOCAL DATABASE EMULATOR
// ==========================================
const KEY_USERS = 'noka_users';
const KEY_PROFILES = 'noka_profiles';
const KEY_PLATFORMS = 'noka_platforms';
const KEY_PASSWORDS = 'noka_passwords';
const KEY_TELEGRAM = 'noka_telegram';

// Setup default mock platform data if local database is empty
const initializeDefaultPlatformData = (userId: string) => {
  const currentPlatforms = localStorage.getItem(KEY_PLATFORMS);
  if (!currentPlatforms || JSON.parse(currentPlatforms).length === 0) {
    const defaultPlats: Platform[] = [
      {
        id: 'plat-fb',
        user_id: userId,
        name: 'Facebook',
        logo_url: 'https://img.icons8.com/color/120/facebook-new.png',
        created_at: new Date().toISOString(),
      },
      {
        id: 'plat-ig',
        user_id: userId,
        name: 'Instagram',
        logo_url: 'https://img.icons8.com/color/120/instagram-new.png',
        created_at: new Date().toISOString(),
      },
      {
        id: 'plat-tt',
        user_id: userId,
        name: 'TikTok',
        logo_url: 'https://img.icons8.com/color/120/tiktok.png',
        created_at: new Date().toISOString(),
      },
      {
        id: 'plat-tg',
        user_id: userId,
        name: 'Telegram',
        logo_url: 'https://img.icons8.com/color/120/telegram-app.png',
        created_at: new Date().toISOString(),
      }
    ];
    localStorage.setItem(KEY_PLATFORMS, JSON.stringify(defaultPlats));
  }
};

export const databaseService = {
  // --- Profiles ---
  async getProfile(userId: string): Promise<Profile | null> {
    if (isFirebaseConfigured && auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const profile = await firebaseDatabaseService.getProfile(userId);
        if (profile) return profile;
      } catch (err) {
        console.warn('Firebase getProfile failed, falling back to local storage:', err);
      }
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('Supabase profile pull error:', error);
        return null;
      }
      return data;
    } else {
      const profiles = JSON.parse(localStorage.getItem(KEY_PROFILES) || '[]');
      return profiles.find((p: Profile) => p.id === userId) || null;
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    if (isFirebaseConfigured && auth.currentUser && auth.currentUser.uid === userId) {
      try {
        return await firebaseDatabaseService.updateProfile(userId, updates);
      } catch (err) {
        console.warn('Firebase updateProfile failed, falling back to local storage:', err);
      }
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const pList = JSON.parse(localStorage.getItem(KEY_PROFILES) || '[]');
      let updatedProfile: Profile | null = null;
      const newList = pList.map((p: Profile) => {
        if (p.id === userId) {
          updatedProfile = { ...p, ...updates };
          return updatedProfile;
        }
        return p;
      });
      if (!updatedProfile) {
        // Create if missing
        updatedProfile = {
          id: userId,
          username: updates.username || 'noka_user',
          full_name: updates.full_name || 'Noka User',
          phone: updates.phone || '0900000000',
          avatar_url: updates.avatar_url || null,
          referral_code: updates.referral_code || Math.random().toString(36).substring(2, 10),
          created_at: new Date().toISOString(),
          ...updates,
        };
        newList.push(updatedProfile);
      }
      localStorage.setItem(KEY_PROFILES, JSON.stringify(newList));
      return updatedProfile;
    }
  },

  // --- Platforms ---
  async getPlatforms(userId: string): Promise<Platform[]> {
    if (isFirebaseConfigured && auth.currentUser && auth.currentUser.uid === userId) {
      try {
        return await firebaseDatabaseService.getPlatforms(userId);
      } catch (err) {
        console.warn('Firebase getPlatforms failed, falling back to local storage:', err);
      }
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      initializeDefaultPlatformData(userId);
      const platforms = JSON.parse(localStorage.getItem(KEY_PLATFORMS) || '[]');
      return platforms.filter((p: Platform) => p.user_id === userId);
    }
  },

  async insertPlatforms(platforms: Omit<Platform, 'id' | 'created_at'>[]): Promise<Platform[]> {
    const firstPlatformUserId = platforms[0]?.user_id;
    if (isFirebaseConfigured && auth.currentUser && firstPlatformUserId && auth.currentUser.uid === firstPlatformUserId) {
      try {
        return await firebaseDatabaseService.insertPlatforms(platforms);
      } catch (err) {
        console.warn('Firebase insertPlatforms failed, falling back to local storage:', err);
      }
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('platforms')
        .insert(platforms)
        .select();
      if (error) throw error;
      return data;
    } else {
      const current = JSON.parse(localStorage.getItem(KEY_PLATFORMS) || '[]');
      const added: Platform[] = platforms.map(p => ({
        ...p,
        id: `plat-${Math.random().toString(36).substring(2, 15)}`,
        created_at: new Date().toISOString(),
      }));
      localStorage.setItem(KEY_PLATFORMS, JSON.stringify([...current, ...added]));
      return added;
    }
  },

  async deletePlatform(id: string): Promise<void> {
    if (isFirebaseConfigured && auth.currentUser) {
      try {
        return await firebaseDatabaseService.deletePlatform(id);
      } catch (err) {
        console.warn('Firebase deletePlatform failed, falling back to local storage:', err);
      }
    }
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const platforms = JSON.parse(localStorage.getItem(KEY_PLATFORMS) || '[]');
      const filtered = platforms.filter((p: Platform) => p.id !== id);
      localStorage.setItem(KEY_PLATFORMS, JSON.stringify(filtered));

      // Also set platform_id to NULL in passwords
      const passwords = JSON.parse(localStorage.getItem(KEY_PASSWORDS) || '[]');
      const updatedPass = passwords.map((pw: Password) => {
        if (pw.platform_id === id) {
          return { ...pw, platform_id: null };
        }
        return pw;
      });
      localStorage.setItem(KEY_PASSWORDS, JSON.stringify(updatedPass));
    }
  },

  async updatePlatform(id: string, updates: Partial<Platform>): Promise<Platform> {
    if (isFirebaseConfigured && auth.currentUser) {
      try {
        return await firebaseDatabaseService.updatePlatform(id, updates);
      } catch (err) {
        console.warn('Firebase updatePlatform failed, falling back to local storage:', err);
      }
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('platforms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const platforms = JSON.parse(localStorage.getItem(KEY_PLATFORMS) || '[]');
      let updated: Platform | null = null;
      const newList = platforms.map((p: Platform) => {
        if (p.id === id) {
          updated = { ...p, ...updates };
          return updated;
        }
        return p;
      });
      if (!updated) throw new Error('Platform not found');
      localStorage.setItem(KEY_PLATFORMS, JSON.stringify(newList));
      return updated;
    }
  },

  // --- Passwords ---
  async getPasswords(userId: string): Promise<Password[]> {
    if (isFirebaseConfigured && auth.currentUser && auth.currentUser.uid === userId) {
      try {
        return await firebaseDatabaseService.getPasswords(userId);
      } catch (err) {
        console.warn('Firebase getPasswords failed, falling back to local storage:', err);
      }
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('passwords')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      const passwords = JSON.parse(localStorage.getItem(KEY_PASSWORDS) || '[]');
      return passwords.filter((p: Password) => p.user_id === userId);
    }
  },

  async insertPassword(password: Omit<Password, 'id' | 'created_at' | 'updated_at'>): Promise<Password> {
    if (isFirebaseConfigured && auth.currentUser && auth.currentUser.uid === password.user_id) {
      try {
        return await firebaseDatabaseService.insertPassword(password);
      } catch (err) {
        console.warn('Firebase insertPassword failed, falling back to local storage:', err);
      }
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('passwords')
        .insert(password)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const passwords = JSON.parse(localStorage.getItem(KEY_PASSWORDS) || '[]');
      const newPassword: Password = {
        ...password,
        id: `pw-${Math.random().toString(36).substring(2, 15)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      passwords.unshift(newPassword);
      localStorage.setItem(KEY_PASSWORDS, JSON.stringify(passwords));
      return newPassword;
    }
  },

  async updatePassword(id: string, updates: Partial<Password>): Promise<Password> {
    if (isFirebaseConfigured && auth.currentUser) {
      try {
        return await firebaseDatabaseService.updatePassword(id, updates);
      } catch (err) {
        console.warn('Firebase updatePassword failed, falling back to local storage:', err);
      }
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('passwords')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const passwords = JSON.parse(localStorage.getItem(KEY_PASSWORDS) || '[]');
      let updated: Password | null = null;
      const newList = passwords.map((pw: Password) => {
        if (pw.id === id) {
          updated = { ...pw, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return pw;
      });
      if (!updated) throw new Error('Password entry not found');
      localStorage.setItem(KEY_PASSWORDS, JSON.stringify(newList));
      return updated;
    }
  },

  async deletePassword(id: string): Promise<void> {
    if (isFirebaseConfigured && auth.currentUser) {
      try {
        return await firebaseDatabaseService.deletePassword(id);
      } catch (err) {
        console.warn('Firebase deletePassword failed, falling back to local storage:', err);
      }
    }
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('passwords')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const passwords = JSON.parse(localStorage.getItem(KEY_PASSWORDS) || '[]');
      const filtered = passwords.filter((pw: Password) => pw.id !== id);
      localStorage.setItem(KEY_PASSWORDS, JSON.stringify(filtered));
    }
  },

  // --- Telegram Configurations ---
  async getTelegramConfig(userId: string): Promise<TelegramConfig> {
    if (isFirebaseConfigured && auth.currentUser && auth.currentUser.uid === userId) {
      try {
        return await firebaseDatabaseService.getTelegramConfig(userId);
      } catch (err) {
        console.warn('Firebase getTelegramConfig failed, falling back to local storage:', err);
      }
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('telegram_configs')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) {
        // If not found, insert default rows
        const default_config = {
          user_id: userId,
          bot_token: '',
          chat_id: '',
          is_active: false,
          notify_new_password: true,
          notify_suspicious_login: true,
          notify_system_update: false,
        };
        const { data: inserted, error: insError } = await supabase
          .from('telegram_configs')
          .insert(default_config)
          .select()
          .single();
        if (insError) throw insError;
        return inserted;
      }
      return data;
    } else {
      const configs = JSON.parse(localStorage.getItem(KEY_TELEGRAM) || '[]');
      let userConfig = configs.find((c: TelegramConfig) => c.user_id === userId);
      if (!userConfig) {
        userConfig = {
          id: `tg-${Math.random().toString(36).substring(2, 15)}`,
          user_id: userId,
          bot_token: '',
          chat_id: '',
          is_active: false,
          notify_new_password: true,
          notify_suspicious_login: true,
          notify_system_update: false,
          created_at: new Date().toISOString(),
        };
        configs.push(userConfig);
        localStorage.setItem(KEY_TELEGRAM, JSON.stringify(configs));
      }
      return userConfig;
    }
  },

  async updateTelegramConfig(userId: string, updates: Partial<TelegramConfig>): Promise<TelegramConfig> {
    if (isFirebaseConfigured && auth.currentUser && auth.currentUser.uid === userId) {
      try {
        return await firebaseDatabaseService.updateTelegramConfig(userId, updates);
      } catch (err) {
        console.warn('Firebase updateTelegramConfig failed, falling back to local storage:', err);
      }
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('telegram_configs')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const configs = JSON.parse(localStorage.getItem(KEY_TELEGRAM) || '[]');
      let updated: TelegramConfig | null = null;
      const newList = configs.map((c: TelegramConfig) => {
        if (c.user_id === userId) {
          updated = { ...c, ...updates };
          return updated;
        }
        return c;
      });
      if (!updated) {
        updated = {
          id: `tg-${Math.random().toString(36).substring(2, 15)}`,
          user_id: userId,
          bot_token: updates.bot_token || '',
          chat_id: updates.chat_id || '',
          is_active: updates.is_active || false,
          notify_new_password: updates.notify_new_password !== undefined ? updates.notify_new_password : true,
          notify_suspicious_login: updates.notify_suspicious_login !== undefined ? updates.notify_suspicious_login : true,
          notify_system_update: updates.notify_system_update !== undefined ? updates.notify_system_update : false,
          created_at: new Date().toISOString(),
        };
        newList.push(updated);
      }
      localStorage.setItem(KEY_TELEGRAM, JSON.stringify(newList));
      return updated;
    }
  },

  // Safe file upload simulator (converts to base64 for local client demo, or uses real storage bucket on Supabase)
  async uploadFile(bucket: 'avatars' | 'platform-logos', filePath: string, file: File): Promise<string> {
    if (isFirebaseConfigured) {
      return firebaseDatabaseService.updateProfile(auth.currentUser?.uid || '', { avatar_url: filePath }).then(() => filePath);
    }
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
        upsert: true,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } else {
      // Offline fallback: read file as base64 URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    }
  }
};
