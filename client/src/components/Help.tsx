import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from './UserProfile';
import { useAuth } from '../contexts/AuthContext';

const Help: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    const originalTitle = document.title;
    const originalMeta = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    document.title = 'ヘルプ・使い方 | マイトレノート - 無料の筋トレ記録アプリ';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'マイトレノートの使い方・FAQ・トラブルシューティング。筋トレ記録アプリの使い方やよくある質問、Googleログイン方法を詳しく解説。');
    } else {
      const metaTag = document.createElement('meta');
      metaTag.name = 'description';
      metaTag.content = 'マイトレノートの使い方・FAQ・トラブルシューティング。筋トレ記録アプリの使い方やよくある質問、Googleログイン方法を詳しく解説。';
      document.head.appendChild(metaTag);
    }

    // アンマウント時にタイトルを元に戻す
    return () => {
      document.title = originalTitle;
      if (meta && originalMeta) {
        meta.setAttribute('content', originalMeta);
      }
    };
  }, []);

  const handleTitleClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 
                className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={handleTitleClick}
                title="クリックでトップページに戻る"
              >
                マイトレノート
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user && <UserProfile user={user} />}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-400">ヘルプ・使い方</h1>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">マイトレノートとは？</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            マイトレノートは、筋トレやフィットネスのトレーニング記録をカレンダー形式で簡単に管理できる無料Webアプリです。
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li>Googleアカウントやメールアドレスで簡単ログイン</li>
            <li>日ごとのトレーニング記録をカレンダーで管理</li>
            <li>部位・種目ごとに記録、編集、削除が可能</li>
            <li>スマホ・PC両対応</li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">使い方ガイド</h2>
          <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 mb-2">
            <li>Googleまたはメールアドレスでログイン</li>
            <li>カレンダーから日付を選択</li>
            <li>「記録を追加」ボタンでトレーニング内容を入力</li>
            <li>記録の編集・削除もワンタッチ</li>
          </ol>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">よくある質問（FAQ）</h2>
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Q. ログインできない・ループする</h3>
            <p className="text-gray-700 dark:text-gray-300">ブラウザのキャッシュをクリアし、再度お試しください。Googleアカウントの認証設定もご確認ください。</p>
          </div>
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Q. データはどこに保存されますか？</h3>
            <p className="text-gray-700 dark:text-gray-300">Googleのクラウド（Firebase）に安全に保存されます。端末を変えても同じアカウントで利用できます。</p>
          </div>
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Q. スマホでも使えますか？</h3>
            <p className="text-gray-700 dark:text-gray-300">はい。iPhone・Android・PCすべてのブラウザでご利用いただけます。</p>
          </div>
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Q. 使い方が分からない・要望がある</h3>
            <p className="text-gray-700 dark:text-gray-300">ページ下部のお問い合わせフォーム（今後追加予定）からご連絡ください。</p>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">トラブルシューティング</h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li>画面が真っ白な場合はリロード、またはキャッシュクリア</li>
            <li>Googleログインができない場合はポップアップブロックを解除</li>
            <li>それでも解決しない場合はお問い合わせください</li>
          </ul>
        </section>
        <footer className="mt-10 text-center text-gray-400 dark:text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} マイトレノート
        </footer>
      </div>
    </div>
  );
};

export default Help; 