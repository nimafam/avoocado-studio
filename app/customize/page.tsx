import type { Metadata } from "next";
import { TShirtImageCustomizer } from "@/components/customizer/TShirtImageCustomizer";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = { title: "Custom Lab", description: "Preview artwork on the front and back of Avoocado Loose and Boxy T-shirt models." };

export default function CustomizePage() {
    return <main className="pt-[112px]"><Header /><TShirtImageCustomizer /></main>;
}
