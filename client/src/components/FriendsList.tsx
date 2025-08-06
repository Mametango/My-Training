import React, { useState, useEffect } from 'react';
import { Friend, FriendRequest } from '../types';
import { friendAPI } from '../services/api';
import { User, UserPlus, UserMinus, Check, X, Mail } from 'lucide-react';

interface FriendsListProps {
  isOpen: boolean;
  onClose: () => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ isOpen, onClose }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
      fetchRequests();
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    try {
      const response = await friendAPI.getAll();
      setFriends(response.data);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await friendAPI.getRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const handleSendRequest = async () => {
    if (!newFriendEmail.trim()) return;
    
    setLoading(true);
    try {
      await friendAPI.sendRequest(newFriendEmail.trim());
      setNewFriendEmail('');
      alert('友達リクエストを送信しました');
    } catch (error: any) {
      alert(error.message || 'リクエストの送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendAPI.acceptRequest(requestId);
      await fetchRequests();
      await fetchFriends();
      alert('友達リクエストを承認しました');
    } catch (error) {
      alert('リクエストの承認に失敗しました');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendAPI.rejectRequest(requestId);
      await fetchRequests();
      alert('友達リクエストを拒否しました');
    } catch (error) {
      alert('リクエストの拒否に失敗しました');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!window.confirm('この友達を削除しますか？')) return;
    
    try {
      await friendAPI.removeFriend(friendId);
      await fetchFriends();
      alert('友達を削除しました');
    } catch (error) {
      alert('友達の削除に失敗しました');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">友達</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'friends'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            友達 ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'requests'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            リクエスト ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'add'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            追加
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* 友達一覧 */}
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500 dark:text-gray-400">友達がいません</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">友達を追加して記録を共有しましょう</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {friend.friend_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {friend.friend_email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friend.friend_id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="友達を削除"
                    >
                      <UserMinus size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 友達リクエスト */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500 dark:text-gray-400">保留中のリクエストはありません</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {request.from_user_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {request.from_user_email}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
                      >
                        <Check size={16} />
                        <span>承認</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2"
                      >
                        <X size={16} />
                        <span>拒否</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 友達追加 */}
          {activeTab === 'add' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  友達のメールアドレス
                </label>
                <input
                  type="email"
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
                />
              </div>
              <button
                onClick={handleSendRequest}
                disabled={loading || !newFriendEmail.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <UserPlus size={16} />
                <span>{loading ? '送信中...' : '友達リクエストを送信'}</span>
              </button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>• 友達のメールアドレスを入力してリクエストを送信</p>
                <p>• 友達が承認すると記録を共有できます</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsList; 