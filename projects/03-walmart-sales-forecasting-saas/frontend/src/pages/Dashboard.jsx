import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../utils/animations/variants';
import KPICard from '../components/dashboard/KPICard';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import RecentActivity from '../components/dashboard/RecentActivity';
import ForecastChart from '../components/charts/ForecastChart';
import PredictiveActionHub from '../components/dashboard/PredictiveActionHub';
import { ConfidenceRing } from '../components/common/ConfidenceRing';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { SkeletonKPIGrid, SkeletonChart, SkeletonCard } from '../components/common/SkeletonLoader';
import {
    Target,
    DollarSign,
    Package,
    AlertTriangle,
    Calendar,
    ArrowUpRight,
    Upload,
    Brain,
    TrendingUp,
    Sparkles,
    BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFlow } from '../context/FlowContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { analysisResults } = useFlow();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30');
    const [showWelcome, setShowWelcome] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange, analysisResults]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            if (analysisResults?.forecast?.predictions && analysisResults?.metrics) {
                // Use real pipeline data
                const { forecast, metrics, insights } = analysisResults;
                const ri = insights?.revenue_impact || {};

                const realData = {
                    kpis: {
                        mape: {
                            value: `${(metrics.mape || 0).toFixed(2)}%`,
                            change: 'From model validation',
                            trend: (metrics.mape < 10) ? 'up' : 'down'
                        },
                        savings: {
                            value: ri.projected_revenue ? `$${(ri.projected_revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'TBD',
                            change: ri.revenue_delta_pct > 0 ? `+${ri.revenue_delta_pct.toFixed(1)}%` : ri.revenue_delta_pct < 0 ? `${ri.revenue_delta_pct.toFixed(1)}%` : 'New',
                            trend: ri.revenue_delta_pct >= 0 ? 'up' : 'down'
                        },
                        products: { value: 'Optimized', change: 'Model Active', trend: 'up' },
                        stockouts: {
                            value: insights?.risk_assessment?.risk_level || 'Low',
                            change: `Score: ${insights?.risk_assessment?.overall_risk_score || 0}`,
                            trend: (insights?.risk_assessment?.overall_risk_score > 50) ? 'down' : 'up'
                        },
                    },
                    chartData: {
                        labels: forecast.dates?.slice(0, 30) || [],
                        actual: [], // In forecast mode, we might just show predictions, so chart component handles it
                        forecast: forecast.predictions?.slice(0, 30) || [],
                    },
                };
                setDashboardData(realData);
            } else {
                // Mock data fallback - run analysis to see real data
                const mockData = {
                    kpis: {
                        mape: { value: '4.2%', change: 'From model validation', trend: 'up' },
                        savings: { value: '$124,500', change: '+12.5% vs baseline', trend: 'up' },
                        products: { value: 'Optimized', change: 'Model Active', trend: 'up' },
                        stockouts: { value: 'Low', change: 'Score: 12', trend: 'up' },
                    },
                    chartData: {
                        labels: Array.from({ length: 14 }, (_, i) => {
                            const d = new Date(); d.setDate(d.getDate() - 7 + i); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }),
                        actual: [4100, 4200, 4150, 4300, 4600, 4800, 4900, null, null, null, null, null, null, null],
                        forecast: [null, null, null, null, null, null, 4900, 5100, 5050, 5200, 5400, 5700, 5800, 6100],
                    },
                    isDemo: true
                };
                setDashboardData(mockData);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    // Quick action cards
    const quickActions = [
        {
            title: 'Upload Data',
            description: 'Import sales data',
            icon: Upload,
            path: '/upload',
            color: 'bg-brand-500',
            bg: 'bg-brand-50',
            text: 'text-brand-600'
        },
        {
            title: 'Run Analysis',
            description: 'Analyze trends',
            icon: Brain,
            path: '/analysis',
            color: 'bg-accent-500',
            bg: 'bg-purple-50',
            text: 'text-purple-600'
        },
        {
            title: 'View Forecasts',
            description: 'Explore predictions',
            icon: TrendingUp,
            path: '/forecast-explorer',
            color: 'bg-emerald-500',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600'
        },
        {
            title: 'Plan Scenarios',
            description: 'Simulate outcomes',
            icon: Sparkles,
            path: '/scenario-planning',
            color: 'bg-amber-500',
            bg: 'bg-amber-50',
            text: 'text-amber-600'
        }
    ];

    const dateOptions = [
        { value: '7', label: 'Last 7 days' },
        { value: '30', label: 'Last 30 days' },
        { value: '90', label: 'Last 90 days' },
        { value: '365', label: 'Last year' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            <WelcomeBanner
                user={user}
                visible={showWelcome}
                onClose={() => setShowWelcome(false)}
            />

            <PredictiveActionHub />

            {/* Header with Date Range */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-text-primary">Overview</h2>
                        {dashboardData?.isDemo && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                Demo Mode
                            </span>
                        )}
                    </div>
                    <p className="text-sm mt-1 text-text-tertiary">Your forecast performance at a glance</p>
                </div>
                <div className="w-48">
                    <Select
                        icon={Calendar}
                        options={dateOptions}
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <SkeletonKPIGrid count={4} />
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <motion.div variants={staggerItem}><KPICard
                        title="Forecast Accuracy (MAPE)"
                        value={dashboardData?.kpis.mape.value}
                        change={dashboardData?.kpis.mape.change}
                        trend="up"
                        icon={Target}
                        color="primary"
                    /></motion.div>
                    <motion.div variants={staggerItem}><KPICard
                        title="Cost Savings"
                        value={dashboardData?.kpis.savings.value}
                        change={dashboardData?.kpis.savings.change}
                        trend={dashboardData?.kpis.savings.trend}
                        icon={DollarSign}
                        color="success"
                    /></motion.div>
                    <motion.div variants={staggerItem}><KPICard
                        title="Active Products"
                        value={dashboardData?.kpis.products.value}
                        change={dashboardData?.kpis.products.change}
                        trend={dashboardData?.kpis.products.trend}
                        icon={Package}
                        color="info"
                    /></motion.div>
                    <motion.div variants={staggerItem}><KPICard
                        title="Stockout Risk"
                        value={dashboardData?.kpis.stockouts.value}
                        change={dashboardData?.kpis.stockouts.change}
                        trend={dashboardData?.kpis.stockouts.trend}
                        icon={AlertTriangle}
                        color="warning"
                    /></motion.div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Forecast Chart */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Actions Grid */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-text-primary">Quick Actions</h3>
                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            {quickActions.map((action, index) => (
                                <motion.div key={action.path} variants={staggerItem}>
                                    <Card
                                        interactive
                                        onClick={() => navigate(action.path)}
                                        className="group flex flex-row items-center gap-4 p-4 hover:border-brand-200 transition-colors h-full"
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm ${action.bg} ${action.text}`}>
                                            <action.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-semibold text-text-primary group-hover:text-brand-600 transition-colors">{action.title}</h4>
                                            <p className="text-xs text-text-tertiary">{action.description}</p>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {loading ? (
                        <SkeletonChart />
                    ) : (
                        <Card className="border-border-default">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                        Sales Forecast Trend
                                        {dashboardData?.kpis?.mape?.value !== 'N/A' && (
                                            <ConfidenceRing confidence={85} size={24} />
                                        )}
                                    </h3>
                                    <p className="text-xs mt-1 text-text-tertiary">Actual vs Predicted sales over time</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/forecast-explorer')}>
                                    View Details <ArrowUpRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            <div className="h-80 w-full">
                                <ForecastChart data={dashboardData?.chartData} />
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column: Recent Activity & Top Products */}
                <div className="space-y-6">
                    {loading ? <SkeletonCard /> : <RecentActivity />}

                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold border-l-4 pl-3 border-purple-500 text-text-primary">Top Products</h4>
                            <Link to="/products" className="text-xs hover:underline text-brand-600">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {['Widget Pro Max', 'Smart Gadget X', 'Essential Pack Z'].map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-bg-tertiary transition-colors border border-transparent hover:border-border-subtle group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-bg-tertiary text-text-secondary group-hover:bg-white group-hover:shadow-sm transition-all">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary">{product}</span>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600">+{(index + 1) * 12}%</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-brand-600 to-indigo-700 text-white border-none">
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <h4 className="font-bold text-lg mb-2">Pro Insights</h4>
                                <p className="text-brand-100 text-sm mb-4">Upgrade to unlock advanced predictive analytics and export features.</p>
                            </div>
                            <Button variant="secondary" size="sm" className="w-full justify-center bg-white text-brand-600 hover:bg-brand-50 border-none">
                                Upgrade Plan
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
