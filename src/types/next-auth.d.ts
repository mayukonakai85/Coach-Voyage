import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "MEMBER";
      avatarUrl: string | null;
      loginCount: number;
      showProfilePopup: boolean;
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
    loginCount: number;
  }
}
