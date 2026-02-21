/**
 * AmbientBackground Component
 * Subtle floating gradient orbs for visual engagement
 */

import React from 'react';
import './AmbientBackground.css';

const AmbientBackground = () => {
    return (
        <div className="ambient-canvas">
            <div className="noise-overlay"></div>
            <div className="grid-overlay"></div>
        </div>
    );
};

export default AmbientBackground;
