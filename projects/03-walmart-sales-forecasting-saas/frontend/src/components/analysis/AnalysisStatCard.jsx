import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const AnalysisStatCard = ({ label, value, icon: Icon, color = 'blue', delay = 0 }) => {
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
        innerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
        if (!innerRef.current) return;
        innerRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    };

    // Clean, professional color palette — icon accent only, white card body
    const colorStyles = {
        blue: {
            iconBg: 'bg-blue-100',
            iconText: 'text-blue-600',
            valuText: 'text-slate-800',
            ring: 'ring-blue-100',
            dot: 'bg-blue-500',
        },
        purple: {
            iconBg: 'bg-purple-100',
            iconText: 'text-purple-600',
            valuText: 'text-slate-800',
            ring: 'ring-purple-100',
            dot: 'bg-purple-500',
        },
        green: {
            iconBg: 'bg-emerald-100',
            iconText: 'text-emerald-600',
            valuText: 'text-slate-800',
            ring: 'ring-emerald-100',
            dot: 'bg-emerald-500',
        },
        yellow: {
            iconBg: 'bg-amber-100',
            iconText: 'text-amber-600',
            valuText: 'text-slate-800',
            ring: 'ring-amber-100',
            dot: 'bg-amber-500',
        },
        red: {
            iconBg: 'bg-red-100',
            iconText: 'text-red-600',
            valuText: 'text-slate-800',
            ring: 'ring-red-100',
            dot: 'bg-red-500',
        },
    };

    const theme = colorStyles[color] || colorStyles.blue;

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative h-full"
        >
            <div
                ref={innerRef}
                className="h-full bg-white rounded-2xl p-5 border border-slate-200 shadow-md hover:shadow-lg transition-all duration-200 ease-out"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Icon */}
                <div className={`inline-flex p-2.5 rounded-xl ${theme.iconBg} ${theme.iconText} mb-4`}>
                    {Icon}
                </div>

                {/* Label */}
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>

                {/* Value */}
                <p className={`text-3xl font-bold tracking-tight ${theme.valuText}`}>{value}</p>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl ${theme.dot} opacity-60`} />
            </div>
        </motion.div>
    );
};

export default AnalysisStatCard;
