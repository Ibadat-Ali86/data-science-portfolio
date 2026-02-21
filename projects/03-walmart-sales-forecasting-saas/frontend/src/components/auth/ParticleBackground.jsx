/**
 * ParticleBackground Component
 * Interactive particle network with connection lines and mouse interaction
 */

import React, { useEffect, useRef } from 'react';

const ParticleBackground = ({ particleCount = 50, connectionDistance = 150 }) => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const animationFrameId = useRef(null);
    const mousePosition = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Particle class
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity * 0.6})`; // Lighter for light mode
                ctx.fill();
            }
        }

        // Initialize particles
        const isMobile = window.innerWidth < 768;
        const count = isMobile ? 20 : particleCount;
        particles.current = Array.from({ length: count }, () => new Particle());

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            particles.current.forEach((particle, i) => {
                particle.update();
                particle.draw();

                // Draw connections
                particles.current.slice(i + 1).forEach(other => {
                    const dx = particle.x - other.x;
                    const dy = particle.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.07 * (1 - distance / connectionDistance)})`; // More subtle for light mode
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                });
            });

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        // Handle mouse move
        const handleMouseMove = (e) => {
            mousePosition.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [particleCount, connectionDistance]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.4 }} // Reduced opacity for light mode
        />
    );
};

export default ParticleBackground;
