/**
 * Phase 4: Web Share API Integration
 * Share forecast results via native share sheet
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, Mail, Link2, Check } from 'lucide-react';
import { useState } from 'react';

export async function shareForecast(forecastData, format = 'link') {
    const canShare = navigator.share !== undefined;

    if (!canShare) {
        console.warn('Web Share API not supported');
        return false;
    }

    try {
        const shareData = {
            title: 'AdaptIQ - Demand Forecast Results',
            text: `Check out my forecast: ${forecastData.summary || 'Latest prediction results'}`,
            url: window.location.href
        };

        // Add file if format is image/pdf
        if (format === 'image' && forecastData.chartImage) {
            const blob = await fetch(forecastData.chartImage).then(r => r.blob());
            const file = new File([blob], 'forecast-chart.png', { type: 'image/png' });
            shareData.files = [file];
        }

        await navigator.share(shareData);
        return true;
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Share failed:', error);
        }
        return false;
    }
}

export function ShareButton({ forecastData, onShare }) {
    const [showOptions, setShowOptions] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleWebShare = async () => {
        const success = await shareForecast(forecastData);
        if (success && onShare) {
            onShare('web-share');
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            if (onShare) onShare('copy-link');
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    const handleDownload = () => {
        // Trigger download (implementation depends on report format)
        const dataStr = JSON.stringify(forecastData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `forecast-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);

        if (onShare) onShare('download');
    };

    const handleEmail = () => {
        const subject = encodeURIComponent('AdaptIQ - Demand Forecast Results');
        const body = encodeURIComponent(`Check out my forecast results:\n\n${window.location.href}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;

        if (onShare) onShare('email');
    };

    const canWebShare = navigator.share !== undefined;

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
            >
                <Share2 className="w-5 h-5" />
                Share Results
            </motion.button>

            {showOptions && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowOptions(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                    >
                        {canWebShare && (
                            <button
                                onClick={handleWebShare}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                            >
                                <Share2 className="w-5 h-5 text-purple-600" />
                                <div>
                                    <p className="font-medium text-gray-800">Share via...</p>
                                    <p className="text-xs text-gray-500">Native share sheet</p>
                                </div>
                            </button>
                        )}

                        <button
                            onClick={handleCopyLink}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium text-green-600">Copied!</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-gray-800">Copy Link</p>
                                        <p className="text-xs text-gray-500">Share URL</p>
                                    </div>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                            <Download className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="font-medium text-gray-800">Download</p>
                                <p className="text-xs text-gray-500">Save as JSON</p>
                            </div>
                        </button>

                        <button
                            onClick={handleEmail}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                        >
                            <Mail className="w-5 h-5 text-orange-600" />
                            <div>
                                <p className="font-medium text-gray-800">Email</p>
                                <p className="text-xs text-gray-500">Send via email</p>
                            </div>
                        </button>
                    </motion.div>
                </>
            )}
        </div>
    );
}
