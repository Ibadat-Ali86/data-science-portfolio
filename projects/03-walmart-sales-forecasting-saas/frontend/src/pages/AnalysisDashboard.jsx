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
    ArrowRight,
    ArrowLeft,
    RefreshCw,
    Play
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useFlow } from '../context/FlowContext';

// Import analysis components
import DatasetProfiler from '../components/analysis/DatasetProfiler';
import PreprocessingLog from '../components/analysis/PreprocessingLog';
import ModelTrainingProgress from '../components/analysis/ModelTrainingProgress';
import BusinessInsights from '../components/analysis/BusinessInsights';
import ActionableRecommendations from '../components/analysis/ActionableRecommendations';
import ForecastVisualizationSuite from '../components/charts/ForecastVisualizationSuite';
import ColumnMappingModal from '../components/common/ColumnMappingModal';
import SanityCheck from '../components/analysis/SanityCheck'; // NEW
import Confetti from '../components/common/Confetti'; // Gamification
import { API_BASE_URL } from '../utils/constants';

// Simple Error Boundary Component for debugging
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800">
                    <h2 className="text-xl font-bold mb-2">Component Error</h2>
                    <p className="font-mono text-sm mb-4">{this.state.error && this.state.error.toString()}</p>
                    <details className="text-xs font-mono whitespace-pre-wrap">
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const AnalysisDashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get uploaded data from FlowContext
    const { uploadedData: flowUploadedData, completeStep } = useFlow();

    // State management
    const [currentStep, setCurrentStep] = useState(flowUploadedData ? 1 : 0);
    const [uploadedData, setUploadedData] = useState(flowUploadedData?.allData || flowUploadedData?.rawData || null);
    const [profile, setProfile] = useState(null);
    const [preprocessedData, setPreprocessedData] = useState(null);
    const [modelMetrics, setModelMetrics] = useState(null);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false); // New state for gamification
    const [isRepairingSession, setIsRepairingSession] = useState(false);
    const [activeTab, setActiveTab] = useState('insights');
    const [analysisData, setAnalysisData] = useState(null); // For export functionality
    const [sessionId, setSessionId] = useState(flowUploadedData?.sessionId || null);
    const sessionIdRef = React.useRef(null);

    // Update ref when state changes
    useEffect(() => {
        sessionIdRef.current = sessionId;
    }, [sessionId]);

    // Mapping Modal State
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const [csvColumns, setCsvColumns] = useState([]);
    const [columnMapping, setColumnMapping] = useState({ date: 'Date', target: 'Sales' });

    // Check for uploaded data from FlowContext when component mounts or context changes
    // AUTO-REPAIR: If data exists but no session, upload to backend to create session
    // Use ref to prevent React StrictMode double-render from causing duplicate requests
    const repairAttemptedRef = useRef(false);

    useEffect(() => {
        const repairSession = async () => {
            // Prevent duplicate requests in React StrictMode
            if (repairAttemptedRef.current || isRepairingSession) {
                return;
            }

            // If we have flow data but no session ID, we need to create a backend session
            if (flowUploadedData && flowUploadedData.allData && !flowUploadedData.sessionId) {
                console.log('AnalysisDashboard: Repairing missing session - uploading to backend');
                repairAttemptedRef.current = true;  // Mark as attempted BEFORE async call
                setIsRepairingSession(true);

                try {
                    // Create CSV from flow data
                    // Create CSV from flow data
                    const headers = flowUploadedData.columns || Object.keys(flowUploadedData.allData[0] || {});
                    const csvRaw = [
                        headers.join(','),
                        ...flowUploadedData.allData.map(row =>
                            headers.map(h => row[h] || '').join(',')
                        )
                    ].join('\n');

                    console.log(`Preparing upload for ${flowUploadedData.allData.length} rows`);
                    const blob = new Blob([csvRaw], { type: 'text/csv' });

                    const formData = new FormData();
                    // Explicitly provide filename as 3rd argument
                    formData.append('file', blob, flowUploadedData.fileName || 'debug_data.csv');

                    // Use relative URL to leverage Vite proxy (bypasses CORS)
                    const uploadUrl = '/api/analysis/upload';
                    console.log(`Attempting upload via proxy to: ${uploadUrl}`);

                    const response = await fetch(uploadUrl, {
                        method: 'POST',
                        body: formData,
                        // No need for credentials: 'omit' with proxy, but keeping it simple
                    });

                    if (!response.ok) {
                        throw new Error(`Upload failed: ${response.statusText}`);
                    }

                    const result = await response.json();
                    console.log('AnalysisDashboard: Session repaired successfully:', result.session_id);

                    // Update FlowContext and local state
                    completeStep('upload', {
                        ...flowUploadedData,
                        sessionId: result.session_id
                    });

                    setSessionId(result.session_id);
                    setUploadedData(flowUploadedData.allData);
                    sessionStorage.setItem('currentSessionId', result.session_id);
                    setCurrentStep(1);
                } catch (error) {
                    console.error('AnalysisDashboard: Session repair failed:', error);
                    repairAttemptedRef.current = false;  // Reset on error to allow retry
                    // Still show the data, but user will need to re-upload
                } finally {
                    setIsRepairingSession(false);
                }
            } else if (flowUploadedData && flowUploadedData.sessionId) {
                // Normal case - session exists
                setUploadedData(flowUploadedData.allData || flowUploadedData.rawData || []);
                setSessionId(flowUploadedData.sessionId);
                sessionStorage.setItem('currentSessionId', flowUploadedData.sessionId);
                setCurrentStep(1);
            }
        };

        repairSession();
    }, [flowUploadedData]);

    // Pipeline steps configuration
    const steps = [
        { id: 0, name: 'Upload Data', icon: <Upload className="w-4 h-4" />, completed: uploadedData !== null },
        { id: 1, name: 'Profile Dataset', icon: <FileSearch className="w-4 h-4" />, completed: profile !== null },
        { id: 2, name: 'Preprocess', icon: <Settings className="w-4 h-4" />, completed: preprocessedData !== null },
        { id: 3, name: 'Train Model', icon: <Brain className="w-4 h-4" />, completed: modelMetrics !== null },
        { id: 4, name: 'View Results', icon: <BarChart3 className="w-4 h-4" />, completed: analysisComplete },
    ];

    // Handle File Upload (Step 0 -> Mapping)
    const handleFileUpload = async (file) => {
        console.log("AnalysisDashboard: handleFileUpload called", file);
        try {
            // First parse locally just to get columns for mapping
            const text = await file.text();
            console.log("AnalysisDashboard: file text read", text.substring(0, 50));
            const lines = text.trim().split('\n');
            if (lines.length > 0) {
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                console.log("AnalysisDashboard: headers parsed", headers);
                setCsvColumns(headers);
                setPendingFile(file);
                setShowMappingModal(true);
                console.log("AnalysisDashboard: Mapping Modal Triggered");
            }
        } catch (error) {
            console.error("Error reading file headers:", error);
            alert("Failed to read file headers. Please ensure valid CSV.");
        }
    };

    // ...

    const handleFile = async (file) => {
        console.log("UploadSection: handleFile called", file);
        setFile(file);
        setParsing(true);

        // Simulate short processing delay then pass pure file up
        // The parent component (AnalysisDashboard) handles parsing and mapping
        setTimeout(() => {
            console.log("UploadSection: Timeout done, calling onDataLoaded");
            setParsing(false);
            onDataLoaded(file);
        }, 600);
    };

    const [backendProfile, setBackendProfile] = useState(null);

    // ...

    // Confirm Mapping -> Upload to Backend (Step 0 -> 1)
    const handleMappingConfirm = async (mapping) => {
        if (!pendingFile) return;
        setColumnMapping(mapping);

        const formData = new FormData();
        formData.append('file', pendingFile);

        try {
            // Real Backend Upload
            const response = await fetch(`${API_BASE_URL}/api/analysis/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(errorData.detail || 'Upload failed');
            }

            const result = await response.json();
            console.log("AnalysisDashboard: Upload success", result);

            // CRITICAL: Force update ref immediately to ensure availability
            const newSessionId = result.session_id;
            sessionIdRef.current = newSessionId;
            setSessionId(newSessionId);
            sessionStorage.setItem('currentSessionId', newSessionId); // Backup persistence

            setUploadedData(result.sample_data); // Use sample or parse full locally if needed

            // Persist to FlowContext so it survives refresh
            completeStep('upload', {
                sessionId: result.session_id,
                rawData: result.sample_data,
                fileName: pendingFile.name
            });

            // FETCH FULL PROFILE IMMEDIATELY
            try {
                const profileRes = await fetch(`${API_BASE_URL}/api/analysis/profile/${newSessionId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        target_col: mapping.target,
                        date_col: mapping.date || 'Date'
                    })
                });
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setBackendProfile(profileData);
                    setProfile(profileData); // Pre-set profile for next step
                }
            } catch (pError) {
                console.warn("Auto-profile failed:", pError);
            }

            setCurrentStep(1);
        } catch (error) {
            console.error("Upload error:", error);
            alert(`Upload failed: ${error.message}. Please ensure backend is running.`);
        }
    };

    const handleProfileComplete = async () => {
        // If we already have the profile from upload step, just proceed
        if (profile) {
            setCurrentStep(2);
            return true;
        }

        // STRATEGY: Check all possible storage locations
        // 1. Ref (Immediate)
        // 2. State (Reactive)
        // 3. SessionStorage (Persistent across re-renders)
        // 4. LocalStorage (Persistent across reloads)

        let currentSessionId = sessionIdRef.current || sessionId || sessionStorage.getItem('currentSessionId');

        // Fallback: Check FlowContext in localStorage if still missing
        if (!currentSessionId) {
            console.warn("AnalysisDashboard: Session ID missing in primary sources, checking localStorage flow...");
            try {
                const flowData = JSON.parse(localStorage.getItem('forecastai_flow') || '{}');
                if (flowData.uploadedData?.sessionId) {
                    currentSessionId = flowData.uploadedData.sessionId;
                    // Restore to other storages
                    setSessionId(currentSessionId);
                    sessionIdRef.current = currentSessionId;
                    sessionStorage.setItem('currentSessionId', currentSessionId);
                }
            } catch (e) {
                console.error("Failed to recover session from storage", e);
            }
        }

        console.log("AnalysisDashboard: handleProfileComplete START", {
            resolved: currentSessionId,
            ref: sessionIdRef.current,
            state: sessionId,
            sessionStorage: sessionStorage.getItem('currentSessionId')
        });

        if (!currentSessionId) {
            const debugInfo = `Ref:${!!sessionIdRef.current}, State:${!!sessionId}, Store:${!!sessionStorage.getItem('currentSessionId')}`;
            console.error("AnalysisDashboard: Session ID CRITICAL FAILURE", debugInfo);
            alert(`Session ID missing. Debug: [${debugInfo}]. Please re-upload data.`);
            return false;
        }

        // Retry logic for profiling request
        const maxRetries = 3;
        let lastError = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    console.log(`AnalysisDashboard: Retry attempt ${attempt + 1}/${maxRetries}`);
                    // Exponential backoff: 500ms, 1000ms, 2000ms
                    await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt - 1)));
                }

                const response = await fetch(`${API_BASE_URL}/api/analysis/profile/${currentSessionId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        target_col: columnMapping.target,
                        date_col: columnMapping.date || 'Date' // Fallback if empty
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Profiling failed: ${response.status} ${errorText}`);
                }

                const profileData = await response.json();
                console.log("AnalysisDashboard: Profile data received", profileData);
                setProfile(profileData);
                setBackendProfile(profileData); // Store for other components
                setCurrentStep(2);
                return true;

            } catch (error) {
                console.error(`Profiling error (attempt ${attempt + 1}):`, error);
                lastError = error;

                // If it's a 404 and we have retries left, try again
                if (error.message.includes('404') && attempt < maxRetries - 1) {
                    console.log("Session not found, retrying...");
                    continue;
                }

                // For other errors or last retry, break
                if (attempt === maxRetries - 1) {
                    break;
                }
            }
        }

        // If we get here, all retries failed
        alert(`Failed to profile dataset after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
        return false;
    };

    const handlePreprocessingComplete = (processedData, log) => {
        console.log("AnalysisDashboard: Preprocessing complete", { logCount: log.length });
        if (!processedData) {
            // If backend preprocessing isn't fully wired, mock strict success for now
            const mockProcessed = {
                rows: backendProfile?.dimensions?.rows || 100,
                features: backendProfile?.dimensions?.columns || 5,
                newFeatures: 0
            };
            setPreprocessedData({ data: mockProcessed, log });
            setCurrentStep(3);
            return;
        }
        setPreprocessedData({ data: processedData, log });
        setCurrentStep(3);
    };

    // Step 3: Train Model is handled by ModelTrainingProgress component
    const handleTrainingComplete = (metrics) => {
        try {
            console.log("AnalysisDashboard: Handling training completion", metrics);
            setModelMetrics(metrics);

            // Final Results are now fetched inside ModelTrainingProgress and passed here
            // We will receive the full result object including 'forecast' and 'metrics'

            setAnalysisData(metrics); // Note: metrics arg here will contain full job results

            try {
                localStorage.setItem('analysisResults', JSON.stringify(metrics));
            } catch (e) {
                console.warn("AnalysisDashboard: Failed to save results to localStorage (quota exceeded?)", e);
            }

            completeStep('analysis', metrics);

            // State updates last to trigger re-render
            setAnalysisComplete(true);
            setShowConfetti(true); // Trigger celebration
            setCurrentStep(4);
        } catch (error) {
            console.error("AnalysisDashboard: Error in handleTrainingComplete", error);
            alert("An error occurred while finalizing analysis. Please try refreshing the page.");
        }
    };

    const resetPipeline = () => {
        setCurrentStep(0);
        setUploadedData(null);
        setProfile(null);
        setPreprocessedData(null);
        setModelMetrics(null);
        setAnalysisComplete(false);
        setActiveTab('insights');
        setSessionId(null);
        sessionStorage.removeItem('currentSessionId');
        navigate('/analysis', { replace: true });
    };

    // Handle Demo Data Loading
    const handleLoadDemo = async () => {
        console.log("AnalysisDashboard: Loading Demo Data");
        try {
            const data = generateDemoData();
            if (!data || data.length === 0) throw new Error("Failed to generate demo data");

            // Convert to CSV
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row => Object.values(row).join(','));
            const csvContent = [headers, ...rows].join('\n');

            const file = new File([csvContent], "demo_walmart_data.csv", { type: 'text/csv' });
            await handleFileUpload(file);
        } catch (error) {
            console.error("Demo Load Error:", error);
            alert("Failed to load demo data");
        }
    };

    return (
        <Layout title="Analysis Pipeline">
            <ErrorBoundary>
                {/* Debug Session Display */}
                <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded z-50 pointer-events-none opacity-50">
                    Session: {sessionId || 'NULL'} | Ref: {sessionIdRef.current || 'NULL'} | Store: {sessionStorage.getItem('currentSessionId') || 'NULL'}
                </div>

                <Confetti trigger={showConfetti} />

                {/* Action Bar */}
                {analysisComplete && (
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={resetPipeline}
                            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors btn-secondary"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Start New Analysis
                        </button>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="rounded-xl p-6 shadow-lg border border-[var(--border-primary)]"
                        style={{ background: 'var(--bg-secondary)' }}>
                        <div className="flex items-center justify-between">
                            {steps.map((step, idx) => (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step.completed
                                            ? 'bg-[var(--accent-green)] text-[var(--bg-primary)] shadow-[0_0_15px_rgba(74,222,128,0.4)]'
                                            : currentStep === idx
                                                ? 'bg-[var(--accent-blue)] text-white ring-4 ring-[rgba(74,158,255,0.2)] shadow-[0_0_15px_rgba(74,158,255,0.4)]'
                                                : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                                            }`}>
                                            {step.completed ? <CheckCircle className="w-5 h-5" /> : step.icon}
                                        </div>
                                        <span className={`mt-2 text-xs font-medium uppercase tracking-wider ${currentStep >= idx
                                            ? 'text-[var(--text-primary)]'
                                            : 'text-[var(--text-tertiary)]'
                                            }`}>
                                            {step.name}
                                        </span>
                                    </div>

                                    {idx < steps.length - 1 && (
                                        <div className="w-16 md:w-24 h-0.5 mx-2 rounded-full relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[var(--bg-tertiary)]"></div>
                                            <motion.div
                                                initial={{ x: '-100%' }}
                                                animate={{ x: step.completed ? '0%' : '-100%' }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute inset-0 bg-[var(--accent-green)]"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* Step 0: Upload */}
                        {currentStep === 0 && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <UploadSection
                                    onDataLoaded={handleFileUpload}
                                    onLoadDemo={handleLoadDemo}
                                />

                                <ColumnMappingModal
                                    isOpen={showMappingModal}
                                    onClose={() => setShowMappingModal(false)}
                                    columns={csvColumns}
                                    onConfirm={handleMappingConfirm}
                                    fileInfo={pendingFile}
                                />
                            </motion.div>
                        )}

                        {/* Step 1: Profile Dataset */}
                        {currentStep === 1 && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <DatasetProfiler
                                    data={uploadedData}
                                    onProfileComplete={handleProfileComplete}
                                    isRealBackend={true}
                                    externalProfile={backendProfile} // Pass backend profile
                                />
                            </motion.div>
                        )}

                        {/* Step 2: Preprocessing */}
                        {currentStep === 2 && (
                            <motion.div
                                key="preprocess"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <PreprocessingLog
                                    data={uploadedData}
                                    onPreprocessingComplete={handlePreprocessingComplete}
                                    totalRows={backendProfile?.dimensions?.rows} // Pass backend row count
                                    sessionId={sessionId}
                                />
                            </motion.div>
                        )}

                        {/* Step 3: Model Training */}
                        {currentStep === 3 && preprocessedData && (
                            <motion.div
                                key="training"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <ModelTrainingProgress
                                    data={uploadedData}
                                    onTrainingComplete={handleTrainingComplete}
                                    sessionId={sessionId}
                                />
                            </motion.div>
                        )}

                        {/* Step 4: Results */}
                        {currentStep === 4 && analysisComplete && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {/* Debug Logging */}
                                {console.log("AnalysisDashboard: Rendering Results Step", {
                                    activeTab,
                                    hasAnalysisData: !!analysisData,
                                    hasModelMetrics: !!modelMetrics,
                                    hasUploadedData: !!uploadedData
                                })}

                                {/* Tab Navigation */}
                                <div className="rounded-xl p-2 shadow-lg border border-[var(--border-primary)] mb-6"
                                    style={{ background: 'var(--bg-secondary)' }}>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'insights', label: 'Business Insights', icon: <TrendingUp className="w-4 h-4" /> },
                                            { id: 'charts', label: 'Visualizations', icon: <BarChart3 className="w-4 h-4" /> },
                                            { id: 'sanity', label: 'Sanity Check', icon: <CheckCircle className="w-4 h-4" /> }, // NEW
                                            { id: 'actions', label: 'Action Plan', icon: <Target className="w-4 h-4" /> },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${activeTab === tab.id
                                                    ? 'bg-[var(--accent-blue)] text-white shadow-lg'
                                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                                    }`}
                                            >
                                                {tab.icon}
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tab Content */}
                                <AnimatePresence mode="wait">
                                    {activeTab === 'insights' && (
                                        <motion.div
                                            key="insights-tab"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <ErrorBoundary>
                                                <BusinessInsights
                                                    forecastData={uploadedData}
                                                    metrics={modelMetrics}
                                                    onContinue={() => setActiveTab('charts')}
                                                />
                                            </ErrorBoundary>
                                        </motion.div>
                                    )}

                                    {activeTab === 'charts' && (
                                        <motion.div
                                            key="charts-tab"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <ErrorBoundary>
                                                <ForecastVisualizationSuite
                                                    forecastData={analysisData}
                                                    historicalData={uploadedData}
                                                />
                                            </ErrorBoundary>
                                        </motion.div>
                                    )}

                                    {activeTab === 'sanity' && (
                                        <motion.div
                                            key="sanity-tab"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <ErrorBoundary>
                                                <SanityCheck
                                                    forecastData={analysisData}
                                                    historicalData={uploadedData}
                                                />
                                            </ErrorBoundary>
                                        </motion.div>
                                    )}

                                    {activeTab === 'actions' && (
                                        <motion.div
                                            key="actions-tab"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <ErrorBoundary>
                                                <ActionableRecommendations
                                                    forecastData={analysisData}
                                                    insights={modelMetrics}
                                                    analysisData={analysisData}
                                                />
                                            </ErrorBoundary>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </ErrorBoundary>
        </Layout>
    );
};

/**
 * Upload Section Component
 */
const UploadSection = ({ onDataLoaded, onLoadDemo }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [parsing, setParsing] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.toLowerCase().endsWith('.csv'))) {
            handleFile(droppedFile);
        } else if (droppedFile) {
            alert("Please upload a valid CSV file.");
        }
    };

    const handleFile = async (file) => {
        setFile(file);
        setParsing(true);

        // Simulate short processing delay then pass pure file up
        // The parent component (AnalysisDashboard) handles parsing and mapping
        setTimeout(() => {
            setParsing(false);
            onDataLoaded(file);
        }, 600);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto mt-12">

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 gradient-text">Start New Analysis</h2>
                <p className="" style={{ color: 'var(--text-secondary)' }}>Upload your historical sales data to generate a forecast</p>
            </div>

            {/* Upload Area */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${isDragging
                    ? 'border-[var(--accent-blue)] bg-[rgba(74,158,255,0.05)]'
                    : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]'
                    }`}
            >
                <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform ${isDragging ? 'scale-110' : ''}`}
                        style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
                        <Upload className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {parsing ? 'Processing your file...' : 'Upload your dataset'}
                    </h3>

                    {parsing ? (
                        <div className="flex items-center gap-2 mt-4" style={{ color: 'var(--accent-blue)' }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <RefreshCw className="w-5 h-5" />
                            </motion.div>
                            <span className="font-mono text-sm">Parsing CSV data...</span>
                        </div>
                    ) : (
                        <>
                            <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Drag and drop a CSV file here, or click to browse
                            </p>

                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="btn-primary"
                            >
                                Select CSV File
                            </label>
                        </>
                    )}
                </div>
            </div>

            {/* Demo Data Option */}
            <div className="rounded-xl p-6 border border-[var(--border-primary)] flex items-center justify-between"
                style={{ background: 'linear-gradient(to right, rgba(183,148,246,0.05), transparent)' }}>
                <div>
                    <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Don't have data yet?
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Try our demo with sample Walmart sales data
                    </p>
                </div>
                <button
                    onClick={onLoadDemo}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors hover:bg-[rgba(183,148,246,0.1)]"
                    style={{ color: 'var(--accent-purple)' }}
                >
                    <Play className="w-4 h-4 fill-current" />
                    Load Demo Data
                </button>
            </div>

            {/* File Format Info */}
            <div className="bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border-primary)]">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[rgba(74,158,255,0.1)]">
                        <FileSearch className="w-5 h-5 text-[var(--accent-blue)]" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>CSV Format Requirements</h4>
                        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Your file must contain a date column and a numeric value column.
                        </p>
                        <div className="text-xs font-mono p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-tertiary)]">
                            date,sales,category<br />
                            2024-01-01,1500,Electronics
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Generate demo data for testing
 */
const generateDemoData = () => {
    const data = [];
    const categories = ['Electronics', 'Clothing', 'Food', 'Home'];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    for (let i = 0; i < 90; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        categories.forEach((category, catIdx) => {
            data.push({
                date: date.toISOString().split('T')[0],
                sales: Math.floor(500 + Math.random() * 1500 + Math.sin(i / 7) * 200),
                quantity: Math.floor(10 + Math.random() * 50),
                product_id: `P00${catIdx + 1}`,
                category
            });
        });
    }

    return data;
};

export default AnalysisDashboard;
