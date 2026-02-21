import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Flow Context
 * Manages the connected workflow state across pages
 * Tracks progress: Upload → Analysis → Forecast → Scenario → Reports → Executive
 */

const FlowContext = createContext();

// Flow steps definition
export const FLOW_STEPS = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', order: 0 },
    { id: 'upload', path: '/upload', label: 'Data Upload', order: 1 },
    { id: 'analysis', path: '/analysis', label: 'Analysis', order: 2 },
    { id: 'forecast', path: '/forecast-explorer', label: 'Forecasts', order: 3 },
    { id: 'scenario', path: '/scenario-planning', label: 'Scenarios', order: 4 },
    { id: 'reports', path: '/reports', label: 'Reports', order: 5 },
    { id: 'executive', path: '/executive', label: 'Executive', order: 6 },
];

export const FlowProvider = ({ children }) => {
    const location = useLocation();

    // Flow state
    const [flowState, setFlowState] = useState(() => {
        const saved = sessionStorage.getItem('forecastai_flow');
        return saved ? JSON.parse(saved) : {
            completedSteps: [],
            currentStep: 'dashboard',
            uploadedData: null,
            analysisResults: null,
            forecastResults: null,
            scenarioResults: null,
            lastUpdated: null
        };
    });

    // Persist flow state
    useEffect(() => {
        sessionStorage.setItem('forecastai_flow', JSON.stringify(flowState));
    }, [flowState]);

    // Update current step based on location
    useEffect(() => {
        const currentPath = location.pathname;
        const step = FLOW_STEPS.find(s => s.path === currentPath);
        if (step && step.id !== flowState.currentStep) {
            setFlowState(prev => ({
                ...prev,
                currentStep: step.id
            }));
        }
    }, [location.pathname]);

    // Mark step as completed
    const completeStep = (stepId, data = null) => {
        setFlowState(prev => {
            const newCompleted = prev.completedSteps.includes(stepId)
                ? prev.completedSteps
                : [...prev.completedSteps, stepId];

            const updates = {
                ...prev,
                completedSteps: newCompleted,
                lastUpdated: new Date().toISOString()
            };

            // Store step-specific data
            if (stepId === 'upload' && data) updates.uploadedData = data;
            if (stepId === 'analysis' && data) updates.analysisResults = data;
            if (stepId === 'forecast' && data) updates.forecastResults = data;
            if (stepId === 'scenario' && data) updates.scenarioResults = data;

            return updates;
        });
    };

    // Check if step is completed
    const isStepCompleted = (stepId) => {
        return flowState.completedSteps.includes(stepId);
    };

    // Check if step is accessible
    const isStepAccessible = (stepId) => {
        const step = FLOW_STEPS.find(s => s.id === stepId);
        if (!step) return false;

        // Dashboard is always accessible
        if (step.order === 0) return true;

        // Other steps need previous step completed
        const prevStep = FLOW_STEPS.find(s => s.order === step.order - 1);
        return prevStep ? isStepCompleted(prevStep.id) : true;
    };

    // Get next step
    const getNextStep = () => {
        const currentStepObj = FLOW_STEPS.find(s => s.id === flowState.currentStep);
        if (!currentStepObj) return null;

        return FLOW_STEPS.find(s => s.order === currentStepObj.order + 1) || null;
    };

    // Get flow progress percentage
    const getProgress = () => {
        const totalSteps = FLOW_STEPS.length - 1; // Exclude dashboard
        const completed = flowState.completedSteps.filter(s => s !== 'dashboard').length;
        return Math.round((completed / totalSteps) * 100);
    };

    // Reset flow
    const resetFlow = () => {
        setFlowState({
            completedSteps: [],
            currentStep: 'dashboard',
            uploadedData: null,
            analysisResults: null,
            forecastResults: null,
            scenarioResults: null,
            lastUpdated: null
        });
    };

    const value = {
        ...flowState,
        FLOW_STEPS,
        completeStep,
        isStepCompleted,
        isStepAccessible,
        getNextStep,
        getProgress,
        resetFlow
    };

    return (
        <FlowContext.Provider value={value}>
            {children}
        </FlowContext.Provider>
    );
};

// Hook to use flow context
export const useFlow = () => {
    const context = useContext(FlowContext);
    if (!context) {
        throw new Error('useFlow must be used within a FlowProvider');
    }
    return context;
};

// Next Step CTA Button Component
export const NextStepButton = ({ className = '' }) => {
    const { getNextStep, currentStep, isStepCompleted } = useFlow();
    const nextStep = getNextStep();

    if (!nextStep || !isStepCompleted(currentStep)) return null;

    return (
        <a
            href={nextStep.path}
            className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all btn-ripple ${className}`}
        >
            Next: {nextStep.label}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
        </a>
    );
};

// Flow Progress Bar Component
export const FlowProgressBar = ({ className = '' }) => {
    const { getProgress, FLOW_STEPS, completedSteps, currentStep } = useFlow();
    const progress = getProgress();

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                <span>Workflow Progress</span>
                <span>{progress}% Complete</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="flex justify-between mt-2">
                {FLOW_STEPS.filter(s => s.order > 0).map((step, i) => (
                    <div
                        key={step.id}
                        className={`flex flex-col items-center ${completedSteps.includes(step.id)
                            ? 'text-emerald-500'
                            : currentStep === step.id
                                ? 'text-purple-500'
                                : 'text-gray-400 dark:text-slate-500'
                            }`}
                        title={step.label}
                    >
                        <div className={`w-3 h-3 rounded-full ${completedSteps.includes(step.id)
                            ? 'bg-emerald-500'
                            : currentStep === step.id
                                ? 'bg-purple-500 ring-4 ring-purple-500/20'
                                : 'bg-gray-300 dark:bg-slate-600'
                            }`} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlowContext;
