/**
 * StatsCard3D Component
 * 3D tilt card with glassmorphism and mouse tracking
 */

import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const StatsCard3D = ({ icon: Icon, title, value, trend, trendText, delay = 0 }) => {
    const cardRef = useRef(null);
    const innerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current || !innerRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        innerRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
        if (!innerRef.current) return;
        innerRef.current.style.transform = 'rotateX(0) rotateY(0)';
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="perspective-1000"
        >
            <div
                ref={innerRef}
                className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl transition-transform duration-600 ease-out preserve-3d"
            >
                <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${Icon.gradient} flex items-center justify-center shadow-lg ${Icon.shadow}`}>
                        <Icon.component className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{title}</p>
                        <p className="text-3xl font-display font-bold text-slate-800">{value}</p>
                    </div>
                </div>
                {trend && (
                    <div className="mt-4 flex items-center space-x-2">
                        <span className={`flex items-center text-sm font-medium ${trend.color}`}>
                            <trend.icon className="w-4 h-4 mr-1" />
                            {trend.value}
                        </span>
                        <span className="text-sm text-slate-400">{trendText}</span>
                    </div>
                )}
            </div>

            <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
        </motion.div>
    );
};

export default StatsCard3D;
