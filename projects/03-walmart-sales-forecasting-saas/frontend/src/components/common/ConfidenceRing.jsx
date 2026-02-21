import React from 'react';

export const ConfidenceRing = ({ confidence = 85, size = 120 }) => {
    const strokeWidth = Math.max(2, size / 15);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (confidence / 100) * circumference;

    // Gradient based on confidence
    const getGradientColors = (conf) => {
        if (conf >= 80) return ['#10B981', '#059669']; // Success emerald
        if (conf >= 60) return ['#F59E0B', '#D97706']; // Warning amber
        return ['#EF4444', '#DC2626']; // Danger rose
    };

    const colors = getGradientColors(confidence);

    return (
        <div
            className="relative inline-flex items-center justify-center confidence-ring"
            style={{ width: size, height: size, '--confidence': confidence }}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                <defs>
                    <linearGradient id={`confGrad-${confidence}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={colors[0]} />
                        <stop offset="100%" stopColor={colors[1]} />
                    </linearGradient>
                </defs>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--bg-tertiary, #1E2642)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={`url(#confGrad-${confidence})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                <span className="text-xl font-bold" style={{ fontSize: size * 0.25 }}>
                    {confidence}%
                </span>
                {size >= 80 && (
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                        Conf
                    </span>
                )}
            </div>
        </div>
    );
};
