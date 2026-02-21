/**
 * LoadingTheater Component
 * Multi-stage loading overlay with spinner and success animation
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingTheater = ({ show, stage = 'loading' }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
                >
                    <div className="text-center">
                        {stage === 'loading' && (
                            <>
                                <div className="relative w-20 h-20 mx-auto">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="absolute inset-2 border-4 border-brand-500 rounded-full animate-spin"
                                            style={{
                                                borderColor: '#6366F1 transparent transparent transparent',
                                                animationDelay: `${-0.15 * i}s`,
                                                animationDuration: '1.2s'
                                            }}
                                        />
                                    ))}
                                </div>
                                <p className="mt-4 text-text-secondary font-medium">Authenticating...</p>
                            </>
                        )}

                        {stage === 'success' && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', duration: 0.6 }}
                            >
                                <svg className="w-20 h-20 mx-auto" viewBox="0 0 52 52">
                                    <motion.circle
                                        cx="26"
                                        cy="26"
                                        r="25"
                                        fill="none"
                                        stroke="#10B981"
                                        strokeWidth="2"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                                    />
                                    <motion.path
                                        fill="none"
                                        stroke="#10B981"
                                        strokeWidth="3"
                                        d="M14.1 27.2l7.1 7.2 16.7-16.8"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.4, delay: 0.3 }}
                                    />
                                </svg>
                                <p className="mt-4 text-success-600 font-semibold text-lg">Success!</p>
                                <p className="text-text-tertiary text-sm">Redirecting to dashboard...</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingTheater;
