/**
 * AuthLayout Component
 * Exceptional authentication layout with 3D effects, particles, and animations
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { TrendingUp, TrendingUpIcon, ShieldCheck, ArrowUpRight, CheckCircle } from 'lucide-react';
import ParticleNetwork from '../ui/ParticleNetwork';
import FloatingOrbs from './FloatingOrbs';
import StatsCard3D from './StatsCard3D';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

const AuthLayout = ({ children, mode = 'signin' }) => {
    const [activeTab, setActiveTab] = useState(mode);
    const [textIndex, setTextIndex] = useState(0);

    const phrases = [
        "Smarter Forecasting",
        "Intelligent Planning",
        "Real-time Insights",
        "Data-Driven Growth",
        "Strategic Decisions"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % phrases.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Initialize smooth scroll
    useSmoothScroll();

    // GSAP entrance animations
    useEffect(() => {
        gsap.to('.reveal-up', {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 0.2
        });
    }, []);

    const statsData = [
        {
            icon: {
                component: TrendingUpIcon,
                gradient: 'from-blue-400 to-indigo-500',
                shadow: 'shadow-blue-500/30'
            },
            title: 'Forecast Accuracy',
            value: '98.77%',
            trend: {
                icon: ArrowUpRight,
                value: '+2.4%',
                color: 'text-emerald-400'
            },
            trendText: 'vs last month',
            delay: 0.2
        },
        {
            icon: {
                component: ArrowUpRight, // Using existing icon as placeholder for Real-time if needed, or stick to Shield
                gradient: 'from-violet-400 to-purple-500',
                shadow: 'shadow-violet-500/30'
            },
            title: 'Real-time Predictions',
            value: '< 50ms',
            trend: {
                icon: CheckCircle,
                value: 'Live',
                color: 'text-violet-400'
            },
            trendText: 'Latency',
            delay: 0.3
        },
        {
            icon: {
                component: ShieldCheck,
                gradient: 'from-emerald-400 to-teal-500',
                shadow: 'shadow-emerald-500/30'
            },
            title: 'Enterprise Security',
            value: 'SOC2 Ready',
            trend: {
                icon: CheckCircle,
                value: 'Secured',
                color: 'text-emerald-400'
            },
            trendText: 'End-to-end Encrypted',
            delay: 0.4
        }
    ];

    return (

        <div className="min-h-screen flex relative overflow-hidden bg-[#F9FAFB] text-gray-900">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-secondary-500 z-50"></div>

            {/* Grid Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-grid opacity-[0.03]" />
            </div>

            {/* Left Panel - Branding (40%) */}
            <div className="hidden lg:flex lg:w-[40%] relative z-10 flex-col justify-between p-12 bg-white border-r border-gray-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">

                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <div className="absolute inset-0 bg-pattern" />
                </div>

                {/* Top Section */}
                <div className="relative z-10 reveal-up opacity-0 translate-y-8">
                    <Link to="/" className="flex items-center space-x-3 mb-8 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 transition-transform group-hover:scale-105">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <span className="font-display text-2xl font-bold tracking-tight text-gray-900">ForecastAI</span>
                    </Link>

                    <div className="space-y-6">
                        <h1 className="font-display text-5xl font-bold leading-tight text-gray-900">
                            Welcome back to<br />
                            <div className="h-[1.2em] relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={textIndex}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            ease: "easeOut"
                                        }}
                                        className="absolute left-0 top-0 whitespace-nowrap text-primary-600"
                                    >
                                        {phrases[textIndex]}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="text-lg text-gray-600 max-w-md leading-relaxed"
                        >
                            Enterprise-grade demand intelligence that adapts to your business in real-time.
                        </motion.p>
                    </div>
                </div>

                {/* Middle Section - Animated Stats Cards */}
                <div className="relative z-10 space-y-4 my-8">
                    {statsData.map((stat, index) => (
                        <div key={index} className="reveal-up opacity-0 translate-y-8">
                            <StatsCard3D {...stat} theme="light" />
                        </div>
                    ))}
                </div>

                {/* Bottom Section - Badges */}
                <div className="relative z-10 reveal-up opacity-0 translate-y-8 flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        99.99% Uptime
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        SOC2 Compliant
                    </div>
                </div>
            </div>

            {/* Right Panel - Form Content (60%) */}
            <div className="w-full lg:w-[60%] relative z-10 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto bg-gray-50/50">
                {/* Mobile Header (Visible only on small screens) */}
                <div className="lg:hidden mb-8 w-full max-w-md flex flex-col items-center text-center">
                    <Link to="/" className="flex items-center space-x-3 mb-6 group">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-display text-xl font-bold tracking-tight text-gray-900">ForecastAI</span>
                    </Link>
                </div>

                {children}
            </div>

            {/* Styles */}
            <style jsx>{`
        .bg-grid {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
        }

        .bg-pattern {
          background-image: url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
        }
      `}</style>
        </div>
    );
};

export default AuthLayout;
