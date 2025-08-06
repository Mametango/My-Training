import React, { useState } from 'react';
import { useCommonWords, CommonWord } from '../hooks/useCommonWords';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface CommonWordsManagerProps {
  onWordSelect: (word: string) => void;
  onClose: () => void;
}

export const CommonWordsManager: React.FC<CommonWordsManagerProps> = ({
  onWordSelect,
  onClose
}) => {
  const { 
    addWord, 
    removeWord, 
    updateWord, 
    getWordsByCategory, 
    getCategories,
    setDefaultWords 
  } = useCommonWords();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newWord, setNewWord] = useState('');
  const [newCategory, setNewCategory] = useState('その他');
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const categories = getCategories();
  const wordsByCategory = getWordsByCategory();

  const handleAddWord = () => {
    if (newWord.trim()) {
      addWord(newWord, newCategory);
      setNewWord('');
      setNewCategory('その他');
      setIsAdding(false);
    }
  };

  const handleEditWord = (word: CommonWord) => {
    setEditingId(word.id);
    setEditText(word.text);
    setEditCategory(word.category);
  };

  const handleSaveEdit = () => {
    if (editingId && editText.trim()) {
      updateWord(editingId, editText, editCategory);
      setEditingId(null);
      setEditText('');
      setEditCategory('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditCategory('');
  };

  const handleWordClick = (word: string) => {
    onWordSelect(word);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            よく使うワード管理
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* ワード追加フォーム */}
        {isAdding ? (
          <div className="mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="新しいワードを入力"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddWord();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
                autoFocus
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="その他">その他</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddWord}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                追加
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Plus size={16} />
              新しいワードを追加
            </button>
          </div>
        )}

        {/* カテゴリ別ワード表示 */}
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {wordsByCategory[category]?.map(word => (
                  <div key={word.id} className="flex items-center gap-1">
                    {editingId === word.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-700"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleWordClick(word.text)}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          {word.text}
                        </button>
                        <button
                          onClick={() => handleEditWord(word)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => removeWord(word.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* デフォルトに戻すボタン */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={() => {
              if (window.confirm('よく使うワードをデフォルトに戻しますか？現在の設定は失われます。')) {
                setDefaultWords();
              }
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            デフォルトに戻す
          </button>
        </div>
      </div>
    </div>
  );
}; 