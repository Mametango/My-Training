import axios from 'axios';
import { Workout, MuscleGroup, WorkoutFormData, Statistics } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Workout API
export const workoutAPI = {
  getAll: (date?: string) => 
    api.get<Workout[]>('/workouts', { params: { date } }),
  
  getByDateRange: (startDate: string, endDate: string) =>
    api.get<Workout[]>('/workouts/range', { 
      params: { start_date: startDate, end_date: endDate } 
    }),
  
  create: (workout: WorkoutFormData) =>
    api.post<{ id: number; message: string }>('/workouts', workout),
  
  update: (id: number, workout: WorkoutFormData) =>
    api.put<{ message: string }>(`/workouts/${id}`, workout),
  
  delete: (id: number) =>
    api.delete<{ message: string }>(`/workouts/${id}`),
};

// Muscle Groups API
export const muscleGroupAPI = {
  getAll: () => api.get<MuscleGroup[]>('/muscle-groups'),
};

// Exercise API
export const exerciseAPI = {
  getByMuscleGroup: (muscleGroup: string) => 
    api.get<string[]>(`/exercises/${muscleGroup}`),
};

// Statistics API
export const statisticsAPI = {
  get: (startDate?: string, endDate?: string) =>
    api.get<Statistics[]>('/statistics', {
      params: { start_date: startDate, end_date: endDate }
    }),
};

export default api; 