import type { Metadata } from "next";
import { AdminCollectionEditor } from "@/components/admin/AdminCollectionEditor";

export const metadata: Metadata = {
  title: "Edit Collection",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function EditCollectionPage({
  params,
}: PageProps<"/admin/collections/[id]">) {
  const { id } = await params;
  return <AdminCollectionEditor collectionId={Number(id)} />;
}
