import React from 'react';
import { useAuth } from '../../context/AuthContext';

const VideoBackground = ({ showForGuests = false, opacity = 0.2 }) => {
    const { isAuthenticated } = useAuth();

    // Only show video if user is authenticated or explicitly enabled for guests
    if (!isAuthenticated && !showForGuests) return null;

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{ opacity: opacity }}
            >
                <source src="/assets/videos/background.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            {/* Overlay - Lighter for guests to ensure video is visible */}
            {!showForGuests && (
                <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-[2px]" />
            )}
        </div>
    );
};

export default VideoBackground;
