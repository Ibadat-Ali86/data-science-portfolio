import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion, AnimatePresence } from 'framer-motion';
import CommandPalette from '../ui/CommandPalette';
import ParticleCanvas from '../ui/ParticleCanvas';
import RainbowMeshCursor from '../ui/RainbowMeshCursor';

/**
 * Main application Layout
 * Handles sidebar collapse (desktop) and overlay drawer (mobile).
 * Responsive: sidebar hidden below lg breakpoint, toggled via Header hamburger.
 */
const Layout = ({ children, title }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCommandOpen, setIsCommandOpen] = useState(false);

    // Close mobile sidebar on route navigate (resize or link click)
    useEffect(() => {
        const close = () => setIsMobileOpen(false);
        window.addEventListener('resize', close);
        return () => window.removeEventListener('resize', close);
    }, []);

    // Command Palette shortcut Cmd+K / Ctrl+K
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex min-h-screen text-text-primary relative overflow-hidden font-sans antialiased">
            {/* ── Page background (below everything, including the mesh) ── */}
            <div className="fixed inset-0 z-[-1]" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 50%, #f0fff8 100%)' }} />

            {/* ── Rainbow Mesh Cursor — sits above page bg but below all content ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
                <RainbowMeshCursor />
            </div>
            {/* ── Animated ambient blobs (fixed, above mesh) ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
                <div className="absolute inset-0 opacity-50">
                    <ParticleCanvas />
                </div>
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                    transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-brand-400/8 blur-[130px]"
                />
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                    className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-accent-400/8 blur-[130px]"
                />
            </div>

            <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

            {/* ── MOBILE: Overlay Backdrop ── */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* ── SIDEBAR ── */}
            {/* Desktop: always visible, collapsible */}
            <div className="hidden lg:block fixed inset-y-0 left-0 z-20">
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            </div>

            {/* Mobile: slide-in overlay drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        className="fixed top-0 left-0 h-full z-40 lg:hidden"
                    >
                        <Sidebar
                            isCollapsed={false}
                            toggleSidebar={() => setIsMobileOpen(false)}
                            onLinkClick={() => setIsMobileOpen(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── MAIN CONTENT ── */}
            <div
                className={`
                    flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative z-10
                    ml-0 lg:${isSidebarCollapsed ? 'ml-20' : 'ml-64'}
                `}
            >
                <Header
                    title={title}
                    onMenuClick={() => setIsMobileOpen(prev => !prev)}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8" style={{ background: 'transparent' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="max-w-7xl mx-auto space-y-6"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
