# Vercel Deployment Protection を無効にする

## 問題

現在、Vercel のデプロイメント保護が有効になっており、プレビューデプロイメントや本番デプロイメントにアクセスするために認証が必要になっています。

これにより：
- APIエンドポイントにアクセスできない
- アプリケーションが正常に動作しない

## 解決手順

### 1. Vercel ダッシュボードにアクセス

https://vercel.com/asofia888s-projects/russian-talk-tutor/settings/deployment-protection

### 2. Deployment Protection を無効化

1. **Settings** → **Deployment Protection** に移動
2. 以下の設定を確認:

   **Vercel Authentication (推奨設定)**:
   - ✅ **OFF** に設定（無効化）
   - または
   - 「Protection Bypass for Automation」を設定

3. **Save** をクリック

### 3. 既存のデプロイメントを再デプロイ

保護設定を変更しても、既存のデプロイメントには影響しません。新しいデプロイメントを作成する必要があります：

1. **Deployments** タブに移動
2. 最新のデプロイメント（`russian-talk-tutor-5hhh306yg...`）を選択
3. **⋯** メニュー → **Redeploy**
4. **Redeploy** をクリック

### 4. 本番URLで確認

https://russian-talk-tutor.vercel.app にアクセスして動作確認

## 別の方法: Protection Bypass Token の設定

もしDeployment Protectionを有効にしたままにしたい場合：

1. **Settings** → **Deployment Protection**
2. **Protection Bypass for Automation** セクションで:
   - トークンを生成
   - そのトークンを環境変数 `VERCEL_AUTOMATION_BYPASS_SECRET` として設定

ただし、このアプリは公開アプリケーションなので、保護は不要です。

## なぜこの問題が発生したか

Vercel のデフォルト設定で、新しいプロジェクトにはデプロイメント保護が有効になる場合があります。これは：
- プライベートなアプリケーションには便利
- パブリックなAPIを持つアプリケーションには不適切

## 確認方法

保護が無効になったかどうかを確認：

```bash
curl -I https://russian-talk-tutor.vercel.app
```

**保護が有効な場合**:
```
HTTP/2 200
content-type: text/html
```

**保護が無効な場合**:
```
HTTP/2 200
content-type: text/html; charset=utf-8
```

または、ブラウザで直接アクセスして、認証ページが表示されないことを確認。
