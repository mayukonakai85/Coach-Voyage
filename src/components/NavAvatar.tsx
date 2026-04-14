import { Avatar } from "@/components/Avatar";

// アバターURLはsessionから取得済みのため追加fetchは不要
// プロフィール更新時はupdateSession()でsessionが更新されNavigation経由で反映される
export function NavAvatar({ name, fallbackUrl }: { name: string; fallbackUrl: string | null }) {
  return <Avatar name={name} avatarUrl={fallbackUrl} size="sm" />;
}
