"use client";

import { useState } from "react";

type Fit = "loose" | "boxy";
type Side = "front" | "back";
type Placement = "center" | "chest" | "large" | "lower";

const colors = [
    { name: "Bone", value: "#e9e3d5" },
    { name: "Black", value: "#171717" },
    { name: "Avocado", value: "#d7ff46" },
    { name: "Clay", value: "#b8674b" },
    { name: "Ocean", value: "#65899b" },
];

const designs = [
    { name: "Meeple Society", mark: "M", color: "#d7ff46" },
    { name: "Critical Roll", mark: "20", color: "#f3c64e" },
    { name: "Damavand Lines", mark: "D", color: "#b9d1c3" },
    { name: "Everyday Icon", mark: "E", color: "#ff775f" },
];

const placements: { id: Placement; label: string; position: string }[] = [
    { id: "center", label: "Center", position: "top-[34%] left-1/2 size-[23%] -translate-x-1/2" },
    { id: "chest", label: "Left chest", position: "top-[30%] left-[31%] size-[12%]" },
    { id: "large", label: "Large center", position: "top-[26%] left-1/2 size-[38%] -translate-x-1/2" },
    { id: "lower", label: "Lower center", position: "top-[53%] left-1/2 size-[20%] -translate-x-1/2" },
];

function ChoiceButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
    return <button type="button" aria-pressed={active} onClick={onClick} className={`border px-4 py-3 text-sm transition ${active ? "border-black bg-black text-white" : "border-black/20 hover:border-black"}`}>{children}</button>;
}

export function TShirtCustomizer() {
    const [fit, setFit] = useState<Fit>("loose");
    const [color, setColor] = useState(colors[0]);
    const [side, setSide] = useState<Side>("front");
    const [placement, setPlacement] = useState<Placement>("center");
    const [design, setDesign] = useState(designs[0]);
    const activePlacement = placements.find((item) => item.id === placement)!;

    return (
        <div className="grid min-h-[calc(100svh-112px)] lg:grid-cols-[1.35fr_0.65fr]">
            <section className="relative flex min-h-[620px] items-center justify-center overflow-hidden bg-[#d8d5ce] p-6 md:min-h-[760px] md:p-12">
                <div className="absolute left-6 top-6 flex gap-2 text-xs font-medium uppercase tracking-[0.15em] text-black/45"><span>Live preview</span><span>•</span><span>{side}</span></div>
                <div className={`relative transition-[width] duration-500 ease-[var(--ease-standard)] ${fit === "loose" ? "w-[min(92%,680px)]" : "w-[min(82%,600px)]"}`}>
                    <div
                        className={`relative aspect-[1/1.08] drop-shadow-[0_26px_30px_rgba(0,0,0,0.15)] transition-colors duration-300 ${fit === "boxy" ? "scale-y-[0.92]" : ""}`}
                        style={{ backgroundColor: color.value, clipPath: fit === "loose" ? "polygon(25% 7%, 39% 1%, 61% 1%, 75% 7%, 100% 24%, 87% 43%, 76% 34%, 80% 100%, 20% 100%, 24% 34%, 13% 43%, 0 24%)" : "polygon(23% 7%, 39% 1%, 61% 1%, 77% 7%, 100% 22%, 86% 42%, 75% 34%, 78% 100%, 22% 100%, 25% 34%, 14% 42%, 0 22%)" }}
                    >
                        <div className={`absolute left-1/2 top-[1%] h-[9%] w-[19%] -translate-x-1/2 rounded-b-full border-b-[10px] border-black/15 ${side === "back" ? "h-[5%] w-[15%]" : ""}`} />
                        <div className={`absolute flex items-center justify-center rounded-full bg-black font-bold leading-none text-white shadow-sm transition-all duration-500 ${activePlacement.position}`} style={{ backgroundColor: design.color, color: "#111" }}>
                            <span className={placement === "chest" ? "text-[clamp(1rem,3vw,2rem)]" : "text-[clamp(2rem,7vw,6rem)]"}>{design.mark}</span>
                        </div>
                    </div>
                    <div className="mt-7 text-center"><span className="text-sm font-medium">{design.name}</span><span className="mx-3 text-black/25">/</span><span className="text-sm text-black/45">{fit} · {color.name} · {side}</span></div>
                </div>
            </section>

            <aside className="border-l border-black/15 bg-[var(--color-background)] px-6 py-10 md:px-10 lg:max-h-[calc(100svh-112px)] lg:overflow-y-auto">
                <div className="mb-10"><span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-primary)]">Avoocado Custom Lab</span><h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] md:text-5xl">Build your tee.</h1><p className="mt-4 text-sm leading-6 text-black/50">Try our existing artwork on different fits, colors and print positions.</p></div>
                <div className="space-y-9">
                    <fieldset><legend className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-black/45">01 / Choose artwork</legend><div className="grid grid-cols-2 gap-2">{designs.map((item) => <ChoiceButton active={design.name === item.name} onClick={() => setDesign(item)} key={item.name}>{item.name}</ChoiceButton>)}</div></fieldset>
                    <fieldset><legend className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-black/45">02 / T-shirt style</legend><div className="grid grid-cols-2 gap-2"><ChoiceButton active={fit === "loose"} onClick={() => setFit("loose")}>Loose fit</ChoiceButton><ChoiceButton active={fit === "boxy"} onClick={() => setFit("boxy")}>Boxy fit</ChoiceButton></div></fieldset>
                    <fieldset><legend className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-black/45">03 / Color — {color.name}</legend><div className="flex flex-wrap gap-3">{colors.map((item) => <button type="button" onClick={() => setColor(item)} aria-label={`Choose ${item.name}`} aria-pressed={color.name === item.name} className={`size-10 rounded-full border-2 transition-transform hover:scale-110 ${color.name === item.name ? "scale-110 border-black ring-2 ring-black/20 ring-offset-2" : "border-black/15"}`} style={{ backgroundColor: item.value }} key={item.name} />)}</div></fieldset>
                    <fieldset><legend className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-black/45">04 / Print side</legend><div className="grid grid-cols-2 gap-2"><ChoiceButton active={side === "front"} onClick={() => setSide("front")}>Front</ChoiceButton><ChoiceButton active={side === "back"} onClick={() => setSide("back")}>Back</ChoiceButton></div></fieldset>
                    <fieldset><legend className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-black/45">05 / Artwork placement</legend><div className="grid grid-cols-2 gap-2">{placements.map((item) => <ChoiceButton active={placement === item.id} onClick={() => setPlacement(item.id)} key={item.id}>{item.label}</ChoiceButton>)}</div></fieldset>
                </div>
                <div className="mt-10 border-t border-black/15 pt-7"><div className="mb-5 flex justify-between text-sm"><span>Custom studio tee</span><span className="font-medium">$46</span></div><button type="button" className="w-full bg-[var(--color-primary)] py-5 text-sm font-medium transition hover:bg-black hover:text-white">Save this combination</button><p className="mt-3 text-center text-xs text-black/40">Preview colors may differ slightly from the final print.</p></div>
            </aside>
        </div>
    );
}
