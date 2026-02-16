
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Brain,
    Upload,
    History,
    Menu
} from 'lucide-react';

const MobileNav = () => {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] pb-safe">
            <div className="flex justify-around items-center h-16 px-2">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive
                            ? 'text-[var(--accent-blue)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                            ? 'text-[var(--accent-blue)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                                ? 'bg-[var(--accent-blue)] text-white shadow-[0_0_15px_var(--accent-blue)]'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-primary)]'
                            }`
                        }
                    >
                        <Brain className="w-7 h-7" />
                    </NavLink>
                </div>

                <NavLink
                    to="/forecast-explorer"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive
                            ? 'text-[var(--accent-blue)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                            ? 'text-[var(--accent-blue)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`
                    }
                >
                    <Menu className="w-6 h-6" />
                    <span className="text-[10px] font-medium">More</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default MobileNav;
