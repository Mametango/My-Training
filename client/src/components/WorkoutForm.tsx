import React, { useState, useEffect } from 'react';
import { WorkoutFormData, MuscleGroup } from '../types';
import { muscleGroupAPI, exerciseAPI } from '../services/api';

interface WorkoutFormProps {
  selectedDate: Date;
  onSubmit: (workout: WorkoutFormData) => void;
  onCancel: () => void;
  initialData?: WorkoutFormData;
  isEditing?: boolean;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({
  selectedDate,
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [exerciseSuggestions, setExerciseSuggestions] = useState<string[]>([]);
  const [formData, setFormData] = useState<WorkoutFormData>({
    date: selectedDate.toISOString().split('T')[0],
    muscle_group: '',
    exercise_name: '',
    reps: 10,
    weight: 0,
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0],
      }));
    }
  }, [selectedDate, initialData]);

  // Update form date when selectedDate changes (for new workouts)
  useEffect(() => {
    if (!isEditing) {
      const newDate = selectedDate.toISOString().split('T')[0];
      console.log('Updating form date to:', newDate, 'isEditing:', isEditing);
      setFormData(prev => ({
        ...prev,
        date: newDate,
      }));
    }
  }, [selectedDate, isEditing]);

  // Force update form date when not editing to ensure synchronization
  useEffect(() => {
    if (!isEditing && !initialData) {
      const newDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        date: newDate,
      }));
    }
  }, [selectedDate, isEditing, initialData]);

  useEffect(() => {
    const fetchMuscleGroups = async () => {
      try {
        const response = await muscleGroupAPI.getAll();
        setMuscleGroups(response.data);
      } catch (error) {
        console.error('Failed to fetch muscle groups:', error);
      }
    };
    fetchMuscleGroups();
  }, []);

  useEffect(() => {
    const fetchExerciseSuggestions = async () => {
      if (formData.muscle_group) {
        try {
          const response = await exerciseAPI.getByMuscleGroup(formData.muscle_group);
          setExerciseSuggestions(response.data);
        } catch (error) {
          console.error('Failed to fetch exercise suggestions:', error);
          setExerciseSuggestions([]);
        }
      } else {
        setExerciseSuggestions([]);
      }
    };
    fetchExerciseSuggestions();
  }, [formData.muscle_group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'reps' || name === 'weight' ? Number(value) : value,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {isEditing ? 'トレーニングを編集' : '新しいトレーニング'}
      </h2>
      {!isEditing && (
        <p className="text-lg text-gray-600 mb-4">
          {selectedDate.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })} の記録を追加
        </p>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日付
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日付
            </label>
            <div className="text-lg text-blue-600 font-medium p-3 bg-blue-50 border border-blue-200 rounded-md">
              📅 {selectedDate.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
            <input
              type="hidden"
              name="date"
              value={selectedDate.toISOString().split('T')[0]}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            部位
          </label>
          <select
            name="muscle_group"
            value={formData.muscle_group}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">部位を選択</option>
            {muscleGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            種目名
          </label>
          {exerciseSuggestions.length > 0 ? (
            <select
              name="exercise_name"
              value={formData.exercise_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">種目を選択</option>
              {exerciseSuggestions.map(exercise => (
                <option key={exercise} value={exercise}>
                  {exercise}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="exercise_name"
              value={formData.exercise_name}
              onChange={handleInputChange}
              placeholder="例: ベンチプレス"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              回数
            </label>
            <input
              type="number"
              name="reps"
              value={formData.reps}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              重量 (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              min="0"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-600">
            <span className="font-medium">トータル重量: </span>
            <span className="text-blue-600 font-bold">
              {(formData.reps * formData.weight).toFixed(1)} kg
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メモ
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            placeholder="トレーニングの感想や注意点を記録"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isEditing ? '更新' : '記録'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkoutForm; 