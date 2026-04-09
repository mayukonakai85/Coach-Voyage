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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        // 無効化された会員はログイン不可
        if (!user.isActive) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) return null;

        // ログイン回数をインクリメント
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { loginCount: { increment: 1 } },
          select: { loginCount: true },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as "ADMIN" | "MEMBER",
          loginCount: updated.loginCount,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.loginCount = (user as { loginCount?: number }).loginCount ?? 1;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.loginCount = token.loginCount as number ?? 1;
        // 最新のアバターURLを取得
        const user = await prisma.user.findUnique({
          where: { id: token.id },
          select: { avatarUrl: true, name: true },
        });
        session.user.avatarUrl = user?.avatarUrl ?? null;
        if (user?.name) session.user.name = user.name;
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
