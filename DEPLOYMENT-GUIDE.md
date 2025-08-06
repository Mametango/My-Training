# デプロイ方法ガイド

## 問題の解決策

PowerShellでコマンドが止まる問題を解決するために、複数の方法を用意しました。

## 方法1: バッチファイル（推奨）

### 簡単なデプロイ
```bash
quick-deploy.bat
```

### 詳細なデプロイ
```bash
build-and-deploy.bat
```

## 方法2: 改善版PowerShell

```powershell
# 通常のデプロイ
.\deploy-improved.ps1

# ビルドをスキップしてデプロイのみ
.\deploy-improved.ps1 -SkipBuild

# 詳細モード
.\deploy-improved.ps1 -Verbose
```

## 方法3: 手動コマンド

### PowerShellの場合
```powershell
# 実行ポリシーを設定
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# ビルド
cd client
npm run build
cd ..

# デプロイ
firebase deploy --only hosting
```

### コマンドプロンプトの場合
```cmd
cd client
npm run build
cd ..
firebase deploy --only hosting
```

## トラブルシューティング

### PowerShellが止まる場合
1. **バッチファイルを使用**: `quick-deploy.bat`をダブルクリック
2. **実行ポリシーを確認**: `Get-ExecutionPolicy`
3. **管理者権限で実行**: PowerShellを管理者として実行

### npmコマンドが失敗する場合
1. **依存関係を再インストール**: `npm install`
2. **キャッシュをクリア**: `npm cache clean --force`
3. **Node.jsバージョンを確認**: `node --version`

### Firebaseデプロイが失敗する場合
1. **ログイン確認**: `firebase login`
2. **プロジェクト確認**: `firebase projects:list`
3. **設定確認**: `firebase use`

## 推奨方法

**最も安定した方法**: `quick-deploy.bat`をダブルクリック

これにより、PowerShellの問題を回避し、安定したデプロイが可能になります。 