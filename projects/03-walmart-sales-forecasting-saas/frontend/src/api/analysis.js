/**
 * Analysis API Service
 * Handles communication with backend ML API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Generic fetch wrapper with error handling
 */
const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const config = {
        ...options,
        headers: {
            ...options.headers,
        },
    };

    // Add auth header if token exists
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add content-type for JSON (unless it's FormData)
    if (!(options.body instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
};

/**
 * Upload CSV file for analysis
 */
export const uploadDataset = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return fetchWithAuth('/analysis/upload', {
        method: 'POST',
        body: formData,
    });
};

/**
 * Get dataset profile/statistics
 */
export const profileDataset = async (sessionId, targetCol = 'sales', dateCol = 'date') => {
    return fetchWithAuth(`/analysis/profile/${sessionId}`, {
        method: 'POST',
        body: JSON.stringify({ target_col: targetCol, date_col: dateCol }),
    });
};

/**
 * Start model training
 */
export const trainModel = async (sessionId, options = {}) => {
    const {
        modelType = 'ensemble',
        targetCol = 'sales',
        dateCol = 'date',
        forecastPeriods = 30,
        confidenceLevel = 0.95,
    } = options;

    return fetchWithAuth(`/analysis/train/${sessionId}`, {
        method: 'POST',
        body: JSON.stringify({
            model_type: modelType,
            target_col: targetCol,
            date_col: dateCol,
            forecast_periods: forecastPeriods,
            confidence_level: confidenceLevel,
        }),
    });
};

/**
 * Get training job status
 */
export const getTrainingStatus = async (jobId) => {
    return fetchWithAuth(`/analysis/status/${jobId}`, {
        method: 'GET',
    });
};

/**
 * Get training results
 */
export const getTrainingResults = async (jobId) => {
    return fetchWithAuth(`/analysis/results/${jobId}`, {
        method: 'GET',
    });
};

/**
 * Get available models
 */
export const getAvailableModels = async () => {
    return fetchWithAuth('/analysis/models', {
        method: 'GET',
    });
};

/**
 * Poll training status until complete
 */
export const pollTrainingStatus = async (jobId, onProgress, interval = 1000, maxAttempts = 300) => {
    let attempts = 0;

    return new Promise((resolve, reject) => {
        const poll = async () => {
            try {
                const status = await getTrainingStatus(jobId);

                if (onProgress) {
                    onProgress(status);
                }

                if (status.status === 'completed') {
                    const results = await getTrainingResults(jobId);
                    resolve(results);
                    return;
                }

                if (status.status === 'failed') {
                    reject(new Error(status.error || 'Training failed'));
                    return;
                }

                attempts++;
                if (attempts >= maxAttempts) {
                    reject(new Error('Training timeout'));
                    return;
                }

                setTimeout(poll, interval);
            } catch (error) {
                reject(error);
            }
        };

        poll();
    });
};

/**
 * Check if backend is available
 */
export const checkBackendHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
        return response.ok;
    } catch {
        return false;
    }
};

export default {
    uploadDataset,
    profileDataset,
    trainModel,
    getTrainingStatus,
    getTrainingResults,
    getAvailableModels,
    pollTrainingStatus,
    checkBackendHealth,
};
