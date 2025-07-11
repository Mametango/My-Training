import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase設定（本番環境用）
const firebaseConfig = {
  apiKey: "AIzaSyA-0sTKhrtRRSfSRKb5cXyGbIH02IwygXI",
  authDomain: "my-routine-app-a0708.firebaseapp.com",
  projectId: "my-routine-app-a0708",
  storageBucket: "my-routine-app-a0708.appspot.com",
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
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// 認証関数
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Google認証成功:', result.user.email);
    return result.user;
  } catch (error: any) {
    console.error('❌ Google認証エラー:', error);
    
    // エラーメッセージの日本語化
    let errorMessage = '認証に失敗しました';
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'ログインがキャンセルされました';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'ポップアップがブロックされました。ブラウザの設定を確認してください';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'ネットワークエラーが発生しました';
    }
    
    throw new Error(errorMessage);
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