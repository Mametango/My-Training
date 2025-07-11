import React from 'react';
import { signInWithGoogle } from '../firebase';
import { Mail } from 'lucide-react';

const Login: React.FC = () => {
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('ログインエラー:', error);
      alert(error.message || 'ログインに失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            トレーニング記録
          </h1>
          <p className="text-gray-600">
            トレーニングの記録を始めましょう
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                アカウントにログイン
              </h2>
              <p className="text-gray-600 mb-6">
                Gmailアカウントでログインして、トレーニング記録を管理してください
              </p>
            </div>
            
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Mail size={20} />
              Gmailでログイン
            </button>
            
            <div className="text-center text-sm text-gray-500">
              <p>
                ログインすることで、あなたのトレーニング記録が安全に保存されます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 