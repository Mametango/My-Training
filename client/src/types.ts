export interface Workout {
  id?: string;
  date: string;
  muscle_group: string;
  exercise_name: string;
  reps?: number;
  weight?: number | -1;
  hand?: 'both' | 'right' | 'left'; // 両手・右手・左手
  notes?: string;
  created_at?: string;
  user_id?: string; // ユーザーIDを追加
  is_public?: boolean; // 公開設定を追加
}

export interface MuscleGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Exercise {
  id: string;
  muscle_group: string;
  name: string;
  itemid?: string;
  order?: number;
}

export interface WorkoutFormData {
  id?: string;
  date: string;
  muscle_group: string;
  exercise_name: string;
  reps: number | '';
  weight: number | '' | -1;
  hand: 'both' | 'right' | 'left'; // 両手・右手・左手
  notes: string;
  is_public?: boolean; // 公開設定を追加
}

export interface Statistics {
  muscle_group: string;
  workout_count: number;
  total_reps: number;
  avg_weight: number;
}

// 友達機能の型定義
export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  friend_email: string;
  friend_name: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  from_user_email: string;
  from_user_name: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  photo_url?: string;
  is_public_profile: boolean;
  allow_friend_requests: boolean;
  created_at: string;
}

export interface SharedWorkout {
  id: string;
  workout: Workout;
  user: UserProfile;
  shared_at: string;
} 