import React, { useEffect, useRef } from 'react';

const ParticleCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let animationFrameId;

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        // Branded color palette
        const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#3b82f6'];

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 2.5 + 1;
                this.opacity = Math.random() * 0.35 + 0.1;
                this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
                this.pulseOffset = Math.random() * Math.PI * 2;
            }

            update(time) {
                this.x += this.vx;
                this.y += this.vy;
                // Wraparound instead of bounce — smoother
                if (this.x < -10) this.x = width + 10;
                if (this.x > width + 10) this.x = -10;
                if (this.y < -10) this.y = height + 10;
                if (this.y > height + 10) this.y = -10;
                // Breathing opacity
                this.currentOpacity = this.opacity * (0.7 + 0.3 * Math.sin(time * this.pulseSpeed + this.pulseOffset));
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + Math.round(this.currentOpacity * 255).toString(16).padStart(2, '0');
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            const count = Math.min(80, Math.floor((width * height) / 15000));
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        };

        let time = 0;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            time++;

            particles.forEach((p, i) => {
                p.update(time);
                p.draw();

                // Draw connecting lines between close particles
                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x;
                    const dy = p.y - q.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 130) {
                        const alpha = (1 - dist / 130) * 0.12;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        initParticles();
        animate();

        const handleResize = () => {
            resize();
            initParticles();
        };

        window.removeEventListener('resize', resize);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
        />
    );
};

export default ParticleCanvas;
