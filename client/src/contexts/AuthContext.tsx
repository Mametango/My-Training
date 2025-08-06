import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange, signOutUser, signInWithGoogle, signInWithEmail, createUserWithEmail } from '../firebase';

// カスタムUser型（My Routineと同じ）
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, username?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  logout: async () => ({ success: false }),
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      if (!isMounted) return;
      
      try {
        if (firebaseUser) {
          // Get the ID token with timeout
          const tokenPromise = firebaseUser.getIdToken();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Token fetch timeout')), 3000);
          });
          
          const idToken = await Promise.race([tokenPromise, timeoutPromise]) as string;
          
          // Convert Firebase user to our User interface
          const userData: User = {
            id: firebaseUser.uid,
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
          };
          
          if (isMounted) {
            setUser(userData);
            setToken(idToken);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            setUser(null);
            setToken(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        if (isMounted) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
      }
    });

    // タイムアウト処理（5秒後に強制的にloadingをfalseにする）
    const timeoutTimer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutTimer);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmail(email, password);
      // Firebaseの認証状態管理に任せるため、手動でのsetTokenは削除
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'ログインに失敗しました';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'ユーザーが見つかりません。新規登録してください。';
          break;
        case 'auth/wrong-password':
          errorMessage = 'パスワードが正しくありません';
          break;
        case 'auth/invalid-email':
          errorMessage = '無効なメールアドレスです';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'メールアドレスまたはパスワードが正しくありません';
          break;
        case 'auth/user-disabled':
          errorMessage = 'アカウントが無効になっています';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'メール/パスワード認証が有効になっていません。Googleログインをお試しください';
          break;
        default:
          errorMessage = `ログインエラー: ${error.message}`;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email: string, password: string, username?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await createUserWithEmail(email, password, username);
      // Firebaseの認証状態管理に任せるため、手動でのsetTokenは削除
      return { success: true };
    } catch (error: any) {
      let errorMessage = '登録に失敗しました';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'このメールアドレスは既に使用されています';
          break;
        case 'auth/weak-password':
          errorMessage = 'パスワードが弱すぎます（6文字以上で入力してください）';
          break;
        case 'auth/invalid-email':
          errorMessage = '無効なメールアドレスです';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'メール/パスワード認証が有効になっていません';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'ネットワークエラーが発生しました';
          break;
        default:
          errorMessage = `登録エラー: ${error.message}`;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithGoogle();
      // Firebaseの認証状態管理に任せるため、手動でのsetTokenは削除
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Googleログインに失敗しました';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'ログインがキャンセルされました';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'ポップアップがブロックされました。ポップアップを許可してください';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'ログインがキャンセルされました';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'このメールアドレスは別の方法で登録されています';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'ネットワークエラーが発生しました';
          break;
        default:
          errorMessage = `Googleログインエラー: ${error.message}`;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await signOutUser();
      setUser(null);
      setToken(null);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'ログアウトに失敗しました' };
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 