import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    LineChart,
    Sliders,
    FileText,
    TrendingUp,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Brain,
    History,
    BarChart3,
    Target,
    Activity,
    Upload,
    CheckCircle,
    Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

// Navigation organized by workflow order
const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', label: 'Upload Data', icon: Upload },
    { path: '/analysis', label: 'Analysis', icon: Brain },
    { path: '/forecast-explorer', label: 'Forecasts', icon: History },
    { path: '/scenario-planning', label: 'Scenarios', icon: Target },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/executive', label: 'Executive', icon: BarChart3 },
];

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    // Removed local state: const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--border-primary)] shadow-2xl`}
            style={{ background: 'var(--bg-secondary)' }}>

            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-primary)]">
                <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg"
                        style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>ForecastAI</span>
                    )}
                </div>
                {!isCollapsed && (
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Collapse Button (Visible only when collapsed) */}
            {isCollapsed && (
                <div className="flex justify-center py-2 border-b border-[var(--border-primary)]">
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative overflow-hidden ${isActive
                                ? 'bg-[rgba(74,158,255,0.1)] text-[var(--accent-blue)] font-medium shadow-[0_0_15px_rgba(74,158,255,0.1)]'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                            } ${isCollapsed ? 'justify-center' : ''}`
                        }
                        title={isCollapsed ? item.label : undefined}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0 transition-colors z-10" />

                        {!isCollapsed && (
                            <span className="z-10">{item.label}</span>
                        )}

                        {/* Active indicator line */}
                        {({ isActive }) => isActive && !isCollapsed && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full bg-[var(--accent-blue)] shadow-[0_0_8px_var(--accent-blue)]" />
                        )}

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(74,158,255,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-[var(--border-primary)]">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 p-3 rounded-xl mb-3"
                        style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))' }}>
                            <span className="text-white font-bold text-sm">
                                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                {user?.full_name || 'Demo User'}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                                {user?.email || 'demo@forecast.ai'}
                            </p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all
                        text-[var(--text-secondary)] hover:bg-[rgba(255,87,87,0.1)] hover:text-[var(--accent-red)]
                        ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? 'Logout' : undefined}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
