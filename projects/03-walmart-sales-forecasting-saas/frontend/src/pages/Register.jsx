/**
 * Register Page - Redirects to Login (unified auth page)
 * All authentication is now handled through the unified Login page with tabs
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to login page which now includes register tab
        navigate('/login', { state: { defaultTab: 'register' } });
    }, [navigate]);

    return null;
};

export default Register;
