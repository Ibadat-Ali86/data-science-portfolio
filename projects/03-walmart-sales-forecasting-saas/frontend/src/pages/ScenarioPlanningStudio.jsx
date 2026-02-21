import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { generateScenarioCSV } from '../utils/reportGenerator';
import { useFlow } from '../context/FlowContext';
import {
    Sliders,
    TrendingUp,
    Calendar,
    DollarSign,
    Play,
    RotateCcw,
    Download,
    ChevronDown,
    ChevronUp,
    Percent,
    Store,
    Tag,
    Thermometer,
    AlertCircle,
    Brain,
    Rocket
} from 'lucide-react';

// Slider Component — with visible colored track and branded thumb
const ScenarioSlider = ({ label, value, onChange, min, max, step = 1, unit = '', icon: Icon }) => {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
                    {label}
                </label>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                    {value}{unit}
                </span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full"
                    style={{
                        background: `linear-gradient(90deg, #6366f1 ${pct}%, #e2e8f0 ${pct}%)`,
                    }}
                />
            </div>
            <div className="flex justify-between text-[10px] mt-1 text-slate-400">
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
            </div>
        </div>
    );
};


// Result Card Component
const ResultCard = ({ title, baseline, scenario, unit = '$', positive = true }) => {
    const diff = scenario - baseline;
    const diffPercent = ((diff / baseline) * 100).toFixed(1);
    const isPositive = positive ? diff >= 0 : diff <= 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-4 border"
            style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--border-primary)'
            }}
        >
            <h4 className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{title}</h4>
            <div className="flex items-end gap-3">
                <div>
                    <p className="text-2xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                        {unit === '$' ? `$${scenario.toLocaleString()}` : `${scenario.toLocaleString()}${unit}`}
                    </p>
                    <p className="text-xs flex items-center gap-1 mt-1"
                        style={{ color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                        {isPositive ? '+' : ''}{diffPercent}% vs baseline
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

// Scenario Preset Component
const ScenarioPreset = ({ name, description, onClick, active, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${active
            ? 'border-[var(--accent-purple)]'
            : 'border-[var(--border-primary)] hover:border-[var(--accent-purple)]'
            }`}
        style={{ background: active ? 'rgba(183, 148, 246, 0.1)' : 'var(--bg-secondary)' }}
    >
        <div className="relative z-10 flex items-start gap-3">
            <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-[var(--accent-purple)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--accent-purple)]'}`}>
                {Icon && <Icon className="w-5 h-5" />}
            </div>
            <div>
                <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{name}</h4>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{description}</p>
            </div>
        </div>
        {active && (
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-purple)] to-transparent opacity-5" />
        )}
    </button>
);

// Main Scenario Planning Studio Component
const ScenarioPlanningStudio = () => {
    const navigate = useNavigate();
    // Get analysis data from FlowContext
    const { analysisResults, uploadedData } = useFlow();

    // Calculate baseline from actual data
    const baseline = useMemo(() => {
        // If we have analysis results, calculate from actual forecast
        if (analysisResults?.forecast?.predictions) {
            const predictions = analysisResults.forecast.predictions;
            const totalForecast = predictions.reduce((a, b) => a + b, 0);
            const avgPrice = 25; // Assumed average price per unit
            const marginPercent = 0.15; // 15% margin

            return {
                revenue: Math.round(totalForecast * avgPrice),
                margin: Math.round(totalForecast * avgPrice * marginPercent),
                unitsSold: Math.round(totalForecast),
                inventoryNeeded: Math.round(totalForecast * 1.15), // 15% safety stock
                dataSource: 'analysis' // Track data source
            };
        }

        // Fallback to reasonable defaults if no data
        return {
            revenue: 2500000,
            margin: 375000,
            unitsSold: 130000,
            inventoryNeeded: 145000,
            dataSource: 'default'
        };
    }, [analysisResults]);

    // Scenario parameters
    const [scenarios, setScenarios] = useState({
        markdownPercent: 15,
        promotionalWeeks: 4,
        temperatureOffset: 0,
        holidayBoost: 10,
        storeCluster: 'all'
    });

    // Results (calculated from scenarios)
    const [results, setResults] = useState(null);

    // Initialize results when baseline changes
    useEffect(() => {
        if (baseline) {
            setResults({
                revenue: Math.round(baseline.revenue * 1.14), // Initial scenario boost
                margin: Math.round(baseline.margin * 1.13),
                unitsSold: Math.round(baseline.unitsSold * 1.115),
                inventoryNeeded: Math.round(baseline.inventoryNeeded * 1.12)
            });
        }
    }, [baseline]);

    const [activePreset, setActivePreset] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Initial loading state / safety guard
    if (!results) {
        return (
            <Layout title="Scenario Planning">
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-purple)] border-t-transparent animate-spin" />
                        <p style={{ color: 'var(--text-secondary)' }}>Initializing studio...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Presets
    const presets = [
        {
            id: 'conservative',
            name: 'Conservative Q1',
            description: 'Minimal promotions, standard pricing',
            icon: Calendar,
            params: { markdownPercent: 5, promotionalWeeks: 2, temperatureOffset: 0, holidayBoost: 5 }
        },
        {
            id: 'aggressive',
            name: 'Aggressive Growth',
            description: 'Heavy promotions to capture market share',
            icon: Rocket,
            params: { markdownPercent: 25, promotionalWeeks: 8, temperatureOffset: 0, holidayBoost: 20 }
        },
        {
            id: 'holiday',
            name: 'Holiday Season',
            description: 'Optimized for Q4 holiday demand',
            icon: Tag,
            params: { markdownPercent: 20, promotionalWeeks: 6, temperatureOffset: -10, holidayBoost: 25 }
        }
    ];

    const applyPreset = (preset) => {
        setActivePreset(preset.id);
        setScenarios({ ...scenarios, ...preset.params });
        runSimulation({ ...scenarios, ...preset.params });
    };

    const runSimulation = async (params = scenarios) => {
        setIsSimulating(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Calculate scenario results based on parameters
        const markdownMultiplier = 1 + (params.markdownPercent / 100);
        const promotionalMultiplier = 1 + (params.promotionalWeeks * 0.02);
        const holidayMultiplier = 1 + (params.holidayBoost / 100);

        const revenueMultiplier = markdownMultiplier * promotionalMultiplier * holidayMultiplier * 0.85;
        const marginMultiplier = (1 - params.markdownPercent / 200) * promotionalMultiplier * holidayMultiplier;

        setResults({
            revenue: Math.round(baseline.revenue * revenueMultiplier),
            margin: Math.round(baseline.margin * marginMultiplier),
            unitsSold: Math.round(baseline.unitsSold * revenueMultiplier * 1.1),
            inventoryNeeded: Math.round(baseline.inventoryNeeded * revenueMultiplier * 1.15)
        });

        setIsSimulating(false);
    };

    const resetScenario = () => {
        setScenarios({
            markdownPercent: 15,
            promotionalWeeks: 4,
            temperatureOffset: 0,
            holidayBoost: 10,
            storeCluster: 'all'
        });
        setActivePreset(null);
        setResults(baseline);
    };

    const handleExportScenario = () => {
        if (!baseline || !results) return;
        generateScenarioCSV(results, baseline, scenarios);
    };

    return (
        <Layout title="Scenario Planning">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Banner */}
                <div className="rounded-xl p-6 border shadow-lg relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))', borderColor: 'var(--border-primary)' }}>
                    <div className="relative z-10">
                        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Sliders className="w-6 h-6" style={{ color: 'var(--accent-purple)' }} />
                            Scenario Simulator
                        </h1>
                        <p className="max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                            Simulate different business scenarios and measure their potential impact on sales, margins, and inventory requirements.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-10 pointer-events-none"
                        style={{ background: 'var(--accent-purple)' }} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - Scenario Controls */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Quick Presets */}
                        <div className="card">
                            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Presets</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {presets.map(preset => (
                                    <ScenarioPreset
                                        key={preset.id}
                                        {...preset}
                                        active={activePreset === preset.id}
                                        onClick={() => applyPreset(preset)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Parameter Controls */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Scenario Parameters</h3>
                                <button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center gap-2 text-xs font-medium hover:text-[var(--accent-blue)] transition-colors"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                <ScenarioSlider
                                    label="Markdown Percentage"
                                    value={scenarios.markdownPercent}
                                    onChange={(v) => setScenarios({ ...scenarios, markdownPercent: v })}
                                    min={0}
                                    max={50}
                                    unit="%"
                                    icon={Percent}
                                />

                                <ScenarioSlider
                                    label="Promotional Weeks"
                                    value={scenarios.promotionalWeeks}
                                    onChange={(v) => setScenarios({ ...scenarios, promotionalWeeks: v })}
                                    min={0}
                                    max={12}
                                    icon={Calendar}
                                />

                                <ScenarioSlider
                                    label="Holiday Demand Boost"
                                    value={scenarios.holidayBoost}
                                    onChange={(v) => setScenarios({ ...scenarios, holidayBoost: v })}
                                    min={0}
                                    max={50}
                                    unit="%"
                                    icon={Tag}
                                />

                                <ScenarioSlider
                                    label="Temperature Offset"
                                    value={scenarios.temperatureOffset}
                                    onChange={(v) => setScenarios({ ...scenarios, temperatureOffset: v })}
                                    min={-20}
                                    max={20}
                                    unit="°F"
                                    icon={Thermometer}
                                />
                            </div>

                            <AnimatePresence>
                                {showAdvanced && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="pt-4 border-t border-[var(--border-primary)]"
                                    >
                                        <div className="mb-4 max-w-md">
                                            <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                                <Store className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
                                                Store Cluster
                                            </label>
                                            <select
                                                value={scenarios.storeCluster}
                                                onChange={(e) => setScenarios({ ...scenarios, storeCluster: e.target.value })}
                                                className="w-full rounded-lg px-4 py-2 border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                                                style={{
                                                    background: 'var(--bg-tertiary)',
                                                    borderColor: 'var(--border-primary)',
                                                    color: 'var(--text-primary)'
                                                }}
                                            >
                                                <option value="all">All Stores</option>
                                                <option value="large">Large Format Stores</option>
                                                <option value="medium">Medium Stores</option>
                                                <option value="small">Small Stores</option>
                                                <option value="warm">Warm Climate Region</option>
                                                <option value="cold">Cold Climate Region</option>
                                            </select>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => runSimulation()}
                                    disabled={isSimulating}
                                    className="flex-1 btn-primary justify-center"
                                >
                                    {isSimulating ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                            >
                                                <RotateCcw className="w-5 h-5" />
                                            </motion.div>
                                            Simulating...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5" />
                                            Run Simulation
                                        </>
                                    )}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={resetScenario}
                                    className="px-4 py-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                                    style={{ color: 'var(--text-secondary)' }}
                                    title="Reset Parameters"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Panel - Results */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="card h-full">
                            <h3 className="text-base font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
                                Projected Impact
                            </h3>

                            <div className="space-y-4">
                                <ResultCard
                                    title="Projected Revenue"
                                    baseline={baseline.revenue}
                                    scenario={results.revenue}
                                    unit="$"
                                    positive={true}
                                />

                                <ResultCard
                                    title="Gross Margin"
                                    baseline={baseline.margin}
                                    scenario={results.margin}
                                    unit="$"
                                    positive={true}
                                />

                                <ResultCard
                                    title="Units Sold"
                                    baseline={baseline.unitsSold}
                                    scenario={results.unitsSold}
                                    unit=""
                                    positive={true}
                                />

                                <ResultCard
                                    title="Inventory Required"
                                    baseline={baseline.inventoryNeeded}
                                    scenario={results.inventoryNeeded}
                                    unit=""
                                    positive={false}
                                />
                            </div>

                            {/* ROI Summary */}
                            <div className="mt-8 rounded-xl p-5 border"
                                style={{
                                    background: 'rgba(183, 148, 246, 0.05)',
                                    borderColor: 'var(--accent-purple)'
                                }}>
                                <h4 className="font-medium text-sm mb-3" style={{ color: 'var(--accent-purple)' }}>Scenario ROI Summary</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--text-secondary)' }}>Markdown Cost</span>
                                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                            ${Math.round(results.revenue * scenarios.markdownPercent / 100).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--text-secondary)' }}>Incremental Revenue</span>
                                        <span className="font-medium" style={{ color: 'var(--accent-green)' }}>
                                            +${(results.revenue - baseline.revenue).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 mt-2" style={{ borderColor: 'var(--border-primary)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Net Impact</span>
                                        <span className={`font-bold ${(results.margin - baseline.margin) >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'
                                            }`}>
                                            {(results.margin - baseline.margin) >= 0 ? '+' : ''}
                                            ${(results.margin - baseline.margin).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Export Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleExportScenario}
                                className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors hover:bg-[var(--bg-tertiary)]"
                                style={{
                                    border: '1px solid var(--border-primary)',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                <Download className="w-5 h-5" />
                                Export Scenario Report
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default ScenarioPlanningStudio;
