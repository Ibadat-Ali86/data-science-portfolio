import { useEffect, useRef } from "react";

/**
 * RainbowMeshCursor — Global mouse-tracking gradient effect.
 * Renders a smooth, blurred radial gradient that follows the cursor.
 * Visible on both light and dark backgrounds.
 */
export default function RainbowMeshCursor() {
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
            // Lerp toward mouse position for a smooth rubber-band effect
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

    return (
        <div
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none overflow-hidden"
            style={{ zIndex: 0 }}
        >
            {/* Main cursor blob */}
            <div
                ref={blobRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '800px',
                    height: '800px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at center, rgba(74,158,255,0.18) 0%, rgba(183,148,246,0.12) 30%, rgba(0,217,255,0.07) 55%, transparent 75%)',
                    filter: 'blur(40px)',
                    willChange: 'transform',
                    pointerEvents: 'none',
                }}
            />
            {/* Secondary ambient halo blob (drifts slower) */}
            <div
                style={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at center, rgba(74,222,128,0.07) 0%, rgba(74,158,255,0.05) 50%, transparent 80%)',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                    animation: 'ambient-drift 20s ease-in-out infinite alternate',
                }}
            />
            {/* Top-right accent blob */}
            <div
                style={{
                    position: 'absolute',
                    top: '-100px',
                    right: '-100px',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at center, rgba(183,148,246,0.1) 0%, rgba(74,158,255,0.06) 60%, transparent 80%)',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                    animation: 'ambient-drift 15s ease-in-out infinite alternate-reverse',
                }}
            />
            <style>{`
                @keyframes ambient-drift {
                    from { transform: translate(0, 0) scale(1); }
                    to { transform: translate(60px, 40px) scale(1.1); }
                }
            `}</style>
        </div>
    );
}
