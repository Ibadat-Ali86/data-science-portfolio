import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Brain,
    Upload,
    History,
    Menu,
    BarChart3,
    Activity
} from 'lucide-react';

const MobileNav = () => {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-bg-secondary border-t border-border-primary pb-safe safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-16 px-2">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive
                            ? 'text-brand-600'
                            : 'text-text-secondary hover:text-text-primary'
                        }`
                    }
                >
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Home</span>
                </NavLink>

                <NavLink
                    to="/upload"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive
                            ? 'text-brand-600'
                            : 'text-text-secondary hover:text-text-primary'
                        }`
                    }
                >
                    <Upload className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Upload</span>
                </NavLink>

                {/* Central Action Button */}
                <div className="relative -top-5">
                    <NavLink
                        to="/analysis"
                        className={({ isActive }) =>
                            `flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform active:scale-95 ${isActive
                                ? 'bg-brand-600 text-white shadow-brand-500/30'
                                : 'bg-bg-elevated text-text-secondary border border-border-primary'
                            }`
                        }
                    >
                        <Brain className="w-7 h-7" />
                    </NavLink>
                </div>

                <NavLink
                    to="/monitoring"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive
                            ? 'text-brand-600'
                            : 'text-text-secondary hover:text-text-primary'
                        }`
                    }
                >
                    <Activity className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Monitor</span>
                </NavLink>

                <NavLink
                    to="/forecast-explorer"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive
                            ? 'text-brand-600'
                            : 'text-text-secondary hover:text-text-primary'
                        }`
                    }
                >
                    <History className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Forecast</span>
                </NavLink>

                <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive
                            ? 'text-brand-600'
                            : 'text-text-secondary hover:text-text-primary'
                        }`
                    }
                >
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Reports</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default MobileNav;
