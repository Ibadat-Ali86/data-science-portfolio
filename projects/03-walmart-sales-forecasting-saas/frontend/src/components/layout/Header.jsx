import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, Settings, ChevronDown, Check, AlertTriangle, Info, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Sample notifications data
const sampleNotifications = [
    { id: 1, type: 'alert', title: 'Low Stock Alert', message: 'Product A is running low', time: '5m', read: false },
    { id: 2, type: 'success', title: 'Forecast Ready', message: 'Weekly forecast generated', time: '1h', read: false },
    { id: 3, type: 'info', title: 'System Update', message: 'New features available', time: '2h', read: true },
];

const Header = ({ title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState(sampleNotifications);

    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/analysis?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'alert': return <AlertTriangle className="w-4 h-4" style={{ color: 'var(--accent-red)' }} />;
            case 'success': return <Check className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />;
            default: return <Info className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />;
        }
    };

    return (
        <header className="px-6 lg:px-8 py-4 bg-[var(--bg-primary)] sticky top-0 z-40 border-b border-[var(--border-primary)] backdrop-blur-md bg-opacity-90">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                        {title}
                        {unreadCount > 0 && (
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent-red)' }} />
                        )}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative hidden lg:block group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-[var(--accent-blue)]"
                            style={{ color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search analysis..."
                            className="pl-10 pr-4 py-2 w-64 rounded-xl text-sm transition-all focus:w-72 focus:outline-none"
                            style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-primary)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </form>

                    {/* Notifications */}
                    <div ref={notifRef} className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2.5 rounded-xl transition-all hover:bg-[var(--bg-secondary)]"
                            style={{ color: showNotifications ? 'var(--accent-blue)' : 'var(--text-secondary)' }}
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-[var(--bg-primary)]"
                                    style={{ background: 'var(--accent-red)' }} />
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-80 rounded-xl shadow-xl overflow-hidden glass-card animate-in fade-in zoom-in-95 duration-200"
                                style={{ border: '1px solid var(--border-primary)', background: 'var(--bg-elevated)' }}>
                                <div className="px-4 py-3 flex justify-between items-center border-b border-[var(--border-primary)]">
                                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                                    <span className="text-xs px-2 py-0.5 rounded-full"
                                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                                        {unreadCount} New
                                    </span>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => markAsRead(notif.id)}
                                            className="px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--bg-secondary)] relative group border-b border-[var(--border-primary)] last:border-0"
                                            style={{ opacity: notif.read ? 0.6 : 1 }}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-0.5 p-1.5 rounded-lg h-fit"
                                                    style={{ background: 'var(--bg-secondary)' }}>
                                                    {getNotificationIcon(notif.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                            {notif.title}
                                                        </p>
                                                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{notif.time}</span>
                                                    </div>
                                                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                                                        {notif.message}
                                                    </p>
                                                </div>
                                            </div>
                                            {!notif.read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'var(--accent-blue)' }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <button className="p-2.5 rounded-xl transition-all hover:bg-[var(--bg-secondary)]"
                        style={{ color: 'var(--text-secondary)' }}>
                        <Settings className="w-5 h-5" />
                    </button>

                    {/* User Profile */}
                    <div ref={dropdownRef} className="relative pl-2 border-l border-[var(--border-primary)]">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-3 p-1.5 rounded-xl transition-all hover:bg-[var(--bg-secondary)]"
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
                                style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                                style={{ color: 'var(--text-secondary)' }} />
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 mt-3 w-48 rounded-xl shadow-xl overflow-hidden glass-card animate-in fade-in zoom-in-95 duration-200"
                                style={{ border: '1px solid var(--border-primary)', background: 'var(--bg-elevated)' }}>
                                <div className="px-4 py-3 border-b border-[var(--border-primary)]">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                        {user?.full_name || 'User Name'}
                                    </p>
                                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                                        {user?.email || 'user@example.com'}
                                    </p>
                                </div>
                                <div className="p-1">
                                    <button onClick={() => navigate('/profile')}
                                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--bg-secondary)] flex items-center gap-2"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        <User className="w-4 h-4" /> Profile
                                    </button>
                                    <button onClick={() => { logout(); navigate('/login'); }}
                                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[rgba(255,87,87,0.1)] flex items-center gap-2 group"
                                        style={{ color: 'var(--text-secondary)' }}>
                                        <X className="w-4 h-4 group-hover:text-[var(--accent-red)]" />
                                        <span className="group-hover:text-[var(--accent-red)]">Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
