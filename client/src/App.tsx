import React, { useState, useEffect, useRef } from 'react';
import CalendarComponent from './components/Calendar';
import WorkoutList from './components/WorkoutList';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import SettingsModal from './components/SettingsModal';
import FriendsList from './components/FriendsList';
import FriendsFeed from './components/FriendsFeed';
import { Workout, WorkoutFormData, MuscleGroup, Exercise } from './types';
import { workoutAPI, muscleGroupAPI, exerciseAPI } from './services/api';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { getJSTDateString, getMonthDateRange } from './utils/dateUtils';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Help from './components/Help';

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateLoading, setDateLoading] = useState(false);
  const [monthlyWorkouts, setMonthlyWorkouts] = useState<Workout[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFriendsListOpen, setIsFriendsListOpen] = useState(false);
  const [isFriendsFeedOpen, setIsFriendsFeedOpen] = useState(false);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const initialDataFetchedRef = useRef(false);
  const userRef = useRef<any>(null);
  const authLoadingRef = useRef(true);

  // タイトルと言語を設定
  useEffect(() => {
    document.title = t('app.title');
    document.documentElement.lang = language;
  }, [t, language]);





  // 認証状態の変更を追跡し、認証完了時に初期データを取得
  useEffect(() => {
    userRef.current = user;
    authLoadingRef.current = authLoading;
    
    // 認証が完了したら初期データを取得（一度だけ）
    if (user && !authLoading && !initialDataFetchedRef.current) {
      initialDataFetchedRef.current = true;
      
      // 非同期で初期データを取得
      const fetchInitialData = async () => {
        setLoading(true);
        
        try {
          // タイムアウト付きのPromise.all
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Initial data fetch timeout')), 5000);
          });
          
          const dataPromise = Promise.all([
            muscleGroupAPI.getAll(),
            exerciseAPI.getAll()
          ]);
          
          const [muscleGroupsData, exercisesData] = await Promise.race([dataPromise, timeoutPromise]) as any;
          
          setMuscleGroups(muscleGroupsData.data || []);
          setExercises(exercisesData.data || []);
        } catch (error) {
          console.error('Failed to fetch initial data:', error);
          setMuscleGroups([]);
          setExercises([]);
        } finally {
          setLoading(false);
        }
      };
      
      // 即座に実行
      fetchInitialData();
    } else if (!user && !authLoading) {
      setLoading(false);
      initialDataFetchedRef.current = false;
    }
  }, [user, authLoading]);





  // selectedDateが変わるたびにその日の記録と月次データを取得
  useEffect(() => {
    if (user && !authLoading) {
      const fetchDailyWorkouts = async () => {
        try {
          setDateLoading(true);
          const dateString = getJSTDateString(selectedDate);
          const response = await workoutAPI.getAll(dateString);
          setWorkouts(response.data);
        } catch (error) {
          console.error('Failed to fetch workouts:', error);
          setWorkouts([]);
        } finally {
          setDateLoading(false);
        }
      };
      
      const fetchMonthlyData = async () => {
        const dateRange = getMonthDateRange(selectedDate);
        const { start, end } = dateRange;
        try {
          const response = await workoutAPI.getByDateRange(start, end);
          setMonthlyWorkouts(response.data);
        } catch (error) {
          console.error('Failed to fetch monthly workouts:', error);
          setMonthlyWorkouts([]);
        }
      };
      
      // 両方のデータを並行取得
      Promise.allSettled([fetchDailyWorkouts(), fetchMonthlyData()]);
    }
  }, [user, authLoading, selectedDate]);




  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const handleAddWorkout = () => {
    // WorkoutListで直接追加できるようにする
  };

  const handleEditWorkout = async (workout: Workout) => {
    try {
      if (workout.id) {
        // WorkoutFormData型に変換
        const dataToSubmit = {
          id: workout.id,
          date: workout.date,
          muscle_group: workout.muscle_group,
          exercise_name: workout.exercise_name,
          reps: typeof workout.reps === 'number' ? workout.reps : '',
          weight: typeof workout.weight === 'number' ? workout.weight : '',
          notes: workout.notes || '',
        } as WorkoutFormData;
        await workoutAPI.update(workout.id, dataToSubmit);
        // 編集時は当日のデータのみ更新
        const dateString = getJSTDateString(selectedDate);
        const response = await workoutAPI.getAll(dateString);
        setWorkouts(response.data);
      }
          } catch (error) {
        alert(t('workout.edit.failed'));
      }
  };

  // id型をstringに
  const handleDeleteWorkout = async (id: string, confirm: boolean = true) => {
    if (!confirm || window.confirm(t('workout.delete.confirm'))) {
      try {
        await workoutAPI.delete(id);
        // 削除時は当日のデータと月全体のデータを更新
        const dateString = getJSTDateString(selectedDate);
        const response = await workoutAPI.getAll(dateString);
        setWorkouts(response.data);
        
        const dateRange = getMonthDateRange(selectedDate);
        const monthlyResponse = await workoutAPI.getByDateRange(dateRange.start, dateRange.end);
        setMonthlyWorkouts(monthlyResponse.data);
      } catch (error) {
        alert(t('workout.delete.failed'));
      }
    }
  };

  const handleSubmitWorkout = async (workoutData: WorkoutFormData) => {
    try {
      // workoutDataの日付をそのまま使用（selectedDateで上書きしない）
      const dataToSubmit = {
        ...workoutData,
        // date: getJSTDateString(selectedDate), // この行を削除
      };

      if (workoutData.id) {
        await workoutAPI.update(workoutData.id, dataToSubmit);
      } else {
        await workoutAPI.create(dataToSubmit);
      }

      // 新規作成・更新時は当日のデータと月全体のデータを更新
      const dateString = getJSTDateString(selectedDate);
      const response = await workoutAPI.getAll(dateString);
      setWorkouts(response.data);
      
      const dateRange = getMonthDateRange(selectedDate);
      const monthlyResponse = await workoutAPI.getByDateRange(dateRange.start, dateRange.end);
      setMonthlyWorkouts(monthlyResponse.data);
    } catch (error) {
      console.error('Workout submission error:', error);
      alert('記録の保存に失敗しました: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // タイトルクリックで今日の日付に移動
  const handleTitleClick = () => {
    const today = new Date();
    setSelectedDate(today);
  };

  // 設定モーダルを開く
  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  // 友達一覧を開く
  const handleOpenFriendsList = () => {
    setIsFriendsListOpen(true);
  };

  // 友達フィードを開く
  const handleOpenFriendsFeed = () => {
    setIsFriendsFeedOpen(true);
  };

  // 未使用のformatDate関数を削除

  // Debug panel removed

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('auth.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loading')}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">データを読み込み中...</p>
          <button 
            onClick={() => {
              setLoading(false);
              if (user) {
                setLoading(true);
                initialDataFetchedRef.current = false;
                // ページをリロードして初期化
                window.location.reload();
              }
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            手動で更新
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 
                className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={handleTitleClick}
                title={t('app.title.tooltip')}
              >
                {t('app.title')}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <UserProfile 
                user={user} 
                onOpenFriendsList={handleOpenFriendsList}
                onOpenFriendsFeed={handleOpenFriendsFeed}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar 上部配置 */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <CalendarComponent
              selectedDate={selectedDate}
              workouts={monthlyWorkouts}
              onDateChange={handleDateChange}
            />
          </div>
        </div>

        {/* WorkoutList 下部配置 */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <WorkoutList
              workouts={workouts}
              onEdit={handleEditWorkout}
              onDelete={handleDeleteWorkout}
              onAddWorkout={handleAddWorkout}
              onSubmitWorkout={handleSubmitWorkout}
              selectedDate={selectedDate}
              onOpenSettings={handleOpenSettings}
              muscleGroups={muscleGroups}
              exercises={exercises}
              loading={dateLoading}
            />
          </div>
        </div>

      </main>

      {/* 設定モーダル */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* 友達一覧モーダル */}
      <FriendsList
        isOpen={isFriendsListOpen}
        onClose={() => setIsFriendsListOpen(false)}
      />

      {/* 友達フィードモーダル */}
      <FriendsFeed
        isOpen={isFriendsFeedOpen}
        onClose={() => setIsFriendsFeedOpen(false)}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/help" element={<Help />} />
        <Route path="/" element={<AppContent />} />
      </Routes>
    </Router>
  );
};

export default App; 