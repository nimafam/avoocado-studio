export function TurntableStyles() {
    return <style>{`
        .customizer-route section div:has(> img[src*="tshirt-turntable-"]) {
            aspect-ratio: 3 / 4 !important;
            width: min(76vw, 480px) !important;
            flex: none;
        }

        .customizer-route img[src*="tshirt-turntable-"] {
            top: -34% !important;
            bottom: auto !important;
            height: auto !important;
            object-fit: initial !important;
        }

        .customizer-route section div:has(> img[src*="tshirt-turntable-"]) > div.left-1\\/2 {
            transform: translateX(-50%) !important;
        }

        @media (max-width: 640px) {
            .customizer-route section div:has(> img[src*="tshirt-turntable-"]) {
                width: min(88vw, 400px) !important;
            }
        }
    `}</style>;
}
