import type { Metadata } from "next";
import { AdminCollectionEditor } from "@/components/admin/AdminCollectionEditor";

export const metadata: Metadata = {
  title: "New Collection",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default function NewCollectionPage() {
  return <AdminCollectionEditor />;
}
