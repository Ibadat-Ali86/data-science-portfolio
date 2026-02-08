import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

// Check if Supabase is configured
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const USE_SUPABASE = !!SUPABASE_URL && SUPABASE_URL !== 'https://placeholder.supabase.co';

// Dynamically import Supabase if configured
let supabase = null;
if (USE_SUPABASE) {
    import('../lib/supabase').then(module => {
        supabase = module.supabase;
    }).catch(err => {
        console.warn('Supabase not available, using local auth:', err);
    });
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (USE_SUPABASE && supabase) {
                    // Supabase auth initialization
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        setUser(session.user);
                        setToken(session.access_token);
                        localStorage.setItem('token', session.access_token);
                    }

                    // Listen for auth changes
                    const { data: { subscription } } = supabase.auth.onAuthStateChange(
                        (event, session) => {
                            if (session) {
                                setUser(session.user);
                                setToken(session.access_token);
                                localStorage.setItem('token', session.access_token);
                            } else {
                                setUser(null);
                                setToken(null);
                                localStorage.removeItem('token');
                            }
                        }
                    );

                    return () => subscription?.unsubscribe();
                } else if (token) {
                    // Local backend auth verification
                    const response = await api.get('/api/auth/me');
                    setUser(response.data);
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                localStorage.removeItem('token');
                setToken(null);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // Login function - supports both Supabase and local
    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            if (USE_SUPABASE && supabase) {
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (authError) throw authError;

                setUser(data.user);
                setToken(data.session.access_token);
                localStorage.setItem('token', data.session.access_token);
                return { success: true };
            } else {
                // Local backend auth
                const formData = new FormData();
                formData.append('username', email);
                formData.append('password', password);

                const response = await api.post('/api/auth/login', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const { access_token, user: userData } = response.data;
                localStorage.setItem('token', access_token);
                setToken(access_token);
                setUser(userData);
                return { success: true };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Register function - supports both Supabase and local
    const register = useCallback(async (userData) => {
        setLoading(true);
        setError(null);

        try {
            if (USE_SUPABASE && supabase) {
                const { data, error: authError } = await supabase.auth.signUp({
                    email: userData.email,
                    password: userData.password,
                    options: {
                        data: {
                            full_name: userData.full_name || userData.email
                        }
                    }
                });

                if (authError) throw authError;

                return {
                    success: true,
                    data: data.user,
                    message: 'Please check your email to verify your account.'
                };
            } else {
                const response = await api.post('/api/auth/register', userData);
                return { success: true, data: response.data };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // OAuth login (Supabase only)
    const loginWithProvider = useCallback(async (provider) => {
        if (!USE_SUPABASE || !supabase) {
            return { success: false, error: 'OAuth not available in local mode' };
        }

        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });

            if (authError) throw authError;
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        try {
            if (USE_SUPABASE && supabase) {
                await supabase.auth.signOut();
            }
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    }, []);

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isSupabaseMode: USE_SUPABASE,
        login,
        register,
        loginWithProvider,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

