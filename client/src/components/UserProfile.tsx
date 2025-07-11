import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { signOutUser } from '../firebase';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('サインアウトエラー:', error);
      alert('サインアウトに失敗しました');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <UserIcon size={16} className="text-white" />
          )}
        </div>
        <span className="text-sm font-medium">
          {user.displayName || user.email}
        </span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-sm text-gray-700 border-b">
            <p className="font-medium">{user.displayName}</p>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut size={16} />
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 