import React, { useState, useEffect, useCallback } from 'react';
import CalendarComponent from './components/Calendar';
import WorkoutForm from './components/WorkoutForm';
import WorkoutList from './components/WorkoutList';
import Statistics from './components/Statistics';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import { Workout, MuscleGroup, WorkoutFormData, Statistics as StatsType } from './types';
import { workoutAPI, muscleGroupAPI, statisticsAPI } from './services/api';
import { Plus, BarChart3 } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [statistics, setStatistics] = useState<StatsType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate date range for statistics (current month)
  const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString().split('T')[0];
  const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).toISOString().split('T')[0];

  useEffect(() => {
    fetchMuscleGroups();
    fetchStatistics();
  }, []);

  const fetchMuscleGroups = async () => {
    try {
      const response = await muscleGroupAPI.getAll();
      setMuscleGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch muscle groups:', error);
    }
  };

  const fetchWorkouts = useCallback(async () => {
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await workoutAPI.getAll(dateString);
      setWorkouts(response.data);
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const fetchStatistics = async () => {
    try {
      const response = await statisticsAPI.get();
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      console.log('Calendar date selected:', value.toISOString().split('T')[0]);
      setSelectedDate(value);
      // Automatically show form when a date is selected
      setShowForm(true);
      setEditingWorkout(null);
      // Reset form to ensure it uses the new selected date
    }
  };

  const handleAddWorkout = () => {
    setShowForm(true);
    setEditingWorkout(null);
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setShowForm(true);
  };

  const handleDeleteWorkout = async (id: number) => {
    if (window.confirm('このトレーニング記録を削除しますか？')) {
      try {
        await workoutAPI.delete(id);
        fetchWorkouts();
        fetchStatistics();
      } catch (error) {
        console.error('Failed to delete workout:', error);
        alert('削除に失敗しました');
      }
    }
  };

  const handleSubmitWorkout = async (workoutData: WorkoutFormData) => {
    try {
      // Always use selected date for new workouts, ignore form date
      const dataToSubmit = editingWorkout ? workoutData : {
        ...workoutData,
        date: selectedDate.toISOString().split('T')[0]
      };

      console.log('Submitting workout with date:', dataToSubmit.date, 'selectedDate:', selectedDate.toISOString().split('T')[0]);

      if (editingWorkout) {
        await workoutAPI.update(editingWorkout.id!, dataToSubmit);
      } else {
        await workoutAPI.create(dataToSubmit);
      }
      setShowForm(false);
      setEditingWorkout(null);
      fetchWorkouts();
      fetchStatistics();
    } catch (error) {
      console.error('Failed to save workout:', error);
      alert('保存に失敗しました');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingWorkout(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">トレーニング記録</h1>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <BarChart3 size={16} />
                  統計
                </button>
                <button
                  onClick={handleAddWorkout}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  記録追加
                </button>
              </div>
              <UserProfile user={user} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            📅 {formatDate(selectedDate)}
          </h2>
          {showForm && !editingWorkout && (
            <p className="text-sm text-blue-600 mt-1">
              この日付に新しいトレーニング記録を追加します
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <CalendarComponent
              selectedDate={selectedDate}
              workouts={workouts}
              onDateChange={handleDateChange}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {showForm ? (
              <WorkoutForm
                selectedDate={selectedDate}
                onSubmit={handleSubmitWorkout}
                onCancel={handleCancelForm}
                initialData={editingWorkout ? {
                  date: editingWorkout.date,
                  muscle_group: editingWorkout.muscle_group,
                  exercise_name: editingWorkout.exercise_name,
                  reps: editingWorkout.reps || 10,
                  weight: editingWorkout.weight || 0,
                  notes: editingWorkout.notes || ''
                } : undefined}
                isEditing={!!editingWorkout}
              />
            ) : showStats ? (
              <Statistics
                statistics={statistics}
                startDate={startDate}
                endDate={endDate}
              />
            ) : (
              <WorkoutList
                workouts={workouts}
                onEdit={handleEditWorkout}
                onDelete={handleDeleteWorkout}
              />
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default App; 