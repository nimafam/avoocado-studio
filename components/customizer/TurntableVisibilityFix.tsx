export function TurntableVisibilityFix() {
    return <style>{`
        .customizer-route img[src*="tshirt-turntable-"] {
            display: block !important;
            width: 800% !important;
            max-width: none !important;
            height: 200% !important;
            top: -34% !important;
            bottom: auto !important;
            object-fit: fill !important;
            opacity: 1 !important;
            z-index: 1;
        }

        .customizer-route section div:has(> img[src*="tshirt-turntable-"]) > div:not(.left-1\\/2) {
            z-index: 2;
        }
    `}</style>;
}
