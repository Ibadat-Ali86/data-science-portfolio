import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPICard = ({ title, value, change, trend, icon: Icon, color = 'primary' }) => {
    // Determine trend color and icon
    const isPositive = trend === 'up';
    const isNeutral = trend === 'neutral';

    // Map colors to theme variables
    const colorMap = {
        primary: 'var(--accent-blue)',
        success: 'var(--accent-green)',
        warning: 'var(--accent-orange)',
        danger: 'var(--accent-red)',
        info: 'var(--accent-cyan)',
        purple: 'var(--accent-purple)'
    };

    const accentColor = colorMap[color] || colorMap.primary;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: `0 10px 20px -5px ${accentColor}20` }}
            transition={{ duration: 0.2 }}
            className="kpi-card group"
            style={{ borderColor: 'var(--border-primary)' }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${accentColor}15` }}>
                    <Icon className="w-6 h-6" style={{ color: accentColor }} />
                </div>

                {change && (
                    <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg"
                        style={{
                            background: isPositive ? 'rgba(74, 222, 128, 0.1)' : isNeutral ? 'rgba(148, 163, 184, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                            color: isPositive ? 'var(--accent-green)' : isNeutral ? 'var(--text-secondary)' : 'var(--accent-red)'
                        }}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : isNeutral ? <Minus className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{change}</span>
                    </div>
                )}
            </div>

            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
            <p className="text-2xl font-bold font-mono tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>

            <div className="w-full h-1 mt-4 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }} // Placeholder for actual progress if available
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: accentColor }}
                />
            </div>
        </motion.div>
    );
};

export default KPICard;
