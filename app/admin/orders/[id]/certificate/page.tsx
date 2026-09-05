import { CertificateView } from "@/components/admin/CertificateView";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CertificateView orderId={Number(id)} />;
}
