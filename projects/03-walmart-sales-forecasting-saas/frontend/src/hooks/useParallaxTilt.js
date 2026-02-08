import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for smooth 3D parallax tilt effect
 * Applies to the container and creates a floating content effect
 */
export const useParallaxTilt = (options = {}) => {
    const {
        maxRotate = 2,      // max tilt in degrees (subtle)
        speed = 0.05,       // lower = smoother
        translateZ = 10,    // content lift amount (subtle)
        enabled = true,     // toggle effect
    } = options;

    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const animationRef = useRef(null);
    const targetRef = useRef({ x: 0, y: 0 });
    const currentRef = useRef({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e) => {
        if (!containerRef.current || !enabled) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        targetRef.current.x = y * maxRotate;
        targetRef.current.y = x * -maxRotate;
    }, [maxRotate, enabled]);

    const handleMouseLeave = useCallback(() => {
        targetRef.current.x = 0;
        targetRef.current.y = 0;
    }, []);

    useEffect(() => {
        if (!enabled) return;

        const container = containerRef.current;
        const content = contentRef.current;

        if (!container) return;

        const animate = () => {
            currentRef.current.x += (targetRef.current.x - currentRef.current.x) * speed;
            currentRef.current.y += (targetRef.current.y - currentRef.current.y) * speed;

            container.style.transform = `
                perspective(1000px)
                rotateX(${currentRef.current.x}deg)
                rotateY(${currentRef.current.y}deg)
            `;

            container.style.transition = 'none';

            if (content) {
                content.style.transform = `translateZ(${translateZ}px)`;
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            // Reset transforms on cleanup
            if (container) {
                container.style.transform = '';
            }
            if (content) {
                content.style.transform = '';
            }
        };
    }, [enabled, speed, translateZ, handleMouseMove, handleMouseLeave]);

    return { containerRef, contentRef };
};

export default useParallaxTilt;
