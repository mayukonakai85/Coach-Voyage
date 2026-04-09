# Coach Voyage - 会員制動画アーカイブ

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install --cache /tmp/npm-cache
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、各値を設定します。

```bash
cp .env.local.example .env.local
```

| 変数名 | 説明 |
|---|---|
| `NEXTAUTH_SECRET` | 自動生成済み（変更不要） |
| `DATABASE_URL` | そのままでOK |
| `BUNNY_LIBRARY_ID` | Bunny.net Stream → ライブラリID |
| `BUNNY_TOKEN_AUTH_KEY` | Stream → セキュリティ → トークン認証キー |
| `BUNNY_CDN_HOSTNAME` | Stream → CDNホスト名 |

### 3. データベースのセットアップ

```bash
DATABASE_URL="file:./dev.db" npx prisma db push
DATABASE_URL="file:./dev.db" npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

---

## ログイン情報（開発用）

| ロール | Email | Password |
|---|---|---|
| 管理者 | admin@coachvoyage.com | admin123 |
| 会員 | yamada@example.com | member123 |

---

## Bunny.net セットアップ

1. [Bunny.net](https://bunny.net) でアカウント作成
2. Stream → ライブラリを新規作成
3. **セキュリティ** → **トークン認証を有効にする** をON
4. 表示されたトークン認証キーを `.env.local` の `BUNNY_TOKEN_AUTH_KEY` に設定
5. 動画をアップロードし、動画IDを管理画面から登録

---

## ファイル構成

```
src/
├── app/
│   ├── (auth)/login/        # ログインページ
│   ├── (member)/videos/     # 動画一覧・詳細（会員向け）
│   ├── admin/               # 管理者ページ
│   └── api/admin/           # 管理者向けAPIエンドポイント
├── components/              # 共通コンポーネント
├── lib/
│   ├── auth.ts              # NextAuth設定
│   ├── db.ts                # Prismaクライアント
│   └── bunny.ts             # Bunny.net署名付きURL生成
└── middleware.ts             # 認証ルート保護
prisma/
├── schema.prisma            # DBスキーマ（フェーズ2のモデルもコメントで記載）
└── seed.ts                  # ダミーデータ
```

---

## フェーズ2（セミナー機能）の追加方法

1. `prisma/schema.prisma` の `Seminar` と `Registration` モデルのコメントを外す
2. `npx prisma db push` でDBを更新
3. `src/app/(member)/seminars/` にセミナー一覧・詳細ページを追加
4. `src/app/api/admin/seminars/` にAPIルートを追加
