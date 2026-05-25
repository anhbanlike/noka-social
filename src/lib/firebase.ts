import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// @ts-ignore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

export const isFirebaseConfigured = true;

// Firestore service methods
export const firebaseDatabaseService = {
  getProfile: async (id: string) => {
    const { doc, getDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'profiles', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as any) : null;
  },
  updateProfile: async (id: string, updates: any) => {
    const { doc, setDoc, getDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'profiles', id);
    await setDoc(docRef, updates, { merge: true });
    const docSnap = await getDoc(docRef);
    return docSnap.data() as any;
  },
  getPlatforms: async (id: string) => {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const q = query(collection(db, 'platforms'), where('user_id', '==', id));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
  },
  insertPlatforms: async (platforms: any[]) => {
    const { collection, addDoc } = await import('firebase/firestore');
    const results = [];
    for (const p of platforms) {
      const docRef = await addDoc(collection(db, 'platforms'), p);
      results.push({ id: docRef.id, ...p });
    }
    return results;
  },
  deletePlatform: async (id: string) => {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'platforms', id));
  },
  updatePlatform: async (id: string, updates: any) => {
    const { doc, updateDoc, getDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'platforms', id);
    await updateDoc(docRef, updates);
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() } as any;
  },
  getPasswords: async (userId: string) => {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const q = query(collection(db, 'passwords'), where('user_id', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
  },
  insertPassword: async (password: any) => {
    const { collection, addDoc } = await import('firebase/firestore');
    const docRef = await addDoc(collection(db, 'passwords'), password);
    return { id: docRef.id, ...password };
  },
  updatePassword: async (id: string, updates: any) => {
    const { doc, updateDoc, getDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'passwords', id);
    await updateDoc(docRef, updates);
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() } as any;
  },
  deletePassword: async (id: string) => {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'passwords', id));
  },
  getTelegramConfig: async (userId: string) => {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const q = query(collection(db, 'telegram_configs'), where('user_id', '==', userId));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
  },
  updateTelegramConfig: async (userId: string, updates: any) => {
    const { collection, query, where, getDocs, updateDoc, doc, addDoc } = await import('firebase/firestore');
    const q = query(collection(db, 'telegram_configs'), where('user_id', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      await updateDoc(doc(db, 'telegram_configs', snap.docs[0].id), updates);
      return { id: snap.docs[0].id, ...snap.docs[0].data(), ...updates } as any;
    } else {
        const docRef = await addDoc(collection(db, 'telegram_configs'), { ...updates, user_id: userId });
        return { id: docRef.id, ...updates, user_id: userId } as any;
    }
  },
};
