// Firestore用APIラッパー
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Workout, MuscleGroup, Exercise, WorkoutFormData, Friend, FriendRequest, UserProfile, SharedWorkout } from '../types';
import '../firebase'; // firebase.tsでinitializeApp済み

const db = getFirestore();
const auth = getAuth();

// Firestoreのコレクション名
const WORKOUTS = 'workouts';
const MUSCLE_GROUPS = 'muscleGroups';
const EXERCISES = 'exercises';
const FRIENDS = 'friends';
const FRIEND_REQUESTS = 'friendRequests';
const USER_PROFILES = 'userProfiles';

// FirestoreデータをWorkout型に変換するヘルパー関数
const convertFirestoreDocToWorkout = (doc: any): Workout => {
  const data = doc.data();
  return {
    id: doc.id,
    date: data.date || '',
    muscle_group: data.muscle_group || '',
    exercise_name: data.exercise_name || '',
    reps: data.reps || 0,
    weight: data.weight || 0,
    notes: data.notes || '',
    created_at: data.created_at || '',
  };
};

// Workout API
export const workoutAPI = {
  // 指定日付のworkout一覧取得
  getAll: async (date?: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    console.log('Fetching workouts for date:', date, 'user:', user.uid);
    
    let q = query(
      collection(db, WORKOUTS),
      where('userId', '==', user.uid)
    );
    
    if (date) {
      q = query(q, where('date', '==', date));
    }
    
    const snap = await getDocs(q);
    console.log('Found workouts:', snap.docs.length);
    return { data: snap.docs.map(convertFirestoreDocToWorkout) };
  },

  // 日付範囲でworkout取得
  getByDateRange: async (startDate: string, endDate: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const q = query(
      collection(db, WORKOUTS),
      where('userId', '==', user.uid),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    const snap = await getDocs(q);
    return { data: snap.docs.map(convertFirestoreDocToWorkout) };
  },

  // workout新規作成
  create: async (workoutData: WorkoutFormData) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    console.log('Creating workout with data:', workoutData);
    
    const docRef = await addDoc(collection(db, WORKOUTS), {
      ...workoutData,
      userId: user.uid,
      created_at: new Date().toISOString(),
    });
    
    console.log('Workout created with ID:', docRef.id);
    return { data: { id: docRef.id, ...workoutData } };
  },

  // workout更新
  update: async (id: string, workoutData: WorkoutFormData) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const docRef = doc(db, WORKOUTS, id);
    await updateDoc(docRef, {
      ...workoutData,
      updated_at: new Date().toISOString(),
    });
    
    return { data: { id, ...workoutData } };
  },

  // workout削除
  delete: async (id: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const docRef = doc(db, WORKOUTS, id);
    await deleteDoc(docRef);
    
    return { data: { id } };
  },
};

// MuscleGroup API
export const muscleGroupAPI = {
  getAll: async () => {
    try {
      console.log('Fetching muscle groups...');
      const snap = await getDocs(collection(db, MUSCLE_GROUPS));
      console.log('Muscle groups found:', snap.docs.length);
      return { 
        data: snap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          color: doc.data().color || '#3B82F6',
          description: doc.data().description || '',
        })) as MuscleGroup[]
      };
      } catch (error) {
    return { data: [] };
  }
  },
};

// Exercise API
export const exerciseAPI = {
  getAll: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No authenticated user for exercises');
        return { data: [] };
      }
      
      console.log('Fetching exercises for user:', user.uid);
      const q = query(
        collection(db, EXERCISES),
        where('userId', '==', user.uid)
      );
      const snap = await getDocs(q);
      
      console.log('Exercises found:', snap.docs.length);
      
      // データが空の場合は初期データを再設定
      if (snap.empty) {
        console.log('No exercises found, returning empty array');
        return { data: [] };
      }
      
      const result = { 
        data: snap.docs.map(doc => ({
          id: doc.id,
          muscle_group: doc.data().muscle_group || '',
          name: doc.data().name || '',
          order: doc.data().order || 0,
          itemid: doc.data().itemid || '',
        }))
      };
      return result;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return { data: [] };
    }
  },

  // 種目データを強制的に再初期化
  reinitialize: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // 再初期化機能を一時的に無効化
      return { data: [] };
    } catch (error) {
      throw error;
    }
  },

  // 重複した種目を削除
  removeDuplicates: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const q = query(
        collection(db, EXERCISES),
        where('userId', '==', user.uid)
      );
      const snap = await getDocs(q);
      
      const existingExerciseData = snap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || '',
        muscle_group: doc.data().muscle_group || '',
      }));
      
      // 重複した種目を検出して削除
      const seenKeys = new Set();
      const duplicatesToDelete = [];
      
      for (const exercise of existingExerciseData) {
        const key = `${exercise.muscle_group}__${exercise.name}`;
        if (seenKeys.has(key)) {
          duplicatesToDelete.push(exercise.id);
        } else {
          seenKeys.add(key);
        }
      }
      
      if (duplicatesToDelete.length > 0) {
        const deletePromises = duplicatesToDelete.map(id => deleteDoc(doc(db, EXERCISES, id)));
        await Promise.all(deletePromises);
      }
      
      // 削除後にデータを再取得
      return await exerciseAPI.getAll();
    } catch (error) {
      throw error;
    }
  },

  // userIdが設定されていない種目を現在のユーザーIDで修正
  fixMissingUserIds: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const snap = await getDocs(collection(db, EXERCISES));
    const exercisesWithoutUserId = snap.docs.filter(doc => !doc.data().userId);
    
    if (exercisesWithoutUserId.length === 0) {
      return { data: 'No exercises without userId found' };
    }
    
    const updatePromises = exercisesWithoutUserId.map(docSnap => {
      return updateDoc(doc(db, EXERCISES, docSnap.id), {
        userId: user.uid,
        updated_at: new Date().toISOString(),
      });
    });
    
    await Promise.all(updatePromises);
    return { data: `${exercisesWithoutUserId.length} exercises updated with userId` };
  },

  // すべてのexercisesにlistIdを一括付与
  fixAllListIds: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const snap = await getDocs(collection(db, EXERCISES));
    const toUpdate = snap.docs.filter(doc => !doc.data().listId);
    if (toUpdate.length === 0) {
      return { data: 'No exercises without listId found' };
    }
    const updatePromises = toUpdate.map(docSnap => {
      return updateDoc(doc(db, EXERCISES, docSnap.id), {
        listId: 'defaultlistid',
        updated_at: new Date().toISOString(),
      });
    });
    await Promise.all(updatePromises);
    return { data: `${toUpdate.length} exercises updated with listId` };
  },

  // すべてのexercisesにitemidを0001から順に再割り当て（リセット）
  fixAllItemIds: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const snap = await getDocs(collection(db, EXERCISES));
    const exercises = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string; [key: string]: any }>;
    // 名前順でソート（または任意の順序で）
    const sorted = exercises.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    const updatePromises = sorted.map((exercise, index) => {
      const newItemId = String(index + 1).padStart(4, '0');
      return updateDoc(doc(db, EXERCISES, exercise.id), {
        itemid: newItemId,
        updated_at: new Date().toISOString(),
      });
    });
    await Promise.all(updatePromises);
    return { data: `${sorted.length} exercises itemidリセット完了` };
  },

  getByMuscleGroup: async (muscleGroup: string) => {
    const q = query(
      collection(db, EXERCISES),
      where('muscle_group', '==', muscleGroup)
    );
    const snap = await getDocs(q);
    return { 
      data: snap.docs.map(doc => ({
        id: doc.id,
        muscle_group: doc.data().muscle_group || '',
        name: doc.data().name || '',
        type: doc.data().type || 'compound',
        itemid: doc.data().itemid || '',
      }))
    };
  },

  create: async (exerciseData: Omit<Exercise, 'id' | 'itemid'>) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    try {
      // 既存のitemid/Newitemidをすべて取得
      const snap = await getDocs(collection(db, EXERCISES));
      const allItemIds = snap.docs
        .map(doc => doc.data().itemid)
        .filter(itemid => itemid && itemid.match(/^\d{4}$/))
        .map(itemid => parseInt(itemid, 10));
      const allNewItemIds = snap.docs
        .map(doc => doc.data().itemid)
        .filter(itemid => itemid && itemid.startsWith('Newitemid_'))
        .map(itemid => parseInt(itemid.replace('Newitemid_', ''), 10));
      
      let newItemId = '';
      if (exerciseData.name.startsWith('New')) {
        // Newitemidの欠番を探す
        let n = 1;
        while (allNewItemIds.includes(n)) n++;
        newItemId = `Newitemid_${String(n).padStart(4, '0')}`;
      } else {
        // itemidの欠番を探す
        let n = 1;
        while (allItemIds.includes(n)) n++;
        newItemId = String(n).padStart(4, '0');
      }
      
      const docRef = await addDoc(collection(db, EXERCISES), {
        ...exerciseData,
        userId: user.uid,
        itemid: newItemId,
        created_at: new Date().toISOString(),
      });
      
      return { data: { id: docRef.id, ...exerciseData, itemid: newItemId } };
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, exerciseData: Exercise) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const docRef = doc(db, EXERCISES, id);
    const { id: _, ...dataWithoutId } = exerciseData;
    await updateDoc(docRef, {
      ...dataWithoutId,
      updated_at: new Date().toISOString(),
    });
    
    return { data: { id, ...dataWithoutId } };
  },

  delete: async (id: string) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    try {
      const docRef = doc(db, EXERCISES, id);
      await deleteDoc(docRef);
      return { data: { id } };
    } catch (error) {
      throw error;
    }
  },

  // 種目の順番を一括更新
  updateOrder: async (exercises: Exercise[]) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    try {
      const updatePromises = exercises.map((exercise, index) => {
        const docRef = doc(db, EXERCISES, exercise.id);
        return updateDoc(docRef, {
          order: index,
          updated_at: new Date().toISOString(),
        });
      });
      
      await Promise.all(updatePromises);
      return { data: exercises };
    } catch (error) {
      throw error;
    }
  },
};

// Statistics API
export const statisticsAPI = {
  get: async (startDate: string, endDate: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const q = query(
      collection(db, WORKOUTS),
      where('userId', '==', user.uid),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    const snap = await getDocs(q);
    const workouts = snap.docs.map(convertFirestoreDocToWorkout);
    
    // 統計データを集計
    const stats = workouts.reduce((acc: any, workout) => {
      const group = workout.muscle_group;
      if (!acc[group]) {
        acc[group] = {
          muscle_group: group,
          workout_count: 0,
          total_reps: 0,
          total_weight: 0,
          weight_count: 0,
        };
      }
      acc[group].workout_count++;
      acc[group].total_reps += workout.reps || 0;
      if (workout.weight && workout.weight > 0) {
        acc[group].total_weight += workout.weight;
        acc[group].weight_count++;
      }
      return acc;
    }, {});
    
    return {
      data: Object.values(stats).map((stat: any) => ({
        muscle_group: stat.muscle_group,
        workout_count: stat.workout_count,
        total_reps: stat.total_reps,
        avg_weight: stat.weight_count > 0 ? stat.total_weight / stat.weight_count : 0,
      }))
    };
  },
};

// Friend API
export const friendAPI = {
  // 友達一覧取得
  getAll: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const q = query(
      collection(db, FRIENDS),
      where('user_id', '==', user.uid),
      where('status', '==', 'accepted')
    );
    const snap = await getDocs(q);
    return { data: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Friend[] };
  },

  // 友達リクエスト一覧取得
  getRequests: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const q = query(
      collection(db, FRIEND_REQUESTS),
      where('to_user_id', '==', user.uid),
      where('status', '==', 'pending')
    );
    const snap = await getDocs(q);
    return { data: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FriendRequest[] };
  },

  // 友達リクエスト送信
  sendRequest: async (friendEmail: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    // 友達のユーザープロファイルを検索
    const userQuery = query(
      collection(db, USER_PROFILES),
      where('email', '==', friendEmail)
    );
    const userSnap = await getDocs(userQuery);
    
    if (userSnap.empty) {
      throw new Error('ユーザーが見つかりません');
    }
    
    const friendProfile = userSnap.docs[0].data() as UserProfile;
    
    // 既存のリクエストをチェック
    const existingQuery = query(
      collection(db, FRIEND_REQUESTS),
      where('from_user_id', '==', user.uid),
      where('to_user_id', '==', friendProfile.id)
    );
    const existingSnap = await getDocs(existingQuery);
    
    if (!existingSnap.empty) {
      throw new Error('既に友達リクエストを送信しています');
    }
    
    // 新しいリクエストを作成
    const docRef = await addDoc(collection(db, FRIEND_REQUESTS), {
      from_user_id: user.uid,
      to_user_id: friendProfile.id,
      from_user_email: user.email,
      from_user_name: user.displayName || user.email,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
    
    return { data: { id: docRef.id } };
  },

  // 友達リクエスト承認
  acceptRequest: async (requestId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    // リクエストを取得
    const requestRef = doc(db, FRIEND_REQUESTS, requestId);
    const requestSnap = await getDocs(query(collection(db, FRIEND_REQUESTS), where('__name__', '==', requestId)));
    const request = requestSnap.docs[0].data() as FriendRequest;
    
    // リクエストを承認済みに更新
    await updateDoc(requestRef, { status: 'accepted' });
    
    // 友達関係を作成（双方向）
    await addDoc(collection(db, FRIENDS), {
      user_id: user.uid,
      friend_id: request.from_user_id,
      friend_email: request.from_user_email,
      friend_name: request.from_user_name,
      status: 'accepted',
      created_at: new Date().toISOString(),
    });
    
    await addDoc(collection(db, FRIENDS), {
      user_id: request.from_user_id,
      friend_id: user.uid,
      friend_email: user.email,
      friend_name: user.displayName || user.email,
      status: 'accepted',
      created_at: new Date().toISOString(),
    });
    
    return { data: { id: requestId } };
  },

  // 友達リクエスト拒否
  rejectRequest: async (requestId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const requestRef = doc(db, FRIEND_REQUESTS, requestId);
    await updateDoc(requestRef, { status: 'rejected' });
    
    return { data: { id: requestId } };
  },

  // 友達削除
  removeFriend: async (friendId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    // 双方向の友達関係を削除
    const q1 = query(
      collection(db, FRIENDS),
      where('user_id', '==', user.uid),
      where('friend_id', '==', friendId)
    );
    const q2 = query(
      collection(db, FRIENDS),
      where('user_id', '==', friendId),
      where('friend_id', '==', user.uid)
    );
    
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    const deletePromises = [
      ...snap1.docs.map(doc => deleteDoc(doc.ref)),
      ...snap2.docs.map(doc => deleteDoc(doc.ref))
    ];
    
    await Promise.all(deletePromises);
    
    return { data: { id: friendId } };
  },
};

// User Profile API
export const userProfileAPI = {
  // ユーザープロファイル取得
  get: async (userId?: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const targetUserId = userId || user.uid;
    const q = query(
      collection(db, USER_PROFILES),
      where('id', '==', targetUserId)
    );
    const snap = await getDocs(q);
    
    if (snap.empty) {
      // プロファイルが存在しない場合は作成
      return userProfileAPI.create();
    }
    
    return { data: { id: snap.docs[0].id, ...snap.docs[0].data() } as UserProfile };
  },

  // ユーザープロファイル作成
  create: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const profileData = {
      id: user.uid,
      email: user.email,
      name: user.displayName || user.email,
      photo_url: user.photoURL,
      is_public_profile: false,
      allow_friend_requests: true,
      created_at: new Date().toISOString(),
    };
    
    await addDoc(collection(db, USER_PROFILES), profileData);
    return { data: profileData as UserProfile };
  },

  // ユーザープロファイル更新
  update: async (profileData: Partial<UserProfile>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const q = query(
      collection(db, USER_PROFILES),
      where('id', '==', user.uid)
    );
    const snap = await getDocs(q);
    
    if (snap.empty) {
      throw new Error('Profile not found');
    }
    
    const docRef = doc(db, USER_PROFILES, snap.docs[0].id);
    await updateDoc(docRef, {
      ...profileData,
      updated_at: new Date().toISOString(),
    });
    
    return { data: { id: snap.docs[0].id, ...snap.docs[0].data(), ...profileData } as UserProfile };
  },
};

// Shared Workout API
export const sharedWorkoutAPI = {
  // 友達の公開記録を取得
  getFriendsWorkouts: async (limitCount: number = 20) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    // 友達一覧を取得
    const friendsResponse = await friendAPI.getAll();
    const friends = friendsResponse.data;
    
    if (friends.length === 0) {
      return { data: [] };
    }
    
    // 友達の公開記録を取得
    const friendIds = friends.map(f => f.friend_id);
    const q = query(
      collection(db, WORKOUTS),
      where('user_id', 'in', friendIds),
      where('is_public', '==', true),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    
    const snap = await getDocs(q);
    const workouts = snap.docs.map(convertFirestoreDocToWorkout);
    
    // ユーザー情報を取得
    const userIds = [...new Set(workouts.map(w => w.user_id).filter(Boolean))];
    const userProfiles = await Promise.all(
      userIds.map(id => userProfileAPI.get(id))
    );
    
    const userMap = userProfiles.reduce((acc, profile) => {
      if (profile.data) {
        acc[profile.data.id] = profile.data;
      }
      return acc;
    }, {} as Record<string, UserProfile>);
    
    const sharedWorkouts: SharedWorkout[] = workouts.map(workout => ({
      id: workout.id!,
      workout,
      user: userMap[workout.user_id!] || { id: '', email: '', name: '', is_public_profile: false, allow_friend_requests: false, created_at: '' },
      shared_at: workout.created_at || new Date().toISOString(),
    }));
    
    return { data: sharedWorkouts };
  },
}; 