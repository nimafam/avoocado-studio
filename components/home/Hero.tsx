export function Hero() {
    return (
        <section className="relative flex h-[100svh] items-center">

            <div className="container relative z-10 pt-24">

                <div className="max-w-5xl">

                    <span
                        className="
              mb-8
              block
              text-sm
              font-medium
              uppercase
              tracking-[0.2em]
              text-[var(--color-primary)]
            "
                    >
                        Avoocado / Original Apparel
                    </span>

                    <h1
                        className="
              text-[clamp(4rem,10vw,10rem)]
              font-bold
              leading-[0.82]
              tracking-[-0.065em]
            "
                    >
                        Wear
                        <br />

                        something
                        <br />

                        <span className="text-[var(--color-primary)]">
                            different.
                        </span>
                    </h1>

                </div>

                <div className="mt-14 flex items-end justify-between">

                    <p
                        className="
              max-w-sm
              text-base
              leading-7
              text-[var(--color-text-muted)]
            "
                    >
                        Original designs inspired by games,
                        art, culture and everything we love.
                    </p>

                    <div
                        className="
              hidden
              items-center
              gap-3
              text-sm
              md:flex
            "
                    >
                        <span>Scroll to explore</span>
                        <span className="text-xl">↓</span>
                    </div>

                </div>

            </div>

        </section>
    );
}
