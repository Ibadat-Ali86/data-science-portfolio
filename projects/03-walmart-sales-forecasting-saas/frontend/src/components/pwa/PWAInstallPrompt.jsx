/**
 * PWA Install Prompt Component
 * Displays a professional install banner with animations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, CheckCircle } from 'lucide-react';
import { showInstallPrompt, isAppInstalled } from '../../utils/pwa';

export default function PWAInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (isAppInstalled()) {
            setIsInstalled(true);
            return;
        }

        // Check if previously dismissed (in this session)
        const wasDismissed = sessionStorage.getItem('pwa-prompt-dismissed');
        if (wasDismissed) {
            setDismissed(true);
            return;
        }

        // Listen for installable event
        const handleInstallable = () => {
            // Show prompt after a short delay for better UX
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('pwa-installable', handleInstallable);

        return () => {
            window.removeEventListener('pwa-installable', handleInstallable);
        };
    }, []);

    const handleInstall = async () => {
        const accepted = await showInstallPrompt();

        if (accepted) {
            setShowPrompt(false);
            setIsInstalled(true);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDismissed(true);
        sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    // Don't render if installed or dismissed
    if (isInstalled || dismissed) return null;

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
                >
                    <div className="relative">
                        {/* Glassmorphism background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-xl rounded-2xl shadow-2xl" />

                        {/* Content */}
                        <div className="relative p-6">
                            {/* Close button */}
                            <button
                                onClick={handleDismiss}
                                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                                aria-label="Dismiss"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Icon */}
                            <div className="flex items-start gap-4">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 3
                                    }}
                                    className="flex-shrink-0"
                                >
                                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Download className="w-7 h-7 text-white" />
                                    </div>
                                </motion.div>

                                {/* Text content */}
                                <div className="flex-1 pr-6">
                                    <h3 className="text-white font-semibold text-lg mb-2">
                                        Install AdaptIQ
                                    </h3>
                                    <p className="text-white/90 text-sm mb-4 leading-relaxed">
                                        Get instant access, work offline, and enjoy a native app experience
                                    </p>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <div className="flex items-center gap-2 text-white/80 text-xs">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Offline access</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/80 text-xs">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Faster loading</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/80 text-xs">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Home screen</span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleInstall}
                                            className="flex-1 bg-white text-purple-600 py-2.5 px-4 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
                                        >
                                            Install Now
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleDismiss}
                                            className="px-4 py-2.5 text-white/90 hover:text-white text-sm font-medium transition-colors"
                                        >
                                            Not now
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            {/* Device indicator */}
                            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-center gap-2 text-white/60 text-xs">
                                <Monitor className="w-4 h-4" />
                                <span>Available on desktop and mobile</span>
                                <Smartphone className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Decorative gradient border */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400 to-blue-400 opacity-30 blur-xl -z-10" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
