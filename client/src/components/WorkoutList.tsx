import React, { useState, useEffect } from 'react';
import { Workout, MuscleGroup, Exercise, WorkoutFormData } from '../types';
import { getJSTDateString } from '../utils/dateUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { useNumberInput } from '../hooks/useNumberInput';
import { Trash2, GripVertical, User, Settings } from 'lucide-react';
import { XPostButton } from './XPostButton';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 1RM計算関数（Epley式）
const calculate1RM = (weight: number, reps: number): number => {
  if (reps <= 1) return weight;
  return weight * (1 + reps / 30);
};

// 最大重量を取得（将来的に使用する可能性があるためコメントアウト）
// const getMaxWeight = (sets: Workout[]): number => {
//   return Math.max(...sets.map(w => w.weight || 0));
// };

// 1RMを取得（将来的に使用する可能性があるためコメントアウト）
// const getMax1RM = (sets: Workout[]): number => {
//   return Math.max(...sets.map(w => calculate1RM(w.weight || 0, w.reps || 0)));
// };

interface WorkoutListProps {
  workouts: Workout[];
  onEdit: (workout: Workout) => void;
  onDelete: (id: string, confirm?: boolean) => void;
  onAddWorkout?: () => void;
  onSubmitWorkout: (workoutData: WorkoutFormData) => Promise<void>;
  muscleGroups?: MuscleGroup[];
  exercises?: Exercise[];
  selectedDate: Date;
  onOpenSettings?: () => void;
  loading?: boolean;
}

// ドラッグ&ドロップ可能な種目アイテムコンポーネント
interface SortableWorkoutItemProps {
  id: string;
  muscleGroup: string;
  exercise: string;
  sets: Workout[];
  exerciseVolume: number;

  onAddSet: (muscleGroup: string, exercise: string) => void;
  onDeleteGroup: (sets: Workout[]) => void;
  onDelete: (id: string, confirm?: boolean) => void;
  isAddingSet: boolean;
  addingSet: string | null;
  setData: { weight: number | '' | -1; reps: number | ''; notes: string };
  onSetInputChange: (field: 'weight' | 'reps' | 'notes', value: string | number | -1) => void;
  onSaveSet: (muscleGroup: string, exercise: string) => void;
  onCancelSet: () => void;
  onEdit: (workout: Workout) => void;
}

const SortableWorkoutItem: React.FC<SortableWorkoutItemProps & { deleting?: boolean, allExercises: Exercise[] }> = ({
  id,
  muscleGroup,
  exercise,
  sets,
  exerciseVolume,
  onAddSet,
  onDeleteGroup,
  onDelete,
  isAddingSet,
  addingSet,
  setData,
  onSetInputChange,
  onSaveSet,
  onCancelSet,
  deleting = false,
  allExercises,
  onEdit,
}) => {
  const { t } = useLanguage();
  const weightInput = useNumberInput();
  const repsInput = useNumberInput();
  const [showMemoMenu, setShowMemoMenu] = useState(false);
  const [newMemoWord, setNewMemoWord] = useState('');
  const [newMemoCategory, setNewMemoCategory] = useState('手');
  const [memoWords, setMemoWords] = useState<{ [key: string]: string[] }>({
    '手': ['右手', '左手', '両手'],
    '注意点': ['フォーム注意', '肘を曲げすぎない', '背中を丸めない'],
    '重量': ['軽め', '重め'],
    'その他': ['疲労感あり', '調子良い']
  });
  
  // メモワードを追加
  const addMemoWord = (word: string, category: string) => {
    setMemoWords(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), word]
    }));
  };
  
  // メモワードを削除
  const removeMemoWord = (word: string, category: string) => {
    setMemoWords(prev => ({
      ...prev,
      [category]: prev[category].filter(w => w !== word)
    }));
  };
  
  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.memo-menu')) {
        setShowMemoMenu(false);
      }
    };

    if (showMemoMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMemoMenu]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditingField, setIsEditingField] = useState<null | { field: 'weight' | 'reps' | 'hand', setId: string }>(null);
  const [editValue, setEditValue] = useState<string | number>('');

  const handleEditStart = (field: 'weight' | 'reps', setId: string, value: number | -1) => {
    setIsEditingField({ field, setId });
    setEditValue(value);
  };
  const handleEditSave = (w: Workout) => {
    if (!isEditingField) return;
    
    if (isEditingField.field === 'weight') {
      // 重量の編集の場合
      let newValue: number | -1;
      if (editValue === -1 || editValue === '自重') {
        newValue = -1;
      } else if (editValue === '') {
        newValue = 0; // 空文字の場合は0に設定
      } else {
        newValue = Number(editValue);
      }
      
      if (newValue === -1 || (!isNaN(newValue) && newValue >= 0)) {
        if (w.weight !== newValue) {
          onEdit({ ...w, weight: newValue });
        }
      }
    } else if (isEditingField.field === 'reps') {
      // 回数の編集の場合
      const newValue = Number(editValue);
      if (!isNaN(newValue) && newValue >= 0) {
        if (w.reps !== newValue) {
          onEdit({ ...w, reps: newValue });
        }
      }
    }
    
    setIsEditingField(null);
  };
  const handleEditCancel = () => setIsEditingField(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(exercise);
  // すべての種目で編集・削除を可能にするため、isCustomExerciseの条件を削除
  const isCustomExercise = !allExercises.find(ex => ex.name === exercise);
  

  const handleEditName = () => {
    setIsEditingName(true);
    setEditedName(exercise);
  };
  const handleSaveName = () => {
    if (editedName.trim() && editedName !== exercise) {
      // 全セットのexercise_nameを変更
      sets.forEach(w => {
        if (w.id) {
          onEdit({ ...w, exercise_name: editedName });
        }
      });
    }
    setIsEditingName(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <div className="flex items-center justify-between mb-1 bg-gray-50 p-3 rounded-lg border">
        <div className="flex items-center flex-wrap gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing mr-2 text-gray-400 hover:text-gray-600"
          >
            <GripVertical size={16} />
          </div>
          <span className="inline-block bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">{muscleGroup}</span>
          {isEditingName ? (
            <>
              <input
                type="text"
                value={editedName}
                onChange={e => setEditedName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); }}
                className={`border px-2 py-1 rounded text-lg font-bold text-gray-900 mr-2 ${
                  isCustomExercise ? 'border-orange-300 bg-orange-50' : 'border-blue-300 bg-blue-50'
                }`}
                autoFocus
              />
              <button onClick={handleSaveName} className="text-green-600 text-xs font-bold mr-2">保存</button>
              <button onClick={() => setIsEditingName(false)} className="text-gray-500 text-xs">キャンセル</button>
              <span className={`text-xs ml-2 ${
                isCustomExercise ? 'text-orange-600' : 'text-blue-600'
              }`}>
                {isCustomExercise ? 'カスタム種目' : '既存種目'}
              </span>
            </>
          ) : (
            <>
              <span className="text-lg font-bold text-gray-900 whitespace-nowrap">{exercise}</span>
              <div className="relative ml-2">
                <button 
                  onClick={() => setShowMemoMenu(!showMemoMenu)} 
                  className={`px-2 py-1 text-xs font-medium rounded border ${
                    isCustomExercise 
                      ? 'border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100' 
                      : 'border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100'
                  } transition-colors flex items-center gap-1`}
                >
                  <Settings size={12} />
                  編集
                </button>
                
                {showMemoMenu && (
                  <div className="memo-menu absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">メモワード管理</h3>
                      
                      {/* 新しいワード追加 */}
                      <div className="mb-3">
                        <div className="flex gap-1 mb-2">
                          <input
                            type="text"
                            value={newMemoWord}
                            onChange={(e) => setNewMemoWord(e.target.value)}
                            placeholder="新しいワード"
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <select
                            value={newMemoCategory}
                            onChange={(e) => setNewMemoCategory(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="手">手</option>
                            <option value="注意点">注意点</option>
                            <option value="重量">重量</option>
                            <option value="その他">その他</option>
                          </select>
                        </div>
                        <button
                          onClick={() => {
                            if (newMemoWord.trim()) {
                              addMemoWord(newMemoWord.trim(), newMemoCategory);
                              setNewMemoWord('');
                            }
                          }}
                          className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          追加
                        </button>
                      </div>
                      
                      {/* 既存ワード一覧 */}
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {Object.entries(memoWords).map(([category, words]) => (
                          <div key={category}>
                            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{category}</h4>
                            <div className="flex flex-wrap gap-1">
                              {words.map((word, index) => (
                                <div key={index} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                                  <span className="text-xs text-gray-800 dark:text-gray-200">{word}</span>
                                  <button
                                    onClick={() => removeMemoWord(word, category)}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleEditName}
                        className="w-full px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        種目名を編集
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <button
            onClick={() => onAddSet(muscleGroup, exercise)}
            className="px-3 py-1 border border-green-600 rounded-lg font-bold bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-sm"
          >
            追加
          </button>
          <span className="text-sm text-gray-500 font-semibold">
            総VOL <span className="text-blue-700 font-bold">{exerciseVolume.toLocaleString()} kg</span>
          </span>
        </div>
        <button
          onClick={async () => {
            if (deleting) return;
            if (window.confirm(`${muscleGroup} - ${exercise} の全セットを削除しますか？`)) {
              onDeleteGroup(sets);
            }
          }}
          className={`px-2 py-1 rounded border transition-colors ${deleting ? 'opacity-50 cursor-not-allowed' : ''} ${
            isCustomExercise 
              ? 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100' 
              : 'border-red-200 text-red-500 bg-red-50 hover:bg-red-100'
          }`}
          title={`この種目グループを削除${isCustomExercise ? '（カスタム種目）' : '（既存種目）'}`}
          disabled={deleting}
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="pl-6">
        {sets
          .slice() // 新しい配列を作成
          .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : new Date(a.date).getTime();
            const dateB = b.created_at ? new Date(b.created_at).getTime() : new Date(b.date).getTime();
            return dateA - dateB;
          })
          .map((w, index, arr) => {
            const maxWeight = Math.max(...arr.map(set => set.weight || 0));
            const isMax = (w.weight || 0) === maxWeight && maxWeight > 0;
            const setNumber = index + 1;
            return (
              <div key={w.id} className="flex items-start justify-between py-2 border-b border-gray-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="w-8 flex items-center justify-center flex-shrink-0">
                      {isMax ? (
                        <span
                          className={`inline-flex items-center justify-center rounded-full border-2 border-red-500 bg-white text-red-600 font-bold text-base w-9 h-9 px-0.5`}
                          style={{ boxShadow: '0 0 0 2px #fff' }}
                        >
                          #{setNumber}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">#{setNumber}</span>
                      )}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* 重量インライン編集 */}
                      {isEditingField && isEditingField.setId === w.id && isEditingField.field === 'weight' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={editValue === -1 ? '自重' : editValue}
                            autoFocus
                            onChange={e => {
                              const value = e.target.value;
                              if (value === '自重') {
                                setEditValue(-1);
                              } else if (value === '') {
                                setEditValue(''); // 空文字の場合は空文字をセット
                              } else {
                                // 半角数字、小数点、マイナスのみ許可
                                const filteredValue = value.replace(/[^0-9.-]/g, '');
                                // 数値として解析可能な場合は数値に変換、そうでなければ文字列として保持
                                const numValue = parseFloat(filteredValue);
                                if (!isNaN(numValue)) {
                                  setEditValue(numValue);
                                } else {
                                  setEditValue(filteredValue);
                                }
                              }
                            }}
                            onBlur={() => handleEditSave(w)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleEditSave(w);
                              if (e.key === 'Escape') handleEditCancel();
                              weightInput.handleKeyDown(e);
                            }}
                            onFocus={(e) => {
                              // フォーカス時にカーソルを最後に移動
                              const input = e.target;
                              input.setSelectionRange(input.value.length, input.value.length);
                            }}
                            className={`w-24 px-2 py-1 border rounded text-sm text-gray-900 ${
                              editValue === -1 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-blue-400'
                            }`}
                            placeholder={t('form.placeholder.weight')}
                          />
                          <button
                            onClick={() => {
                              setEditValue(-1);
                              handleEditSave(w);
                            }}
                            className={`px-3 py-1 text-xs rounded border transition-colors font-medium flex items-center gap-1 ${
                              editValue === -1 
                                ? 'bg-blue-500 text-white border-blue-500' 
                                : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                            }`}
                            title="自重を設定"
                          >
                            <User size={12} />
                            自重
                          </button>
                        </div>
                      ) : (
                        <span
                          className="text-sm font-medium cursor-pointer hover:underline"
                          onClick={() => handleEditStart('weight', w.id!, w.weight ?? 0)}
                          title="クリックで編集"
                        >
                          {w.weight === -1 ? t('form.bodyweight') : w.weight !== undefined && w.weight !== null ? `${w.weight}kg` : t('stats.unset')}
                        </span>
                      )}
                      <span className="text-sm text-gray-600">×</span>
                      {/* 回数インライン編集 */}
                      {isEditingField && isEditingField.setId === w.id && isEditingField.field === 'reps' ? (
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editValue}
                          autoFocus
                          onChange={e => {
                            const value = e.target.value;
                            // 半角数字のみ許可
                            const filteredValue = value.replace(/[^0-9]/g, '');
                            setEditValue(filteredValue);
                          }}
                          onBlur={() => handleEditSave(w)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleEditSave(w);
                            if (e.key === 'Escape') handleEditCancel();
                            repsInput.handleKeyDown(e);
                          }}
                          onFocus={(e) => {
                            // フォーカス時にカーソルを最後に移動
                            const input = e.target;
                            input.setSelectionRange(input.value.length, input.value.length);
                          }}
                          className="w-12 px-1 py-0.5 border border-blue-400 rounded text-sm text-gray-900"
                        />
                      ) : (
                        <span
                          className="text-sm font-medium cursor-pointer hover:underline"
                          onClick={() => handleEditStart('reps', w.id!, w.reps ?? 0)}
                          title="クリックで編集"
                        >
                          {w.reps ? `${w.reps}${t('form.reps.unit')}` : t('stats.unset')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-purple-700 font-bold flex-shrink-0">
                      {w.weight && w.weight > 0 && w.reps ? `1RM ${Math.round(calculate1RM(w.weight, w.reps))}kg` : w.weight === -1 && w.reps ? '自重' : '1RM -'}
                    </span>
                    {/* 記入時刻表示 */}
                    {w.created_at && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(w.created_at).toLocaleTimeString('ja-JP', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        })}
                      </span>
                    )}
                  </div>
                  {w.notes && (
                    <div className="ml-10">
                      <span className="text-xs text-gray-500 break-words">メモ: {w.notes}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center ml-2 flex-shrink-0">
                  <button
                    onClick={() => w.id && onDelete(w.id, true)}
                    className="text-red-600 hover:underline text-xs"
                  >削除</button>
                </div>
              </div>
            );
          })}
        
        {/* セット追加フォーム */}
        {isAddingSet && (
          <div 
            className="border-2 border-green-200 rounded-lg p-4 bg-green-50 mt-3"
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                ["INPUT", "SELECT"].includes(document.activeElement?.tagName || "")
              ) {
                e.preventDefault();
                onSaveSet(muscleGroup, exercise);
              }
            }}
            tabIndex={-1}
          >
            <div className="flex items-center mb-3">
              <span className="text-base font-bold text-green-800">追加</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">重量 (kg)</label>
                  <div className="flex gap-2">
                    <input
                      ref={weightInput.inputRef}
                      type="text"
                      inputMode="decimal"
                      value={setData.weight === -1 ? '' : setData.weight}
                      onChange={e => {
                        const value = e.target.value;
                        // 半角数字、小数点、マイナスのみ許可
                        const filteredValue = value.replace(/[^0-9.-]/g, '');
                        onSetInputChange('weight', filteredValue);
                      }}
                      onFocus={weightInput.handleFocus}
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base ${
                        setData.weight === -1 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder={t('form.placeholder.weight')}
                    />
                    <button
                      type="button"
                      onClick={() => onSetInputChange('weight', -1)}
                      className={`px-3 py-2 text-sm border rounded-md transition-colors flex items-center gap-1 ${
                        setData.weight === -1 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                      title="自重を設定"
                    >
                      <User size={14} />
                      自重
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">回数</label>
                  <input
                    ref={repsInput.inputRef}
                    type="text"
                    inputMode="numeric"
                    value={setData.reps === '' ? '' : setData.reps}
                    onChange={(e) => {
                      const value = e.target.value;
                      // 半角数字のみ許可
                      const filteredValue = value.replace(/[^0-9]/g, '');
                      const numValue = parseInt(filteredValue);
                      onSetInputChange('reps', isNaN(numValue) ? '' : numValue);
                    }}
                    onFocus={repsInput.handleFocus}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                    placeholder={t('form.placeholder.reps')}
                  />
                </div>
                <div className="flex-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">メモ</label>
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {Object.entries(memoWords).map(([category, words]) => 
                        words.map((word, index) => (
                          <button
                            key={`${category}-${index}`}
                            onClick={() => onSetInputChange('notes', setData.notes + (setData.notes ? ', ' : '') + word)}
                            className={`px-2 py-1 rounded-full text-xs transition-colors ${
                              category === '手' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800' :
                              category === '注意点' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800' :
                              category === '重量' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {word}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  <textarea
                    value={setData.notes}
                    onChange={(e) => onSetInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base resize-none"
                    placeholder="メモを入力（例：右手、フォーム注意など）"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onSaveSet(muscleGroup, exercise)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-base font-medium"
                >
                  追加
                </button>
                <button
                  onClick={onCancelSet}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 text-base font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WorkoutList: React.FC<WorkoutListProps> = ({ 
  workouts, 
  onEdit, 
  onDelete, 
  onAddWorkout, 
  onSubmitWorkout,
  muscleGroups: propMuscleGroups,
  exercises: propExercises,
  selectedDate,
  onOpenSettings,
  loading = false
}) => {
  const { t } = useLanguage();
  const newWeightInput = useNumberInput();
  const newRepsInput = useNumberInput();
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(propMuscleGroups || []);
  const [exercises, setExercises] = useState<Exercise[]>(propExercises || []);
  const [addingNew, setAddingNew] = useState(false);
  const [editData, setEditData] = useState<WorkoutFormData>({
    id: '',
    date: selectedDate.toISOString().split('T')[0],
    muscle_group: '',
    exercise_name: '',
    weight: '',
    reps: '',
    hand: 'both',
    notes: ''
  });
  const [addingSet, setAddingSet] = useState<string | null>(null); // セット追加中の種目キー
  const [setData, setSetData] = useState<{ weight: number | '' | -1; reps: number | ''; notes: string }>({
    weight: '',
    reps: '',
    notes: ''
  });

  const [sortedWorkoutKeys, setSortedWorkoutKeys] = useState<string[]>([]);
  // 削除中のキーを管理
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  // カスタム種目入力用の状態
  const [customExerciseName, setCustomExerciseName] = useState<string>('');
  // 種目全体の並び順（時刻の昇順・降順）
  const [exerciseSortOrder, setExerciseSortOrder] = useState<'asc' | 'desc'>('asc');

  // ドラッグ&ドロップのセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 筋肉グループとエクササイズの取得（propsから更新）
  useEffect(() => {
    if (propMuscleGroups) {
      setMuscleGroups(propMuscleGroups);
    }
    if (propExercises) {
      setExercises(propExercises);
    }
  }, [propMuscleGroups, propExercises]);

  // 選択された筋肉グループに基づいてエクササイズをフィルタリング
  const filteredExercises = exercises.filter(ex => 
    !editData.muscle_group || ex.muscle_group === editData.muscle_group
  );

  // muscleOverrideを追加
  const handleAddNew = () => {
    // 前回記録した部位を取得（最新の記録から）
    const lastWorkout = workouts[workouts.length - 1];
    const lastMuscleGroup = lastWorkout?.muscle_group || '';
    
    setEditData({
      id: '',
      date: getJSTDateString(selectedDate), // selectedDateの日付を正しく設定
      muscle_group: lastMuscleGroup,
      exercise_name: '',
      weight: '',
      reps: '',
      hand: 'both',
      notes: ''
    });
    setCustomExerciseName(''); // カスタム種目名をリセット
    setAddingNew(true);
  };

  const handleSave = async () => {
    if (!editData.muscle_group || !editData.exercise_name) {
      alert(t('validation.muscle.group.required') + '\n' + t('validation.exercise.required'));
      return;
    }
    if (editData.exercise_name === '__custom__' && !customExerciseName.trim()) {
      alert(t('validation.custom.exercise.required'));
      return;
    }
    
    try {
      const workoutData: WorkoutFormData = {
        ...editData,
        exercise_name: editData.exercise_name === '__custom__' ? customExerciseName : editData.exercise_name,
        weight: editData.weight === '' ? '' : editData.weight === -1 ? -1 : Number(editData.weight),
        reps: editData.reps === '' ? '' : Number(editData.reps),
        hand: editData.hand || 'both',
        is_public: editData.is_public || false
      };
      
      await onSubmitWorkout(workoutData);
      setAddingNew(false);
      setEditData({
        id: '',
        date: getJSTDateString(selectedDate),
        muscle_group: '',
        exercise_name: '',
        weight: '',
        reps: '',
        hand: 'both',
        notes: ''
      });
      setCustomExerciseName('');
    } catch (error: any) {
      alert(t('workout.save.failed') + ': ' + (error?.message || JSON.stringify(error)));
    }
  };

  const handleCancel = () => {
    setAddingNew(false);
          setEditData({
        id: '',
        date: getJSTDateString(selectedDate),
        muscle_group: '',
        exercise_name: '',
        weight: '',
        reps: '',
        hand: 'both',
        notes: ''
      });
    setCustomExerciseName(''); // カスタム種目名をリセット
  };

  const handleInputChange = (field: keyof WorkoutFormData, value: string | number | boolean | -1) => {
    setEditData(prev => {
      const newData = { ...prev };
      
      switch (field) {
        case 'weight':
          if (value === '自重') {
            newData.weight = -1;
          } else if (value === '') {
            newData.weight = ''; // 空文字の場合は空文字を設定
          } else if (typeof value === 'number') {
            newData.weight = value;
          } else {
            // 文字列の場合は数値に変換して設定
            const numValue = parseFloat(String(value));
            newData.weight = isNaN(numValue) ? '' : numValue;
          }
          break;
        case 'reps':
          if (value === '') {
            newData.reps = '';
          } else {
            const numValue = parseFloat(String(value));
            newData.reps = isNaN(numValue) ? '' : numValue;
          }
          break;
        case 'notes':
          newData.notes = String(value);
          break;
        default:
          (newData as any)[field] = value;
      }
      
      return newData;
    });
  };

  // セット追加機能
  const handleAddSet = (muscleGroup: string, exercise: string) => {
    const key = `${muscleGroup}__${exercise}`;
    setAddingSet(key);
    
    // 同じ種目の最新セットの重量・回数を初期値として設定
    const sameExerciseSets = workouts.filter(w => 
      w.muscle_group === muscleGroup && w.exercise_name === exercise
    );
    
    // created_atでソートして最新のセットを取得（created_atがない場合はdateでソート）
    const lastSet = sameExerciseSets.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : new Date(a.date).getTime();
      const dateB = b.created_at ? new Date(b.created_at).getTime() : new Date(b.date).getTime();
      return dateB - dateA; // 降順でソート
    })[0];
    
    setSetData({
      weight: lastSet?.weight ?? '',
      reps: lastSet?.reps ?? '',
      notes: ''
    });
  };

  const handleSaveSet = async (muscleGroup: string, exercise: string) => {
    try {
      const workoutData: WorkoutFormData = {
        id: '',
        date: getJSTDateString(selectedDate),
        muscle_group: muscleGroup,
        exercise_name: exercise,
                weight: setData.weight === '' ? '' : setData.weight === -1 ? -1 : Number(setData.weight),
        reps: setData.reps === '' ? '' : Number(setData.reps),
        hand: 'both',
        notes: setData.notes,
        is_public: false
      };
      
      await onSubmitWorkout(workoutData);
      setAddingSet(null);
      setSetData({ weight: '', reps: '', notes: '' });
    } catch (error) {
      alert(t('workout.save.failed'));
    }
  };

  const handleCancelSet = () => {
    setAddingSet(null);
    setSetData({ weight: '', reps: '', notes: '' });
  };

  const handleSetInputChange = (field: keyof typeof setData, value: string | number | -1) => {
    setSetData(prev => {
      const newData = { ...prev };
      
      switch (field) {
        case 'weight':
          if (value === '自重') {
            newData.weight = -1;
          } else if (value === '') {
            newData.weight = ''; // 空文字の場合は空文字を設定
          } else if (typeof value === 'number') {
            newData.weight = value;
          } else {
            // 文字列の場合は数値に変換して設定
            const numValue = parseFloat(String(value));
            newData.weight = isNaN(numValue) ? '' : numValue;
          }
          break;
        case 'reps':
          if (value === '') {
            newData.reps = '';
          } else {
            const numValue = parseFloat(String(value));
            newData.reps = isNaN(numValue) ? '' : numValue;
          }
          break;
        case 'notes':
          newData.notes = String(value);
          break;
      }
      
      return newData;
    });
  };

  // 筋肉グループ選択時の処理
  const handleMuscleGroupChange = (muscleGroup: string) => {
    handleInputChange('muscle_group', muscleGroup);
  };

  // 種目詳細表示


  // ドラッグ&ドロップ終了時の処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSortedWorkoutKeys((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 種目グループの一括削除
  const handleDeleteGroup = async (sets: Workout[], key: string) => {
    setDeletingKey(key);
    await Promise.all(sets.map(w => w.id && onDelete(w.id, false)));
    setDeletingKey(null);
  };

  // 種目ごとにグループ化
  const grouped = workouts.reduce<{ [key: string]: Workout[] }>((acc, w) => {
    const key = `${w.muscle_group}__${w.exercise_name}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(w);
    return acc;
  }, {});

  // ソートされたキーの初期化（メモ化して最適化）
  useEffect(() => {
    const keys = Object.keys(grouped);
    if (keys.length > 0) {
      // 種目の時刻でソート（メモ化）
      const sortedKeys = keys.sort((a, b) => {
        const setsA = grouped[a];
        const setsB = grouped[b];
        
        // 各種目の最も早い時刻を取得（種目全体の最初の記録時刻）
        const getEarliestTime = (sets: Workout[]) => {
          return Math.min(...sets.map(set => 
            set.created_at ? new Date(set.created_at).getTime() : new Date(set.date).getTime()
          ));
        };
        
        const timeA = getEarliestTime(setsA);
        const timeB = getEarliestTime(setsB);
        
        return exerciseSortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
      setSortedWorkoutKeys(sortedKeys);
    } else {
      setSortedWorkoutKeys([]);
    }
  }, [grouped, exerciseSortOrder]);





  // ローディング中の表示
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">{t('workout.record')}</h2>
            <span className="text-lg text-gray-600">
              {getJSTDateString(selectedDate)}
            </span>
          </div>
          <div className="flex gap-3">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                disabled
              >
                {t('settings.exercise.management')}
              </button>
            )}
            <button
              onClick={handleAddNew}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              disabled
            >
              {t('workout.add')}
            </button>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 text-lg mt-4">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (workouts.length === 0 && !addingNew) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">トレーニング記録</h2>
            <span className="text-lg text-gray-600">
              {getJSTDateString(selectedDate)}
            </span>
          </div>
          <div className="flex gap-3">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                種目設定
              </button>
            )}
            <button
              onClick={handleAddNew}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              記録を追加
            </button>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">この日のトレーニング記録はありません</p>
          <p className="text-gray-400 text-sm mt-2">「記録を追加」ボタンから新しい記録を作成できます</p>
        </div>
      </div>
    );
  }

  // ソートされたキーに基づいてグループ化されたデータを取得
  const sortedGrouped = sortedWorkoutKeys.reduce<{ [key: string]: Workout[] }>((acc, key) => {
    if (grouped[key]) {
      acc[key] = grouped[key];
    }
    return acc;
  }, {});

  // 全体ボリューム（自重と0kgは計算から除外）
  const totalVolume = workouts.reduce((sum, w) => {
    if (w.weight === -1 || w.weight === 0 || w.weight === undefined || w.weight === null || !w.reps) return sum;
    return sum + w.weight * w.reps;
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t('workout.record')}</h2>
          <span className="text-base sm:text-lg text-gray-600">
            {getJSTDateString(selectedDate)}
          </span>
          <button
            onClick={() => setExerciseSortOrder(exerciseSortOrder === 'asc' ? 'desc' : 'asc')}
            className="self-start sm:self-auto px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded border border-gray-300 text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
            title={t('sort.time.tooltip')}
          >
            ［{t('sort.time')}］{exerciseSortOrder === 'asc' ? '↑' : '↓'}
          </button>
          {/* X投稿ボタン */}
          {workouts.length > 0 && (
            <XPostButton
              workoutData={{
                date: selectedDate.toISOString(),
                exercises: sortedWorkoutKeys.map(key => {
                  const sets = grouped[key];
                  const [, exerciseName] = key.split('__');
                  return {
                    name: exerciseName,
                    sets: sets.map(w => ({
                      weight: w.weight || '',
                      reps: w.reps || '',
                      memo: w.notes
                    }))
                  };
                })
              }}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex-1 sm:flex-none bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-xs sm:text-sm"
            >
              {t('settings.exercise.management')}
            </button>
          )}
          <button
            onClick={handleAddNew}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm"
          >
            {t('workout.add')}
          </button>
        </div>
      </div>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <span className="text-lg font-semibold text-gray-700">{t('stats.total.volume')}</span>
        <span className="ml-4 text-2xl font-bold text-blue-700">{totalVolume.toLocaleString()} kg</span>
      </div>

      <div className="space-y-8">
        {/* 新規追加フォーム */}
        {addingNew && (
          <div
            className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 mt-3"
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                ["INPUT", "SELECT"].includes(document.activeElement?.tagName || "")
              ) {
                e.preventDefault();
                handleSave();
              }
            }}
            tabIndex={-1}
          >
            <div className="flex items-center mb-3">
              <span className="text-base font-bold text-blue-800">{t('workout.add')}</span>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex-1">
                  <label className="block text-base font-medium text-gray-700 mb-2">{t('form.muscle.group')}</label>
                  <select
                    value={editData.muscle_group}
                    onChange={(e) => handleMuscleGroupChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  >
                    <option value="">{t('form.select.please')}</option>
                    {(() => {
                      const fixedOrder = ['胸', '背中', '肩', '腕', '脚', '腹筋', 'その他'];
                      const sortedGroups = muscleGroups
                        ? [
                            ...fixedOrder
                              .map(name => muscleGroups.find(g => g.name === name))
                              .filter(Boolean),
                            ...muscleGroups.filter(g => !fixedOrder.includes(g.name))
                          ]
                        : [];
                      return sortedGroups.map(group => (
                        <option key={group!.id} value={group!.name}>{group!.name}</option>
                      ));
                    })()}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-base font-medium text-gray-700 mb-2">{t('form.exercise')}</label>
                  <div className="space-y-2">
                    <select
                      value={editData.exercise_name === '__custom__' ? '__custom__' : editData.exercise_name}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '__custom__') {
                          // カスタム種目を選択した場合
                          handleInputChange('exercise_name', '__custom__');
                          setCustomExerciseName(''); // カスタム種目名をリセット
                        } else {
                          // 通常の種目を選択した場合
                          handleInputChange('exercise_name', value);
                          setCustomExerciseName(''); // カスタム種目名をリセット
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    >
                      <option value="">{t('form.select.please')}</option>
                      {filteredExercises?.map(ex => (
                        <option key={ex.id} value={ex.name} className="whitespace-nowrap">
                          {ex.name}
                        </option>
                      ))}
                      <option value="__custom__">{t('form.custom.exercise')}</option>
                    </select>
                    
                    {/* カスタム種目入力フィールド */}
                    {editData.exercise_name === '__custom__' && (
                      <input
                        type="text"
                        placeholder={t('form.placeholder.custom.exercise')}
                        value={customExerciseName}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCustomExerciseName(value);
                          // カスタム種目名が入力されている場合は、それをexercise_nameとして設定
                          if (value.trim()) {
                            handleInputChange('exercise_name', value);
                          } else {
                            // 空の場合は__custom__に戻す
                            handleInputChange('exercise_name', '__custom__');
                          }
                        }}
                        className="w-full px-4 py-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50 text-base"
                        autoFocus
                      />
                    )}
                    
                    {/* カスタム種目情報表示 */}
                    {editData.exercise_name && editData.exercise_name !== '__custom__' && !filteredExercises.find(ex => ex.name === editData.exercise_name) && (
                      <div className="mt-2 p-2 bg-orange-50 rounded-md text-xs">
                        <div className="flex items-center font-semibold text-orange-800">
                          <span className="whitespace-nowrap">カスタム種目: {editData.exercise_name}</span>
                        </div>
                        <div className="text-orange-600">自由入力された種目です</div>
                      </div>
                    )}
                    
                    {/* 種目情報表示 */}
                    {editData.exercise_name && editData.exercise_name !== '__custom__' && (() => {
                      const selectedExercise = filteredExercises.find(ex => ex.name === editData.exercise_name);
                      return selectedExercise ? (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center font-semibold text-blue-800">
                              <span className="whitespace-nowrap">種目: {selectedExercise.name}</span>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex-1">
                  <label className="block text-base font-medium text-gray-700 mb-2">重量 (kg)</label>
                  <div className="flex gap-2">
                    <input
                      ref={newWeightInput.inputRef}
                      type="text"
                      inputMode="decimal"
                      value={editData.weight === -1 ? '' : editData.weight}
                      onChange={e => {
                        const value = e.target.value;
                        // 半角数字、小数点、マイナスのみ許可
                        const filteredValue = value.replace(/[^0-9.-]/g, '');
                        handleInputChange('weight', filteredValue);
                      }}
                      onFocus={newWeightInput.handleFocus}
                      className={`flex-1 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base ${
                        editData.weight === -1 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder={t('form.placeholder.weight')}
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange('weight', -1)}
                      className={`px-4 py-3 text-sm border rounded-md transition-colors flex items-center gap-1 ${
                        editData.weight === -1 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                      title="自重を設定"
                    >
                      <User size={16} />
                      自重
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-base font-medium text-gray-700 mb-2">回数</label>
                  <input
                    ref={newRepsInput.inputRef}
                    type="text"
                    inputMode="numeric"
                    value={editData.reps === '' ? '' : editData.reps}
                    onChange={(e) => {
                      const value = e.target.value;
                      // 半角数字のみ許可
                      const filteredValue = value.replace(/[^0-9]/g, '');
                      const numValue = parseInt(filteredValue);
                      handleInputChange('reps', isNaN(numValue) ? '' : numValue);
                    }}
                    onFocus={newRepsInput.handleFocus}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder={t('form.placeholder.reps')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">メモ</label>
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {Object.entries({
                      '手': ['右手', '左手', '両手'],
                      '注意点': ['フォーム注意', '肘を曲げすぎない', '背中を丸めない'],
                      '重量': ['軽め', '重め'],
                      'その他': ['疲労感あり', '調子良い']
                    }).map(([category, words]) => 
                      words.map((word, index) => (
                        <button
                          key={`${category}-${index}`}
                          onClick={() => handleInputChange('notes', editData.notes + (editData.notes ? ', ' : '') + word)}
                          className={`px-2 py-1 rounded-full text-xs transition-colors ${
                            category === '手' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800' :
                            category === '注意点' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800' :
                            category === '重量' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>
                </div>
                <textarea
                  value={editData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
                  placeholder="メモを入力（例：右手、フォーム注意など）"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={editData.is_public || false}
                  onChange={(e) => handleInputChange('is_public', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="is_public" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  友達に記録を公開する
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-medium"
                >
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 text-base font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 既存の記録 */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedWorkoutKeys}
            strategy={verticalListSortingStrategy}
          >
            {Object.entries(sortedGrouped).map(([key, sets]) => {
              const [muscleGroup, exercise] = key.split('__');
              const exerciseVolume = sets.reduce((sum, w) => sum + (w.weight || 0) * (w.reps || 0), 0);
              const isAddingSet = addingSet === key;
              
              return (
                <SortableWorkoutItem
                  key={key}
                  id={key}
                  muscleGroup={muscleGroup}
                  exercise={exercise}
                  sets={sets}
                  exerciseVolume={exerciseVolume}
                  onAddSet={handleAddSet}
                  onDeleteGroup={(s) => handleDeleteGroup(s, key)}
                  onDelete={onDelete}
                  isAddingSet={isAddingSet}
                  addingSet={addingSet}
                  setData={setData}
                  onSetInputChange={handleSetInputChange}
                  onSaveSet={handleSaveSet}
                  onCancelSet={handleCancelSet}
                  deleting={deletingKey === key}
                  allExercises={exercises}
                  onEdit={onEdit}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </div>

    </div>
  );
};

export default WorkoutList; 