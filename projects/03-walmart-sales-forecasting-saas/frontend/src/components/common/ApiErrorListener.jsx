import { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';

const ApiErrorListener = () => {
    const { showToast } = useToast();

    useEffect(() => {
        const handleApiError = (event) => {
            const { message } = event.detail;
            showToast(message || 'An unexpected API error occurred', 'error', 5000);
        };

        window.addEventListener('api-error', handleApiError);
        return () => window.removeEventListener('api-error', handleApiError);
    }, [showToast]);

    return null; // This component doesn't render anything
};

export default ApiErrorListener;
