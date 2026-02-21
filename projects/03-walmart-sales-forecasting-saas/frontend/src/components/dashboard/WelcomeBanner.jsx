import React from 'react';
import { motion } from 'framer-motion';
import { Upload, PlayCircle, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const WelcomeBanner = ({ user, visible = true, onClose }) => {
    const navigate = useNavigate();

    if (!visible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="relative overflow-hidden rounded-2xl p-8 shadow-lg border border-brand-100 bg-gradient-to-r from-bg-secondary to-bg-tertiary"
        >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold border border-brand-200">
                            v2.0 Beta
                        </span>
                        <h1 className="text-2xl font-bold text-text-primary">
                            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
                        </h1>
                    </div>
                    <p className="max-w-xl text-text-secondary leading-relaxed">
                        Ready to forecast? Upload your latest sales data to generate insights or explore your existing models.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="primary"
                        icon={Upload}
                        onClick={() => navigate('/upload')}
                    >
                        Upload Data
                    </Button>
                    <Button
                        variant="secondary"
                        icon={PlayCircle}
                        onClick={() => navigate('/analysis')}
                    >
                        Start Analysis
                    </Button>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20 bg-brand-500" />
            <div className="absolute bottom-0 left-1/2 w-48 h-48 rounded-full blur-2xl translate-y-1/2 opacity-10 bg-accent-500" />

            {/* Sparkle icon decoration */}
            <div className="absolute top-6 right-6 text-brand-200 opacity-50 rotate-12">
                <Sparkles className="w-24 h-24" />
            </div>

            {/* Close button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-lg transition-colors hover:bg-bg-tertiary text-text-tertiary hover:text-text-primary"
                    aria-label="Close welcome banner"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </motion.div>
    );
};

export default WelcomeBanner;
