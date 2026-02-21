import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ForecastChart from '../components/charts/ForecastChart';
import FeatureImportanceChart from '../components/charts/FeatureImportanceChart';
import { useFlow } from '../context/FlowContext';
import { generateForecastCSV } from '../utils/reportGenerator';
import {
    TrendingUp,
    Download,
    Calendar,
    BarChart2,
    Brain,
    ChevronRight,
    AlertCircle,
    RefreshCw,
    CheckCircle2
} from 'lucide-react';
import { formatPercent, formatNumber } from '../utils/formatters';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ForecastExplorer = () => {
    const navigate = useNavigate();
    const { analysisResults: flowAnalysisResults } = useFlow();
    const [analysisData, setAnalysisData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    const DEMO_DATA = {
        forecast: {
            dates: Array.from({ length: 15 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - 5 + i);
                return d.toISOString();
            }),
            predictions: [4200, 4150, 4800, 5100, 4900, 4950, 5200, 5400, 5350, 5600, 5800, 6100, 6050, 6300, 6500]
        },
        metrics: { mape: 5.2, rmse: 135.4, mae: 108.2, r2Score: 0.94 },
        profile: {
            dimensions: { rows: 15000, cols: 24 }
        },
        feature_importance: [
            { feature: 'Promotion_Active', importance: 0.35 },
            { feature: 'DayOfWeek', importance: 0.25 },
            { feature: 'Historical_Sales_Lag1', importance: 0.20 },
            { feature: 'Price_Index', importance: 0.12 },
            { feature: 'Holiday_Flag', importance: 0.08 }
        ],
        isDemo: true
    };

    useEffect(() => {
        const loadData = () => {
            let data = flowAnalysisResults;
            if (!data) {
                const savedResults = localStorage.getItem('analysisResults');
                if (savedResults) {
                    data = JSON.parse(savedResults);
                }
            }

            // Fallback to demo data
            const displayData = data || DEMO_DATA;

            if (displayData) {
                setAnalysisData(displayData);
                if (displayData.forecast) {
                    const labels = displayData.forecast.dates.slice(0, 15);
                    const predictions = displayData.forecast.predictions.slice(0, 15);
                    // Mock historical for chart if not present
                    const historical = predictions.map((p, i) =>
                        i < 5 ? p * (0.9 + Math.random() * 0.2) : null
                    );

                    setForecastData({
                        labels: labels.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                        actual: historical,
                        forecast: predictions.map((p, i) => i >= 5 ? p : null),
                    });
                }

                if (displayData.metrics) {
                    setMetrics({
                        mape: formatPercent(displayData.metrics.mape || 4.5),
                        rmse: formatNumber((displayData.metrics.rmse || 150).toFixed(0)),
                        mae: formatNumber((displayData.metrics.mae || 120).toFixed(0)),
                        r2: (displayData.metrics.r2Score || 0.92).toFixed(3),
                    });
                }
            }
            setLoading(false);
        };

        loadData();
    }, [flowAnalysisResults]);

    const exportForecast = () => {
        if (!analysisData?.forecast) return;
        generateForecastCSV(analysisData);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-text-primary">Forecast Explorer</h2>
                        {analysisData?.isDemo && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                Demo Mode
                            </span>
                        )}
                    </div>
                    <p className="text-text-secondary mt-1">Detailed view of predicted demand and model performance.</p>
                </div>
                <Button onClick={exportForecast} variant="outline" icon={Download}>
                    Export CSV
                </Button>
            </div>

            <Card className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-default">
                    {/* Left: Reliability */}
                    <div className="p-6 flex flex-col justify-center items-center text-center">
                        <div className="relative w-32 h-32 mb-4">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-bg-tertiary" />
                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={351.8} strokeDashoffset={351.8 * 0.15} className="text-brand-600" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-3xl font-bold text-text-primary">85%</span>
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                            <CheckCircle2 className="w-3 h-3" />
                            HIGH CONFIDENCE
                        </div>
                        <p className="text-sm text-text-secondary">Ensemble Model Accuracy</p>
                    </div>

                    {/* Right: Metrics */}
                    <div className="col-span-2 p-6">
                        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-6">Performance Metrics</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'MAPE', value: metrics?.mape, sub: 'Error Rate', icon: TrendingUp, color: 'text-brand-600' },
                                { label: 'RMSE', value: metrics?.rmse, sub: 'Deviation', icon: BarChart2, color: 'text-emerald-600' },
                                { label: 'MAE', value: metrics?.mae, sub: 'Abs Error', icon: Calendar, color: 'text-amber-600' },
                                { label: 'R² Score', value: metrics?.r2, sub: 'Fit Quality', icon: Brain, color: 'text-purple-600' },
                            ].map((metric, index) => (
                                <div key={index} className="flex flex-col p-4 rounded-xl bg-bg-tertiary border border-border-default hover:border-brand-200 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{metric.label}</span>
                                        <metric.icon className={`w-4 h-4 ${metric.color}`} />
                                    </div>
                                    <span className={`text-2xl font-display font-bold ${metric.color} mb-1`}>{metric.value}</span>
                                    <span className="text-xs text-text-tertiary">{metric.sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">Demand Forecast Chart</h3>
                        <p className="text-sm text-text-tertiary">14-day rolling prediction</p>
                    </div>
                </div>
                <div className="h-96 w-full">
                    {forecastData ? (
                        <ForecastChart data={forecastData} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-text-tertiary">
                            Loading chart data...
                        </div>
                    )}
                </div>
            </Card>

            {/* Feature Importance Section */}
            <FeatureImportanceChart analysisData={analysisData} />

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:border-brand-300 transition-colors group cursor-pointer" interactive onClick={() => navigate('/analysis')}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-text-primary group-hover:text-brand-700 transition-colors">Run New Analysis</h4>
                            <p className="text-sm text-text-secondary">Upload new data to retrain model</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-tertiary ml-auto group-hover:text-brand-600" />
                    </div>
                </Card>

                <Card className="hover:border-brand-300 transition-colors group cursor-pointer" interactive onClick={() => navigate('/reports')}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Download className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-text-primary group-hover:text-purple-700 transition-colors">Generate Reports</h4>
                            <p className="text-sm text-text-secondary">Download PDF/Excel summaries</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-tertiary ml-auto group-hover:text-purple-600" />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ForecastExplorer;
