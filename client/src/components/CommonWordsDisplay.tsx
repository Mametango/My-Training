import React, { useState } from 'react';
import { useCommonWords } from '../hooks/useCommonWords';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { CommonWordsManager } from './CommonWordsManager';

interface CommonWordsDisplayProps {
  onWordSelect: (word: string) => void;
  currentNotes: string;
}

export const CommonWordsDisplay: React.FC<CommonWordsDisplayProps> = ({
  onWordSelect,
  currentNotes
}) => {
  const { getWordsByCategory, getCategories } = useCommonWords();
  
  const [showManager, setShowManager] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const categories = getCategories();
  const wordsByCategory = getWordsByCategory();

  const handleWordClick = (word: string) => {
    // 現在のメモにワードを追加
    const separator = currentNotes.trim() ? ', ' : '';
    onWordSelect(currentNotes + separator + word);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const isExpanded = (category: string) => expandedCategories.includes(category);

  return (
    <>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            よく使うワード
          </h4>
          <button
            onClick={() => setShowManager(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="よく使うワードを管理"
          >
            <Settings size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              >
                <span>{category}</span>
                {isExpanded(category) ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              
              {isExpanded(category) && (
                <div className="px-3 pb-3">
                  <div className="flex flex-wrap gap-1">
                    {wordsByCategory[category]?.map(word => (
                      <button
                        key={word.id}
                        onClick={() => handleWordClick(word.text)}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        {word.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showManager && (
        <CommonWordsManager
          onWordSelect={handleWordClick}
          onClose={() => setShowManager(false)}
        />
      )}
    </>
  );
}; 