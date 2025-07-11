import React from 'react';
import { Workout } from '../types';

interface WorkoutListProps {
  workouts: Workout[];
  onEdit: (workout: Workout) => void;
  onDelete: (id: number) => void;
}

const WorkoutList: React.FC<WorkoutListProps> = ({ workouts, onEdit, onDelete }) => {
  if (workouts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">トレーニング記録</h2>
        <p className="text-gray-500 text-center py-8">この日のトレーニング記録はありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">トレーニング記録</h2>
      <div className="space-y-4">
        {workouts.map((workout) => (
          <div key={workout.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{workout.exercise_name}</h3>
                <p className="text-sm text-gray-600">{workout.muscle_group}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(workout)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  編集
                </button>
                <button
                  onClick={() => workout.id && onDelete(workout.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  削除
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">回数: </span>
                <span className="font-medium">{workout.reps}回</span>
              </div>
              <div>
                <span className="text-gray-600">重量: </span>
                <span className="font-medium">{workout.weight}kg</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-gray-600 text-sm">トータル重量: </span>
              <span className="text-blue-600 font-bold text-sm">
                {((workout.reps || 0) * (workout.weight || 0)).toFixed(1)}kg
              </span>
            </div>
            {workout.notes && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">{workout.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutList; 