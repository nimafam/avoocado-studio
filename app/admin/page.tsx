import type { Metadata } from "next";
import { AdminCatalogManager } from "@/components/admin/AdminCatalogManager";

export const metadata: Metadata = { title: "Catalog Manager", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminPage() {
    return <AdminCatalogManager />;
}

