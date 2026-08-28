export default function CustomizeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="customizer-route">
            {children}
            <style>{`
                .customizer-route section > div > div[style*="clip-path"]::before,
                .customizer-route section > div > div[style*="clip-path"]::after {
                    opacity: 0;
                    pointer-events: none;
                    position: absolute;
                    z-index: 2;
                    transition: opacity 240ms ease;
                }

                .customizer-route:has(fieldset:nth-child(4) button:nth-child(2)[aria-pressed="true"])
                section > div > div[style*="clip-path"]::before {
                    content: "";
                    top: 17%;
                    left: 25%;
                    width: 50%;
                    height: 1px;
                    background: rgb(0 0 0 / 18%);
                    box-shadow: 0 7px 12px rgb(0 0 0 / 6%);
                    opacity: 1;
                }

                .customizer-route:has(fieldset:nth-child(4) button:nth-child(2)[aria-pressed="true"])
                section > div > div[style*="clip-path"]::after {
                    content: "AVOOCADO / BACK";
                    top: 9%;
                    left: 50%;
                    translate: -50% 0;
                    font-size: 8px;
                    font-weight: 500;
                    letter-spacing: .14em;
                    color: rgb(0 0 0 / 40%);
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}
