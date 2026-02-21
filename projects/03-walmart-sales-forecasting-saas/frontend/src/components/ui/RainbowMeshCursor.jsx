import { useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * RainbowMeshCursor — Global mouse-tracking gradient effect.
 * Three dynamic blobs:
 *  - Primary blob:  tracks the cursor via smooth lerp (7%)
 *  - Ambient blob:  drifts slowly in the lower-left area
 *  - Accent blob:   drifts in the upper-right area
 *
 * Light mode uses warm, deeply-saturated colors so the effect is
 * unmissable on white/light-grey backgrounds.
 * Dark mode uses soft blues/purples to avoid visual fatigue.
 */
export default function RainbowMeshCursor() {
    const { isDark } = useTheme();
    const blobRef = useRef(null);
    const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const smooth = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const rafRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };

        window.addEventListener("mousemove", handleMouseMove);

        const animate = () => {
            smooth.current.x += (mouse.current.x - smooth.current.x) * 0.07;
            smooth.current.y += (mouse.current.y - smooth.current.y) * 0.07;

            if (blobRef.current) {
                blobRef.current.style.transform = `translate(${smooth.current.x - 400}px, ${smooth.current.y - 400}px)`;
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // ── Light-mode colors: warm vivid palette (fuchsia, sky, violet, amber)
    // ── Dark-mode colors: soft cool palette (blue, purple, cyan)
    const primaryBg = isDark
        ? "radial-gradient(circle at center, rgba(74,158,255,0.22) 0%, rgba(183,148,246,0.14) 35%, rgba(0,217,255,0.08) 60%, transparent 80%)"
        : "radial-gradient(circle at center, rgba(217,70,239,0.55) 0%, rgba(99,102,241,0.40) 35%, rgba(14,165,233,0.25) 60%, transparent 82%)";

    const ambientBg = isDark
        ? "radial-gradient(circle at center, rgba(74,222,128,0.09) 0%, rgba(74,158,255,0.06) 50%, transparent 80%)"
        : "radial-gradient(circle at center, rgba(245,158,11,0.45) 0%, rgba(239,68,68,0.30) 45%, transparent 80%)";

    const accentBg = isDark
        ? "radial-gradient(circle at center, rgba(183,148,246,0.12) 0%, rgba(74,158,255,0.08) 60%, transparent 80%)"
        : "radial-gradient(circle at center, rgba(16,185,129,0.40) 0%, rgba(6,182,212,0.30) 50%, transparent 80%)";

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
            }}
        >
            {/* ── Primary cursor-tracking blob ── */}
            <div
                ref={blobRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '800px',
                    height: '800px',
                    borderRadius: '50%',
                    background: primaryBg,
                    filter: 'blur(55px)',
                    willChange: 'transform',
                    pointerEvents: 'none',
                }}
            />

            {/* ── Ambient bottom-left blob ── */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '-60px',
                    left: '-60px',
                    width: '750px',
                    height: '750px',
                    borderRadius: '50%',
                    background: ambientBg,
                    filter: 'blur(75px)',
                    pointerEvents: 'none',
                    animation: 'rmesh-drift-a 22s ease-in-out infinite alternate',
                }}
            />

            {/* ── Accent top-right blob ── */}
            <div
                style={{
                    position: 'absolute',
                    top: '-60px',
                    right: '-60px',
                    width: '700px',
                    height: '700px',
                    borderRadius: '50%',
                    background: accentBg,
                    filter: 'blur(75px)',
                    pointerEvents: 'none',
                    animation: 'rmesh-drift-b 18s ease-in-out infinite alternate-reverse',
                }}
            />

            <style>{`
                @keyframes rmesh-drift-a {
                    from { transform: translate(0px,  0px) scale(1);   }
                    to   { transform: translate(80px, 60px) scale(1.1); }
                }
                @keyframes rmesh-drift-b {
                    from { transform: translate(0px,   0px) scale(1);   }
                    to   { transform: translate(-70px, 50px) scale(1.08); }
                }
            `}</style>
        </div>
    );
}
