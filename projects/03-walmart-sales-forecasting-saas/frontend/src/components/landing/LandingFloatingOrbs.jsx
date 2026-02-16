import React, { useEffect, useRef } from 'react';

/**
 * LandingFloatingOrbs - Animated floating orbs background for landing page
 * Light mode version with subtle, professional animations
 */
const LandingFloatingOrbs = ({ count = 5, className = '' }) => {
    const canvasRef = useRef(null);
    const orbsRef = useRef([]);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Set canvas size
        const updateSize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        updateSize();
        window.addEventListener('resize', updateSize);

        // Initialize orbs with light mode colors
        const colors = [
            'rgba(59, 130, 246, 0.15)',  // primary-500
            'rgba(99, 102, 241, 0.12)',  // secondary-500
            'rgba(59, 130, 246, 0.1)',   // primary-500 lighter
            'rgba(16, 185, 129, 0.1)',   // success-500
            'rgba(99, 102, 241, 0.08)',  // secondary-500 lighter
        ];

        orbsRef.current = Array.from({ length: count }, (_, i) => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 80 + Math.random() * 120,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            color: colors[i % colors.length],
        }));

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            orbsRef.current.forEach((orb) => {
                // Update position
                orb.x += orb.dx;
                orb.y += orb.dy;

                // Bounce off edges
                if (orb.x + orb.radius > canvas.width || orb.x - orb.radius < 0) {
                    orb.dx *= -1;
                }
                if (orb.y + orb.radius > canvas.height || orb.y - orb.radius < 0) {
                    orb.dy *= -1;
                }

                // Draw orb with radial gradient
                const gradient = ctx.createRadialGradient(
                    orb.x, orb.y, 0,
                    orb.x, orb.y, orb.radius
                );
                gradient.addColorStop(0, orb.color);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', updateSize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [count]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 pointer-events-none ${className}`}
            style={{
                mixBlendMode: 'normal',
                opacity: 0.6
            }}
        />
    );
};

export default LandingFloatingOrbs;
