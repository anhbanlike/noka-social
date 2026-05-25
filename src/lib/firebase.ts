import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, collection, query, where, orderBy, getDocFromServer } from 'firebase/firestore';
import { Profile, Platform, Password, TelegramConfig } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Detect if Firebase is configured
export const isFirebaseConfigured =
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== '';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Validate connection to Firestore as outlined in SKILL.md
if (isFirebaseConfigured) {
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error('Please check your Firebase configuration.');
      }
    }
  };
  testConnection();
}

// Exception definition
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Info: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Implement Database Service utilizing Firestore mapping
export const firebaseDatabaseService = {
  // --- Profiles ---
  async getProfile(userId: string): Promise<Profile | null> {
    const path = `profiles/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'profiles', userId));
      if (!snap.exists()) return null;
      return snap.data() as Profile;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const path = `profiles/${userId}`;
    try {
      const ref = doc(db, 'profiles', userId);
      const snap = await getDoc(ref);
      let nextProfile: Profile;

      if (!snap.exists()) {
        nextProfile = {
          id: userId,
          username: updates.username || 'noka_user',
          full_name: updates.full_name || 'Noka User',
          phone: updates.phone || '0900000000',
          avatar_url: updates.avatar_url || null,
          referral_code: updates.referral_code || `NK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          created_at: new Date().toISOString(),
          ...updates,
        } as Profile;
        await setDoc(ref, nextProfile);
      } else {
        const existing = snap.data() as Profile;
        nextProfile = { ...existing, ...updates };
        await updateDoc(ref, updates);
      }
      return nextProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // --- Platforms ---
  async getPlatforms(userId: string): Promise<Platform[]> {
    const path = 'platforms';
    try {
      const q = query(collection(db, 'platforms'), where('user_id', '==', userId));
      const querySnapshot = await getDocs(q);
      const list: Platform[] = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data() as Platform);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async insertPlatforms(platforms: Omit<Platform, 'id' | 'created_at'>[]): Promise<Platform[]> {
    const path = 'platforms';
    try {
      const added: Platform[] = [];
      for (const p of platforms) {
        const id = `plat-${Math.random().toString(36).substring(2, 12)}`;
        const newItem: Platform = {
          ...p,
          id,
          created_at: new Date().toISOString(),
        };
        await setDoc(doc(db, 'platforms', id), newItem);
        added.push(newItem);
      }
      return added;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deletePlatform(id: string): Promise<void> {
    const path = `platforms/${id}`;
    try {
      await deleteDoc(doc(db, 'platforms', id));

      // Cascade Platform deletion: set related passwords' platform_id to empty
      const pwColl = collection(db, 'passwords');
      const q = query(pwColl, where('platform_id', '==', id));
      const snaps = await getDocs(q);
      for (const d of snaps.docs) {
        await updateDoc(doc(db, 'passwords', d.id), { platform_id: null });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updatePlatform(id: string, updates: Partial<Platform>): Promise<Platform> {
    const path = `platforms/${id}`;
    try {
      const ref = doc(db, 'platforms', id);
      await updateDoc(ref, updates);
      const fresh = await getDoc(ref);
      return fresh.data() as Platform;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // --- Passwords ---
  async getPasswords(userId: string): Promise<Password[]> {
    const path = 'passwords';
    try {
      const q = query(collection(db, 'passwords'), where('user_id', '==', userId));
      const querySnapshot = await getDocs(q);
      const list: Password[] = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data() as Password);
      });
      // Sort client-side descending to bypass composite index creation requirement in Firebase
      return list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async insertPassword(password: Omit<Password, 'id' | 'created_at' | 'updated_at'>): Promise<Password> {
    const path = 'passwords';
    try {
      const id = `pw-${Math.random().toString(36).substring(2, 12)}`;
      const newItem: Password = {
        ...password,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await setDoc(doc(db, 'passwords', id), newItem);
      return newItem;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updatePassword(id: string, updates: Partial<Password>): Promise<Password> {
    const path = `passwords/${id}`;
    try {
      const ref = doc(db, 'passwords', id);
      const timestampedUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      await updateDoc(ref, timestampedUpdates);
      const fresh = await getDoc(ref);
      return fresh.data() as Password;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deletePassword(id: string): Promise<void> {
    const path = `passwords/${id}`;
    try {
      await deleteDoc(doc(db, 'passwords', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- Telegram ---
  async getTelegramConfig(userId: string): Promise<TelegramConfig> {
    const path = `telegram_configs/${userId}`;
    try {
      const ref = doc(db, 'telegram_configs', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as TelegramConfig;
      }

      // Default
      const default_config: TelegramConfig = {
        id: userId,
        user_id: userId,
        bot_token: '',
        chat_id: '',
        is_active: false,
        notify_new_password: true,
        notify_suspicious_login: true,
        notify_system_update: false,
        created_at: new Date().toISOString(),
      };
      await setDoc(ref, default_config);
      return default_config;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async updateTelegramConfig(userId: string, updates: Partial<TelegramConfig>): Promise<TelegramConfig> {
    const path = `telegram_configs/${userId}`;
    try {
      const ref = doc(db, 'telegram_configs', userId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const default_config: TelegramConfig = {
          id: userId,
          user_id: userId,
          bot_token: updates.bot_token || '',
          chat_id: updates.chat_id || '',
          is_active: updates.is_active || false,
          notify_new_password: updates.notify_new_password !== undefined ? updates.notify_new_password : true,
          notify_suspicious_login: updates.notify_suspicious_login !== undefined ? updates.notify_suspicious_login : true,
          notify_system_update: updates.notify_system_update !== undefined ? updates.notify_system_update : false,
          created_at: new Date().toISOString(),
        };
        await setDoc(ref, default_config);
        return default_config;
      } else {
        await updateDoc(ref, updates);
        const fresh = await getDoc(ref);
        return fresh.data() as TelegramConfig;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};
