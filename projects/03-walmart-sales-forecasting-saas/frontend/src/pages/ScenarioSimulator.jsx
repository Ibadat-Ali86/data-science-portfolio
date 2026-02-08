import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import {
    GitBranch,
    TrendingUp,
    TrendingDown,
    Save,
    RotateCcw,
    Clock,
    Download,
    Brain,
    ChevronRight,
    AlertCircle,
    Sliders,
    DollarSign,
    ShoppingCart,
    Megaphone
} from 'lucide-react';

const ScenarioSimulator = () => {
    const navigate = useNavigate();
    const [analysisData, setAnalysisData] = useState(null);

    const [baseScenario] = useState({
        demand: 100,
        price: 100,
        marketing: 100,
        inventory: 100,
    });

    const [scenario, setScenario] = useState({
        demand: 100,
        price: 100,
        marketing: 100,
        inventory: 100,
    });

    const [results, setResults] = useState(null);
    const [savedScenarios, setSavedScenarios] = useState([]);

    // Load analysis data and saved scenarios
    useEffect(() => {
        const savedResults = localStorage.getItem('analysisResults');
        if (savedResults) {
            setAnalysisData(JSON.parse(savedResults));
        }

        const saved = localStorage.getItem('savedScenarios');
        if (saved) {
            setSavedScenarios(JSON.parse(saved));
        }
    }, []);

    const calculateImpact = () => {
        const demandChange = ((scenario.demand - baseScenario.demand) / baseScenario.demand) * 100;
        const priceChange = ((scenario.price - baseScenario.price) / baseScenario.price) * 100;
        const marketingChange = ((scenario.marketing - baseScenario.marketing) / baseScenario.marketing) * 100;
        const inventoryChange = ((scenario.inventory - baseScenario.inventory) / baseScenario.inventory) * 100;

        // More sophisticated impact calculation
        const revenueImpact = demandChange * 0.5 + priceChange * 0.8 + marketingChange * 0.15;
        const quantityImpact = demandChange + marketingChange * 0.3 - priceChange * 0.4;
        const costImpact = marketingChange * 0.4 + inventoryChange * 0.3;
        const profitImpact = revenueImpact - costImpact * 0.5;

        // Use analysis data for base values if available
        const baseRevenue = analysisData?.metrics?.projectedRevenue || 125000;
        const baseQuantity = analysisData?.dataLength || 1500;

        setResults({
            revenueChange: revenueImpact.toFixed(1),
            quantityChange: quantityImpact.toFixed(1),
            costChange: costImpact.toFixed(1),
            profitChange: profitImpact.toFixed(1),
            projectedRevenue: (baseRevenue * (1 + revenueImpact / 100)).toFixed(0),
            projectedQuantity: (baseQuantity * (1 + quantityImpact / 100)).toFixed(0),
            projectedProfit: ((baseRevenue * 0.3) * (1 + profitImpact / 100)).toFixed(0),
        });
    };

    const handleSliderChange = (key, value) => {
        setScenario({ ...scenario, [key]: value });
    };

    const resetScenario = () => {
        setScenario(baseScenario);
        setResults(null);
    };

    const saveScenario = () => {
        if (!results) return;
        const newScenario = {
            id: Date.now(),
            name: `Scenario ${savedScenarios.length + 1}`,
            ...scenario,
            revenue: `${results.revenueChange > 0 ? '+' : ''}${results.revenueChange}%`,
            profit: `${results.profitChange > 0 ? '+' : ''}${results.profitChange}%`,
            date: new Date().toISOString().split('T')[0],
        };
        const updated = [newScenario, ...savedScenarios].slice(0, 10);
        setSavedScenarios(updated);
        localStorage.setItem('savedScenarios', JSON.stringify(updated));
    };

    const downloadResults = () => {
        if (!results) return;
        const data = {
            scenario: 'What-If Analysis',
            parameters: scenario,
            results: results,
            analysisSource: analysisData?.metrics?.modelType || 'Ensemble Model',
            timestamp: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scenario_results_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // No analysis data - prompt to run analysis first
    if (!analysisData) {
        return (
            <Layout title="Scenario Simulator">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 text-center"
                    >
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-amber-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Run Analysis First
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            The Scenario Simulator uses your forecast data as a baseline.
                            Complete an analysis first to enable what-if simulations.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/analysis')}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
                        >
                            <Brain className="w-5 h-5" />
                            Go to Analysis Pipeline
                            <ChevronRight className="w-4 h-4" />
                        </motion.button>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    const sliders = [
        { key: 'demand', label: 'Demand Factor', icon: ShoppingCart, color: 'blue', description: 'Adjust expected customer demand' },
        { key: 'price', label: 'Price Adjustment', icon: DollarSign, color: 'green', description: 'Modify pricing strategy' },
        { key: 'marketing', label: 'Marketing Spend', icon: Megaphone, color: 'purple', description: 'Change marketing investment' },
        { key: 'inventory', label: 'Inventory Level', icon: GitBranch, color: 'amber', description: 'Adjust stock levels' },
    ];

    return (
        <Layout title="Scenario Simulator">
            <div className="space-y-6">

                {/* Analysis Context */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-purple-100 text-sm mb-1">
                                <Sliders className="w-4 h-4" />
                                Based on Analysis
                            </div>
                            <h3 className="text-xl font-bold">
                                {analysisData.metrics?.modelType || 'Ensemble Model'} Forecast
                            </h3>
                            <p className="text-sm opacity-80 mt-1">
                                Simulate different scenarios using your forecast as baseline
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm opacity-80">Base Accuracy</div>
                            <div className="text-2xl font-bold">{analysisData.metrics?.accuracyRating || 'Excellent'}</div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Scenario Controls */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                            Adjust Parameters
                        </h3>

                        <div className="space-y-6">
                            {sliders.map((slider) => (
                                <div key={slider.key}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-lg bg-${slider.color}-100 dark:bg-${slider.color}-900/30 flex items-center justify-center`}>
                                                <slider.icon className={`w-4 h-4 text-${slider.color}-600`} />
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">{slider.label}</span>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{slider.description}</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold ${scenario[slider.key] > 100 ? 'text-green-600' :
                                                scenario[slider.key] < 100 ? 'text-red-600' : 'text-gray-600'
                                            }`}>
                                            {scenario[slider.key]}%
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="50"
                                        max="150"
                                        value={scenario[slider.key]}
                                        onChange={(e) => handleSliderChange(slider.key, parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={calculateImpact}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                            >
                                <TrendingUp className="w-5 h-5" />
                                Calculate Impact
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={resetScenario}
                                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Reset
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Results */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                            Projected Impact
                        </h3>

                        {results ? (
                            <div className="space-y-4">
                                {/* Impact Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Revenue', value: results.revenueChange, projected: `$${parseInt(results.projectedRevenue).toLocaleString()}` },
                                        { label: 'Volume', value: results.quantityChange, projected: parseInt(results.projectedQuantity).toLocaleString() },
                                        { label: 'Profit', value: results.profitChange, projected: `$${parseInt(results.projectedProfit).toLocaleString()}` },
                                        { label: 'Costs', value: results.costChange, projected: 'Variable' },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{item.label}</div>
                                            <div className={`text-2xl font-bold flex items-center gap-1 ${parseFloat(item.value) > 0 ? 'text-green-600' :
                                                    parseFloat(item.value) < 0 ? 'text-red-600' : 'text-gray-600'
                                                }`}>
                                                {parseFloat(item.value) > 0 ? (
                                                    <TrendingUp className="w-5 h-5" />
                                                ) : parseFloat(item.value) < 0 ? (
                                                    <TrendingDown className="w-5 h-5" />
                                                ) : null}
                                                {item.value}%
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                Projected: {item.projected}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-6">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={saveScenario}
                                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Scenario
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={downloadResults}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export
                                    </motion.button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                                <Sliders className="w-12 h-12 mb-3 opacity-50" />
                                <p>Adjust parameters and click "Calculate Impact"</p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Saved Scenarios */}
                {savedScenarios.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Saved Scenarios
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Name</th>
                                        <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Demand</th>
                                        <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Price</th>
                                        <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Marketing</th>
                                        <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Revenue Impact</th>
                                        <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {savedScenarios.slice(0, 5).map((s) => (
                                        <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{s.name}</td>
                                            <td className="py-3 px-4 text-center">{s.demand}%</td>
                                            <td className="py-3 px-4 text-center">{s.price}%</td>
                                            <td className="py-3 px-4 text-center">{s.marketing}%</td>
                                            <td className={`py-3 px-4 text-center font-semibold ${s.revenue.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                                }`}>{s.revenue}</td>
                                            <td className="py-3 px-4 text-right text-gray-500">{s.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </Layout>
    );
};

export default ScenarioSimulator;
