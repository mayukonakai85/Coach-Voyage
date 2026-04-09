import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileEditor } from "./ProfileEditor";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      _count: { select: { views: true, notes: true, comments: true } },
    },
  });

  if (!user) redirect("/login");

  return <ProfileEditor profile={user} />;
}
