import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "MEMBER";
      avatarUrl: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "MEMBER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "MEMBER";
    id: string;
  }
}
