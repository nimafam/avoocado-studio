import { HomeContinuation } from "@/components/home/HomeContinuation";
import { HomeExperience } from "@/components/home/HomeExperience";
import { Header } from "@/components/layout/Header";

export default function Home() {
  return (
    <main>
      <Header />
      <HomeExperience />
      <HomeContinuation />
    </main>
  );
}
