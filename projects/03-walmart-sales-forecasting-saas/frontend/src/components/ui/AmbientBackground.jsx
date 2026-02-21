import React from 'react';
import { motion } from 'framer-motion';

const AmbientBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-gray-50">
            {/* Animated Gradient Orbs */}
            <motion.div
                className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full blur-[80px] opacity-40 mix-blend-multiply"
                style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)' }}
                animate={{
                    x: [0, 30, -20, 0],
                    y: [0, -30, 20, 0],
                    scale: [1, 1.1, 0.9, 1]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-[80px] opacity-40 mix-blend-multiply"
                style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)' }}
                animate={{
                    x: [0, -40, 30, 0],
                    y: [0, 50, -30, 0],
                    scale: [1, 0.9, 1.1, 1]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            />

            <motion.div
                className="absolute top-[50%] left-[30%] w-[300px] h-[300px] rounded-full blur-[80px] opacity-30 mix-blend-multiply"
                style={{ background: 'radial-gradient(circle, rgba(244, 114, 182, 0.2) 0%, transparent 70%)' }}
                animate={{
                    x: [0, 60, -50, 0],
                    y: [0, -40, 60, 0],
                    scale: [1, 1.2, 0.8, 1]
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
            />

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.4]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                    maskImage: 'linear-gradient(to bottom, white 40%, transparent 100%)'
                }}
            />

            {/* Noise Overlay for Texture */}
            <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
            />
        </div>
    );
};

export default AmbientBackground;
