import React, { useRef, useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

const DashboardPreview = () => {
    const cardRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [stats, setStats] = useState([
        { label: 'Accuracy', value: 98.7, suffix: '%', prefix: '', color: 'text-gray-900' },
        { label: 'Savings', value: 2.4, suffix: 'M', prefix: '$', color: 'text-success-600' },
        { label: 'Stockouts', value: -82, suffix: '%', prefix: '', color: 'text-secondary-600' }
    ]);
    const [isHovering, setIsHovering] = useState(false);

    // 3D Tilt Logic
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Reduce tilt intensity
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        setRotation({ x: rotateX, y: rotateY });

        // Update CSS variable for glare effect
        cardRef.current.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        cardRef.current.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
        setIsHovering(false);
    };

    // Live Data Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(currentStats => currentStats.map((stat, index) => {
                if (Math.random() > 0.7) { // 30% chance to update
                    const variation = (Math.random() - 0.5) * 0.2;
                    let newValue = stat.value + variation;

                    // Constraints
                    if (index === 0) newValue = Math.min(99.9, Math.max(95, newValue)); // Accuracy
                    if (index === 1) newValue = Math.max(1.0, newValue); // Savings
                    if (index === 2) newValue = Math.min(-50, Math.max(-95, newValue)); // Stockouts

                    return { ...stat, value: newValue, lastUpdate: Date.now() };
                }
                return stat;
            }));
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    // Chart data for bars
    const barHeights = [35, 55, 45, 70, 60, 85, 95, 75, 90];

    return (
        <div
            className="perspective-1000 w-full max-w-2xl mx-auto transform-style-3d"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setIsHovering(true)}
        >
            <div
                ref={cardRef}
                className="dashboard-preview-card glass-panel rounded-2xl p-6 relative transition-transform duration-100 ease-out"
                style={{
                    transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${isHovering ? 1.02 : 1}, ${isHovering ? 1.02 : 1}, 1)`
                }}
            >
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-white flex items-center justify-center shadow-inner">
                            <BarChart3 className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-lg">Demand Forecast</div>
                            <div className="text-sm text-gray-500">Real-time predictive analytics</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur rounded-full shadow-sm border border-gray-100 text-success-600 text-sm font-bold tracking-wide">
                        <span className="live-dot" /> {/* Custom CSS class for pulse */}
                        LIVE
                    </div>
                </div>

                {/* Animated Chart Bars */}
                <div className="h-64 rounded-2xl mb-6 flex items-end justify-between px-6 pb-0 relative overflow-hidden bg-gradient-to-b from-transparent to-gray-50/50 border border-gray-100/50">
                    {barHeights.map((h, i) => (
                        <div
                            key={i}
                            style={{
                                height: `${h}%`,
                                animationDelay: `${0.2 + i * 0.1}s`
                            }}
                            className={`w-8 rounded-t-lg chart-bar animate ${i >= 6 ? 'active' : ''}`}
                        />
                    ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/60 border border-white/60 shadow-sm backdrop-blur-sm text-center transform transition-all hover:-translate-y-1">
                            <div
                                className={`text-2xl font-bold font-mono ${stat.color} mb-1 stat-value ${stat.lastUpdate && Date.now() - stat.lastUpdate < 500 ? 'updating' : ''}`}
                            >
                                {stat.prefix}{stat.value.toFixed(1)}{stat.suffix}
                            </div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPreview;
