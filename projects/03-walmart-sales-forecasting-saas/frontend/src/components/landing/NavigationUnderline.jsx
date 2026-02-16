import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * NavigationUnderline - Smooth animated underline for navigation links
 */
const NavigationUnderline = ({ items, activeIndex = 0, onItemClick }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [clickedIndex, setClickedIndex] = useState(activeIndex);

    const handleClick = (index, item) => {
        setClickedIndex(index);
        if (onItemClick) onItemClick(index, item);
    };

    return (
        <div className="flex items-center gap-8 relative">
            {items.map((item, index) => (
                <button
                    key={index}
                    onClick={() => handleClick(index, item)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`relative py-2 px-1 font-medium transition-colors ${clickedIndex === index
                            ? 'text-primary-600'
                            : 'text-gray-600 hover:text-primary-600'
                        }`}
                >
                    {item.label}

                    {/* Hover underline */}
                    {hoveredIndex === index && hoveredIndex !== clickedIndex && (
                        <motion.div
                            layoutId="hoverUnderline"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-300"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                    )}

                    {/* Active underline */}
                    {clickedIndex === index && (
                        <motion.div
                            layoutId="activeUnderline"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                            transition={{
                                type: 'spring',
                                stiffness: 380,
                                damping: 30,
                            }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
};

export default NavigationUnderline;
