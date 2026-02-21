
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ children, content, position = 'top', delay = 0.3 }) => {
    const [isVisible, setIsVisible] = useState(false);
    let timeout;

    const showTooltip = () => {
        timeout = setTimeout(() => setIsVisible(true), delay * 1000);
    };

    const hideTooltip = () => {
        clearTimeout(timeout);
        setIsVisible(false);
    };

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute z-[var(--z-tooltip)] px-3 py-1.5 text-xs font-medium text-white bg-slate-800 rounded shadow-lg whitespace-nowrap ${positions[position]}`}
                    >
                        {content}
                        <div
                            className={`absolute w-2 h-2 bg-slate-800 transform rotate-45 
                                ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                                ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                                ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                                ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
                            `}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
