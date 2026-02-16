/**
 * FloatingOrbs Component
 * Gradient orbs with floating animation and mouse parallax
 */

import React, { useEffect, useRef } from 'react';

const FloatingOrbs = () => {
    const orbsRef = useRef([]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            orbsRef.current.forEach((orb, i) => {
                if (!orb) return;
                const speed = (i + 1) * 20;
                const xOffset = (0.5 - x) * speed;
                const yOffset = (0.5 - y) * speed;
                orb.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            });
        };

        // Only add mouse tracking on desktop
        if (window.innerWidth >= 1024) {
            document.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const orbs = [
        { color: 'from-primary-400 to-primary-600', size: 'w-96 h-96', position: 'top-0 left-0', delay: '0s', duration: '25s' },
        { color: 'from-secondary-400 to-secondary-600', size: 'w-80 h-80', position: 'bottom-0 right-0', delay: '5s', duration: '30s' },
        { color: 'from-primary-300 to-secondary-500', size: 'w-64 h-64', position: 'top-1/2 left-1/3', delay: '10s', duration: '35s' },
    ];

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {orbs.map((orb, index) => (
                <div
                    key={index}
                    ref={(el) => (orbsRef.current[index] = el)}
                    className={`absolute ${orb.size} ${orb.position} rounded-full bg-gradient-to-br ${orb.color} opacity-20 blur-3xl`} // Reduced opacity
                    style={{
                        animation: `float ${orb.duration} ease-in-out infinite`,
                        animationDelay: orb.delay,
                    }}
                />
            ))}

            <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
        </div>
    );
};

export default FloatingOrbs;
