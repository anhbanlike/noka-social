import { create } from 'zustand';
import { supabase, isSupabaseConfigured, databaseService } from '../lib/supabase';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { Profile } from '../types';

interface AuthState {
  user: Profile | null;
  sessionEmail: string | null;
  loading: boolean;
  initialized: boolean;
  sidebarExpanded: boolean;
  initialize: () => Promise<void>;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  signUp: (payload: {
    username: string;
    email?: string | null;
    full_name: string;
    phone: string;
    password: string;
  }) => Promise<{ error: any; profile?: Profile }>;
  signIn: (identifier: string, password: string) => Promise<{ error: string | null; profile?: Profile }>;
  signOut: () => Promise<void>;
  updateUserEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  changeMasterPassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  sessionEmail: null,
  loading: true,
  initialized: false,
  sidebarExpanded: true,

  toggleSidebar: () => {
    set({ sidebarExpanded: !get().sidebarExpanded });
  },

  setSidebarExpanded: (expanded: boolean) => {
    set({ sidebarExpanded: expanded });
  },

  initialize: async () => {
    set({ loading: true });
    try {
      if (isFirebaseConfigured) {
        return new Promise<void>((resolve) => {
          auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
              const profile = await databaseService.getProfile(firebaseUser.uid);
              set({
                user: profile,
                sessionEmail: firebaseUser.email ?? null,
                loading: false,
                initialized: true
              });
              resolve();
            } else {
              // Check if we have an offline session saved
              const storedSession = localStorage.getItem('noka_session');
              if (storedSession) {
                const session = JSON.parse(storedSession);
                const profile = await databaseService.getProfile(session.userId);
                if (profile) {
                  set({
                    user: profile,
                    sessionEmail: session.email,
                    loading: false,
                    initialized: true
                  });
                  resolve();
                  return;
                }
              }
              set({ user: null, sessionEmail: null, loading: false, initialized: true });
              resolve();
            }
          });
        });
      } else if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const profile = await databaseService.getProfile(session.user.id);
          set({
            user: profile,
            sessionEmail: session.user.email ?? null,
            loading: false,
            initialized: true
          });
          return;
        }
      } else {
        // Offline recovery
        const storedSession = localStorage.getItem('noka_session');
        if (storedSession) {
          const session = JSON.parse(storedSession);
          const profile = await databaseService.getProfile(session.userId);
          if (profile) {
            set({
              user: profile,
              sessionEmail: session.email,
              loading: false,
              initialized: true
            });
            return;
          }
        }
      }
    } catch (e) {
      console.error('Auth initialization failed:', e);
    }
    set({ user: null, sessionEmail: null, loading: false, initialized: true });
  },

  signUp: async ({ username, email, full_name, phone, password }) => {
    set({ loading: true });
    const realEmail = email || `${username.toLowerCase()}@noka-offline.local`;
    try {
      if (isFirebaseConfigured) {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, realEmail, password);
          const fbUser = userCredential.user;
          const profile = await databaseService.updateProfile(fbUser.uid, {
            username,
            full_name,
            phone,
            avatar_url: null,
            referral_code: `NK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            email: realEmail,
          });
          
          // Dynamically cache details in local emulator list locally to ensure instant lookup maps
          const users = JSON.parse(localStorage.getItem('noka_users') || '[]');
          if (!users.some((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
            users.push({
              id: fbUser.uid,
              username,
              email: realEmail,
              full_name,
              phone,
              password,
              referral_code: profile.referral_code,
              created_at: new Date().toISOString()
            });
            localStorage.setItem('noka_users', JSON.stringify(users));
          }

          set({ user: profile, sessionEmail: realEmail, loading: false });
          return { error: null, profile };
        } catch (authError: any) {
          console.warn('Firebase signUp failed, falling back to offline registration emulation:', authError);
          
          if (
            authError.code === 'auth/operation-not-allowed' ||
            authError.code === 'auth/configuration-not-found' ||
            authError.code === 'auth/network-request-failed' ||
            authError.message?.includes('disabled') ||
            authError.message?.includes('operation-not-allowed')
          ) {
            // Check conflicts locally
            const users = JSON.parse(localStorage.getItem('noka_users') || '[]');
            if (users.some((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
              set({ loading: false });
              return { error: { message: 'Tên đăng nhập này đã được sử dụng!' } };
            }
            if (email && users.some((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase())) {
              set({ loading: false });
              return { error: { message: 'Địa chỉ Email này đã được đăng ký!' } };
            }

            const userId = `usr_fb_${Math.random().toString(36).substring(2, 12)}`;
            const refCode = `NK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            const newUser = {
              id: userId,
              username,
              email: realEmail,
              full_name,
              phone,
              password,
              referral_code: refCode,
              created_at: new Date().toISOString(),
            };

            users.push(newUser);
            localStorage.setItem('noka_users', JSON.stringify(users));

            const profile: Profile = {
              id: userId,
              username,
              full_name,
              phone,
              avatar_url: null,
              referral_code: refCode,
              created_at: new Date().toISOString(),
            };

            const profiles = JSON.parse(localStorage.getItem('noka_profiles') || '[]');
            profiles.push(profile);
            localStorage.setItem('noka_profiles', JSON.stringify(profiles));

            localStorage.setItem('noka_session', JSON.stringify({ userId, email: realEmail }));

            set({ user: profile, sessionEmail: realEmail, loading: false });
            return { error: null, profile };
          }
          throw authError;
        }
      } else if (isSupabaseConfigured && supabase) {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: realEmail,
          password: password,
          options: {
            data: {
              username,
              full_name,
              phone
            }
          }
        });

        if (error) {
          set({ loading: false });
          return { error };
        }

        if (data.user) {
          // Profile insert/update
          const profile = await databaseService.updateProfile(data.user.id, {
            username,
            full_name,
            phone,
            avatar_url: null,
            referral_code: `NK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          });

          set({ user: profile, sessionEmail: realEmail, loading: false });
          return { error: null, profile };
        }
      } else {
        // Local emulation
        const users = JSON.parse(localStorage.getItem('noka_users') || '[]');
        
        // Check conflicts
        if (users.some((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
          set({ loading: false });
          return { error: { message: 'Username already taken' } };
        }
        if (email && users.some((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase())) {
          set({ loading: false });
          return { error: { message: 'Email already registered' } };
        }

        const userId = `usr_${Math.random().toString(36).substring(2, 12)}`;
        const refCode = `NK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const newUser = {
          id: userId,
          username,
          email: realEmail,
          full_name,
          phone,
          password, // note: in a simulated standard, storing raw in test simulated list is okay
          referral_code: refCode,
          created_at: new Date().toISOString(),
        };

        // Save simulated credentials
        users.push(newUser);
        localStorage.setItem('noka_users', JSON.stringify(users));

        // Create the Profile entry
        const profile: Profile = {
          id: userId,
          username,
          full_name,
          phone,
          avatar_url: null,
          referral_code: refCode,
          created_at: new Date().toISOString(),
        };

        const profiles = JSON.parse(localStorage.getItem('noka_profiles') || '[]');
        profiles.push(profile);
        localStorage.setItem('noka_profiles', JSON.stringify(profiles));

        // Establish session
        localStorage.setItem('noka_session', JSON.stringify({ userId, email: realEmail }));

        set({ user: profile, sessionEmail: realEmail, loading: false });
        return { error: null, profile };
      }
    } catch (e: any) {
      set({ loading: false });
      return { error: e };
    }
    set({ loading: false });
    return { error: { message: 'Registration failed' } };
  },

  signIn: async (identifier, password) => {
    set({ loading: true });
    try {
      if (isFirebaseConfigured) {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        let finalEmail = identifier.trim();
        
        if (!identifier.includes('@')) {
          const users = JSON.parse(localStorage.getItem('noka_users') || '[]');
          const matched = users.find((u: any) => u.username.toLowerCase() === identifier.toLowerCase().trim());
          if (matched && matched.email) {
            finalEmail = matched.email;
          } else {
            try {
              const { collection, query, where, getDocs } = await import('firebase/firestore');
              const { db } = await import('../lib/firebase');
              const q = query(collection(db, 'profiles'), where('username', '==', identifier.toLowerCase().trim()));
              const snap = await getDocs(q);
              if (!snap.empty) {
                const profileData = snap.docs[0].data() as Profile;
                if (profileData.email) {
                  finalEmail = profileData.email;
                } else if (profileData.username) {
                  finalEmail = `${profileData.username.toLowerCase()}@noka-offline.local`;
                }
              } else {
                finalEmail = `${identifier.toLowerCase().trim()}@noka-offline.local`;
              }
            } catch (err) {
              console.warn('Firestore profile lookup unsuccessful on login, using default format:', err);
              finalEmail = `${identifier.toLowerCase().trim()}@noka-offline.local`;
            }
          }
        }

        try {
          const userCredential = await signInWithEmailAndPassword(auth, finalEmail, password);
          const fbUser = userCredential.user;
          const profile = await databaseService.getProfile(fbUser.uid);
          set({ user: profile, sessionEmail: fbUser.email ?? null, loading: false });
          return { error: null, profile: profile ?? undefined };
        } catch (authError: any) {
          console.warn('Firebase signIn failed, attempting emulation fallback:', authError);
          
          // Check local emulator users
          const users = JSON.parse(localStorage.getItem('noka_users') || '[]');
          const matched = users.find((u: any) => 
            (u.username.toLowerCase() === identifier.toLowerCase().trim() || 
             (u.email && u.email.toLowerCase() === identifier.toLowerCase().trim())) &&
            u.password === password
          );

          if (matched) {
            const profile = await databaseService.getProfile(matched.id);
            if (profile) {
              localStorage.setItem('noka_session', JSON.stringify({ userId: matched.id, email: matched.email }));
              set({ user: profile, sessionEmail: matched.email, loading: false });
              return { error: null, profile };
            }
          }
          
          let errorMsgStr = authError.message || 'Đăng nhập không thành công!';
          if (authError.code === 'auth/wrong-password' || authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
            errorMsgStr = 'Tên đăng nhập/Email hoặc mật khẩu không chính xác!';
          } else if (authError.code === 'auth/user-disabled') {
            errorMsgStr = 'Tài khoản này đã bị vô hiệu hóa!';
          } else if (authError.code === 'auth/network-request-failed') {
            errorMsgStr = 'Lỗi kết nối mạng! Vui lòng kiểm tra lại đường truyền internet.';
          } else if (authError.code === 'auth/too-many-requests') {
            errorMsgStr = 'Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Hãy thử lại sau ít phút!';
          } else if (authError.code === 'auth/operation-not-allowed' || authError.message?.includes('operation-not-allowed')) {
            errorMsgStr = 'Lỗi cấu hình (auth/operation-not-allowed): Tính năng Đăng nhập bằng Email/Password chưa được bật trong Firebase Console của dự án của bạn.';
          }
          
          return { error: errorMsgStr };
        }
      } else if (isSupabaseConfigured && supabase) {
        // Simple email detector; the prompt expects username OR email in a single field.
        // If it's not a standard email, we try to fetch profile to resolve the email first,
        // or just pass it to Supabase sign-in
        let finalEmail = identifier;
        if (!identifier.includes('@')) {
          // Resolve standard offline simulation concept or query profiles with RPC
          // For real, we might assume identifier can be used or we query
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('username', identifier)
            .maybeSingle();
          if (data) {
            finalEmail = `${identifier.toLowerCase()}@noka-offline.local`; // hypothetical matching signup pattern
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password: password,
        });

        if (error) {
          set({ loading: false });
          return { error: error.message };
        }

        if (data.user) {
          const profile = await databaseService.getProfile(data.user.id);
          set({ user: profile, sessionEmail: data.user.email ?? null, loading: false });
          return { error: null, profile: profile ?? undefined };
        }
      } else {
        // Local emulation Login
        const users = JSON.parse(localStorage.getItem('noka_users') || '[]');
        const matched = users.find((u: any) => 
          (u.username.toLowerCase() === identifier.toLowerCase().trim() || 
           (u.email && u.email.toLowerCase() === identifier.toLowerCase().trim())) &&
          u.password === password
        );

        if (matched) {
          const profile = await databaseService.getProfile(matched.id);
          if (profile) {
            localStorage.setItem('noka_session', JSON.stringify({ userId: matched.id, email: matched.email }));
            set({ user: profile, sessionEmail: matched.email, loading: false });
            return { error: null, profile };
          }
        }
        set({ loading: false });
        return { error: 'Incorrect credentials' };
      }
    } catch (e: any) {
      set({ loading: false });
      return { error: e.message || 'Error logging in' };
    }
    set({ loading: false });
    return { error: 'Login failed' };
  },

  signOut: async () => {
    set({ loading: true });
    try {
      if (isFirebaseConfigured) {
        await auth.signOut();
      } else if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      } else {
        localStorage.removeItem('noka_session');
      }
    } catch (e) {
      console.error('Error during logout', e);
    }
    set({ user: null, sessionEmail: null, loading: false });
  },

  updateUserEmail: async (newEmail) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) return { success: false, error: error.message };
        set({ sessionEmail: newEmail });
        return { success: true };
      } else {
        const currentUser = get().user;
        if (!currentUser) return { success: false, error: 'No user in session' };

        // Update in noka_users
        const users = JSON.parse(localStorage.getItem('noka_users') || '[]');
        const updatedUsers = users.map((u: any) => {
          if (u.id === currentUser.id) {
            return { ...u, email: newEmail };
          }
          return u;
        });
        localStorage.setItem('noka_users', JSON.stringify(updatedUsers));

        // Update session
        localStorage.setItem('noka_session', JSON.stringify({ userId: currentUser.id, email: newEmail }));
        set({ sessionEmail: newEmail });
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  updateUserProfile: async (updates) => {
    const currentUser = get().user;
    if (!currentUser) return { success: false, error: 'No authenticated user' };

    try {
      const updated = await databaseService.updateProfile(currentUser.id, updates);
      set({ user: updated });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update profile' };
    }
  },

  changeMasterPassword: async (currentPass, newPass) => {
    const currentUser = get().user;
    if (!currentUser) return { success: false, error: 'Unauthenticated' };

    try {
      if (isSupabaseConfigured && supabase) {
        // Real Supabase User updates
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } else {
        // Offline emulator verification
        const users = JSON.parse(localStorage.getItem('noka_users') || '[]');
        const idx = users.findIndex((u: any) => u.id === currentUser.id);
        if (idx === -1) return { success: false, error: 'User profiles corrupt' };

        if (users[idx].password !== currentPass) {
          return { success: false, error: 'Mật khẩu gốc hiện tại không đúng!' };
        }

        // Overwrite standard secret key with new passphrase
        users[idx].password = newPass;
        localStorage.setItem('noka_users', JSON.stringify(users));
        return { success: true };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update credential attributes' };
    }
  }
}));
