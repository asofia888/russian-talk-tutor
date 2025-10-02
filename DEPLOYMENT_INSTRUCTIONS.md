# Vercel デプロイメント手順

## 現在の問題

1. **Tailwind CDN警告** - 古いビルドがキャッシュされている
2. **Service Worker MIMEタイプエラー** - 設定が反映されていない
3. **API タイムアウト** - GEMINI_API_KEY が設定されていない可能性

## 解決手順

### 1. Vercel ダッシュボードでの環境変数設定

1. https://vercel.com/dashboard にアクセス
2. プロジェクト `russian-talk-tutor` を選択
3. **Settings** → **Environment Variables** に移動
4. 以下の環境変数を追加/確認:

```
変数名: GEMINI_API_KEY
値: your-gemini-api-key-here
環境: Production, Preview, Development (全てチェック)
```

### 2. 強制再デプロイ

環境変数を設定したら:

1. **Deployments** タブに移動
2. 最新のデプロイメントを選択
3. **⋯** メニューから **Redeploy** を選択
4. ✅ **Use existing Build Cache** のチェックを外す（重要！）
5. **Redeploy** ボタンをクリック

### 3. キャッシュのクリア

再デプロイ後、ブラウザで:

1. ハードリフレッシュ: `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac)
2. または、開発者ツールを開いて:
   - Application タブ → Clear storage → Clear site data

### 4. 確認事項

デプロイ後、以下を確認:

- [ ] Tailwind CSS が正しく適用されているか (CDN警告が出ないか)
- [ ] Service Worker が登録されているか (コンソールエラーなし)
- [ ] 会話生成が動作するか (タイムアウトしないか)

## ローカル開発環境のセットアップ

ローカルでテストする場合:

1. `.env` ファイルを作成:
```bash
echo "GEMINI_API_KEY=your-gemini-api-key-here" > .env
```

2. 開発サーバーを起動:
```bash
npm run dev
```

3. Vercel Devサーバーでテスト (サーバーレス関数も含む):
```bash
npm install -g vercel
vercel dev
```

## トラブルシューティング

### 🔴 最優先: API が動作しない場合

**症状**:
- 「リクエストがタイムアウトしました」エラー
- 「Server configuration error: GEMINI_API_KEY is not configured」エラー
- 会話が生成されない

**確認手順**:

1. **Gemini API キーを取得**
   - https://aistudio.google.com/apikey にアクセス
   - 「Create API Key」をクリック
   - 新しいプロジェクトまたは既存のプロジェクトを選択
   - 生成されたAPIキーをコピー

2. **Vercelに環境変数を設定**
   - https://vercel.com/dashboard でプロジェクトを開く
   - **Settings** → **Environment Variables**
   - 「Add New」をクリック:
     - Name: `GEMINI_API_KEY`
     - Value: コピーしたAPIキー
     - Environment: **Production**, **Preview**, **Development** 全てチェック
   - 「Save」をクリック

3. **必ず再デプロイ**
   - 環境変数を追加しただけでは反映されない！
   - **Deployments** → 最新のデプロイ → **⋯** → **Redeploy**
   - ✅ **Use existing Build Cache のチェックを外す**
   - 再デプロイが完了するまで待つ（2-3分）

4. **ブラウザで確認**
   - ハードリフレッシュ: `Ctrl + Shift + R`
   - 開発者ツールのConsoleタブでエラーを確認
   - "Server configuration error" が出なくなっていればOK

### 問題: まだ古いビルドが表示される

**症状**:
- "cdn.tailwindcss.com should not be used in production" 警告
- スタイルが正しく表示されない

**解決策**:
1. Vercel で再デプロイ時に **"Use existing Build Cache" のチェックを外す**
2. ブラウザのキャッシュをクリア:
   - `Ctrl + Shift + Del` でキャッシュクリア画面を開く
   - 「キャッシュされた画像とファイル」を選択
   - 「データを削除」をクリック
3. ハードリフレッシュ: `Ctrl + Shift + R`

### 問題: Service Worker MIMEタイプエラー

**症状**:
```
SecurityError: Failed to register a ServiceWorker...
The script has an unsupported MIME type ('text/html')
```

**解決策**:
1. `vercel.json` の設定を確認:
```json
{
  "routes": [
    {
      "src": "/service-worker.js",
      "headers": {
        "Content-Type": "application/javascript; charset=utf-8",
        "Service-Worker-Allowed": "/"
      }
    }
  ]
}
```

2. `public/service-worker.js` が存在することを確認
3. ビルド後、`dist/service-worker.js` が存在することを確認
4. Vercelで再デプロイ（キャッシュなし）

### 問題: API タイムアウトが頻発

**原因**:
- Gemini API のレスポンスが遅い
- サーバーレス関数のコールドスタート
- API割り当て制限

**解決策**:
1. Gemini APIキーの割り当てを確認:
   - https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
   - 無料枠: 15 RPM (Requests Per Minute)
   - 超過している場合は数分待つ

2. より速いモデルを使用:
   - `api/generate-conversation.ts` で `gemini-2.5-flash` を使用（すでに設定済み）

3. タイムアウト設定の確認:
   - クライアント側: 60秒（`services/geminiService.ts`）
   - サーバー側: 60秒（`vercel.json`）

### 問題: Vercel CLI が "not linked" エラー

**解決策**:
```bash
vercel link
# プロンプトに従ってプロジェクトを選択
# Scope: あなたのアカウント名
# Link to existing project? Yes
# Project name: russian-talk-tutor
```

## 重要な注意事項

- **環境変数を変更した場合は必ず再デプロイが必要**
- **Service Worker を更新した場合はハードリフレッシュが必要**
- **API関数のタイムアウトは最大60秒** (Vercel Hobby プランの制限)
