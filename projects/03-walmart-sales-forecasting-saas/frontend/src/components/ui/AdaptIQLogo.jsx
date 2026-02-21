import React from 'react';

const AdaptIQLogo = ({ className = "w-10 h-10" }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="logoGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4A9EFF" />
                    <stop offset="100%" stopColor="#B794F6" />
                </linearGradient>
                <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00D9FF" />
                    <stop offset="100%" stopColor="#4A9EFF" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Background / Base connecting lines */}
            <path
                d="M20,70 L40,50 L60,60 L80,30"
                stroke="url(#logoGrad1)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
            />

            {/* Neural nodes */}
            <circle cx="20" cy="70" r="5" fill="#4A9EFF" />
            <circle cx="40" cy="50" r="6" fill="#B794F6" />
            <circle cx="60" cy="60" r="5" fill="#4A9EFF" />

            {/* Upward Growth Arrow / Brain shape */}
            <path
                d="M35,35 L50,15 L90,15 L90,55 L70,40 L70,25 L50,25 Z"
                fill="url(#logoGrad2)"
                filter="url(#glow)"
            />

            {/* Accent dot on arrow */}
            <circle cx="80" cy="25" r="4" fill="#ffffff" />
        </svg>
    );
};

export default AdaptIQLogo;
