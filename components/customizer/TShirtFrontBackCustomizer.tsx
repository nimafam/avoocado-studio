"use client";

import Image from "next/image";
import { useState } from "react";

type Fit = "loose" | "boxy";
type Side = "front" | "back";
type Placement = "center" | "chest" | "large" | "lower";

const fits = [
    { id: "loose" as Fit, label: "Loose fit" },
    { id: "boxy" as Fit, label: "Boxy fit" },
];
const colors = [
    { name: "Grey", value: "#777777", filter: "none" },
    { name: "Bone", value: "#d8ccb2", filter: "sepia(.5) saturate(.55) brightness(1.16)" },
    { name: "Sage", value: "#667764", filter: "sepia(.45) saturate(.75) hue-rotate(62deg) brightness(.92)" },
    { name: "Clay", value: "#985e4e", filter: "sepia(.7) saturate(1.2) hue-rotate(325deg) brightness(.9)" },
    { name: "Navy", value: "#34475b", filter: "sepia(.25) saturate(1.4) hue-rotate(165deg) brightness(.7)" },
];
const designs = [
    { name: "Meeple Society", mark: "M", color: "#d7ff46" },
    { name: "Critical Roll", mark: "20", color: "#f3c64e" },
    { name: "Damavand Lines", mark: "D", color: "#b9d1c3" },
    { name: "Everyday Icon", mark: "E", color: "#ff775f" },
];
const placements = [
    { id: "center" as Placement, label: "Center", className: "top-[39%] left-1/2 size-[18%] -translate-x-1/2" },
    { id: "chest" as Placement, label: "Left chest", className: "top-[34%] left-[38%] size-[9%]" },
    { id: "large" as Placement, label: "Large center", className: "top-[31%] left-1/2 size-[28%] -translate-x-1/2" },
    { id: "lower" as Placement, label: "Lower center", className: "top-[54%] left-1/2 size-[15%] -translate-x-1/2" },
];

function Option({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
    return <button type="button" aria-pressed={active} onClick={onClick} className={`border px-4 py-3 text-sm transition ${active ? "border-black bg-black text-white" : "border-black/20 hover:border-black"}`}>{children}</button>;
}

export function TShirtFrontBackCustomizer() {
    const [fit, setFit] = useState<Fit>("loose");
    const [side, setSide] = useState<Side>("front");
    const [color, setColor] = useState(colors[0]);
    const [placement, setPlacement] = useState<Placement>("center");
    const [design, setDesign] = useState(designs[0]);
    const activePlacement = placements.find((item) => item.id === placement)!;
    const frame = side === "front" ? "01" : "05";
    const source = `/models/turntable/${fit}-${frame}.png`;

    return <div className="grid min-h-[calc(100svh-112px)] lg:grid-cols-[1.35fr_0.65fr]">
        <section className="relative flex min-h-[620px] items-center justify-center bg-[#efeee9] px-6 py-12 md:min-h-[760px]">
            <div className="absolute left-6 top-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-black/45"><span>Product preview</span><span>•</span><span>{side}</span></div>
            <div className="relative aspect-[3/4] w-full max-w-[520px] overflow-hidden bg-white shadow-[0_24px_70px_rgba(0,0,0,0.07)]">
                <Image key={source} src={source} alt={`${fit} fit T-shirt, ${side} view`} fill priority sizes="(max-width: 1024px) 80vw, 520px" className="object-contain transition-[filter] duration-300" style={{ filter: color.filter }} />
                <div className={`pointer-events-none absolute z-10 flex items-center justify-center rounded-full font-bold leading-none text-black shadow-md transition-all duration-300 ${activePlacement.className}`} style={{ backgroundColor: design.color }}><span className={placement === "chest" ? "text-[clamp(.7rem,1.5vw,1.2rem)]" : "text-[clamp(1.5rem,4vw,3.5rem)]"}>{design.mark}</span></div>
            </div>
            <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 overflow-hidden rounded-full border border-black/15 bg-white p-1 shadow-sm">
                <button type="button" aria-pressed={side === "front"} onClick={() => setSide("front")} className={`min-w-28 rounded-full px-6 py-3 text-sm transition ${side === "front" ? "bg-black text-white" : "hover:bg-black/5"}`}>Front</button>
                <button type="button" aria-pressed={side === "back"} onClick={() => setSide("back")} className={`min-w-28 rounded-full px-6 py-3 text-sm transition ${side === "back" ? "bg-black text-white" : "hover:bg-black/5"}`}>Back</button>
            </div>
        </section>

        <aside className="border-l border-black/15 bg-[var(--color-background)] px-6 py-10 md:px-10 lg:max-h-[calc(100svh-112px)] lg:overflow-y-auto">
            <div className="mb-9"><span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-primary)]">Avoocado Custom Lab</span><h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] md:text-5xl">Build your tee.</h1><p className="mt-4 text-sm leading-6 text-black/50">Choose a fit and inspect the artwork on the front or back before ordering.</p></div>
            <div className="space-y-8">
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">01 / Artwork</legend><div className="grid grid-cols-2 gap-2">{designs.map((item) => <Option active={design.name === item.name} onClick={() => setDesign(item)} key={item.name}>{item.name}</Option>)}</div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">02 / T-shirt style</legend><div className="grid grid-cols-2 gap-2">{fits.map((item) => <Option active={fit === item.id} onClick={() => setFit(item.id)} key={item.id}>{item.label}</Option>)}</div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">03 / Color — {color.name}</legend><div className="flex flex-wrap gap-3">{colors.map((item) => <button type="button" onClick={() => setColor(item)} aria-label={`Choose ${item.name}`} aria-pressed={color.name === item.name} className={`size-10 rounded-full border-2 transition-transform hover:scale-110 ${color.name === item.name ? "scale-110 border-black ring-2 ring-black/20 ring-offset-2" : "border-black/15"}`} style={{ backgroundColor: item.value }} key={item.name} />)}</div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">04 / Print side</legend><div className="grid grid-cols-2 gap-2"><Option active={side === "front"} onClick={() => setSide("front")}>Front</Option><Option active={side === "back"} onClick={() => setSide("back")}>Back</Option></div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">05 / Placement</legend><div className="grid grid-cols-2 gap-2">{placements.map((item) => <Option active={placement === item.id} onClick={() => setPlacement(item.id)} key={item.id}>{item.label}</Option>)}</div></fieldset>
            </div>
            <div className="mt-9 border-t border-black/15 pt-6"><div className="mb-5 flex justify-between text-sm"><span>Custom studio tee</span><span className="font-medium">$46</span></div><button type="button" className="w-full bg-[var(--color-primary)] py-5 text-sm font-medium transition hover:bg-black hover:text-white">Save this combination</button></div>
        </aside>
    </div>;
}
