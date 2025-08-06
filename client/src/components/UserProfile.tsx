import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut, User as UserIcon, ChevronDown, HelpCircle, Users, Activity, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import AccountSettingsModal from './AccountSettingsModal';

// カスタムUser型
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface UserProfileProps {
  user: User;
  onOpenFriendsList?: () => void;
  onOpenFriendsFeed?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onOpenFriendsList, onOpenFriendsFeed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { logout } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    try {
      const result = await logout();
      if (!result.success) {
        alert(result.error || t('auth.logout.failed'));
      }
    } catch (error) {
      alert(t('auth.logout.failed'));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <UserIcon size={16} className="text-white" />
        </div>
        <span className="text-sm font-medium">
          {user.email}
        </span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
            <p className="font-medium">{user.email}</p>
            {user.username && (
              <p className="text-gray-500 dark:text-gray-400">{user.username}</p>
            )}
          </div>

          <button
            onClick={() => {
              setIsSettingsOpen(true);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings size={16} />
            {t('settings.title')}
          </button>

          {onOpenFriendsList && (
            <button
              onClick={() => {
                onOpenFriendsList();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Users size={16} />
              {t('friends.list')}
            </button>
          )}

          {onOpenFriendsFeed && (
            <button
              onClick={() => {
                onOpenFriendsFeed();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Activity size={16} />
              {t('friends.feed')}
            </button>
          )}

          <Link
            to="/help"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <HelpCircle size={16} />
            {t('help.title')}
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut size={16} />
            {t('auth.logout')}
          </button>
        </div>
      )}

      {/* アカウント設定モーダル */}
      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default UserProfile; 