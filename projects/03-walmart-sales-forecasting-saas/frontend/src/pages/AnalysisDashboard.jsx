import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Upload,
    FileSearch,
    Settings,
    Brain,
    BarChart3,
    Target,
    TrendingUp,
    CheckCircle,
    RefreshCw,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';

// Import analysis components
import ProfessionalDatasetProfiler from '../components/analysis/ProfessionalDatasetProfiler';
import PipelineStepIndicator from '../components/common/StepIndicator'; // Updated import
import PreprocessingLog from '../components/analysis/PreprocessingLog';
import ModelTrainingProgress from '../components/analysis/ModelTrainingProgress';
import BusinessInsights from '../components/analysis/BusinessInsights';
import ActionableRecommendations from '../components/analysis/ActionableRecommendations';
import ForecastVisualizationSuite from '../components/charts/ForecastVisualizationSuite';
import ColumnMappingModal from '../components/common/ColumnMappingModal';
import SanityCheck from '../components/analysis/SanityCheck';
import Confetti from '../components/common/Confetti';
import { API_BASE_URL } from '../utils/constants';

// Enterprise components
import EnterpriseErrorBoundary from '../components/common/EnterpriseErrorBoundary';
import PipelineProgress from '../components/pipeline/PipelineProgress';

// Core Components
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FileUploadZone from '../components/upload/FileUploadZone'; // New Component

const AnalysisDashboard = () => {
    const navigate = useNavigate();
    const { uploadedData: flowUploadedData, completeStep } = useFlow();

    // State
    const [currentStep, setCurrentStep] = useState(flowUploadedData ? 2 : 1); // 1-indexed for StepIndicator
    const [uploadedData, setUploadedData] = useState(flowUploadedData?.allData || flowUploadedData?.rawData || null);
    const [profile, setProfile] = useState(null);
    const [preprocessedData, setPreprocessedData] = useState(null);
    const [modelMetrics, setModelMetrics] = useState(null);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [activeTab, setActiveTab] = useState('insights');
    const [analysisData, setAnalysisData] = useState(null);
    const [sessionId, setSessionId] = useState(flowUploadedData?.sessionId || sessionStorage.getItem('currentSessionId'));
    const sessionIdRef = useRef(null);

    // Pipeline progress state (for Step 4)
    const [pipelineStage, setPipelineStage] = useState('training');
    const [pipelineStageProgress, setPipelineStageProgress] = useState(0);

    // Mapping Modal
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const [csvColumns, setCsvColumns] = useState([]);
    const [columnMapping, setColumnMapping] = useState({ date: 'Date', target: 'Sales' });

    useEffect(() => {
        sessionIdRef.current = sessionId;

        // Recover session context if missing (e.g. page refresh)
        if (sessionId && !uploadedData) {
            console.log("Recovering session data for:", sessionId);
            // Fetch session summary/metadata
            fetch(`${API_BASE_URL}/api/analysis/session/${sessionId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setUploadedData(data.summary?.sample_data || []);
                        setProfile(data.profile);
                        if (data.status === 'completed') {
                            setAnalysisData(data.results);
                            setAnalysisComplete(true);
                            setCurrentStep(5);
                        } else if (data.status === 'training') {
                            setCurrentStep(4);
                        } else if (data.status === 'profiling') {
                            setCurrentStep(2);
                        } else {
                            // Default to step 2 if uploaded
                            setCurrentStep(2);
                        }
                    }
                })
                .catch(err => console.warn("Failed to recover session:", err));
        }
    }, [sessionId]); // Removed uploadedData dependency to prevent loop, logic handles it

    const steps = ['Upload Data', 'Profile Dataset', 'Preprocess', 'Train Model', 'View Results'];

    // ... (Keep existing repairSession logic if needed, usually FlowContext handles it)
    // For brevity, assuming flowUploadedData passes correct session or we re-upload in DataUpload page.

    const handleFileUpload = async (file) => {
        try {
            const text = await file.text();
            const lines = text.trim().split('\n');
            if (lines.length > 0) {
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                setCsvColumns(headers);
                setPendingFile(file);
                setShowMappingModal(true);
            }
        } catch (error) {
            console.error("Error reading file:", error);
            alert("Failed to read file headers.");
        }
    };

    const handleMappingConfirm = async (mapping) => {
        if (!pendingFile) return;
        setColumnMapping(mapping);

        const formData = new FormData();
        formData.append('file', pendingFile);

        try {
            const response = await fetch(`${API_BASE_URL}/api/analysis/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');
            const result = await response.json();

            setSessionId(result.session_id);
            setUploadedData(result.sample_data);
            completeStep('upload', {
                sessionId: result.session_id,
                rawData: result.sample_data,
                fileName: pendingFile.name
            });

            // Trigger profiling
            try {
                const profileRes = await fetch(`${API_BASE_URL}/api/analysis/profile/${result.session_id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        target_col: mapping.target,
                        date_col: mapping.date || 'Date'
                    })
                });
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setProfile(profileData);
                }
            } catch (pError) {
                console.warn("Auto-profile failed:", pError);
            }

            setCurrentStep(2); // Move to Profile step
        } catch (error) {
            console.error("Upload error:", error);
            alert(`Upload failed: ${error.message}`);
        }
    };

    const handleProfileComplete = () => {
        setCurrentStep(3); // Preprocess
    };

    const handlePreprocessingComplete = (processedData, log) => {
        setPreprocessedData({ data: processedData, log });
        setCurrentStep(4); // Train
    };

    const handleTrainingComplete = (metrics) => {
        setModelMetrics(metrics);
        setAnalysisData(metrics);
        completeStep('analysis', metrics);
        setAnalysisComplete(true);
        setShowConfetti(true);
        setCurrentStep(5); // Results
    };

    const resetPipeline = () => {
        setCurrentStep(1);
        setUploadedData(null);
        setProfile(null);
        setPreprocessedData(null);
        setModelMetrics(null);
        setAnalysisComplete(false);
        setSessionId(null);
        navigate('/analysis', { replace: true });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Confetti trigger={showConfetti} />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Analysis Pipeline</h2>
                    <p className="text-text-secondary mt-1">End-to-end forecasting workflow.</p>
                </div>
                {analysisComplete && (
                    <Button onClick={resetPipeline} variant="secondary" icon={RefreshCw}>
                        New Analysis
                    </Button>
                )}
            </div>

            <PipelineStepIndicator currentStep={currentStep} steps={steps} />

            <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {/* Step 1: Upload (re-using simplistic upload if arriving directly here) */}
                    {currentStep === 1 && (
                        <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <Card className="max-w-2xl mx-auto p-8 text-center">
                                <h3 className="text-xl font-bold mb-4">Start Analysis</h3>
                                <p className="text-text-secondary mb-6">Upload your dataset to begin processing.</p>
                                <FileUploadZone onFileSelect={handleFileUpload} />
                            </Card>
                            <ColumnMappingModal
                                isOpen={showMappingModal}
                                onClose={() => setShowMappingModal(false)}
                                columns={csvColumns}
                                onConfirm={handleMappingConfirm}
                                fileInfo={pendingFile}
                            />
                        </motion.div>
                    )}

                    {/* Step 2: Profile */}
                    {currentStep === 2 && (
                        <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <ProfessionalDatasetProfiler
                                data={uploadedData}
                                onProfileComplete={handleProfileComplete}
                                externalProfile={profile}
                            />
                        </motion.div>
                    )}

                    {/* Step 3: Preprocess */}
                    {currentStep === 3 && (
                        <motion.div key="preprocess" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <PreprocessingLog
                                data={uploadedData}
                                onPreprocessingComplete={handlePreprocessingComplete}
                                sessionId={sessionId}
                            />
                        </motion.div>
                    )}

                    {/* Step 4: Train */}
                    {currentStep === 4 && (
                        <motion.div key="training" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            {/* Enterprise Pipeline Progress overlay */}
                            <PipelineProgress
                                currentStage={pipelineStage}
                                stageProgress={pipelineStageProgress}
                                onStageComplete={() => {
                                    // PipelineProgress signals completion — handled by ModelTrainingProgress
                                }}
                            />
                            <ModelTrainingProgress
                                data={uploadedData}
                                onTrainingComplete={(metrics) => {
                                    setPipelineStage('ensemble');
                                    setPipelineStageProgress(100);
                                    handleTrainingComplete(metrics);
                                }}
                                sessionId={sessionId}
                                onStageChange={(stage, progress) => {
                                    setPipelineStage(stage);
                                    setPipelineStageProgress(progress);
                                }}
                            />
                        </motion.div>
                    )}

                    {/* Step 5: Results */}
                    {currentStep === 5 && (
                        <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            {/* Success Banner with View Forecast CTA */}
                            <div className="mb-6 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle className="w-5 h-5 text-green-300" />
                                        <span className="font-bold text-white text-lg">Analysis Complete!</span>
                                    </div>
                                    <p className="text-white/75 text-sm">Model trained successfully. View results below or explore the forecast explorer.</p>
                                </div>
                                <div className="flex gap-3 flex-shrink-0">
                                    <button
                                        onClick={() => navigate('/forecast-explorer')}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-brand-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        View Forecast
                                    </button>
                                    <button
                                        onClick={() => navigate('/executive')}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white/20 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/30 transition-all text-sm"
                                    >
                                        <TrendingUp className="w-4 h-4" />
                                        Executive Report
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 border-b border-border-default overflow-x-auto">
                                {[
                                    { id: 'insights', label: 'Insights', icon: TrendingUp },
                                    { id: 'charts', label: 'Visualizations', icon: BarChart3 },
                                    { id: 'sanity', label: 'Sanity Check', icon: CheckCircle },
                                    { id: 'actions', label: 'Action Plan', icon: Target },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap
                                            ${activeTab === tab.id
                                                ? 'border-brand-600 text-brand-600'
                                                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-primary'}
                                        `}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <EnterpriseErrorBoundary>
                                {activeTab === 'insights' && (
                                    <BusinessInsights forecastData={uploadedData} metrics={modelMetrics} onContinue={() => setActiveTab('charts')} />
                                )}
                                {activeTab === 'charts' && (
                                    <ForecastVisualizationSuite forecastData={analysisData} historicalData={uploadedData} />
                                )}
                                {activeTab === 'sanity' && (
                                    <SanityCheck forecastData={analysisData?.forecast || analysisData} historicalData={uploadedData} />
                                )}
                                {activeTab === 'actions' && (
                                    <ActionableRecommendations forecastData={analysisData} insights={modelMetrics} />
                                )}
                            </EnterpriseErrorBoundary>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AnalysisDashboard;
