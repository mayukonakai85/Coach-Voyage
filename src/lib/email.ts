// NEXTAUTH_URL は Vercel 環境では本番URLが設定される
const SITE_URL = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function sendEmail({ to, name, subject, html }: { to: string; name: string; subject: string; html: string }) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.FROM_EMAIL ?? "noreply@example.com";

  if (!apiKey) throw new Error("BREVO_API_KEY が設定されていません");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: "Coach Voyage", email: fromEmail },
      to: [{ email: to, name }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Brevo API error: ${res.status} ${error}`);
  }
}

// 会員招待メール（パスワード設定リンク付き）
export async function sendWelcomeEmail({ to, name, token }: { to: string; name: string; token: string }) {
  const setPasswordUrl = `${SITE_URL}/set-password?token=${token}`;

  await sendEmail({
    to,
    name,
    subject: "【Coach Voyage】ようこそ！パスワードを設定してください",
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; background: #f5f5f5; margin: 0; padding: 32px 16px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #1d4ed8, #4f46e5); padding: 32px; text-align: center;">
      <p style="color: #93c5fd; font-size: 12px; letter-spacing: 2px; margin: 0 0 8px;">MEMBER PORTAL</p>
      <h1 style="color: white; font-size: 24px; margin: 0;">Coach Voyage</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 18px; font-weight: bold; margin: 0 0 12px;">${name} さん、ようこそ Coach Voyage へ！</p>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0 0 24px;">
        この度は Coach Voyage にご参加いただき、ありがとうございます。🎉<br>
        下のボタンからパスワードを設定すると、すぐにポータルにアクセスできます。
      </p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
        <p style="color: #6b7280; font-size: 13px; margin: 0;">ログインメールアドレス：<strong style="color: #111827;">${to}</strong></p>
      </div>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${setPasswordUrl}" style="display: inline-block; background: #1d4ed8; color: white; text-decoration: none; font-weight: bold; font-size: 14px; padding: 14px 32px; border-radius: 8px;">
          パスワードを設定してはじめる →
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px;">※ このメールに心当たりがない場合はそのまま破棄してください。</p>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e5e7eb; padding: 16px 32px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© Coach Voyage</p>
    </div>
  </div>
</body>
</html>`.trim(),
  });
}

// 決済メール（入会案内）
export async function sendPaymentEmail({ to, name }: { to: string; name: string }) {
  await sendEmail({
    to,
    name,
    subject: "Coach Voyageへようこそ！",
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; background: #f5f5f5; margin: 0; padding: 32px 16px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #1d4ed8, #4f46e5); padding: 32px; text-align: center;">
      <p style="color: #93c5fd; font-size: 12px; letter-spacing: 2px; margin: 0 0 8px;">MEMBER PORTAL</p>
      <h1 style="color: white; font-size: 24px; margin: 0;">Coach Voyage</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 15px; margin: 0 0 20px;">${name} 様</p>
      <p style="color: #374151; font-size: 14px; line-height: 2; margin: 0 0 16px;">
        こんにちは！Coach Voyage代表の中井茉由子です。<br>
        この度は、Coach Voyageにご入会いただき、ありがとうございます。
      </p>
      <p style="color: #374151; font-size: 14px; line-height: 2; margin: 0 0 16px;">
        コーチ業界の未来を創る仲間として、Crewの一員となることを<br>
        とても嬉しく思います。
      </p>
      <p style="color: #374151; font-size: 14px; line-height: 2; margin: 0 0 16px;">
        Coach Voyageは、学習・成長・協力の3つの軸を中心に、<br>
        コーチ達のスキルとビジネス面、そして人間的な成長を目指すコミュニティです。<br>
        ${name}さんの成長がクライアントに、そして社会に伝わっていく未来を<br>
        心から応援しています！
      </p>
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 20px 24px; margin: 24px 0;">
        <p style="color: #1e40af; font-size: 14px; font-weight: bold; margin: 0 0 12px;">▼こちらより、月会費お支払いの手続きをお願いします。</p>
        <p style="color: #3b82f6; font-size: 12px; margin: 0 0 16px;">（英語の画面が開きますが、下部の∨マークを押すと日本語に切り替えられます）</p>
        <div style="text-align: center;">
          <a href="https://www.paypal.com/webapps/hermes?token=71X2022330297530K&useraction=commit"
            style="display: inline-block; background: #1d4ed8; color: white; text-decoration: none; font-weight: bold; font-size: 14px; padding: 14px 32px; border-radius: 8px;">
            Coach Voyage 月会費決済リンクはこちら →
          </a>
        </div>
      </div>
      <p style="color: #374151; font-size: 14px; line-height: 2; margin: 0 0 8px;">
        それでは、これから一緒に、素晴らしい航海を進めていきましょう！<br>
        Bon Voyage！
      </p>
      <p style="color: #374151; font-size: 14px; margin: 16px 0 0; font-weight: bold;">Coach Voyage 代表　中井茉由子</p>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e5e7eb; padding: 16px 32px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© Coach Voyage</p>
    </div>
  </div>
</body>
</html>`.trim(),
  });
}

// パスワードリセットメール
export async function sendPasswordResetEmail({ to, name, token }: { to: string; name: string; token: string }) {
  const resetUrl = `${SITE_URL}/set-password?token=${token}`;

  await sendEmail({
    to,
    name,
    subject: "【Coach Voyage】パスワードのリセット",
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; background: #f5f5f5; margin: 0; padding: 32px 16px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #1d4ed8, #4f46e5); padding: 32px; text-align: center;">
      <p style="color: #93c5fd; font-size: 12px; letter-spacing: 2px; margin: 0 0 8px;">MEMBER PORTAL</p>
      <h1 style="color: white; font-size: 24px; margin: 0;">Coach Voyage</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 16px; margin: 0 0 12px;">${name} さん</p>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0 0 24px;">
        パスワードリセットのリクエストを受け付けました。<br>
        下のボタンから新しいパスワードを設定してください。
      </p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${resetUrl}" style="display: inline-block; background: #1d4ed8; color: white; text-decoration: none; font-weight: bold; font-size: 14px; padding: 14px 32px; border-radius: 8px;">
          パスワードをリセットする →
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px;">※ このリクエストに心当たりがない場合はそのまま破棄してください。</p>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e5e7eb; padding: 16px 32px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© Coach Voyage</p>
    </div>
  </div>
</body>
</html>`.trim(),
  });
}
