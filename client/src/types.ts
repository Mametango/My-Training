export interface Workout {
  id?: number;
  date: string;
  muscle_group: string;
  exercise_name: string;
  reps?: number;
  weight?: number;
  notes?: string;
  created_at?: string;
}

export interface MuscleGroup {
  id: string;
  name: string;
  color: string;
}

export interface WorkoutFormData {
  date: string;
  muscle_group: string;
  exercise_name: string;
  reps: number;
  weight: number;
  notes: string;
}

export interface Statistics {
  muscle_group: string;
  workout_count: number;
  total_reps: number;
  avg_weight: number;
} 