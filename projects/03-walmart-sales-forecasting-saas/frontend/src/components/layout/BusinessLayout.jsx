import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Header from './Header';
import Breadcrumbs from './Breadcrumbs';
import ParticleCanvas from '../ui/ParticleCanvas';

const BusinessLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setIsSidebarCollapsed(true);
            else setIsSidebarCollapsed(false);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-bg-primary flex font-sans text-text-primary relative overflow-hidden">
            {/* Stylish Global Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
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
                {/* Subtle dot-grid overlay */}
                <div className="absolute inset-0"
                    style={{ backgroundImage: 'radial-gradient(circle, #94a3b820 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            </div>

            {/* Mobile Backdrop */}
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

            {/* Desktop Sidebar */}
            <div className="hidden lg:block relative z-20 flex-shrink-0">
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            </div>

            {/* Mobile Sidebar Drawer */}
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

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative z-10`}>
                <Header
                    onMenuClick={() => setIsMobileOpen(prev => !prev)}
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    isSidebarCollapsed={isSidebarCollapsed}
                />

                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto w-full">
                        <Breadcrumbs />
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                        >
                            <Outlet />
                        </motion.div>
                    </div>
                </main>

                <MobileNav />
            </div>
        </div>
    );
};

export default BusinessLayout;
