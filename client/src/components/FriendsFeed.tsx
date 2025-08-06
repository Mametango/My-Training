import React, { useState, useEffect } from 'react';
import { SharedWorkout } from '../types';
import { sharedWorkoutAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Calendar, Activity, X, RefreshCw } from 'lucide-react';
import { getJSTDateString } from '../utils/dateUtils';

interface FriendsFeedProps {
  isOpen: boolean;
  onClose: () => void;
}

const FriendsFeed: React.FC<FriendsFeedProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [sharedWorkouts, setSharedWorkouts] = useState<SharedWorkout[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFriendsWorkouts();
    }
  }, [isOpen]);

  const fetchFriendsWorkouts = async () => {
    setLoading(true);
    try {
      const response = await sharedWorkoutAPI.getFriendsWorkouts(50);
      setSharedWorkouts(response.data);
    } catch (error) {
      console.error('Failed to fetch friends workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculate1RM = (weight: number, reps: number): number => {
    if (weight <= 0 || reps <= 0) return 0;
    return Math.round(weight * (1 + reps / 30));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('friends.feed')}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchFriendsWorkouts}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              title={t('refresh')}
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">{t('loading')}</p>
            </div>
          ) : sharedWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">{t('friends.no.records')}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {t('friends.no.records.description')}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sharedWorkouts.map((sharedWorkout) => (
                <div
                  key={sharedWorkout.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  {/* ユーザー情報 */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {sharedWorkout.user.name}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{getJSTDateString(new Date(sharedWorkout.workout.date))}</span>
                        </div>
                        {sharedWorkout.workout.created_at && (
                          <span>
                            {new Date(sharedWorkout.workout.created_at).toLocaleTimeString('ja-JP', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 記録内容 */}
                  <div className="bg-white dark:bg-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {sharedWorkout.workout.muscle_group}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                          {sharedWorkout.workout.exercise_name}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('form.weight')}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {sharedWorkout.workout.weight ? `${sharedWorkout.workout.weight}kg` : t('stats.unset')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('form.reps')}</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {sharedWorkout.workout.reps ? `${sharedWorkout.workout.reps}${t('form.reps.unit')}` : t('stats.unset')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.1rm')}</p>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {sharedWorkout.workout.weight && sharedWorkout.workout.reps
                            ? `${calculate1RM(sharedWorkout.workout.weight, sharedWorkout.workout.reps)}kg`
                            : '-'
                          }
                        </p>
                      </div>
                    </div>

                    {sharedWorkout.workout.notes && (
                      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-500 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{t('form.notes')}:</span> {sharedWorkout.workout.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsFeed; 