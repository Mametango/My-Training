import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Language = 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

// 翻訳データ
const translations = {
  ja: {
    // ヘッダー
    'app.title': 'マイトレノート',
    'app.title.tooltip': 'クリックで今日の日付に移動',
    
    // 認証
    'auth.loading': '認証情報を読み込み中...',
    'auth.login.failed': 'ログインに失敗しました',
    'auth.register.failed': '登録に失敗しました',
    'auth.google.login.failed': 'Googleログインに失敗しました',
    'auth.start.recording': 'トレーニングの記録を始めましょう',
    'auth.login': 'ログイン',
    'auth.register': '新規登録',
    'auth.error': '認証エラー',
    'auth.email': 'メールアドレス',
    'auth.password': 'パスワード',
    'auth.password.placeholder': 'パスワードを入力',
    'auth.logging.in': 'ログイン中...',
    'auth.username.optional': 'ユーザー名（任意）',
    'auth.username.placeholder': 'ユーザー名を入力',
    'auth.password.min6': 'パスワード（6文字以上）',
    'auth.registering': '登録中...',
    'auth.google.login.title': 'Googleアカウントでログイン',
    'auth.google.login.description': 'Gmailアカウントでログインして、トレーニング記録を管理してください',
    'auth.google.login.button': 'Googleでログイン',
    'auth.privacy.notice': 'ログインすることで、あなたのトレーニング記録が安全に保存されます',
    'auth.safari.notice': '※ サファリやiOSでログインできない場合は「サイト越えトラッキングを防ぐ」やコンテンツブロッカーを無効化してください。',
    'auth.logout': 'ログアウト',
    'auth.logout.failed': 'サインアウトに失敗しました',
    'help.title': 'ヘルプ',
    
    // メイン画面
    'loading': '読み込み中...',
    'workout.record': 'トレーニング記録',
    'workout.add': '記録を追加',
    'workout.edit': '編集',
    'workout.delete': '削除',
    'workout.delete.confirm': 'このトレーニング記録を削除しますか？',
    'workout.delete.failed': '削除に失敗しました',
    'workout.edit.failed': '編集に失敗しました',
    'workout.save.failed': '保存に失敗しました',
    'workout.save.success': '保存しました',
    
    // フォーム
    'form.muscle.group': '部位',
    'form.exercise': '種目',
    'form.weight': '重量 (kg)',
    'form.reps': '回数',
    'form.reps.unit': '回',
    'form.notes': 'メモ',
    'form.hand': '手',
    'form.hand.both': '両手',
    'form.hand.right': '右手',
    'form.hand.left': '左手',
    'form.bodyweight': '自重',
    'form.select.please': '選択してください',
    'form.custom.exercise': '＋ カスタム種目を追加',
    'form.custom.exercise.name': 'カスタム種目名',
    'form.placeholder.weight': '自重 または 0 または 例: 50',
    'form.placeholder.reps': '例: 10（任意）',
    'form.placeholder.notes': 'メモ（任意）',
    'form.placeholder.custom.exercise': 'カスタム種目名を入力',
    
    // バリデーション
    'validation.muscle.group.required': '部位を選択してください',
    'validation.exercise.required': '種目を選択してください',
    'validation.custom.exercise.required': 'カスタム種目名を入力してください',
    
    // カレンダー
    'calendar.today': '今日',
    'calendar.workout.day': '記録あり',
    'calendar.swipeHint': 'スワイプで月を変更',
    
    // 統計
    'stats.total.volume': '全体ボリューム',
    'stats.1rm': '1RM',
    'stats.unset': '未入力',
    
    // 設定
    'settings.title': '設定',
    'settings.theme': 'テーマ',
    'settings.theme.light': 'ライトモード',
    'settings.theme.dark': 'ダークモード',
    'settings.language': '言語',
    'settings.language.japanese': '日本語',
    'settings.language.english': 'English',
    'settings.exercise.management': '種目設定',
    'settings.close': '閉じる',
    
    // 友達機能
    'friends.list': '友達一覧',
    'friends.feed': '友達フィード',
    'friends.share': '友達に記録を公開する',
    'friends.share.twitter': '1日の記録をTwitterでシェア',
    'friends.no.records': '友達の記録がありません',
    'friends.no.records.description': '友達が記録を公開するとここに表示されます',
    'refresh': '更新',
    
    // その他
    'cancel': 'キャンセル',
    'save': '保存',
    'add': '追加',
    'share': 'シェア',
    'no.records': 'この日のトレーニング記録はありません',
    'no.records.description': '「記録を追加」ボタンから新しい記録を作成できます',
    'sort.time': '時刻順',
    'sort.time.asc': '昇順',
    'sort.time.desc': '降順',
    'sort.time.tooltip': '種目時刻昇順・降順 (クリックで切り替え)',
    
    // X投稿
    'xpost.button': 'Xに投稿',
    'xpost.preview': '投稿内容プレビュー',
    'xpost.post': '投稿する',
    'xpost.posting': '投稿中...',
    'xpost.success': 'X投稿画面を開きました',
    'xpost.error': 'X投稿に失敗しました',
    'common.cancel': 'キャンセル',
  },
  en: {
    // Header
    'app.title': 'My Training Note',
    'app.title.tooltip': 'Click to go to today',
    
    // Authentication
    'auth.loading': 'Loading authentication...',
    'auth.login.failed': 'Login failed',
    'auth.register.failed': 'Registration failed',
    'auth.google.login.failed': 'Google login failed',
    'auth.start.recording': 'Start recording your training',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.error': 'Authentication Error',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.password.placeholder': 'Enter password',
    'auth.logging.in': 'Logging in...',
    'auth.username.optional': 'Username (optional)',
    'auth.username.placeholder': 'Enter username',
    'auth.password.min6': 'Password (min 6 characters)',
    'auth.registering': 'Registering...',
    'auth.google.login.title': 'Login with Google Account',
    'auth.google.login.description': 'Login with your Gmail account to manage your training records',
    'auth.google.login.button': 'Login with Google',
    'auth.privacy.notice': 'By logging in, your training records will be safely stored',
    'auth.safari.notice': '※ If you cannot login on Safari or iOS, please disable "Prevent Cross-Site Tracking" or content blockers.',
    'auth.logout': 'Logout',
    'auth.logout.failed': 'Logout failed',
    'help.title': 'Help',
    
    // Main screen
    'loading': 'Loading...',
    'workout.record': 'Training Record',
    'workout.add': 'Add Record',
    'workout.edit': 'Edit',
    'workout.delete': 'Delete',
    'workout.delete.confirm': 'Delete this training record?',
    'workout.delete.failed': 'Failed to delete',
    'workout.edit.failed': 'Failed to edit',
    'workout.save.failed': 'Failed to save',
    'workout.save.success': 'Saved successfully',
    
    // Form
    'form.muscle.group': 'Muscle Group',
    'form.exercise': 'Exercise',
    'form.weight': 'Weight (kg)',
    'form.reps': 'Reps',
    'form.reps.unit': ' reps',
    'form.notes': 'Notes',
    'form.hand': 'Hand',
    'form.hand.both': 'Both',
    'form.hand.right': 'Right',
    'form.hand.left': 'Left',
    'form.bodyweight': 'Bodyweight',
    'form.select.please': 'Please select',
    'form.custom.exercise': '+ Add Custom Exercise',
    'form.custom.exercise.name': 'Custom Exercise Name',
    'form.placeholder.weight': 'Bodyweight or 0 or e.g. 50',
    'form.placeholder.reps': 'e.g. 10 (optional)',
    'form.placeholder.notes': 'Notes (optional)',
    'form.placeholder.custom.exercise': 'Enter custom exercise name',
    
    // Validation
    'validation.muscle.group.required': 'Please select muscle group',
    'validation.exercise.required': 'Please select exercise',
    'validation.custom.exercise.required': 'Please enter custom exercise name',
    
    // Calendar
    'calendar.today': 'Today',
    'calendar.workout.day': 'Has records',
    'calendar.swipeHint': 'Swipe to change month',
    
    // Statistics
    'stats.total.volume': 'Total Volume',
    'stats.1rm': '1RM',
    'stats.unset': 'Not set',
    
    // Settings
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.theme.light': 'Light Mode',
    'settings.theme.dark': 'Dark Mode',
    'settings.language': 'Language',
    'settings.language.japanese': '日本語',
    'settings.language.english': 'English',
    'settings.exercise.management': 'Exercise Settings',
    'settings.close': 'Close',
    
    // Friends
    'friends.list': 'Friends List',
    'friends.feed': 'Friends Feed',
    'friends.share': 'Share record with friends',
    'friends.share.twitter': 'Share today\'s record on Twitter',
    'friends.no.records': 'No friends records',
    'friends.no.records.description': 'When friends share records, they will appear here',
    'refresh': 'Refresh',
    
    // Others
    'cancel': 'Cancel',
    'save': 'Save',
    'add': 'Add',
    'share': 'Share',
    'no.records': 'No training records for this day',
    'no.records.description': 'You can create new records from the "Add Record" button',
    'sort.time': 'Time Order',
    'sort.time.asc': 'Ascending',
    'sort.time.desc': 'Descending',
    'sort.time.tooltip': 'Exercise time ascending/descending (click to toggle)',
    
    // X Post
    'xpost.button': 'Post to X',
    'xpost.preview': 'Post Preview',
    'xpost.post': 'Post',
    'xpost.posting': 'Posting...',
    'xpost.success': 'X post window opened',
    'xpost.error': 'Failed to post to X',
    'common.cancel': 'Cancel',
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // ローカルストレージから言語を取得、なければブラウザ設定を確認
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      return savedLanguage;
    }
    
    // ブラウザの言語設定を確認
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ja')) {
      return 'ja';
    }
    
    return 'en';
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  useEffect(() => {
    // 初期化時に言語を設定
    setLanguage(language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}; 