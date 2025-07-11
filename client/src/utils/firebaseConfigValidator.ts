// Firebase設定の検証ユーティリティ
export const validateFirebaseConfig = () => {
  const requiredEnvVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ 不足している環境変数:', missingVars);
    return false;
  }

  // appIdの形式チェック
  const appId = process.env.REACT_APP_FIREBASE_APP_ID;
  if (appId === 'your-app-id' || !appId?.includes(':')) {
    console.error('❌ REACT_APP_FIREBASE_APP_IDが正しく設定されていません');
    return false;
  }

  console.log('✅ Firebase設定が正常です');
  return true;
};

export const getFirebaseConfig = () => {
  if (!validateFirebaseConfig()) {
    throw new Error('Firebase configuration is invalid');
  }

  return {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY!,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.REACT_APP_FIREBASE_APP_ID!
  };
}; 