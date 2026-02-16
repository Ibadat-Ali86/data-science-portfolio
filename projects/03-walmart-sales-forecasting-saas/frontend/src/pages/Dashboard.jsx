import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import KPICard from '../components/dashboard/KPICard';
import ForecastChart from '../components/charts/ForecastChart';
import { SkeletonKPIGrid, SkeletonChart } from '../components/common/SkeletonLoader';
import {
    Target,
    DollarSign,
    Package,
    AlertTriangle,
    Calendar,
    ArrowUpRight,
    ArrowRight,
    BarChart3,
    Upload,
    Brain,
    Sparkles,
    TrendingUp,
    PlayCircle,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30');
    const [showWelcome, setShowWelcome] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Mock data - would be replaced by API call
            const mockData = {
                kpis: {
                    mape: { value: '1.23%', change: '-0.15%', trend: 'down' },
                    savings: { value: '$2.5M', change: '+12.3%', trend: 'up' },
                    products: { value: '1,234', change: '+45', trend: 'up' },
                    stockouts: { value: '23', change: '-8', trend: 'down' },
                },
                chartData: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
                    actual: [15000, 18000, 16500, 19200, 17800, 20500, 19000, 21000],
                    forecast: [16000, 17500, 17000, 19000, 18500, 20000, 19500, 20800],
                },
            };
            setTimeout(() => {
                setDashboardData(mockData);
                setLoading(false);
            }, 800);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    // Quick action cards
    const quickActions = [
        {
            title: 'Upload Data',
            description: 'Import Walmart sales data for analysis',
            icon: Upload,
            path: '/upload',
            gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)'
        },
        {
            title: 'Run Analysis',
            description: 'Analyze trends and patterns',
            icon: Brain,
            path: '/analysis',
            gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)'
        },
        {
            title: 'View Forecasts',
            description: 'Explore prediction results',
            icon: TrendingUp,
            path: '/forecast-explorer',
            gradient: 'linear-gradient(135deg, #10B981, #06B6D4)'
        },
        {
            title: 'Plan Scenarios',
            description: 'Simulate business what-ifs',
            icon: Sparkles,
            path: '/scenario-planning',
            gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)'
        }
    ];

    return (
        <Layout title="Dashboard">
            <div className="space-y-8">
                {/* Welcome Banner */}
                <AnimatePresence>
                    {showWelcome && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="relative overflow-hidden rounded-2xl p-8 shadow-lg border border-[var(--border-primary)]"
                            style={{ background: 'linear-gradient(to right, var(--bg-secondary), var(--bg-tertiary))' }}
                        >
                            <div className="relative z-10">
                                <h1 className="text-2xl font-bold mb-2 gradient-text">
                                    Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
                                </h1>
                                <p className="mb-6 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                                    Ready to forecast? Start by uploading your sales data or explore your existing forecasts.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/upload')}
                                        className="btn-primary"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload Data
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/analysis')}
                                        className="btn-secondary"
                                    >
                                        <PlayCircle className="w-4 h-4" />
                                        Start Analysis
                                    </motion.button>
                                </div>
                            </div>

                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20"
                                style={{ background: 'var(--accent-purple)' }} />
                            <div className="absolute bottom-0 left-1/2 w-48 h-48 rounded-full blur-2xl translate-y-1/2 opacity-10"
                                style={{ background: 'var(--accent-cyan)' }} />

                            {/* Close button */}
                            <button
                                onClick={() => setShowWelcome(false)}
                                className="absolute top-4 right-4 p-1 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header with Date Range */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Overview</h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Your forecast performance at a glance</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-primary)] shadow-sm"
                            style={{ background: 'var(--bg-secondary)' }}>
                            <Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="bg-transparent border-none text-sm font-medium focus:outline-none cursor-pointer"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="365">Last year</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* KPI Cards with Skeleton Loading */}
                {loading ? (
                    <SkeletonKPIGrid count={4} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard
                            title="Forecast Accuracy (MAPE)"
                            value={dashboardData?.kpis.mape.value}
                            change={dashboardData?.kpis.mape.change}
                            trend={dashboardData?.kpis.mape.trend}
                            icon={Target}
                            color="primary"
                        />
                        <KPICard
                            title="Cost Savings"
                            value={dashboardData?.kpis.savings.value}
                            change={dashboardData?.kpis.savings.change}
                            trend={dashboardData?.kpis.savings.trend}
                            icon={DollarSign}
                            color="success"
                        />
                        <KPICard
                            title="Active Products"
                            value={dashboardData?.kpis.products.value}
                            change={dashboardData?.kpis.products.change}
                            trend={dashboardData?.kpis.products.trend}
                            icon={Package}
                            color="primary"
                        />
                        <KPICard
                            title="Stockout Risk"
                            value={dashboardData?.kpis.stockouts.value}
                            change={dashboardData?.kpis.stockouts.change}
                            trend={dashboardData?.kpis.stockouts.trend}
                            icon={AlertTriangle}
                            color="warning"
                        />
                    </div>
                )}

                {/* Quick Actions Grid */}
                <div>
                    <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <motion.button
                                key={action.path}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(action.path)}
                                className="group p-5 rounded-2xl border text-left transition-shadow hover:shadow-lg"
                                style={{
                                    background: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-primary)',
                                    boxShadow: 'var(--shadow-md)'
                                }}
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg"
                                    style={{ background: action.gradient }}>
                                    <action.icon className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{action.title}</h4>
                                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{action.description}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Chart Section with Skeleton */}
                {loading ? (
                    <SkeletonChart />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Sales Forecast Trend</h3>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Actual vs Predicted sales over time</p>
                            </div>
                            <Link to="/forecast-explorer" className="flex items-center gap-1 text-sm font-medium hover:underline"
                                style={{ color: 'var(--accent-blue)' }}>
                                View Details <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="h-80 w-full">
                            <ForecastChart data={dashboardData?.chartData} />
                        </div>
                    </motion.div>
                )}

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold border-l-4 pl-3" style={{ borderColor: 'var(--accent-purple)', color: 'var(--text-primary)' }}>Top Products</h4>
                            <Link to="/products" className="text-xs hover:underline" style={{ color: 'var(--accent-blue)' }}>View All</Link>
                        </div>
                        <div className="space-y-4">
                            {['Widget Pro Max', 'Smart Gadget X', 'Essential Pack Z'].map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{product}</span>
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: 'var(--accent-green)' }}>+{(index + 1) * 12}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="card"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold border-l-4 pl-3" style={{ borderColor: 'var(--accent-blue)', color: 'var(--text-primary)' }}>Getting Started</h4>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Follow the workflow to generate insights</p>
                            <Link
                                to="/upload"
                                className="btn-primary w-full justify-center"
                            >
                                <Upload className="w-4 h-4" />
                                Start with Upload
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="card"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold border-l-4 pl-3" style={{ borderColor: 'var(--accent-green)', color: 'var(--text-primary)' }}>Model Performance</h4>
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: 'XGBoost', mape: '0.98%', status: 'best' },
                                { name: 'LSTM', mape: '1.45%', status: 'good' },
                                { name: 'Prophet', mape: '2.31%', status: 'ok' },
                            ].map((model, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full"
                                            style={{ background: model.status === 'best' ? 'var(--accent-green)' : model.status === 'good' ? 'var(--accent-blue)' : 'var(--accent-orange)' }} />
                                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{model.name}</span>
                                    </div>
                                    <span className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{model.mape}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
