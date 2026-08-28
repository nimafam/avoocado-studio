"use client";

import Image from "next/image";
import { useState } from "react";

type Side = "front" | "back";
type Fit = "loose" | "boxy";
type Placement = "center" | "chest" | "large" | "lower";

const colors = [
    ["Grey", "#737474", "none"],
    ["Bone", "#d8ccb2", "sepia(.55) saturate(.55) brightness(1.15)"],
    ["Sage", "#667764", "sepia(.45) saturate(.8) hue-rotate(62deg) brightness(.92)"],
    ["Clay", "#985e4e", "sepia(.7) saturate(1.25) hue-rotate(325deg) brightness(.9)"],
    ["Navy", "#34475b", "sepia(.25) saturate(1.5) hue-rotate(165deg) brightness(.72)"],
] as const;
const designs = [
    ["Meeple Society", "M", "#d7ff46"],
    ["Critical Roll", "20", "#f3c64e"],
    ["Damavand Lines", "D", "#b9d1c3"],
    ["Everyday Icon", "E", "#ff775f"],
] as const;
const placements = [
    ["center", "Center", "left-1/2 top-[39%] size-[17%] -translate-x-1/2"],
    ["chest", "Left chest", "left-[39%] top-[34%] size-[9%]"],
    ["large", "Large center", "left-1/2 top-[31%] size-[27%] -translate-x-1/2"],
    ["lower", "Lower center", "left-1/2 top-[55%] size-[14%] -translate-x-1/2"],
] as const;

function Option({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
    return <button type="button" aria-pressed={active} onClick={onClick} className={`border px-4 py-3 text-sm transition ${active ? "border-black bg-black text-white" : "border-black/20 hover:border-black"}`}>{children}</button>;
}

export function TShirtSvgCustomizer() {
    const [side, setSide] = useState<Side>("front");
    const [fit, setFit] = useState<Fit>("loose");
    const [color, setColor] = useState(0);
    const [design, setDesign] = useState(0);
    const [placement, setPlacement] = useState<Placement>("center");
    const activePlacement = placements.find(([id]) => id === placement)!;
    const source = side === "front" ? "/models/SVG/Front.svg" : "/models/SVG/Back.svg";

    return <div className="grid min-h-[calc(100svh-112px)] lg:grid-cols-[1.35fr_0.65fr]">
        <section className="relative flex min-h-[620px] items-center justify-center bg-[#efeee9] px-6 pb-28 pt-12 md:min-h-[760px]">
            <div className="absolute left-6 top-6 text-xs font-medium uppercase tracking-[0.15em] text-black/45">Product preview · {side}</div>
            <div className="relative aspect-[4/5] w-full max-w-[560px] overflow-hidden bg-white shadow-[0_24px_70px_rgba(0,0,0,0.07)]">
                <div className={`absolute inset-[5%] transition-transform duration-300 ${fit === "boxy" ? "scale-x-110 scale-y-[0.92]" : "scale-100"}`}>
                    <Image key={source} src={source} alt={`${side} view of ${fit} T-shirt`} fill unoptimized priority sizes="(max-width: 1024px) 80vw, 560px" className="object-contain transition-[filter] duration-300" style={{ filter: colors[color][2] }} />
                </div>
                <div className={`pointer-events-none absolute z-10 flex items-center justify-center rounded-full font-bold leading-none text-black shadow-md transition-all duration-300 ${activePlacement[2]}`} style={{ backgroundColor: designs[design][2] }}><span className={placement === "chest" ? "text-[clamp(.7rem,1.5vw,1.2rem)]" : "text-[clamp(1.5rem,4vw,3.5rem)]"}>{designs[design][1]}</span></div>
            </div>
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 overflow-hidden rounded-full border border-black/15 bg-white p-1 shadow-sm">
                <button type="button" onClick={() => setSide("front")} className={`min-w-28 rounded-full px-6 py-3 text-sm transition ${side === "front" ? "bg-black text-white" : "hover:bg-black/5"}`}>Front</button>
                <button type="button" onClick={() => setSide("back")} className={`min-w-28 rounded-full px-6 py-3 text-sm transition ${side === "back" ? "bg-black text-white" : "hover:bg-black/5"}`}>Back</button>
            </div>
        </section>

        <aside className="border-l border-black/15 bg-[var(--color-background)] px-6 py-10 md:px-10 lg:max-h-[calc(100svh-112px)] lg:overflow-y-auto">
            <div className="mb-9"><span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-primary)]">Avoocado Custom Lab</span><h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] md:text-5xl">Build your tee.</h1><p className="mt-4 text-sm leading-6 text-black/50">Preview the supplied vector model from the front or back and adjust your preferred configuration.</p></div>
            <div className="space-y-8">
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">01 / Artwork</legend><div className="grid grid-cols-2 gap-2">{designs.map((item, index) => <Option active={design === index} onClick={() => setDesign(index)} key={item[0]}>{item[0]}</Option>)}</div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">02 / T-shirt style</legend><div className="grid grid-cols-2 gap-2"><Option active={fit === "loose"} onClick={() => setFit("loose")}>Loose fit</Option><Option active={fit === "boxy"} onClick={() => setFit("boxy")}>Boxy fit</Option></div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">03 / Color — {colors[color][0]}</legend><div className="flex flex-wrap gap-3">{colors.map((item, index) => <button type="button" onClick={() => setColor(index)} aria-label={`Choose ${item[0]}`} aria-pressed={color === index} className={`size-10 rounded-full border-2 transition-transform hover:scale-110 ${color === index ? "scale-110 border-black ring-2 ring-black/20 ring-offset-2" : "border-black/15"}`} style={{ backgroundColor: item[1] }} key={item[0]} />)}</div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">04 / Print side</legend><div className="grid grid-cols-2 gap-2"><Option active={side === "front"} onClick={() => setSide("front")}>Front</Option><Option active={side === "back"} onClick={() => setSide("back")}>Back</Option></div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">05 / Placement</legend><div className="grid grid-cols-2 gap-2">{placements.map((item) => <Option active={placement === item[0]} onClick={() => setPlacement(item[0])} key={item[0]}>{item[1]}</Option>)}</div></fieldset>
            </div>
            <div className="mt-9 border-t border-black/15 pt-6"><div className="mb-5 flex justify-between text-sm"><span>Custom studio tee</span><span className="font-medium">$46</span></div><button type="button" className="w-full bg-[var(--color-primary)] py-5 text-sm font-medium transition hover:bg-black hover:text-white">Save this combination</button></div>
        </aside>
    </div>;
}
