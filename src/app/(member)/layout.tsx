import { Navigation } from "@/components/Navigation";
import { LoginPopupManager } from "@/components/LoginPopupManager";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-28 md:pt-20">{children}</main>
      <LoginPopupManager />
    </div>
  );
}
