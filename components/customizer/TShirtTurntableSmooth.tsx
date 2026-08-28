"use client";

import { useRef, useState } from "react";

type Fit = "loose" | "boxy";
type PrintSide = "front" | "back";
type Placement = "center" | "chest" | "large" | "lower";

const fits = [
    { id: "loose" as Fit, label: "Loose fit", source: "/models/tshirt-turntable-loose.png" },
    { id: "boxy" as Fit, label: "Boxy fit", source: "/models/tshirt-turntable-boxy.png" },
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
    { id: "center" as Placement, label: "Center", className: "top-[39%] left-1/2 size-[15%] -translate-x-1/2" },
    { id: "chest" as Placement, label: "Left chest", className: "top-[35%] left-[41%] size-[8%]" },
    { id: "large" as Placement, label: "Large center", className: "top-[34%] left-1/2 size-[23%] -translate-x-1/2" },
    { id: "lower" as Placement, label: "Lower center", className: "top-[53%] left-1/2 size-[13%] -translate-x-1/2" },
];
const labels = ["Front", "Front ¾", "Right", "Back ¾", "Back", "Back ¾", "Left", "Front ¾"];

function Option({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
    return <button type="button" aria-pressed={active} onClick={onClick} className={`border px-4 py-3 text-sm transition ${active ? "border-black bg-black text-white" : "border-black/20 hover:border-black"}`}>{children}</button>;
}

function SpriteFrame({ source, frame, filter, visible }: { source: string; frame: number; filter: string; visible: boolean }) {
    return <img src={source} alt="" draggable={false} className={`pointer-events-none absolute inset-y-0 left-0 h-full w-[800%] max-w-none object-fill transition-opacity duration-200 ease-out ${visible ? "opacity-100" : "opacity-0"}`} style={{ transform: `translateX(-${frame * 12.5}%)`, filter }} />;
}

export function TShirtTurntableSmooth() {
    const [fit, setFit] = useState<Fit>("loose");
    const [frame, setFrame] = useState(0);
    const [previousFrame, setPreviousFrame] = useState(0);
    const [blendIn, setBlendIn] = useState(true);
    const [color, setColor] = useState(colors[0]);
    const [printSide, setPrintSide] = useState<PrintSide>("front");
    const [placement, setPlacement] = useState<Placement>("center");
    const [design, setDesign] = useState(designs[0]);
    const drag = useRef<{ x: number; frame: number; lastStep: number } | null>(null);
    const wheelLocked = useRef(false);
    const activeFit = fits.find((item) => item.id === fit)!;
    const activePlacement = placements.find((item) => item.id === placement)!;
    const designVisible = printSide === "front" ? [0, 1, 7].includes(frame) : [3, 4, 5].includes(frame);

    function goToFrame(next: number) {
        const normalized = ((next % 8) + 8) % 8;
        if (normalized === frame) return;
        setPreviousFrame(frame);
        setBlendIn(false);
        setFrame(normalized);
        requestAnimationFrame(() => requestAnimationFrame(() => setBlendIn(true)));
    }

    function step(direction: number) { goToFrame(frame + direction); }

    return <div className="grid min-h-[calc(100svh-112px)] lg:grid-cols-[1.35fr_0.65fr]">
        <section className="relative flex min-h-[620px] touch-none flex-col items-center justify-center overflow-hidden bg-[#efeee9] px-5 py-10 md:min-h-[760px] md:px-12">
            <div className="absolute left-6 top-6 z-20 flex gap-2 text-xs font-medium uppercase tracking-[0.15em] text-black/45"><span>360° preview</span><span>•</span><span>{labels[frame]}</span></div>
            <div
                className="relative aspect-[3/2] w-full max-w-[850px] cursor-ew-resize select-none overflow-hidden bg-white"
                onPointerDown={(event) => { drag.current = { x: event.clientX, frame, lastStep: 0 }; event.currentTarget.setPointerCapture(event.pointerId); }}
                onPointerMove={(event) => { if (!drag.current) return; const stepCount = Math.trunc((drag.current.x - event.clientX) / 38); if (stepCount !== drag.current.lastStep) { drag.current.lastStep = stepCount; goToFrame(drag.current.frame + stepCount); } }}
                onPointerUp={(event) => { drag.current = null; event.currentTarget.releasePointerCapture(event.pointerId); }}
                onPointerCancel={() => { drag.current = null; }}
                onWheel={(event) => { event.preventDefault(); if (wheelLocked.current) return; const amount = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY; if (Math.abs(amount) < 4) return; wheelLocked.current = true; step(amount > 0 ? 1 : -1); window.setTimeout(() => { wheelLocked.current = false; }, 140); }}
                aria-label={`${activeFit.label}, ${labels[frame]} view. Drag or scroll to rotate.`}
            >
                <SpriteFrame source={activeFit.source} frame={previousFrame} filter={color.filter} visible={!blendIn} />
                <SpriteFrame source={activeFit.source} frame={frame} filter={color.filter} visible={blendIn} />
                <div className={`pointer-events-none absolute z-10 flex items-center justify-center rounded-full font-bold leading-none text-black shadow-md transition-all duration-200 ${activePlacement.className} ${designVisible ? "opacity-100" : "opacity-0"}`} style={{ backgroundColor: design.color }}><span className={placement === "chest" ? "text-[clamp(.75rem,2vw,1.5rem)]" : "text-[clamp(1.5rem,5vw,4.5rem)]"}>{design.mark}</span></div>
            </div>
            <div className="mt-7 w-full max-w-[680px]"><input aria-label="Rotate T-shirt" type="range" min="0" max="7" step="1" value={frame} onChange={(event) => goToFrame(Number(event.target.value))} className="w-full accent-black" /><div className="mt-3 flex justify-between text-[10px] font-medium uppercase tracking-[0.14em] text-black/40"><span>Scroll / drag left</span><span>{frame + 1} / 8</span><span>Scroll / drag right</span></div></div>
        </section>

        <aside className="border-l border-black/15 bg-[var(--color-background)] px-6 py-10 md:px-10 lg:max-h-[calc(100svh-112px)] lg:overflow-y-auto">
            <div className="mb-9"><span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-primary)]">Avoocado Custom Lab</span><h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] md:text-5xl">Build your tee.</h1><p className="mt-4 text-sm leading-6 text-black/50">Scroll or drag the preview one frame at a time, then choose the fit, color and print position.</p></div>
            <div className="space-y-8">
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">01 / Artwork</legend><div className="grid grid-cols-2 gap-2">{designs.map((item) => <Option active={design.name === item.name} onClick={() => setDesign(item)} key={item.name}>{item.name}</Option>)}</div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">02 / T-shirt style</legend><div className="grid grid-cols-2 gap-2">{fits.map((item) => <Option active={fit === item.id} onClick={() => setFit(item.id)} key={item.id}>{item.label}</Option>)}</div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">03 / Color — {color.name}</legend><div className="flex flex-wrap gap-3">{colors.map((item) => <button type="button" onClick={() => setColor(item)} aria-label={`Choose ${item.name}`} aria-pressed={color.name === item.name} className={`size-10 rounded-full border-2 transition-transform hover:scale-110 ${color.name === item.name ? "scale-110 border-black ring-2 ring-black/20 ring-offset-2" : "border-black/15"}`} style={{ backgroundColor: item.value }} key={item.name} />)}</div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">04 / Print side</legend><div className="grid grid-cols-2 gap-2"><Option active={printSide === "front"} onClick={() => { setPrintSide("front"); goToFrame(0); }}>Front</Option><Option active={printSide === "back"} onClick={() => { setPrintSide("back"); goToFrame(4); }}>Back</Option></div></fieldset>
                <fieldset><legend className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-black/45">05 / Placement</legend><div className="grid grid-cols-2 gap-2">{placements.map((item) => <Option active={placement === item.id} onClick={() => setPlacement(item.id)} key={item.id}>{item.label}</Option>)}</div></fieldset>
            </div>
            <div className="mt-9 border-t border-black/15 pt-6"><div className="mb-5 flex justify-between text-sm"><span>Custom studio tee</span><span className="font-medium">$46</span></div><button type="button" className="w-full bg-[var(--color-primary)] py-5 text-sm font-medium transition hover:bg-black hover:text-white">Save this combination</button></div>
        </aside>
    </div>;
}
