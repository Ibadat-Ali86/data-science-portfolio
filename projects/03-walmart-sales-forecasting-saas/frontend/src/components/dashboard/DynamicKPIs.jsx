import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Activity,
    BarChart2,
    PieChart,
    Briefcase
} from 'lucide-react';

const KPICard = ({ kpi }) => {
    const { name, value, suffix, trend_value, description, visualization_type, key } = kpi;

    // Icon mapping based on key/name heuristics
    const getIcon = () => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('sales') || lowerKey.includes('revenue') || lowerKey.includes('cost')) return <DollarSign className="w-5 h-5 text-emerald-500" />;
        if (lowerKey.includes('headcount') || lowerKey.includes('employee')) return <Users className="w-5 h-5 text-blue-500" />;
        if (lowerKey.includes('turnover') || lowerKey.includes('rate')) return <Activity className="w-5 h-5 text-rose-500" />;
        return <BarChart2 className="w-5 h-5 text-indigo-500" />;
    };

    const formatValue = (val) => {
        if (typeof val !== 'number') return val;
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
        return val.toLocaleString();
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                {getIcon()}
            </div>

            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-slate-50 rounded-lg">
                    {getIcon()}
                </div>
                {trend_value !== null && trend_value !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend_value >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                        {trend_value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(trend_value)}%
                    </div>
                )}
            </div>

            <h3 className="text-slate-500 text-sm font-medium mb-1">{name}</h3>
            <div className="text-2xl font-bold text-slate-800 flex items-baseline gap-1">
                {formatValue(value)}
                <span className="text-sm font-normal text-slate-400">{suffix}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{description}</p>

            {/* Visualization Placeholder based on type */}
            {visualization_type === 'progress' && (
                <div className="w-full h-1 bg-slate-100 rounded-full mt-3">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(value, 100)}%` }}></div>
                </div>
            )}
        </motion.div>
    );
};

const DynamicKPIs = ({ kpis, domainInfo }) => {
    if (!kpis || kpis.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-slate-800">
                    {domainInfo?.domain || 'Key Metrics'} Insights
                </h2>
                {domainInfo?.confidence && (
                    <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">
                        {Math.round(domainInfo.confidence * 100)}% Match
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, idx) => (
                    <KPICard key={kpi.key || idx} kpi={kpi} />
                ))}
            </div>
        </div>
    );
};

export default DynamicKPIs;
