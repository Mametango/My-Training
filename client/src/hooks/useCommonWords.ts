import { useState, useEffect } from 'react';

export interface CommonWord {
  id: string;
  text: string;
  category: string;
}

const STORAGE_KEY = 'my-training-common-words';

export const useCommonWords = () => {
  const [commonWords, setCommonWords] = useState<CommonWord[]>([]);

  // 初期データを読み込み
  useEffect(() => {
    const savedWords = localStorage.getItem(STORAGE_KEY);
    if (savedWords) {
      try {
        setCommonWords(JSON.parse(savedWords));
      } catch (error) {
        console.error('Failed to parse saved common words:', error);
        // デフォルトのよく使うワードを設定
        setDefaultWords();
      }
    } else {
      // デフォルトのよく使うワードを設定
      setDefaultWords();
    }
  }, []);

  const setDefaultWords = () => {
    const defaultWords: CommonWord[] = [
      { id: '1', text: '右手', category: '手' },
      { id: '2', text: '左手', category: '手' },
      { id: '3', text: '両手', category: '手' },
      { id: '4', text: 'フォーム注意', category: '注意点' },
      { id: '5', text: '肘を曲げすぎない', category: '注意点' },
      { id: '6', text: '背中を丸めない', category: '注意点' },
      { id: '7', text: '呼吸を意識', category: '注意点' },
      { id: '8', text: '軽めの重量', category: '重量' },
      { id: '9', text: '重めの重量', category: '重量' },
      { id: '10', text: '疲労感あり', category: '体調' },
      { id: '11', text: '調子良い', category: '体調' },
      { id: '12', text: '痛みなし', category: '体調' }
    ];
    setCommonWords(defaultWords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWords));
  };

  // ワードを追加
  const addWord = (text: string, category: string = 'その他') => {
    const newWord: CommonWord = {
      id: Date.now().toString(),
      text: text.trim(),
      category
    };
    
    const updatedWords = [...commonWords, newWord];
    setCommonWords(updatedWords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWords));
  };

  // ワードを削除
  const removeWord = (id: string) => {
    const updatedWords = commonWords.filter(word => word.id !== id);
    setCommonWords(updatedWords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWords));
  };

  // ワードを更新
  const updateWord = (id: string, text: string, category: string) => {
    const updatedWords = commonWords.map(word => 
      word.id === id ? { ...word, text: text.trim(), category } : word
    );
    setCommonWords(updatedWords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWords));
  };

  // カテゴリ別にワードを取得
  const getWordsByCategory = () => {
    const grouped = commonWords.reduce<{ [key: string]: CommonWord[] }>((acc, word) => {
      if (!acc[word.category]) {
        acc[word.category] = [];
      }
      acc[word.category].push(word);
      return acc;
    }, {});
    
    return grouped;
  };

  // カテゴリ一覧を取得
  const getCategories = () => {
    const categories = [...new Set(commonWords.map(word => word.category))];
    return categories.sort();
  };

  return {
    commonWords,
    addWord,
    removeWord,
    updateWord,
    getWordsByCategory,
    getCategories,
    setDefaultWords
  };
}; 