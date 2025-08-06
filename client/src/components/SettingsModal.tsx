import React, { useState, useEffect, useCallback } from 'react';
import { Exercise } from '../types';
import { exerciseAPI } from '../services/api';
import { Settings, X, Plus, Trash2, GripVertical } from 'lucide-react';
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

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ドラッグ&ドロップ可能な種目アイテムコンポーネント
interface SortableExerciseItemProps {
  exercise: Exercise;
  isEditing: boolean;
  editingExercise: Exercise | null;
  onEdit: (exercise: Exercise) => void;
  onSaveEdit: (exercise: Exercise) => void;
  onCancelEdit: () => void;
  onDelete: (exerciseId: string) => void;
}

const SortableExerciseItem: React.FC<SortableExerciseItemProps> = ({
  exercise,
  isEditing,
  editingExercise,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 現在のユーザーIDを取得
  // const auth = getAuth();
  // const currentUserId = auth.currentUser?.uid;
  // const isMine = exercise.userId === currentUserId;

  return (
    <div ref={setNodeRef} style={style} className="p-4 hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
      {isEditing ? (
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={editingExercise?.name || ''}
            onChange={(e) => onEdit({
              ...editingExercise!,
              name: e.target.value
            })}
            className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(exercise)}
          />
          <button
            onClick={() => onSaveEdit(exercise)}
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            保存
          </button>
          <button
            onClick={onCancelEdit}
            className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            キャンセル
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical size={16} />
            </div>
            <span className="font-medium text-gray-800">
              {exercise.name}
            </span>
            <span className="ml-2 text-xs text-blue-600" title="itemid">
              {exercise.itemid ? exercise.itemid : 'itemidなし'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!exercise.id) {
                  alert('削除できるIDがありません');
                  return;
                }
                onDelete(exercise.id);
              }}
              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
              title="削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [selectedPart, setSelectedPart] = useState('胸');
  const [sortedExerciseIds, setSortedExerciseIds] = useState<string[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<string[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);

  // ドラッグ&ドロップのセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const parts = [
    { id: '胸', name: '胸' },
    { id: '背中', name: '背中' },
    { id: '肩', name: '肩' },
    { id: '腕', name: '腕' },
    { id: '脚', name: '脚' },
    { id: '腹筋', name: '腹筋' },
    { id: 'その他', name: 'その他' },
  ];

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      const response = await exerciseAPI.getAll();
      // itemidがない場合は空文字で補完
      const exercisesWithItemId = response.data.map((e: any) => ({ ...e, itemid: e.itemid || '' }));
      setExercises(exercisesWithItemId);
      console.log('種目データ読み込み完了:', {
        totalExercises: exercisesWithItemId.length,
        currentPart: selectedPart,
        currentPartExercises: exercisesWithItemId.filter((e: any) => e.muscle_group === selectedPart).length
      });
      // 部位ごとにソートされたIDリストを再初期化
      const currentPartExercises = exercisesWithItemId.filter((e: any) => e.muscle_group === selectedPart);
      const sortedByOrder = currentPartExercises.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      setSortedExerciseIds(sortedByOrder.map((e: any) => e.id));
      setOriginalOrder(sortedByOrder.map((e: any) => e.id));
      setOrderChanged(false);
    } catch (error) {
      console.error('種目データ読み込みエラー:', error);
      // Error handling without console.log
    } finally {
      setLoading(false);
    }
  }, [selectedPart]);

  useEffect(() => {
    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen, fetchExercises]);

  // 部位切り替え時もIDリストを再初期化
  useEffect(() => {
    if (exercises.length > 0) {
      const currentPartExercises = exercises.filter(e => e.muscle_group === selectedPart);
      const sortedByOrder = currentPartExercises.sort((a, b) => (a.order || 0) - (b.order || 0));
      setSortedExerciseIds(sortedByOrder.map(e => e.id));
      setOriginalOrder(sortedByOrder.map(e => e.id));
      setOrderChanged(false);
    } else {
      setSortedExerciseIds([]);
      setOriginalOrder([]);
      setOrderChanged(false);
    }
  }, [selectedPart, exercises]);

  const handleAddExercise = async () => {
    if (!newExerciseName.trim()) {
      alert('種目名を入力してください');
      return;
    }
    try {
      const newExercise = {
        muscle_group: selectedPart,
        name: newExerciseName.trim(),
        // itemidはAPI側で自動付与
      };
      await exerciseAPI.create(newExercise);
      setNewExerciseName('');
      await fetchExercises();
    } catch (error) {
      alert('種目の追加に失敗しました');
    }
  };

  const handleEditExercise = async (exercise: Exercise) => {
    if (!editingExercise) return;
    try {
      await exerciseAPI.update(exercise.id, editingExercise);
      setEditingExercise(null);
      await fetchExercises();
    } catch (error) {
      alert('種目の更新に失敗しました');
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!window.confirm('この種目を削除しますか？')) {
      return;
    }
    try {
      await exerciseAPI.delete(exerciseId);
      await fetchExercises();
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  // ドラッグ&ドロップ終了時の処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSortedExerciseIds((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);

        return arrayMove(items, oldIndex, newIndex);
      });
      setOrderChanged(true);
      console.log('並び順が変更されました');
    } else {
      setOrderChanged(false);
    }
  };

  // 選択中部位の種目のみ抽出（ソート順を適用）
  const currentPartExercises = exercises.filter(e => e.muscle_group === selectedPart);
  const sortedExercises = sortedExerciseIds
    .map(id => currentPartExercises.find(e => e.id === id))
    .filter(Boolean) as Exercise[];

  // 種目の順番を保存する関数
  const handleSaveOrder = async () => {
    try {
      setSavingOrder(true);
      setOrderSaved(false);
      // 現在の部位の種目のみを対象に順番を保存
      await exerciseAPI.updateOrder(sortedExercises);
      setOrderSaved(true);
      // 3秒後に成功メッセージを消す
      setTimeout(() => setOrderSaved(false), 3000);
      setOriginalOrder(sortedExercises.map(e => e.id));
      setOrderChanged(false);
    } catch (error) {
      alert('順番の保存に失敗しました');
    } finally {
      setSavingOrder(false);
    }
  };

  // モーダルを閉じる際に順番を保存
  const handleClose = async () => {
    if (sortedExercises.length > 0) {
      await handleSaveOrder();
    }
    onClose();
  };

  // キャンセルで閉じる（保存しない）
  const handleCancel = () => {
    // 並び順を元に戻す
    setSortedExerciseIds(originalOrder);
    setOrderChanged(false);
    onClose();
  };

  // itemidなしの種目を修正
  const handleFixAllItemIds = async () => {
    if (!window.confirm('itemidが設定されていない種目を一括修正します。よろしいですか？')) return;
    try {
      const result = await exerciseAPI.fixAllItemIds();
      await fetchExercises();
      alert(result.data);
    } catch (error) {
      alert('itemid修正に失敗しました');
    }
  };

  // プッシュアップ専用のitemid修正
  const handleFixPushupItemId = async () => {
    if (!window.confirm('プッシュアップのitemidを修正します。よろしいですか？')) return;
    try {
      const pushupExercise = exercises.find(e => e.name === 'プッシュアップ');
      if (pushupExercise && !pushupExercise.itemid) {
        // 既存のitemidを取得して、未使用の番号を探す
        const existingItemIds = exercises
          .map(e => e.itemid)
          .filter((itemid): itemid is string => !!itemid && /^\d{4}$/.test(itemid))
          .map(itemid => parseInt(itemid));
        
        let newItemId = 1;
        while (existingItemIds.includes(newItemId)) {
          newItemId++;
        }
        
        await exerciseAPI.update(pushupExercise.id, {
          ...pushupExercise,
          itemid: String(newItemId).padStart(4, '0')
        });
        await fetchExercises();
        alert(`プッシュアップのitemidを${String(newItemId).padStart(4, '0')}に設定しました`);
      } else {
        alert('プッシュアップが見つからないか、既にitemidが設定されています');
      }
    } catch (error) {
      alert('プッシュアップのitemid修正に失敗しました');
    }
  };

  if (!isOpen) return null;

  const selectedPartName = parts.find(g => g.id === selectedPart)?.name || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Settings className="w-6 h-6 text-gray-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">種目設定</h2>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 2カラムレイアウト */}
          <div className="flex gap-6">
            {/* 左：部位リスト */}
            <div className="w-40 flex-shrink-0">
              <div className="bg-gray-50 rounded-lg p-2 flex flex-col gap-2">
                {parts.map(part => (
                  <button
                    key={part.id}
                    onClick={() => setSelectedPart(part.id)}
                    className={`w-full px-3 py-2 rounded text-left font-semibold transition-colors
                      ${selectedPart === part.id ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-800 hover:bg-blue-100'}`}
                  >
                    {part.name}
                  </button>
                ))}
                <button
                  onClick={handleFixAllItemIds}
                  className="mt-2 w-full px-3 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm"
                >
                  itemidリセット
                </button>
                <button
                  onClick={handleFixPushupItemId}
                  className="mt-2 w-full px-3 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  プッシュアップ修正
                </button>
              </div>
            </div>

            {/* 右：種目一覧＋追加フォーム */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{selectedPartName}の種目管理</h3>

              {/* 新規種目追加 */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-700 mb-3">新規種目を追加</h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="種目名"
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddExercise()}
                  />
                  <button
                    onClick={handleAddExercise}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    追加
                  </button>
                </div>
              </div>

              {/* 種目一覧 */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-700">{selectedPartName}の種目一覧</h4>
                </div>
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">読み込み中...</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {sortedExercises.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        種目が登録されていません
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={sortedExerciseIds}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="divide-y divide-gray-200">
                            {sortedExercises.map((exercise) => (
                              <SortableExerciseItem
                                key={exercise.id}
                                exercise={exercise}
                                isEditing={editingExercise?.id === exercise.id}
                                editingExercise={editingExercise}
                                onEdit={setEditingExercise}
                                onSaveEdit={handleEditExercise}
                                onCancelEdit={() => setEditingExercise(null)}
                                onDelete={handleDeleteExercise}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                )}
              </div>

              {/* 並び順保存ボタン */}
              {(() => {
                console.log('保存ボタン表示条件チェック:', {
                  sortedExercisesLength: sortedExercises.length,
                  orderChanged,
                  orderSaved,
                  shouldShow: sortedExercises.length > 0
                });
                return sortedExercises.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-blue-800">
                        {orderSaved ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p className="font-medium text-green-700">並び順を保存しました！</p>
                          </div>
                        ) : orderChanged ? (
                          <>
                            <p className="font-medium">種目の並び順を変更しました</p>
                            <p className="text-xs mt-1">ドラッグ&ドロップで並び順を変更した後、保存ボタンを押してください</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">種目の並び順を管理</p>
                            <p className="text-xs mt-1">ドラッグ&ドロップで並び順を変更できます</p>
                          </>
                        )}
                      </div>
                      <button
                        onClick={handleSaveOrder}
                        disabled={savingOrder}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                          savingOrder 
                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {savingOrder ? '保存中...' : '並び順を保存'}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              保存して閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 