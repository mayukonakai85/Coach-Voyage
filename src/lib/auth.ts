import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true, email: true, name: true, password: true,
            role: true, isActive: true, avatarUrl: true, showProfilePopup: true,
          },
        });

        if (!user || !user.isActive) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        // ログイン回数・最終ログイン日時を更新（1回のクエリで完結）
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { loginCount: { increment: 1 }, lastLoginAt: new Date() },
          select: { loginCount: true },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as "ADMIN" | "MEMBER",
          loginCount: updated.loginCount,
          avatarUrl: user.avatarUrl,
          showProfilePopup: user.showProfilePopup,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  callbacks: {
    async jwt({ token, user, trigger, session: sessionUpdate }) {
      // 初回ログイン時：authorize の戻り値をトークンに保存
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.loginCount = user.loginCount;
        token.avatarUrl = user.avatarUrl;
        token.showProfilePopup = user.showProfilePopup;
        if (user.name) token.name = user.name;
      }
      // プロフィール更新時：クライアントから update() で差分だけ反映
      if (trigger === "update" && sessionUpdate) {
        if (sessionUpdate.name !== undefined) token.name = sessionUpdate.name;
        if (sessionUpdate.avatarUrl !== undefined) token.avatarUrl = sessionUpdate.avatarUrl;
        if (sessionUpdate.showProfilePopup !== undefined) token.showProfilePopup = sessionUpdate.showProfilePopup;
      }
      return token;
    },
    async session({ session, token }) {
      // DBへのアクセスなし：トークンから読むだけ
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.loginCount = token.loginCount ?? 1;
        session.user.avatarUrl = token.avatarUrl ?? null;
        session.user.showProfilePopup = token.showProfilePopup ?? false;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/home",
  },
};
