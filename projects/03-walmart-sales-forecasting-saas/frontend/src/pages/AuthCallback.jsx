import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingTheater from '../components/auth/LoadingTheater';

/**
 * AuthCallback Component
 * Handles the redirect from backend OAuth with JWT token
 */
const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const processedRef = useRef(false);

    useEffect(() => {
        // Prevent double processing in StrictMode
        if (processedRef.current) return;
        processedRef.current = true;

        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
            // Success! Store token and redirect
            // We pass null user initially, fetchProfile will get details
            login({ access_token: token }, null);

            // Short delay to show the success animation
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } else if (error) {
            // OAuth failed
            console.error('OAuth Error:', error);
            navigate('/login?error=oauth_failed');
        } else {
            // No token or error? Weird state.
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <LoadingTheater
            isLoading={true}
            isSuccess={true}
            message="Authenticating securely..."
            subMessage="Connecting to your account"
        />
    );
};

export default AuthCallback;
