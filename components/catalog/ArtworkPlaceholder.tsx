type ArtworkPlaceholderProps = {
    tone: string;
    mark: string;
    index?: string;
    compact?: boolean;
};

export function ArtworkPlaceholder({ tone, mark, index, compact = false }: ArtworkPlaceholderProps) {
    return (
        <div className="group/art relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: tone }}>
            {index && <span className="absolute left-5 top-5 z-10 text-xs font-medium">{index}</span>}
            <div className="absolute inset-[13%] rounded-[48%] border border-black/20 transition-transform duration-700 ease-[var(--ease-standard)] group-hover/art:rotate-6 group-hover/art:scale-105" />
            <div className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black font-bold leading-none text-white transition-transform duration-700 ease-[var(--ease-standard)] group-hover/art:-rotate-6 group-hover/art:scale-110 ${compact ? "size-[42%] text-[clamp(3rem,7vw,6rem)]" : "size-[46%] text-[clamp(4rem,9vw,9rem)]"}`}>
                {mark}
            </div>
            <span className="absolute bottom-5 right-5 text-[10px] font-medium uppercase tracking-[0.16em] text-black/55">Artwork soon</span>
        </div>
    );
}
