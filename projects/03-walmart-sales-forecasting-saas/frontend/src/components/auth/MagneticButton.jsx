/**
 * MagneticButton Component
 * Button that follows cursor with magnetic attraction effect
 */

import React, { useRef } from 'react';

const MagneticButton = ({ children, className = '', ...props }) => {
    const buttonRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Apply magnetic effect (10% of distance)
        buttonRef.current.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    };

    const handleMouseLeave = () => {
        if (!buttonRef.current) return;
        buttonRef.current.style.transform = 'translate(0, 0)';
    };

    return (
        <button
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`transition-transform duration-300 ease-out ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default MagneticButton;
