import Link from "next/link";

const featuredProducts = [
    { name: "Meeple Society", collection: "Boardgame", price: "$38", tone: "bg-[#d7ff46]", mark: "M" },
    { name: "Damavand Lines", collection: "Iran Topography", price: "$42", tone: "bg-[#b9d1c3]", mark: "D" },
    { name: "Everyday Icon", collection: "Pop Art", price: "$38", tone: "bg-[#ff775f]", mark: "E" },
];

export function HomeContinuation() {
    return (
        <>
            <section className="bg-black py-24 text-white md:py-36">
                <div className="container grid gap-16 md:grid-cols-[1fr_2fr] md:gap-24">
                    <div className="flex items-start gap-3 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                        <span className="mt-1.5 size-2 rounded-full bg-[var(--color-primary)]" />
                        Our point of view
                    </div>
                    <div>
                        <h2 className="max-w-5xl text-[clamp(3.2rem,7.6vw,8.5rem)] font-bold leading-[0.88] tracking-[-0.06em]">
                            Clothes should say something before you do.
                        </h2>
                        <div className="mt-14 grid gap-8 border-t border-white/20 pt-8 text-white/60 sm:grid-cols-2">
                            <p className="max-w-md text-base leading-7">
                                Avoocado turns the games, places, art and strange little ideas we love into original pieces made to be worn often.
                            </p>
                            <p className="max-w-md text-base leading-7">
                                Designed in our studio, released in small runs and printed with attention to every line, color and detail.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 md:py-36" id="featured-products">
                <div className="container">
                    <div className="mb-14 flex items-end justify-between border-b border-black/15 pb-7 md:mb-20">
                        <div>
                            <span className="mb-4 block text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-primary)]">New in studio</span>
                            <h2 className="text-[clamp(3rem,6vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.055em]">Fresh objects</h2>
                        </div>
                        <Link href="/t-shirts" className="hidden text-sm font-medium sm:block">Shop all ↗</Link>
                    </div>

                    <div className="grid gap-12 md:grid-cols-3 md:gap-5">
                        {featuredProducts.map((product, index) => (
                            <Link href="/t-shirts" className="group" key={product.name}>
                                <div className={`relative aspect-[4/5] overflow-hidden ${product.tone}`}>
                                    <span className="absolute left-5 top-5 text-xs font-medium">0{index + 1}</span>
                                    <div className="absolute inset-[14%] rounded-[48%] border border-black/20 transition-transform duration-700 ease-[var(--ease-standard)] group-hover:rotate-6 group-hover:scale-105" />
                                    <div className="absolute left-1/2 top-1/2 flex size-[44%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black text-[clamp(4rem,9vw,8rem)] font-bold leading-none text-white transition-transform duration-700 ease-[var(--ease-standard)] group-hover:-rotate-6 group-hover:scale-110">
                                        {product.mark}
                                    </div>
                                    <span className="absolute bottom-5 right-5 text-[10px] font-medium uppercase tracking-[0.16em]">Artwork placeholder</span>
                                </div>
                                <div className="mt-5 flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-medium tracking-[-0.025em]">{product.name}</h3>
                                        <p className="mt-1 text-sm text-black/50">{product.collection}</p>
                                    </div>
                                    <span className="text-sm font-medium">{product.price}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-y border-black/15">
                <div className="container grid md:grid-cols-3">
                    {[
                        ["01", "Original by default", "Every graphic starts in the Avoocado studio."],
                        ["02", "Small-run mindset", "Fewer pieces, more care and less ordinary stuff."],
                        ["03", "Made to be lived in", "Comfortable foundations for designs with character."],
                    ].map(([index, title, copy]) => (
                        <div className="border-b border-black/15 py-12 md:border-b-0 md:border-r md:px-10 md:py-16 md:first:pl-0 md:last:border-r-0" key={index}>
                            <span className="text-xs text-black/40">{index}</span>
                            <h3 className="mt-10 text-2xl font-medium tracking-[-0.035em]">{title}</h3>
                            <p className="mt-4 max-w-xs text-sm leading-6 text-black/55">{copy}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="py-6">
                <Link href="/collections" className="group mx-6 flex min-h-[70svh] items-center overflow-hidden rounded-[2rem] bg-[var(--color-primary)] md:mx-10">
                    <div className="container py-20">
                        <span className="text-xs font-medium uppercase tracking-[0.2em]">The full collection</span>
                        <div className="mt-8 flex items-end justify-between gap-8">
                            <h2 className="text-[clamp(4rem,11vw,12rem)] font-bold leading-[0.78] tracking-[-0.07em]">
                                Find your<br />different.
                            </h2>
                            <span className="mb-2 hidden size-24 items-center justify-center rounded-full bg-black text-3xl text-white transition-transform duration-500 group-hover:rotate-45 md:flex">↗</span>
                        </div>
                    </div>
                </Link>
            </section>

            <footer className="bg-black pb-8 pt-24 text-white md:pt-32">
                <div className="container">
                    <div className="grid gap-16 border-b border-white/20 pb-20 md:grid-cols-[2fr_1fr_1fr]">
                        <div>
                            <p className="max-w-lg text-[clamp(2.3rem,4vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.05em]">Good ideas look better in your inbox.</p>
                            <form className="mt-10 flex max-w-xl border-b border-white/40 pb-3">
                                <label className="sr-only" htmlFor="newsletter-email">Email address</label>
                                <input id="newsletter-email" type="email" placeholder="Email address" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-white/40" />
                                <button type="submit" className="text-sm font-medium">Join ↗</button>
                            </form>
                        </div>
                        <div className="flex flex-col items-start gap-4 text-sm">
                            <span className="mb-2 text-xs uppercase tracking-[0.16em] text-white/40">Explore</span>
                            <Link href="/t-shirts">T-Shirts</Link>
                            <Link href="/collections">Collections</Link>
                            <Link href="/about">About</Link>
                        </div>
                        <div className="flex flex-col items-start gap-4 text-sm">
                            <span className="mb-2 text-xs uppercase tracking-[0.16em] text-white/40">Elsewhere</span>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram ↗</a>
                            <a href="mailto:hello@avoocado.studio">Email ↗</a>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6 pt-8 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
                        <span>© 2026 Avoocado Studio</span>
                        <span>Original apparel for curious people.</span>
                    </div>
                    <div className="overflow-hidden pt-12 text-center text-[clamp(4rem,17vw,18rem)] font-bold leading-[0.7] tracking-[-0.08em] text-white">AVOOCADO</div>
                </div>
            </footer>
        </>
    );
}
