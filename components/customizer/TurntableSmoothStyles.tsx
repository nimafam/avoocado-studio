export function TurntableSmoothStyles() {
    return <style>{`
        .customizer-route img[src*="tshirt-turntable-"] {
            display: block !important;
            width: 800% !important;
            max-width: none !important;
            height: 200% !important;
            top: -34% !important;
            bottom: auto !important;
            object-fit: fill !important;
            z-index: 1;
        }
    `}</style>;
}
