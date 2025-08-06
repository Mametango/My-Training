import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase設定（正しい設定）
const firebaseConfig = {
  apiKey: "AIzaSyA-0sTKhrtRRSfSRKb5cXyGbIH02IwygXI",
  authDomain: "my-training-8d8a9.firebaseapp.com",
  projectId: "my-training-8d8a9",
  storageBucket: "my-training-8d8a9.firebasestorage.app",
  messagingSenderId: "1081225191946",
  appId: "1:1081225191946:web:e70ac3a1bf9c77969c75f3",
  measurementId: "G-3ET0DMDS8T"
};

// Initialize Firebase (My Routineと同じ方式)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// AuthとFirestoreの初期化
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google認証プロバイダー
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // より安定した認証のための追加設定
  access_type: 'offline'
});

// メール/パスワード認証
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw error;
  }
};

// メール/パスワード登録
export const createUserWithEmail = async (email: string, password: string, username?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // ユーザー名を設定
    if (username && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: username
      });
    }
    
    return userCredential.user;
  } catch (error: any) {
    throw error;
  }
};

// Google認証（ポップアップのみ）
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// 認証状態の監視
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export default app; 