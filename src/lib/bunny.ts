import crypto from "crypto";

/**
 * Bunny.net Stream 署名付きURL生成
 *
 * Bunny.net の Stream ライブラリでトークン認証を有効にすると、
 * 有効期限付きの署名済みURLのみで動画を再生できるようになります。
 *
 * 設定手順:
 * 1. Bunny.net ダッシュボード → Stream → ライブラリを選択
 * 2. セキュリティ → 「トークン認証を有効にする」をON
 * 3. 表示されたトークン認証キーを BUNNY_TOKEN_AUTH_KEY に設定
 */
export function generateBunnySignedEmbedUrl(videoId: string): string {
  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const tokenAuthKey = process.env.BUNNY_TOKEN_AUTH_KEY;

  if (!libraryId || !tokenAuthKey) {
    // 開発時: 環境変数未設定の場合はダミーURLを返す
    console.warn(
      "Bunny.net 環境変数が設定されていません。.env.local を確認してください。"
    );
    return `https://iframe.mediadelivery.net/embed/demo/${videoId}`;
  }

  // 有効期限: 現在時刻から2時間後（秒単位のUnixタイムスタンプ）
  const expires = Math.floor(Date.now() / 1000) + 2 * 60 * 60;

  // Bunny.net トークン計算
  // 参考: https://docs.bunny.net/docs/stream-embedding-videos
  // token = SHA256(tokenAuthKey + videoId + expires)
  const hashableString = `${tokenAuthKey}${videoId}${expires}`;
  const token = crypto
    .createHash("sha256")
    .update(hashableString)
    .digest("hex");

  const embedUrl = new URL(
    `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`
  );
  embedUrl.searchParams.set("token", token);
  embedUrl.searchParams.set("expires", expires.toString());
  embedUrl.searchParams.set("autoplay", "false");

  return embedUrl.toString();
}

/**
 * Bunny.net サムネイルURL生成
 * Stream ライブラリは動画アップロード後、自動でサムネイルを生成します
 */
export function getBunnyThumbnailUrl(videoId: string): string {
  const libraryId = process.env.BUNNY_LIBRARY_ID;
  if (!libraryId) {
    return "/placeholder-thumbnail.png";
  }
  return `https://vz-${process.env.BUNNY_CDN_HOSTNAME?.replace(/^vz-/, "").replace(/\.b-cdn\.net$/, "")}.b-cdn.net/${videoId}/thumbnail.jpg`;
}
