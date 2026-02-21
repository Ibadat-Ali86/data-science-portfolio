import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const titles = [
    "Intelligent Analytics",
    "Demand Forecasting",
    "Inventory Optimization",
    "Sales Prediction"
];

const AnimatedText = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % titles.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className="inline-block relative w-full h-[1.2em] overflow-visible">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -15, filter: 'blur(5px)' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute inset-0 w-full text-left gradient-text-animated"
                >
                    {titles[index]}
                </motion.div>
            </AnimatePresence>
        </span>
    );
};

export default AnimatedText;
