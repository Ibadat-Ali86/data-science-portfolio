
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Command,
    Home,
    Upload,
    BarChart2,
    Settings,
    User,
    FileText,
    LogOut,
    Sparkles,
    Zap,
    X,
    TrendingUp,
    LayoutDashboard
} from 'lucide-react';

const CommandPalette = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const commands = [
        {
            category: "Navigation",
            items: [
                { icon: Home, label: "Home", path: "/", shortcut: "G H" },
                { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", shortcut: "G D" },
                { icon: Upload, label: "Upload Data", path: "/upload", shortcut: "G U" },
                { icon: BarChart2, label: "Analysis", path: "/analysis", shortcut: "G A" },
                { icon: TrendingUp, label: "Forecast Explorer", path: "/forecast-explorer", shortcut: "G F" },
                { icon: Sparkles, label: "Scenario Simulator", path: "/scenario-simulator", shortcut: "G S" },
                { icon: FileText, label: "Reports", path: "/reports", shortcut: "G R" },
            ]
        },
        {
            category: "Settings",
            items: [
                { icon: User, label: "Profile", path: "/profile", shortcut: "G P" },
                { icon: Settings, label: "Settings", path: "/settings", shortcut: "G ," },
                { icon: LogOut, label: "Logout", action: () => console.log('Logout'), shortcut: "Shift Q" },
            ]
        }
    ];

    // Filter commands based on query
    const filteredCommands = commands.map(group => ({
        ...group,
        items: group.items.filter(item =>
            item.label.toLowerCase().includes(query.toLowerCase())
        )
    })).filter(group => group.items.length > 0);

    // Flatten for keyboard navigation
    const flatItems = filteredCommands.flatMap(group => group.items);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onClose(); // Toggle handled by parent usually, but this closes it
            }

            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % flatItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + flatItems.length) % flatItems.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = flatItems[selectedIndex];
                if (item) {
                    if (item.path) navigate(item.path);
                    if (item.action) item.action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, flatItems, navigate, onClose, selectedIndex]);

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-bg-primary/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-xl bg-bg-elevated border border-border-subtle rounded-xl shadow-2xl overflow-hidden relative z-50 flex flex-col max-h-[60vh]"
                    >
                        <div className="flex items-center px-4 py-3 border-b border-border-subtle">
                            <Search className="w-5 h-5 text-text-tertiary mr-3" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Type a command or search..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-tertiary text-lg"
                            />
                            <button
                                onClick={onClose}
                                className="p-1 rounded hover:bg-bg-tertiary text-text-tertiary transition-colors"
                            >
                                <span className="text-xs font-mono border border-border-default rounded px-1.5 py-0.5">ESC</span>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-2 scrollbar-thin">
                            {flatItems.length === 0 ? (
                                <div className="py-12 text-center text-text-tertiary">
                                    <p>No results found.</p>
                                </div>
                            ) : (
                                filteredCommands.map((group, groupIndex) => (
                                    <div key={group.category} className="mb-2 last:mb-0">
                                        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-3 py-2">
                                            {group.category}
                                        </h3>
                                        {group.items.map((item) => {
                                            // Calculate global index for selection
                                            const itemGlobalIndex = flatItems.indexOf(item);
                                            const isSelected = itemGlobalIndex === selectedIndex;

                                            return (
                                                <button
                                                    key={item.label}
                                                    onClick={() => {
                                                        if (item.path) navigate(item.path);
                                                        if (item.action) item.action();
                                                        onClose();
                                                    }}
                                                    onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                                                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${isSelected
                                                        ? 'bg-brand-50 text-brand-600'
                                                        : 'text-text-secondary hover:bg-bg-tertiary'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className={`w-5 h-5 ${isSelected ? 'text-brand-500' : 'text-text-tertiary'}`} />
                                                        <span className={`font-medium ${isSelected ? 'text-text-primary' : ''}`}>
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    {item.shortcut && (
                                                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${isSelected
                                                            ? 'border-brand-200 bg-white text-brand-600 shadow-sm'
                                                            : 'border-border-default bg-bg-tertiary text-text-tertiary'
                                                            }`}>
                                                            {item.shortcut}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="px-4 py-2 border-t border-border-subtle bg-bg-secondary text-xs text-text-tertiary flex justify-between items-center">
                            <div className="flex gap-4">
                                <span><kbd className="font-sans">↑↓</kbd> to navigate</span>
                                <span><kbd className="font-sans">↵</kbd> to select</span>
                            </div>
                            <span>
                                <span className="text-brand-500 font-medium">AdaptIQ</span> Command Palette
                            </span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
