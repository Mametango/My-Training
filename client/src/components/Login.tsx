import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertCircle, X, Lock, User } from 'lucide-react';

const Login: React.FC = () => {
  const { login, register, loginWithGoogle, loading } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'google' | 'login' | 'register'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || t('auth.login.failed'));
      }
    } catch (error: any) {
      setError(error.message || t('auth.login.failed'));
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await register(email, password, username);
      if (!result.success) {
        setError(result.error || t('auth.register.failed'));
      }
    } catch (error: any) {
      setError(error.message || t('auth.register.failed'));
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setError(result.error || t('auth.google.login.failed'));
      }
      // 成功時は何もしない（AuthContextが自動的に状態を更新する）
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(error.message || t('auth.google.login.failed'));
    }
  };

  const clearError = () => {
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('app.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('auth.start.recording')}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
          {/* タブ切り替え */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('google')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'google'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Google
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'login'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'register'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      {t('auth.error')}
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                      {error}
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ログインフォーム */}
          {activeTab === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  id="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password.placeholder')}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 touch-manipulation text-base font-medium"
              >
                <Lock size={20} />
                {loading ? t('auth.logging.in') : t('auth.login')}
              </button>
            </form>
          )}

          {/* 新規登録フォーム */}
          {activeTab === 'register' && (
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div>
                <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('auth.username.optional')}
                </label>
                <input
                  type="text"
                  id="register-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('auth.username.placeholder')}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  id="register-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('auth.password.min6')}
                </label>
                <input
                  type="password"
                  id="register-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password.placeholder')}
                  minLength={6}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-green-600 text-white rounded-md hover:bg-green-700 active:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 touch-manipulation text-base font-medium"
              >
                <User size={20} />
                {loading ? t('auth.registering') : t('auth.register')}
              </button>
            </form>
          )}

          {/* Google認証 */}
          {activeTab === 'google' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  {t('auth.google.login.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                  {t('auth.google.login.description')}
                </p>
              </div>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 active:bg-gray-100 dark:active:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 touch-manipulation text-base font-medium shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? t('auth.logging.in') : t('auth.google.login.button')}
              </button>
            </div>
          )}

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            <p>
              {t('auth.privacy.notice')}
            </p>
            <p className="mt-2 text-xs text-red-500 font-semibold">
              {t('auth.safari.notice')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 