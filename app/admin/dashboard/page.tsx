import type { Metadata } from "next";
import { AdminCatalogManager } from "@/components/admin/AdminCatalogManager";

export const metadata: Metadata = {
  title: "داشبورد مدیریت",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return <AdminCatalogManager />;
}
