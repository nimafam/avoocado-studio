"use client";

import { useRef } from "react";
import {
    motion,
    useScroll,
    useTransform,
} from "motion/react";

import { Hero } from "./Hero";
import { FeaturedCollections } from "./FeaturedCollections";
import type { PublicCollection } from "@/lib/catalog/cloudflare-repository";

export function HomeExperience({ collections }: { collections: PublicCollection[] }) {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    /* ─────────────────────────────────────
       PHASE 01 — HERO
    ───────────────────────────────────── */

    const heroOpacity = useTransform(scrollYProgress, (value) => {
        if (value <= 0.24) return 1;
        if (value >= 0.38) return 0;
        return 1 - ((value - 0.24) / 0.14);
    });

    const heroY = useTransform(scrollYProgress, [0.24, 0.38], [0, -72]);

    const heroScale = useTransform(scrollYProgress, [0.24, 0.38], [1, 0.965]);
    const heroPointerEvents = useTransform(
        scrollYProgress,
        (value) => value < 0.38 ? "auto" : "none",
    );

    /* ─────────────────────────────────────
       PHASE 02 — BRAND SURFACE
    ───────────────────────────────────── */

    const circleScale = useTransform(
        scrollYProgress,
        [0, 0.22, 0.46, 0.62],
        [1, 1, 4.65, 4.8],
    );

    const circleX = useTransform(
        scrollYProgress,
        [0.22, 0.46],
        ["0%", "-22%"],
    );

    /*
     * The circle stays visible through the
     * collections reveal so it connects both
     * scenes visually.
     */

    /* ─────────────────────────────────────
       PHASE 03 — COLLECTIONS
    ───────────────────────────────────── */

    const collectionsOpacity = useTransform(scrollYProgress, (value) => {
        if (value <= 0.5) return 0;
        if (value >= 0.6) return 1;
        return (value - 0.5) / 0.1;
    });

    const collectionsY = useTransform(
        scrollYProgress,
        [0.5, 0.64],
        [64, 0],
    );

    const collectionsScale = useTransform(
        scrollYProgress,
        [0.5, 0.64],
        [0.98, 1],
    );
    const collectionsPointerEvents = useTransform(
        scrollYProgress,
        (value) => value < 0.5 ? "none" : "auto",
    );

    return (
        <section
            ref={containerRef}
            className="relative h-[230vh]"
        >
            <div className="sticky top-0 h-[100svh] overflow-hidden">

                {/* Brand transition object */}
                <motion.div
                    aria-hidden="true"
                    style={{
                        scale: circleScale,
                        x: circleX,
                    }}
                    className="
            pointer-events-none
            absolute
            -right-[12vw]
            top-1/2
            z-0
            aspect-square
            w-[55vw]
            -translate-y-1/2
            rounded-full
            bg-[var(--avo-green-light)]
            will-change-transform
          "
                />

                {/* Hero Scene */}
                <motion.div
                    style={{
                        opacity: heroOpacity,
                        y: heroY,
                        scale: heroScale,
                        pointerEvents: heroPointerEvents,
                    }}
                    className="
            absolute
            inset-0
            z-10
            origin-center
            will-change-transform
          "
                >
                    <Hero />
                </motion.div>

                {/* Collections Scene */}
                <motion.div
                    style={{
                        opacity: collectionsOpacity,
                        y: collectionsY,
                        scale: collectionsScale,
                        pointerEvents: collectionsPointerEvents,
                    }}
                    className="
            absolute
            inset-0
            z-20
            origin-center
            will-change-transform
          "
                >
                    <FeaturedCollections collections={collections} />
                </motion.div>

            </div>
        </section>
    );
}
