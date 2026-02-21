/**
 * Scenario Simulator
 * Real-time what-if analysis — sliders auto-calculate on change (debounced).
 * No button required. Blueprint Phase 4 spec.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    GitBranch,
    TrendingUp,
    TrendingDown,
    Save,
    RotateCcw,
    Download,
    Brain,
    ChevronRight,
    AlertCircle,
    Sliders,
    DollarSign,
    ShoppingCart,
    Megaphone,
    Zap,
    Info,
    CheckCircle,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { useFlow } from '../context/FlowContext';

// ─────────────────────────────────────────────
// Debounce Hook
// ─────────────────────────────────────────────
const useDebounce = (value, delay = 350) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
};

// ─────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────
const EmptyState = ({ navigate }) => (
    <div className="max-w-xl mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-default rounded-2xl border border-border-default p-10 text-center"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
        >
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Run Analysis First</h2>
            <p className="text-text-secondary mb-8 text-sm leading-relaxed">
                The Scenario Simulator uses your forecast data as a baseline.
                Complete an analysis pipeline run to enable live what-if simulations.
            </p>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/analysis')}
                className="px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-semibold inline-flex items-center gap-2"
            >
                <Brain className="w-5 h-5" />
                Go to Analysis Pipeline
                <ChevronRight className="w-4 h-4" />
            </motion.button>
        </motion.div>
    </div>
);

// ─────────────────────────────────────────────
// Slider Row 
// ─────────────────────────────────────────────
const SliderRow = ({ config, value, onChange }) => {
    const deviation = value - 100;
    const isUp = deviation > 0;
    const isDown = deviation < 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700">
                        <config.icon className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-primary">{config.label}</p>
                        <p className="text-xs text-text-muted">{config.description}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold font-mono px-2.5 py-1 rounded-lg ${isUp ? 'bg-green-50 text-green-700' :
                    isDown ? 'bg-red-50 text-red-700' :
                        'bg-bg-subtle text-text-secondary'
                    }`}>
                    {isUp && <TrendingUp className="w-3 h-3" />}
                    {isDown && <TrendingDown className="w-3 h-3" />}
                    {value}%
                </div>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min="50"
                    max="150"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, var(--brand-primary, #6D28D9) ${(value - 50) * 2}%, #E5E7EB ${(value - 50) * 2}%)`
                    }}
                />
                {/* Midpoint indicator */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-border-default rounded-full pointer-events-none"
                    style={{ left: '50%' }}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Impact Card
// ─────────────────────────────────────────────
const ImpactCard = ({ label, change, projected, delay = 0 }) => {
    const val = parseFloat(change);
    const isPos = val > 0;
    const isNeg = val < 0;

    return (
        <motion.div
            key={change}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.25 }}
            className="p-4 rounded-xl border border-border-default bg-bg-subtle"
        >
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">{label}</p>
            <div className={`text-2xl font-bold font-mono flex items-center gap-1.5 ${isPos ? 'text-green-700' : isNeg ? 'text-red-600' : 'text-text-secondary'}`}>
                {isPos && <TrendingUp className="w-5 h-5" />}
                {isNeg && <TrendingDown className="w-5 h-5" />}
                {isPos ? '+' : ''}{val.toFixed(1)}%
            </div>
            <p className="text-xs text-text-secondary mt-1">Projected: <span className="font-semibold text-text-primary">{projected}</span></p>
        </motion.div>
    );
};

// ─────────────────────────────────────────────
// Main Scenario Simulator
// ─────────────────────────────────────────────
const ScenarioSimulator = () => {
    const navigate = useNavigate();
    const { analysisResults } = useFlow();

    // Also try localStorage fallback for backwards compat
    const [localData, setLocalData] = useState(null);
    useEffect(() => {
        if (!analysisResults) {
            const saved = localStorage.getItem('analysisResults');
            if (saved) {
                try { setLocalData(JSON.parse(saved)); } catch (_) { }
            }
        }
    }, [analysisResults]);

    const DEMO_DATA = {
        forecast: { predictions: [4500, 4800, 5100, 5050, 5300, 5600, 5900] },
        metrics: { mape: 6.8, rmse: 142.5, r2: 0.93, modelType: 'XGBoost Ensemble', projectedRevenue: 1250000 },
        dataLength: 25000,
        isDemo: true
    };

    const analysisData = analysisResults || localData || DEMO_DATA;

    const baseRef = useRef({ demand: 100, price: 100, marketing: 100, inventory: 100 });

    const [scenario, setScenario] = useState({ demand: 100, price: 100, marketing: 100, inventory: 100 });
    const [savedScenarios, setSavedScenarios] = useState(() => {
        try { return JSON.parse(localStorage.getItem('savedScenarios') || '[]'); } catch { return []; }
    });
    const [lastSaved, setLastSaved] = useState(null);

    // Debounced scenario for auto-calculation
    const debouncedScenario = useDebounce(scenario, 350);

    // ── Compute Impact (Blueprint momentum model) ──
    const results = useMemo(() => {
        const base = baseRef.current;
        const demandΔ = ((debouncedScenario.demand - base.demand) / base.demand) * 100;
        const priceΔ = ((debouncedScenario.price - base.price) / base.price) * 100;
        const marketΔ = ((debouncedScenario.marketing - base.marketing) / base.marketing) * 100;
        const inventoryΔ = ((debouncedScenario.inventory - base.inventory) / base.inventory) * 100;

        // Weighted impact model
        const revenueImpact = demandΔ * 0.5 + priceΔ * 0.8 + marketΔ * 0.15;
        const quantityImpact = demandΔ + marketΔ * 0.3 - priceΔ * 0.4;
        const costImpact = marketΔ * 0.4 + inventoryΔ * 0.3;
        const profitImpact = revenueImpact - costImpact * 0.5;

        const baseRevenue = analysisData?.metrics?.projectedRevenue ||
            (analysisData?.forecast?.predictions?.reduce((a, b) => a + b, 0) || 0) * 25 ||
            125000;
        const baseQty = analysisData?.dataLength || 1500;

        return {
            revenueChange: revenueImpact,
            quantityChange: quantityImpact,
            costChange: costImpact,
            profitChange: profitImpact,
            projectedRevenue: baseRevenue * (1 + revenueImpact / 100),
            projectedQuantity: baseQty * (1 + quantityImpact / 100),
            projectedProfit: (baseRevenue * 0.3) * (1 + profitImpact / 100),
        };
    }, [debouncedScenario, analysisData]);

    const resetScenario = () => {
        setScenario({ demand: 100, price: 100, marketing: 100, inventory: 100 });
    };

    const saveScenario = () => {
        const newScenario = {
            id: Date.now(),
            name: `Scenario ${savedScenarios.length + 1}`,
            ...scenario,
            revenue: `${results.revenueChange > 0 ? '+' : ''}${results.revenueChange.toFixed(1)}%`,
            profit: `${results.profitChange > 0 ? '+' : ''}${results.profitChange.toFixed(1)}%`,
            date: new Date().toLocaleDateString(),
        };
        const updated = [newScenario, ...savedScenarios].slice(0, 10);
        setSavedScenarios(updated);
        localStorage.setItem('savedScenarios', JSON.stringify(updated));
        setLastSaved(newScenario.name);
        setTimeout(() => setLastSaved(null), 3000);
    };

    const downloadResults = () => {
        const data = { scenario, results, analysisSource: analysisData?.metrics?.modelType || 'Ensemble Model', timestamp: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scenario_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const sliders = [
        { key: 'demand', label: 'Demand Factor', icon: ShoppingCart, description: 'Expected customer demand level' },
        { key: 'price', label: 'Price Adjustment', icon: DollarSign, description: 'Product pricing strategy' },
        { key: 'marketing', label: 'Marketing Spend', icon: Megaphone, description: 'Marketing investment level' },
        { key: 'inventory', label: 'Inventory Level', icon: GitBranch, description: 'Stock holding strategy' },
    ];

    const impactItems = [
        { label: 'Revenue Impact', change: results.revenueChange, projected: formatCurrency(results.projectedRevenue) },
        { label: 'Volume Change', change: results.quantityChange, projected: formatNumber(results.projectedQuantity) + ' units' },
        { label: 'Profit Impact', change: results.profitChange, projected: formatCurrency(results.projectedProfit) },
        { label: 'Cost Variance', change: results.costChange, projected: 'Variable' },
    ];

    return (
        <div className="space-y-6 p-1">
            {/* Header Banner */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 p-6 text-white"
                style={{ boxShadow: '0 4px 12px rgba(109,40,217,0.2)' }}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-brand-200 text-xs font-semibold uppercase tracking-wider mb-1">
                            <Zap className="w-4 h-4" />
                            Real-Time Simulation
                            {analysisData?.isDemo && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                                    DEMO MODE
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold">
                            {analysisData?.metrics?.modelType || 'Ensemble'} Forecast — What-If Simulator
                        </h2>
                        <p className="text-brand-100 text-sm mt-1 opacity-80">
                            Move any slider to instantly recalculate projected impact
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-brand-200 uppercase tracking-wider">Base Accuracy</p>
                        <p className="text-2xl font-bold font-mono">
                            {(100 - (analysisData?.metrics?.mape || 5)).toFixed(1)}%
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-6">
                {/* Sliders Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface-default rounded-2xl border border-border-default p-6"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-brand-600" />
                            <h3 className="text-base font-bold text-text-primary">Adjust Parameters</h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-brand-600 font-medium bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                            Live
                        </div>
                    </div>

                    <div className="space-y-7">
                        {sliders.map((s) => (
                            <SliderRow
                                key={s.key}
                                config={s}
                                value={scenario[s.key]}
                                onChange={(v) => setScenario(prev => ({ ...prev, [s.key]: v }))}
                            />
                        ))}
                    </div>

                    <div className="flex gap-3 mt-8 pt-6 border-t border-border-default">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={resetScenario}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-default text-text-secondary text-sm font-medium hover:bg-bg-subtle transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset to Baseline
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={saveScenario}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
                        >
                            <AnimatePresence mode="wait">
                                {lastSaved ? (
                                    <motion.span
                                        key="saved"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Saved!
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="save"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Scenario
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={downloadResults}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-default text-text-secondary text-sm font-medium hover:bg-bg-subtle transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </motion.button>
                    </div>
                </motion.div>

                {/* Impact Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-surface-default rounded-2xl border border-border-default p-6"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                >
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="w-5 h-5 text-brand-600" />
                        <h3 className="text-base font-bold text-text-primary">Projected Impact</h3>
                        <span className="ml-auto text-xs text-text-muted">Updates in real-time</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {impactItems.map((item, i) => (
                            <ImpactCard key={item.label} {...item} delay={i * 0.05} />
                        ))}
                    </div>

                    {/* ROI Bar */}
                    <div className="p-4 rounded-xl bg-bg-subtle border border-border-default">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Net Profit Impact</span>
                            <span className={`text-sm font-bold font-mono ${results.profitChange > 0 ? 'text-green-700' : results.profitChange < 0 ? 'text-red-600' : 'text-text-secondary'}`}>
                                {results.profitChange > 0 ? '+' : ''}{results.profitChange.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-border-default rounded-full h-2 overflow-hidden">
                            <motion.div
                                className={`h-2 rounded-full ${results.profitChange > 0 ? 'bg-green-500' : 'bg-red-400'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(Math.abs(results.profitChange) * 2, 100)}%` }}
                                transition={{ duration: 0.4 }}
                            />
                        </div>

                        <div className="flex items-start gap-1.5 mt-3">
                            <Info className="w-3.5 h-3.5 text-text-muted mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-text-muted leading-relaxed">
                                Estimates are directional projections based on your forecast data. Use for planning, not operational purchase orders.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Saved Scenarios Table */}
            {savedScenarios.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-surface-default rounded-2xl border border-border-default p-6"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                >
                    <h3 className="text-base font-bold text-text-primary mb-4">Saved Scenarios</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-default">
                                    {['Name', 'Demand', 'Price', 'Marketing', 'Revenue Impact', 'Date'].map(h => (
                                        <th key={h} className="py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted text-left last:text-right">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {savedScenarios.slice(0, 6).map((s) => (
                                    <tr key={s.id} className="border-b border-border-default last:border-0 hover:bg-bg-subtle transition-colors">
                                        <td className="py-3 px-3 font-semibold text-text-primary">{s.name}</td>
                                        <td className="py-3 px-3 font-mono text-text-secondary">{s.demand}%</td>
                                        <td className="py-3 px-3 font-mono text-text-secondary">{s.price}%</td>
                                        <td className="py-3 px-3 font-mono text-text-secondary">{s.marketing}%</td>
                                        <td className={`py-3 px-3 font-bold font-mono ${s.revenue.startsWith('+') ? 'text-green-700' : 'text-red-600'}`}>{s.revenue}</td>
                                        <td className="py-3 px-3 text-text-muted text-right">{s.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ScenarioSimulator;
