# 本番環境の環境変数確認手順

## ✅ 確認済み

**Development環境**:
- GEMINI_API_KEY は正しく設定されています
- 最後の6文字: `Nrlv6U`
- APIキーは有効（テスト済み）

## ❗ 確認が必要

**Production環境**でも同じAPIキーが設定されているか確認してください。

### 手順

1. **Vercel ダッシュボードを開く**
   - https://vercel.com/asofia888s-projects/russian-talk-tutor
   - または: https://vercel.com/dashboard

2. **Settings → Environment Variables に移動**
   - 左サイドバーの **Settings** をクリック
   - **Environment Variables** タブを選択

3. **GEMINI_API_KEY の環境を確認**
   - `GEMINI_API_KEY` の行を見つける
   - **Environments** 列で以下が全てチェックされているか確認:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. **Production環境で値を確認（重要！）**
   - GEMINI_API_KEY の行の右側にある **⋯** メニューをクリック
   - **Edit** を選択
   - **Value** の最後の6文字が `Nrlv6U` であることを確認
   - 異なる場合は、正しい値に更新:
     ```
     AIzaSyD1aVrxvUqssou1I19iCtosAr5gZNrlv6U
     ```

5. **環境の選択を確認**
   - **Production** にチェックが入っていることを確認
   - チェックが入っていない場合は、チェックを入れる
   - **Save** をクリック

6. **必ず再デプロイ**
   - 環境変数を変更/保存したら、必ず再デプロイが必要
   - **Deployments** タブに移動
   - 最新のデプロイメントの **⋯** → **Redeploy**
   - ✅ **「Use existing Build Cache」のチェックを外す**
   - **Redeploy** をクリック

## 考えられる原因

現在のエラー（タイムアウト）の原因は以下のいずれかです：

### 1. Production環境にAPIキーが設定されていない
- Development環境では動作するが、Production環境では動作しない
- → 上記の手順4で確認・設定

### 2. Production環境に異なる（無効な）APIキーが設定されている
- 古いキーや間違ったキーが設定されている可能性
- → 上記の手順4で正しいキーに更新

### 3. 再デプロイが必要
- 環境変数を設定したが、再デプロイしていない
- → 上記の手順6で再デプロイ

## トラブルシューティング

### 確認方法1: Vercel Function Logs

1. https://vercel.com/asofia888s-projects/russian-talk-tutor
2. **Deployments** タブ → Production デプロイメントをクリック
3. **Functions** タブを選択
4. `/api/generate-conversation` をクリック
5. ログで以下のエラーを探す:
   ```
   GEMINI_API_KEY is not set
   ```
   - このエラーがある場合 → Production環境にAPIキーが設定されていない

### 確認方法2: ブラウザの開発者ツール

1. https://russian-talk-tutor.vercel.app を開く
2. 開発者ツール（F12）を開く
3. **Network** タブを選択
4. トピックをクリックして会話を生成
5. `generate-conversation` のリクエストをクリック
6. **Response** タブを確認:
   ```json
   {
     "error": "Server configuration error: GEMINI_API_KEY is not configured",
     "hint": "Please set the GEMINI_API_KEY environment variable in Vercel dashboard"
   }
   ```
   - このエラーが返る場合 → Production環境にAPIキーが設定されていない

## 解決後の確認

再デプロイ後:

1. ブラウザでハードリフレッシュ: `Ctrl + Shift + R`
2. トピックをクリックして会話生成をテスト
3. エラーが出ず、会話が表示されればOK！
