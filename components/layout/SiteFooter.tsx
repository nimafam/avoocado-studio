import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="bg-black pb-8 pt-20 text-white">
            <div className="container">
                <div className="grid gap-14 border-b border-white/20 pb-16 md:grid-cols-[2fr_1fr_1fr]">
                    <p className="max-w-xl text-[clamp(2.4rem,5vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.05em]">Wear something different.</p>
                    <div className="flex flex-col items-start gap-4 text-sm"><span className="text-xs uppercase tracking-[0.16em] text-white/40">Explore</span><Link href="/t-shirts">T-Shirts</Link><Link href="/collections">Collections</Link><Link href="/about">About</Link></div>
                    <div className="flex flex-col items-start gap-4 text-sm"><span className="text-xs uppercase tracking-[0.16em] text-white/40">Contact</span><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram ↗</a><a href="mailto:hello@avoocado.studio">Email ↗</a></div>
                </div>
                <div className="flex justify-between pt-7 text-xs text-white/45"><span>© 2026 Avoocado Studio</span><Link href="/">Back home ↑</Link></div>
            </div>
        </footer>
    );
}
