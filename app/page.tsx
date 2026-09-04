import { HomeContinuation } from "@/components/home/HomeContinuation";
import { HomeExperience } from "@/components/home/HomeExperience";
import { Header } from "@/components/layout/Header";
import { getPublicCollections, getPublicProducts } from "@/lib/catalog/cloudflare-repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, collections] = await Promise.all([getPublicProducts(), getPublicCollections()]);
  return (
    <main>
      <Header />
      <HomeExperience collections={collections} />
      <HomeContinuation products={products} />
    </main>
  );
}
