import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Brain, History, Target, FileText, BarChart3,
    Upload, ChevronLeft, ChevronRight, LogOut, Settings,
    HelpCircle, Activity, Zap, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdaptIQLogo from '../ui/AdaptIQLogo';

const NAV_GROUPS = [
    {
        label: 'Core',
        items: [
            { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, accent: '#4A9EFF' },
            { path: '/upload', label: 'Upload Data', icon: Upload, accent: '#00D9FF' },
            { path: '/analysis', label: 'Analysis', icon: Brain, accent: '#B794F6' },
            { path: '/monitoring', label: 'Monitor', icon: Activity, accent: '#4ADE80' },
        ]
    },
    {
        label: 'Insights',
        items: [
            { path: '/forecast-explorer', label: 'Forecasts', icon: History, accent: '#4A9EFF' },
            { path: '/scenario-simulator', label: 'Scenarios', icon: Target, accent: '#F59E0B' },
            { path: '/scenario-planning', label: 'Planning', icon: BarChart3, accent: '#34D399' },
            { path: '/reports', label: 'Reports', icon: FileText, accent: '#F97316' },
            { path: '/executive', label: 'Executive', icon: Zap, accent: '#A78BFA' },
        ]
    },
];

const Sidebar = ({ isCollapsed, toggleSidebar, onLinkClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'A';

    return (
        <aside className={`
            relative
            ${isCollapsed ? 'w-20' : 'w-64'}
            transition-all duration-300 ease-in-out
            flex flex-col h-[100dvh]
            bg-white/95 backdrop-blur-xl
            border-r border-slate-200/80
            shadow-[4px_0_32px_rgba(0,0,0,0.06)]
            overflow-hidden
        `}>
            {/* Top brand gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#4A9EFF] via-[#B794F6] to-[#00D9FF] z-10" />

            {/* Subtle corner blobs for visual depth */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* ── LOGO Header ── */}
            <div className={`h-16 flex items-center px-4 border-b border-slate-100 flex-shrink-0 z-10 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                    >
                        <AdaptIQLogo className="w-9 h-9" />
                    </motion.div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -12, width: 0 }}
                                animate={{ opacity: 1, x: 0, width: 'auto' }}
                                exit={{ opacity: 0, x: -12, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden whitespace-nowrap"
                            >
                                <span className="text-lg font-bold tracking-tight font-display bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                    AdaptIQ
                                </span>
                                <span className="ml-1.5 text-[9px] font-bold text-brand-500 bg-brand-50 border border-brand-100 rounded-sm px-1 py-0.5 uppercase tracking-widest align-middle">
                                    AI
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {!isCollapsed && (
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all flex-shrink-0"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isCollapsed && (
                <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex absolute -right-3.5 top-[4.5rem] z-50 w-7 h-7 items-center justify-center bg-white border border-slate-200 rounded-full shadow-md text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            )}

            {/* ── Navigation ── */}
            <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent z-10">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label} className="mb-4">
                        {!isCollapsed && (
                            <p className="px-5 mb-2 text-[9.5px] font-extrabold text-slate-400 uppercase tracking-[0.12em] flex items-center gap-1.5">
                                <Sparkles className="w-2.5 h-2.5 text-brand-400" />
                                {group.label}
                            </p>
                        )}
                        {isCollapsed && <div className="mx-4 my-2 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />}
                        <div className="px-2.5 space-y-0.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={onLinkClick}
                                        title={isCollapsed ? item.label : undefined}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                                ? 'bg-gradient-to-r from-brand-50 to-brand-50/40 text-brand-700 font-semibold shadow-sm border border-brand-100/60'
                                                : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-800 border border-transparent'
                                            } ${isCollapsed ? 'justify-center' : ''}`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {/* Active left bar indicator */}
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="sidebar-active-bar"
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full"
                                                        style={{ background: item.accent }}
                                                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                                                    />
                                                )}
                                                {/* Active shimmer glow */}
                                                {isActive && (
                                                    <div className="absolute inset-0 opacity-10 rounded-xl" style={{ background: `radial-gradient(ellipse at 0% 50%, ${item.accent}, transparent 70%)` }} />
                                                )}

                                                <Icon
                                                    className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}
                                                    style={isActive ? { color: item.accent } : {}}
                                                />
                                                {!isCollapsed && (
                                                    <span className="truncate text-sm leading-none">{item.label}</span>
                                                )}
                                                {isActive && !isCollapsed && (
                                                    <div className="ml-auto">
                                                        <div className="w-1.5 h-1.5 rounded-full opacity-80" style={{ background: item.accent }} />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ── User & Footer ── */}
            <div className="border-t border-slate-100 p-3 flex-shrink-0 z-10 bg-white/80 backdrop-blur-sm">
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-2 overflow-hidden"
                        >
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-100 hover:border-slate-200 transition-all duration-200 cursor-pointer group">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#4A9EFF] to-[#B794F6] text-white font-bold text-xs shadow-md ring-2 ring-white">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold truncate text-slate-700">{user?.full_name || 'Demo User'}</p>
                                    <p className="text-[10px] truncate text-slate-400 capitalize flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                                        {user?.role || 'Enterprise Plan'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isCollapsed && (
                    <div className="flex justify-center mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#4A9EFF] to-[#B794F6] text-white font-bold text-xs shadow-md ring-2 ring-white">
                            {initials}
                        </div>
                    </div>
                )}

                <div className={`flex ${isCollapsed ? 'flex-col items-center gap-1' : 'justify-between px-1'}`}>
                    <button className="p-2 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-all" title="Settings">
                        <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-all" title="Help">
                        <HelpCircle className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
