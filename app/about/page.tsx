import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getServerLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "About", description: "The ideas, process and people behind Avoocado Studio." };

export default async function AboutPage() {
  const fa = await getServerLocale() === "fa";
  const steps = fa ? [
    ["۰۱", "اتود", "هر محصول با یک مشاهده، شوخی یا پرسش تصویری کوچک شروع می‌شود."],
    ["۰۲", "پرداخت", "ایده را ساده می‌کنیم تا بدون از دست دادن شخصیتش واضح دیده شود."],
    ["۰۳", "آزمون", "رنگ، اندازه و جانمایی پیش از ورود طرح به کالکشن بررسی می‌شوند."],
    ["۰۴", "انتشار", "طرح نهایی در نسخه‌های محدود استودیویی عرضه می‌شود."],
  ] : [
    ["01", "Sketch", "Every piece begins as a small observation, joke or visual question."],
    ["02", "Refine", "We simplify until the idea reads clearly without losing its character."],
    ["03", "Test", "Color, scale and placement are tested before a piece enters a collection."],
    ["04", "Release", "Finished designs arrive in focused, small studio editions."],
  ];
  return <main><Header /><section className="container pb-24 pt-44 md:pt-52"><span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-primary)]">{fa ? "درباره / استودیو" : "About / The studio"}</span><h1 className="mt-7 max-w-6xl text-[clamp(4rem,9vw,10rem)] font-bold leading-[0.82] tracking-[-0.07em]">{fa ? "برای ساختن چیزهای بازیگوش جدی هستیم." : "Serious about making playful things."}</h1><div className="mt-20 grid gap-12 border-t border-black/15 pt-10 md:grid-cols-[1fr_2fr]"><span className="text-sm text-black/45">{fa ? "آووکادو، از ۱۴۰۵" : "Avoocado, since 2026"}</span><div className="space-y-8 text-[clamp(1.5rem,3vw,3rem)] leading-[1.15] tracking-[-0.035em]"><p>{fa ? "آووکادو یک استودیوی طراحی مستقل است که پوشاک و محصولات اورجینال با الهام از بازی‌ها، طبیعت ایران، هنر و فرهنگ روزمره می‌سازد." : "Avoocado is an independent design studio making original apparel and objects inspired by games, Iranian landscapes, art and everyday culture."}</p><p className="text-black/40">{fa ? "ایده‌های روشن، فرم‌های جسور و محصولاتی را دوست داریم که بعد از تازگی اولیه هم شخصیت خودشان را حفظ کنند." : "We like clear ideas, bold shapes and products that keep a little personality after the novelty wears off."}</p></div></div></section><section className="bg-[var(--color-primary)] py-24 md:py-36"><div className="container grid gap-16 md:grid-cols-2"><h2 className="text-[clamp(3rem,7vw,7rem)] font-bold leading-[0.85] tracking-[-0.06em]">{fa ? <>از صفحه<br />تا زندگی روزمره.</> : <>From screen<br />to everyday.</>}</h2><div className="grid gap-10 sm:grid-cols-2">{steps.map(([n, title, copy]) => <div className="border-t border-black/25 pt-5" key={n}><span className="text-xs">{n}</span><h3 className="mt-8 text-2xl font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-black/60">{copy}</p></div>)}</div></div></section><section className="container py-24 md:py-36"><div className="grid gap-10 md:grid-cols-[1fr_2fr]"><span className="text-xs uppercase tracking-[0.18em] text-black/45">{fa ? "ارتباط با ما" : "Get in touch"}</span><div><h2 className="text-[clamp(3rem,7vw,7rem)] font-bold leading-[0.9] tracking-[-0.06em]">{fa ? "ایده‌ای داری که ارزش پوشیدن دارد؟" : "Have an idea worth wearing?"}</h2><a className="mt-10 inline-block border-b border-black pb-2 text-lg" href="mailto:hello@avoocado.studio">hello@avoocado.studio ↗</a></div></div></section><SiteFooter /></main>;
}
