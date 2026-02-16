import React from 'react';
import { motion } from 'framer-motion';

/**
 * ShimmerCard - Card with animated shimmer effect on hover
 * Perfect for feature cards and interactive elements
 */
const ShimmerCard = ({ children, className = '', delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className={`relative overflow-hidden group ${className}`}
        >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    }}
                />
            </div>

            {/* Card content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default ShimmerCard;
