/**
 * PWA Status Indicator
 * Shows online/offline status and installation status
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, CloudOff, CheckCircle2, Download } from 'lucide-react';
import { isAppInstalled, onlineStatus } from '../../utils/pwa';

export default function PWAStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [installed, setInstalled] = useState(false);
    const [showStatus, setShowStatus] = useState(false);

    useEffect(() => {
        // Check installation status
        setInstalled(isAppInstalled());

        // Monitor online status
        const statusMonitor = onlineStatus();
        statusMonitor.addEventListener((online) => {
            setIsOnline(online);

            // Show status change briefly
            setShowStatus(true);
            setTimeout(() => setShowStatus(false), 3000);
        });

        return () => {
            // Cleanup if needed
        };
    }, []);

    return (
        <>
            {/* Permanent indicator (small) */}
            <div className="fixed top-4 right-4 z-40">
                <div className="flex items-center gap-2">
                    {/* Online/Offline indicator */}
                    <motion.div
                        initial={false}
                        animate={{
                            backgroundColor: isOnline
                                ? 'rgba(34, 197, 94, 0.2)'
                                : 'rgba(239, 68, 68, 0.2)'
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20"
                    >
                        <motion.div
                            animate={{ scale: isOnline ? [1, 1.2, 1] : 1 }}
                            transition={{ duration: 1, repeat: isOnline ? Infinity : 0, repeatDelay: 2 }}
                        >
                            {isOnline ? (
                                <Wifi className="w-4 h-4 text-green-500" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-red-500" />
                            )}
                        </motion.div>
                        <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </motion.div>

                    {/* Installation status */}
                    {installed && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 backdrop-blur-md border border-purple-300/30"
                        >
                            <CheckCircle2 className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-600">
                                Installed
                            </span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Temporary status change notification */}
            <AnimatePresence>
                {showStatus && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
                    >
                        <div className={`
              px-6 py-3 rounded-xl shadow-2xl backdrop-blur-xl border
              ${isOnline
                                ? 'bg-green-500/90 border-green-400/30'
                                : 'bg-red-500/90 border-red-400/30'
                            }
            `}>
                            <div className="flex items-center gap-3 text-white">
                                {isOnline ? (
                                    <>
                                        <Cloud className="w-5 h-5" />
                                        <div>
                                            <p className="font-semibold text-sm">Back Online!</p>
                                            <p className="text-xs opacity-90">Syncing data...</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <CloudOff className="w-5 h-5" />
                                        <div>
                                            <p className="font-semibold text-sm">You're Offline</p>
                                            <p className="text-xs opacity-90">Cached data available</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
