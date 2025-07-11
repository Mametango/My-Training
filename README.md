# トレーニング記録アプリ

カレンダーインターフェースを使用したトレーニング記録管理アプリケーションです。

## 機能

- 📅 カレンダーでの日付選択
- 💪 筋肉部位別のトレーニング記録
- 📊 統計・分析機能
- 🔐 Firebase認証（Gmail OAuth）
- 📱 レスポンシブデザイン

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- Tailwind CSS
- React Calendar
- Lucide React

### バックエンド
- Node.js
- Express
- SQLite
- CORS

### 認証
- Firebase Authentication
- Google OAuth

## セットアップ

### 前提条件
- Node.js (v16以上)
- npm

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd My-Training
```

2. 依存関係をインストール
```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

3. Firebase設定
- Firebase Consoleでプロジェクトを作成
- AuthenticationでGoogle OAuthを有効化
- プロジェクト設定からWebアプリの設定値を取得
- `.env`ファイルに正しい設定値を設定

4. 環境変数の設定
```bash
# ルートディレクトリに.envファイルを作成
cp .env.example .env
# .envファイルを編集して必要な環境変数を設定
```

### 開発サーバーの起動

```bash
npm run dev
```

これで以下が起動します：
- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:5000

## デプロイ

### Firebase Hosting

1. Firebase CLIをインストール
```bash
npm install -g firebase-tools
```

2. Firebaseにログイン
```bash
firebase login
```

3. プロジェクトを初期化
```bash
firebase init hosting
```

4. ビルドしてデプロイ
```bash
cd client
npm run build
firebase deploy
```

## 使用方法

1. アプリにアクセスしてGmailでログイン
2. カレンダーで日付を選択
3. トレーニング記録を追加
4. 統計ページで進捗を確認

## ライセンス

MIT License 