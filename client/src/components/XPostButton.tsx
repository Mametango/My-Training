import React, { useState } from 'react';
import { Twitter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface XPostButtonProps {
  workoutData: {
    date: string;
    exercises: Array<{
      name: string;
      sets: Array<{
        weight: string | number;
        reps: string | number;
        memo?: string;
      }>;
    }>;
  };
}

export const XPostButton: React.FC<XPostButtonProps> = ({ workoutData }) => {
  const [isPosting, setIsPosting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { t } = useLanguage();

  // 投稿内容を生成
  const generatePostContent = () => {
    const date = new Date(workoutData.date).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });

    // 運動種目を抽出（順序を保持）
    const exerciseNames = workoutData.exercises.map(ex => ex.name);
    
    // メモを抽出
    const memos = workoutData.exercises
      .flatMap(ex => ex.sets)
      .map(set => set.memo)
      .filter(memo => memo && memo.trim())
      .slice(0, 3); // 最大3個まで

    let content = `🏋️ ${date}のトレーニング\n`;
    content += `\n運動種目:\n`;
    exerciseNames.forEach(ex => {
      content += `• ${ex}\n`;
    });

    if (memos.length > 0) {
      content += `\nメモ:\n`;
      memos.forEach(memo => {
        content += `• ${memo}\n`;
      });
    }

    content += `\n#マイトレノート #筋トレ`;

    return content;
  };

  const postContent = generatePostContent();

  // X投稿処理
  const handlePost = async () => {
    setIsPosting(true);
    
    try {
      // Web Intent URLを使用してX投稿画面を開く
      const encodedText = encodeURIComponent(postContent);
      const intentUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
      
      // 新しいウィンドウで開く
      window.open(intentUrl, '_blank', 'width=600,height=400');
      
      // 成功メッセージ
      alert(t('xpost.success') || 'X投稿画面を開きました');
    } catch (error) {
      console.error('X投稿エラー:', error);
      alert(t('xpost.error') || 'X投稿に失敗しました');
    } finally {
      setIsPosting(false);
      setShowPreview(false);
    }
  };

  return (
    <div className="relative">
      {/* 投稿ボタン */}
      <button
        onClick={() => setShowPreview(true)}
        disabled={isPosting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
        title={t('xpost.button') || 'Xに投稿'}
      >
        <Twitter size={16} />
        <span>{t('xpost.button') || 'Xに投稿'}</span>
      </button>

      {/* プレビューモーダル */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('xpost.preview') || '投稿内容プレビュー'}
            </h3>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                {postContent}
              </pre>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handlePost}
                disabled={isPosting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
              >
                <Twitter size={16} />
                {isPosting ? (t('xpost.posting') || '投稿中...') : (t('xpost.post') || '投稿する')}
              </button>
              
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
              >
                {t('common.cancel') || 'キャンセル'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 