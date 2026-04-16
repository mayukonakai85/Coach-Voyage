import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const maxDuration = 30; // Neon DBコールドスタート対策

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
