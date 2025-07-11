import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyA-0sTKhrtRRSfSRKb5cXyGbIH02IwygXI",
  authDomain: "my-training-8d8a9.firebaseapp.com",
  projectId: "my-training-8d8a9",
  storageBucket: "my-training-8d8a9.appspot.com",
  messagingSenderId: "1081225191946",
  appId: "1:1081225191946:web:your-app-id"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// AuthとFirestoreの初期化
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google認証プロバイダー
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// 認証関数
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google認証エラー:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('サインアウトエラー:', error);
    throw error;
  }
};

// 認証状態の監視
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export default app; 