import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Response interceptor for error handling and retries
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Set up retry logic for 5xx errors or network failures
        if (config) {
            config.retry = config.retry ?? 3;
            config.retryCount = config.retryCount ?? 0;
            config.retryDelay = config.retryDelay ?? 2000;

            const isNetworkError = !error.response;
            const is5xxError = error.response && error.response.status >= 500;

            if ((isNetworkError || is5xxError) && config.retryCount < config.retry) {
                config.retryCount += 1;
                // Exponential backoff
                const delay = config.retryDelay * Math.pow(2, config.retryCount - 1);
                console.warn(`[API] Retrying request... Attempt ${config.retryCount} in ${delay}ms`);

                await wait(delay);
                return api(config);
            }
        }

        // If retries exhausted or 4xx error, dispatch UI event
        let errorMessage = 'An unexpected error occurred';
        if (error.response?.data?.detail) {
            // FastAPI validation errors are arrays
            if (Array.isArray(error.response.data.detail)) {
                errorMessage = error.response.data.detail.map(e => e.msg).join(', ');
            } else {
                errorMessage = error.response.data.detail;
            }
        } else if (!error.response) {
            errorMessage = 'Network error. Please check your connection.';
        } else if (error.response.status >= 500) {
            errorMessage = 'Server is currently unavailable. Please try again later.';
        }

        window.dispatchEvent(new CustomEvent('api-error', {
            detail: { message: errorMessage, status: error.response?.status }
        }));

        return Promise.reject(error);
    }
);

export default api;
