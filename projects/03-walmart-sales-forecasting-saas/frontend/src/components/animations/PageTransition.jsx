/**
 * PageTransition Component
 * Smooth page transitions for route changes
 */

import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../../utils/animations/variants';

const PageTransition = ({ children }) => {
    return (
        <motion.div
            variants={pageTransition}
            initial="initial"
            animate="enter"
            exit="exit"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
