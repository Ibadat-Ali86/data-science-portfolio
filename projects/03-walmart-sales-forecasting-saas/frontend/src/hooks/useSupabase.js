import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase, getSession, getUser, signIn, signUp, signOut, signInWithProvider } from '../lib/supabase';

// Auth Context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Wrap your app with this to provide authentication state
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            try {
                const session = await getSession();
                setSession(session);
                setUser(session?.user ?? null);
            } catch (err) {
                console.error('Auth initialization error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event);
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                // Handle specific events
                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setSession(null);
                }
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    // Sign in handler
    const handleSignIn = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await signIn(email, password);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Sign up handler
    const handleSignUp = useCallback(async (email, password, fullName) => {
        setLoading(true);
        setError(null);
        try {
            const data = await signUp(email, password, fullName);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // OAuth handler
    const handleOAuthSignIn = useCallback(async (provider) => {
        setLoading(true);
        setError(null);
        try {
            const data = await signInWithProvider(provider);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Sign out handler
    const handleSignOut = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await signOut();
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        user,
        session,
        loading,
        error,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signInWithProvider: handleOAuthSignIn,
        signOut: handleSignOut,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to access auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * Hook for Supabase realtime subscriptions
 */
export const useRealtimeSubscription = (table, callback, options = {}) => {
    useEffect(() => {
        const channel = supabase
            .channel(`${table}-channel-${Date.now()}`)
            .on(
                'postgres_changes',
                {
                    event: options.event || '*',
                    schema: 'public',
                    table,
                    filter: options.filter
                },
                (payload) => callback(payload)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, callback, options.event, options.filter]);
};

/**
 * Hook to fetch and cache data from Supabase
 */
export const useSupabaseQuery = (table, query = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { select = '*', filters = [], order, limit } = query;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let queryBuilder = supabase.from(table).select(select);

            // Apply filters
            filters.forEach(({ column, operator, value }) => {
                queryBuilder = queryBuilder.filter(column, operator, value);
            });

            // Apply ordering
            if (order) {
                queryBuilder = queryBuilder.order(order.column, {
                    ascending: order.ascending ?? false
                });
            }

            // Apply limit
            if (limit) {
                queryBuilder = queryBuilder.limit(limit);
            }

            const { data, error } = await queryBuilder;

            if (error) throw error;
            setData(data);
        } catch (err) {
            console.error(`Error fetching ${table}:`, err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [table, select, JSON.stringify(filters), order?.column, order?.ascending, limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for forecasts with realtime updates
 */
export const useForecasts = (limit = 100) => {
    const [forecasts, setForecasts] = useState([]);
    const { data, loading, error, refetch } = useSupabaseQuery('forecasts', {
        order: { column: 'created_at', ascending: false },
        limit
    });

    useEffect(() => {
        if (data) setForecasts(data);
    }, [data]);

    // Subscribe to new forecasts
    useRealtimeSubscription('forecasts', (payload) => {
        if (payload.eventType === 'INSERT') {
            setForecasts(prev => [payload.new, ...prev].slice(0, limit));
        } else if (payload.eventType === 'DELETE') {
            setForecasts(prev => prev.filter(f => f.id !== payload.old.id));
        }
    }, { event: '*' });

    return { forecasts, loading, error, refetch };
};

/**
 * Hook for scenarios with realtime updates
 */
export const useScenarios = () => {
    const [scenarios, setScenarios] = useState([]);
    const { data, loading, error, refetch } = useSupabaseQuery('scenarios', {
        order: { column: 'created_at', ascending: false }
    });

    useEffect(() => {
        if (data) setScenarios(data);
    }, [data]);

    // Subscribe to scenario changes
    useRealtimeSubscription('scenarios', (payload) => {
        if (payload.eventType === 'INSERT') {
            setScenarios(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
            setScenarios(prev => prev.map(s =>
                s.id === payload.new.id ? payload.new : s
            ));
        } else if (payload.eventType === 'DELETE') {
            setScenarios(prev => prev.filter(s => s.id !== payload.old.id));
        }
    }, { event: '*' });

    return { scenarios, loading, error, refetch };
};

export default useAuth;
