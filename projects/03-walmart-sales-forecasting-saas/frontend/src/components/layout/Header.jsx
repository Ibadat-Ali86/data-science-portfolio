import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, Settings, HelpCircle, User, CheckCircle, AlertTriangle, Book, Keyboard, LifeBuoy, Monitor, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CommandPalette from '../ui/CommandPalette';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import FeedbackManager from '../../utils/FeedbackManager';

const Header = ({ toggleSidebar, isSidebarCollapsed, onMenuClick }) => {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isCommandOpen, setIsCommandOpen] = useState(false);

    // Dropdown states
    const [activeDropdown, setActiveDropdown] = useState(null); // 'notifications', 'help', 'settings', 'profile'
    const headerRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headerRef.current && !headerRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (name) => {
        setActiveDropdown(prev => prev === name ? null : name);
    };

    // Mock Data
    const notifications = [
        { id: 1, type: 'success', title: 'Analysis Complete', desc: 'Walmart Q3 Sales forecast is ready to view.', time: '2m ago' },
        { id: 2, type: 'warning', title: 'Data Anomaly', desc: 'High volatility detected in electronics category.', time: '1h ago' },
        { id: 3, type: 'info', title: 'Model Retrained', desc: 'Ensemble model was automatically retrained.', time: '3h ago' }
    ];

    return (
        <header ref={headerRef} className="h-16 px-6 flex items-center justify-between border-b border-slate-200/80 sticky top-0 z-40" style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            {/* Left: Mobile Toggle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick || toggleSidebar}
                    className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Search */}
                <button
                    onClick={() => setIsCommandOpen(true)}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all group"
                >
                    <Search className="w-4 h-4" />
                    <span className="text-sm">Search...</span>
                    <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 group-hover:text-slate-500">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </button>
                <button
                    onClick={() => setIsCommandOpen(true)}
                    className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Search className="w-5 h-5" />
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => toggleDropdown('notifications')}
                        className={`relative p-2 rounded-full transition-colors ${activeDropdown === 'notifications' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'}`}
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                    </button>

                    <AnimatePresence>
                        {activeDropdown === 'notifications' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden transform origin-top-right"
                            >
                                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h3 className="font-semibold text-slate-800">Notifications</h3>
                                    <span className="text-xs text-brand-600 font-medium cursor-pointer hover:underline">Mark all read</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map(n => (
                                        <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3">
                                            <div className="mt-0.5">
                                                {n.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                                {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                                                {n.type === 'info' && <Bell className="w-5 h-5 text-blue-500" />}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-slate-800 dark:text-white">{n.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.desc}</p>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">{n.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-2 text-center border-t border-slate-100 dark:border-dark-border bg-slate-50/80 dark:bg-dark-elem-light/80">
                                    <span className="text-xs text-brand-600 font-medium cursor-pointer hover:underline">View All Activity</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Help */}
                <div className="relative hidden md:block">
                    <button
                        onClick={() => toggleDropdown('help')}
                        className={`p-2 rounded-full transition-colors ${activeDropdown === 'help' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'}`}
                    >
                        <HelpCircle className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                        {activeDropdown === 'help' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-64 bg-white/80 dark:bg-dark-elem/80 rounded-xl shadow-xl border border-slate-100 dark:border-dark-border overflow-hidden transform origin-top-right p-2 backdrop-blur-xl"
                            >
                                <div className="space-y-1">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-dark-elem-light/80 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors text-left">
                                        <Book className="w-4 h-4 text-slate-400" />
                                        Documentation
                                    </button>
                                    <button onClick={() => { setIsCommandOpen(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-dark-elem-light/80 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors text-left">
                                        <Keyboard className="w-4 h-4 text-slate-400" />
                                        Keyboard Shortcuts
                                    </button>
                                    <button
                                        onClick={() => {
                                            FeedbackManager.showToast('Support requested. A ticket has been opened.', 'success');
                                            setActiveDropdown(null);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-dark-elem-light/80 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors text-left border-t border-slate-100 dark:border-dark-border mt-1 pt-3"
                                    >
                                        <LifeBuoy className="w-4 h-4 text-slate-400" />
                                        Contact Support
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Settings */}
                <div className="relative hidden md:block">
                    <button
                        onClick={() => toggleDropdown('settings')}
                        className={`p-2 rounded-full transition-colors ${activeDropdown === 'settings' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'}`}
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                        {activeDropdown === 'settings' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-64 bg-white/80 dark:bg-dark-elem/80 rounded-xl shadow-xl border border-slate-100 dark:border-dark-border overflow-hidden transform origin-top-right p-4 backdrop-blur-xl"
                            >
                                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Preferences</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-700 dark:text-slate-200">Theme</span>
                                        <div className="flex bg-slate-100/80 dark:bg-dark-elem-light/80 rounded-lg p-0.5">
                                            <button onClick={() => setTheme('light')} className={`p-1 rounded-md ${theme === 'light' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                                <Sun className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => setTheme('dark')} className={`p-1 rounded-md ${theme === 'dark' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                                <Moon className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => setTheme('system')} className={`p-1 rounded-md ${theme === 'system' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                                <Monitor className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-700 dark:text-slate-200">Compact View</span>
                                        <button className="w-8 h-4 bg-emerald-500 rounded-full relative transition-colors"><div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div></button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-700 dark:text-slate-200">Animations</span>
                                        <button className="w-8 h-4 bg-emerald-500 rounded-full relative transition-colors"><div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div></button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="ml-2 flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-dark-border">
                    <div className="flex flex-col items-end hidden md:flex">
                        <span className="text-sm font-medium text-slate-800 dark:text-white leading-none">
                            {user?.full_name || 'Admin User'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Enterprise Plan
                        </span>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-medium shadow-md hover:shadow-lg transition-all border-2 border-white ring-2 ring-brand-100">
                        {user?.full_name?.charAt(0) || 'A'}
                    </button>
                </div>
            </div>

            {/* Command Palette Modal */}
            <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
        </header>
    );
};

export default Header;
