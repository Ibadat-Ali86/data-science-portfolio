import React from 'react';

const AmbientBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            {/* Gradient Mesh Layer */}
            <div
                className="absolute inset-0 opacity-40 animate-mesh"
                style={{
                    background: `
                        radial-gradient(at 40% 20%, hsla(253, 100%, 85%, 1) 0px, transparent 50%),
                        radial-gradient(at 80% 0%, hsla(189, 100%, 86%, 1) 0px, transparent 50%),
                        radial-gradient(at 0% 50%, hsla(340, 100%, 88%, 1) 0px, transparent 50%),
                        radial-gradient(at 80% 50%, hsla(266, 100%, 85%, 1) 0px, transparent 50%),
                        radial-gradient(at 0% 100%, hsla(253, 100%, 90%, 1) 0px, transparent 50%)
                    `,
                    filter: 'blur(60px)'
                }}
            />

            {/* Noise Texture for Texture/Depth */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
            />
        </div>
    );
};

export default AmbientBackground;
