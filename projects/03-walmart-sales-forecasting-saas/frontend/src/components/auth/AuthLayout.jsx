import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, FileCheck, CheckCircle2, Activity } from 'lucide-react';
import AdaptIQLogo from '../ui/AdaptIQLogo';
import AnimatedText from './AnimatedText';
import RainbowMeshCursor from '../ui/RainbowMeshCursor';

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex relative overflow-hidden bg-[#0A0E1A] text-white font-sans">
            {/* Animated Gradient Mesh Background - Left Panel Area */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <RainbowMeshCursor />
            </div>
            <div className="absolute inset-0 w-[55%] pointer-events-none opacity-20 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4A9EFF] to-[#B794F6] filter blur-[100px] animate-pulse-slow"></div>
            </div>

            {/* Left Panel - Brand Intelligence Area (55%) */}
            <div className="hidden lg:flex lg:w-[55%] relative z-10 flex-col justify-between p-12 lg:p-16 xl:p-24 overflow-hidden">
                {/* Noise overlay */}
                <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

                {/* Top Section */}
                <div className="relative z-10">
                    <Link to="/" className="flex items-center space-x-3 mb-10 group">
                        <div className="w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                            <AdaptIQLogo className="w-10 h-10 drop-shadow-md" />
                        </div>
                        <span className="font-display text-3xl font-bold tracking-tight text-white drop-shadow">AdaptIQ</span>
                    </Link>

                    <div className="space-y-4 max-w-xl">
                        <h1 className="font-display text-[38px] font-bold leading-tight text-white min-h-[100px]">
                            Access Your <br />
                            <AnimatedText />
                        </h1>
                        <p className="text-[#A3ADBF] text-lg leading-relaxed mt-2">
                            Enterprise-grade demand forecasting powered by ML.
                        </p>
                    </div>
                </div>

                {/* Middle Section - Glass Forecast Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 my-10"
                >
                    {/* Soft neon edge glow behind the card */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-[#4A9EFF]/40 to-[#B794F6]/40 rounded-[17px] blur-[8px] opacity-60"></div>

                    <div className="relative bg-[#131829]/90 backdrop-blur-[24px] border border-[rgba(163,173,191,0.12)] rounded-2xl p-7 shadow-2xl overflow-hidden hover:shadow-[0_0_40px_rgba(74,158,255,0.15)] transition-shadow duration-500 group">

                        {/* Internal light sweep on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D9FF] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D9FF]"></span>
                                </div>
                                <span className="text-sm font-medium text-slate-300 tracking-wide uppercase text-[11px] letter-spacing-[1px]">Live Forecast</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-bold tracking-tight text-[#4ADE80] drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">98.77% <span className="text-sm font-medium text-slate-400">Accuracy</span></span>
                                <span className="text-[11px] text-[#4ADE80] flex items-center gap-1 font-medium mt-1">
                                    <Activity className="w-3 h-3" /> Growth trend +12.5%
                                </span>
                            </div>
                        </div>

                        {/* Abstract Line Chart */}
                        <div className="h-32 w-full relative flex items-end gap-2 px-1 z-10 group-hover:scale-[1.02] transition-transform duration-500">
                            {[40, 55, 45, 70, 60, 85, 75, 95, 90, 100].map((h, i) => (
                                <div key={i} className="flex-1 bg-[#1C2333]/80 rounded-t-sm relative overflow-hidden h-full flex items-end border border-white/[0.02]">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1.2, delay: i * 0.08, ease: "easeOut" }}
                                        className="w-full rounded-t-sm bg-gradient-to-t from-[#4A9EFF]/10 to-[#4A9EFF]/40"
                                    ></motion.div>
                                </div>
                            ))}
                            {/* Glowing Trend Line Overlay */}
                            <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_12px_rgba(74,158,255,0.9)]" preserveAspectRatio="none" viewBox="0 0 100 100" style={{ padding: '0 4px', overflow: 'visible' }}>
                                <motion.path
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                                    d="M0,60 L11,45 L22,55 L33,30 L44,40 L55,15 L66,25 L77,5 L88,10 L100,0"
                                    fill="none"
                                    stroke="#4A9EFF"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    vectorEffect="non-scaling-stroke"
                                />
                            </svg>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Section - Security List */}
                <div className="relative z-10 flex flex-wrap gap-5 text-[13px] text-[#A3ADBF] font-medium border-t border-white/5 pt-6">
                    <div className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                        <Shield className="w-4 h-4 text-[#00D9FF]" />
                        <span>SOC 2</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                        <Lock className="w-4 h-4 text-[#00D9FF]" />
                        <span>256-bit Encryption</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                        <FileCheck className="w-4 h-4 text-[#00D9FF]" />
                        <span>GDPR</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                        <CheckCircle2 className="w-4 h-4 text-[#00D9FF]" />
                        <span>ISO 27001</span>
                    </div>
                </div>
            </div>

            {/* Right Panel - Authentication (45%) */}
            <div className="w-full lg:w-[45%] relative z-10 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto bg-[#0A0E1A]">

                {/* Mobile Header */}
                <div className="lg:hidden w-full max-w-[400px] flex flex-col items-center text-center mb-8">
                    <Link to="/" className="flex items-center gap-3 mb-2 group">
                        <div className="w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                            <AdaptIQLogo className="w-10 h-10 drop-shadow-md" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white font-display">AdaptIQ</span>
                    </Link>
                </div>

                {/* Form Wrapper */}
                {children}

                {/* System Status Badge (Top Right) */}
                <div className="absolute top-6 right-6 hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(74,222,128,0.15)] border border-[rgba(74,222,128,0.3)] backdrop-blur-md shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                    <div className="w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_8px_#4ADE80]"></div>
                    <span className="text-[11px] font-bold text-[#4ADE80] tracking-wide uppercase">AI Systems Operational</span>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
