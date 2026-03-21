import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "Admin — El Garaje de Vale",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
