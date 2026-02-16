import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Lock, User, Eye, EyeOff, ArrowRight,
    TrendingUp, Zap, Shield, Check, AlertCircle, Loader2,
    CheckCircle2
} from 'lucide-react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useAuth } from '../../context/AuthContext';
import './AuthPage.css';

/**
 * TextScramble Effect Component
 * Creates a cyberpunk-style text scramble animation
 */
const TextScramble = ({ phrases, className }) => {
    const [text, setText] = useState(phrases[0]);
    const [isAnimating, setIsAnimating] = useState(false);
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    const phraseIndex = useRef(0);

    const scramble = useCallback((newText) => {
        if (isAnimating) return;
        setIsAnimating(true);

        const oldText = text;
        const length = Math.max(oldText.length, newText.length);
        let frame = 0;
        const maxFrames = 40;

        const animate = () => {
            let output = '';
            let complete = 0;

            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 10);
                const end = start + Math.floor(Math.random() * 15);

                if (frame >= end) {
                    output += to;
                    complete++;
                } else if (frame >= start) {
                    output += chars[Math.floor(Math.random() * chars.length)];
                } else {
                    output += from;
                }
            }

            setText(output);
            frame++;

            if (frame <= maxFrames) {
                requestAnimationFrame(animate);
            } else {
                setText(newText);
                setIsAnimating(false);
            }
        };

        requestAnimationFrame(animate);
    }, [text, isAnimating, chars]);

    useEffect(() => {
        const interval = setInterval(() => {
            phraseIndex.current = (phraseIndex.current + 1) % phrases.length;
            scramble(phrases[phraseIndex.current]);
        }, 3000);

        return () => clearInterval(interval);
    }, [phrases, scramble]);

    return <span className={className}>{text}</span>;
};

/**
 * Animated Chart Component - Light Mode
 */
const ForecastChart = () => {
    return (
        <div className="forecast-chart-container float-animation">
            <div className="chart-card">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Live Forecast
                    </span>
                    <span className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Real-time
                    </span>
                </div>
                <svg className="w-full h-32" viewBox="0 0 400 120">
                    {/* Grid Lines */}
                    <line x1="0" y1="30" x2="400" y2="30" stroke="#E5E7EB" strokeWidth="1" />
                    <line x1="0" y1="60" x2="400" y2="60" stroke="#E5E7EB" strokeWidth="1" />
                    <line x1="0" y1="90" x2="400" y2="90" stroke="#E5E7EB" strokeWidth="1" />

                    {/* Historical Data (Blue) */}
                    <path
                        className="chart-line"
                        d="M 0,80 Q 50,75 100,60 T 200,50 T 300,40"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    {/* Forecast (Purple with glow) */}
                    <path
                        className="chart-line chart-line-delayed"
                        d="M 300,40 Q 350,35 400,20"
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.4))' }}
                    />

                    {/* Data Points */}
                    <circle className="chart-point" cx="100" cy="60" r="5" fill="#3B82F6" style={{ animationDelay: '0.5s' }} />
                    <circle className="chart-point" cx="200" cy="50" r="5" fill="#3B82F6" style={{ animationDelay: '1s' }} />
                    <circle className="chart-point" cx="300" cy="40" r="6" fill="#3B82F6" style={{ animationDelay: '1.5s' }} />
                    <circle
                        className="chart-point"
                        cx="400"
                        cy="20"
                        r="7"
                        fill="#8B5CF6"
                        style={{ animationDelay: '2s', filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.6))' }}
                    />

                    {/* Prediction Zone */}
                    <defs>
                        <linearGradient id="predGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <rect x="300" y="0" width="100" height="120" fill="url(#predGradient)" />
                </svg>
                <div className="flex justify-between mt-3 text-xs font-medium">
                    <span className="text-gray-400">Historical</span>
                    <span className="text-violet-600">AI Prediction →</span>
                </div>
            </div>
        </div>
    );
};

/**
 * Animated Stat Counter
 */
const StatCounter = ({ target, suffix = '', label }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current * 100) / 100);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [target]);

    return (
        <div className="text-center">
            <div className="stat-number font-display text-3xl font-bold">
                {count}{suffix}
            </div>
            <div className="text-gray-500 text-sm font-medium">{label}</div>
        </div>
    );
};

/**
 * Password Strength Indicator
 */
const PasswordStrength = ({ password }) => {
    const requirements = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password)
    };

    const strength = Object.values(requirements).filter(Boolean).length;

    const getColor = () => {
        if (strength <= 1) return 'bg-red-500';
        if (strength === 2) return 'bg-orange-500';
        if (strength === 3) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    const getLabel = () => {
        if (strength <= 1) return 'Weak';
        if (strength === 2) return 'Fair';
        if (strength === 3) return 'Good';
        return 'Strong';
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= strength ? getColor() : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
                <span className={`text-xs font-medium ${strength === 4 ? 'text-emerald-600' :
                        strength === 3 ? 'text-yellow-600' :
                            strength === 2 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                    {getLabel()}
                </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {Object.entries(requirements).map(([key, valid]) => (
                    <span
                        key={key}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${valid ? 'text-emerald-600' : 'text-gray-400'
                            }`}
                    >
                        {valid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
                        {key === 'length' ? '8+ characters' :
                            key === 'upper' ? 'Uppercase' :
                                key === 'lower' ? 'Lowercase' : 'Number'}
                    </span>
                ))}
            </div>
        </div>
    );
};

/**
 * Main AuthPage Component - Light Mode Professional Design
 */
const AuthPage = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [particlesInit, setParticlesInit] = useState(false);

    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const navigate = useNavigate();
    const { login, register, loginWithProvider, isSupabaseMode, isAuthenticated } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Initialize particles engine
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setParticlesInit(true);
        });
    }, []);

    const particlesOptions = {
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        particles: {
            color: { value: '#3B82F6' },
            links: {
                color: '#3B82F6',
                distance: 150,
                enable: true,
                opacity: 0.08,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.4,
                direction: 'none',
                random: true,
                straight: false,
                outModes: { default: 'out' }
            },
            number: {
                density: { enable: true, area: 1000 },
                value: 60
            },
            opacity: {
                value: 0.3,
                random: true,
                animation: { enable: true, speed: 0.5, minimumValue: 0.1 }
            },
            size: {
                value: { min: 1, max: 2.5 },
                animation: { enable: true, speed: 1, minimumValue: 0.5 }
            }
        },
        interactivity: {
            events: {
                onHover: { enable: true, mode: 'grab' },
                onClick: { enable: true, mode: 'push' }
            },
            modes: {
                grab: { distance: 120, links: { opacity: 0.3 } },
                push: { quantity: 3 }
            }
        },
        detectRetina: true
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const result = await login(loginForm.email, loginForm.password);
            if (result.success) {
                setSuccess('Login successful! Redirecting...');
                setTimeout(() => navigate('/dashboard'), 1000);
            } else {
                setError(result.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (registerForm.password !== registerForm.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (registerForm.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            const result = await register({
                email: registerForm.email,
                password: registerForm.password,
                full_name: registerForm.fullName
            });

            if (result.success) {
                setSuccess(result.message || 'Account created successfully! Please check your email.');
                setActiveTab('login');
                setLoginForm({ email: registerForm.email, password: '' });
            } else {
                setError(result.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialAuth = async (provider) => {
        setError('');
        setIsLoading(true);

        try {
            const result = await loginWithProvider(provider);
            if (!result.success) {
                setError(result.error || `${provider} login is not available. Please use email login.`);
            }
        } catch (err) {
            setError(err.message || `Failed to login with ${provider}`);
        } finally {
            setIsLoading(false);
        }
    };

    const headlinePhrases = [
        'Predict the Future',
        'Optimize Inventory',
        'Maximize Revenue',
        'Reduce Waste',
        'ForecastAI'
    ];

    return (
        <div className="auth-page min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Particle Background */}
            {particlesInit && (
                <Particles
                    id="tsparticles"
                    className="absolute inset-0 z-0"
                    options={particlesOptions}
                />
            )}

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Side: Branding & Visuals */}
                <div className="hidden lg:block space-y-10">
                    {/* Logo */}
                    <Link to="/" className="inline-flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <span className="font-display text-2xl font-bold text-gray-900 tracking-tight">
                            ForecastAI
                        </span>
                    </Link>

                    {/* Animated Headline */}
                    <div className="space-y-5">
                        <h1 className="font-display text-5xl font-bold text-gray-900 leading-tight">
                            <TextScramble phrases={headlinePhrases} className="scramble-text" />
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600">
                                of Your Business
                            </span>
                        </h1>
                        <p className="text-gray-600 text-lg max-w-md leading-relaxed">
                            Harness the power of ensemble machine learning to achieve{' '}
                            <span className="text-blue-600 font-semibold">98.77%</span> forecast accuracy.
                        </p>
                    </div>

                    {/* Animated Chart Preview */}
                    <ForecastChart />

                    {/* Stats */}
                    <div className="flex gap-10">
                        <StatCounter target={98.77} suffix="%" label="Accuracy" />
                        <StatCounter target={45} suffix="" label="Stores" />
                        <StatCounter target={421} suffix="K" label="Predictions" />
                    </div>
                </div>

                {/* Right Side: Auth Forms */}
                <div className="auth-card-wrapper">
                    <div className="auth-card">
                        {/* Mobile Logo */}
                        <Link to="/" className="lg:hidden flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-display text-xl font-bold text-gray-900">ForecastAI</span>
                        </Link>

                        {/* Tab Switcher */}
                        <div className="flex bg-gray-100 p-1.5 rounded-xl mb-8 relative">
                            <motion.div
                                className="absolute top-1.5 h-[calc(100%-12px)] bg-white rounded-lg shadow-sm"
                                initial={false}
                                animate={{
                                    left: activeTab === 'login' ? '6px' : 'calc(50%)',
                                    width: 'calc(50% - 6px)'
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                            <button
                                onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold relative z-10 transition-colors ${activeTab === 'login' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold relative z-10 transition-colors ${activeTab === 'register' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Create Account
                            </button>
                        </div>

                        {/* Messages */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-50 border border-red-200 text-red-700"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="text-sm">{error}</p>
                                </motion.div>
                            )}
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700"
                                >
                                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="text-sm">{success}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Login Form */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'login' ? (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.25 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <h2 className="font-display text-2xl font-bold text-gray-900">Welcome back</h2>
                                        <p className="text-gray-500">
                                            Enter your credentials to access your dashboard
                                        </p>
                                    </div>

                                    {/* Social Login */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSocialAuth('google')}
                                            disabled={isLoading}
                                            className="social-btn flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all disabled:opacity-50"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-700">Google</span>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSocialAuth('github')}
                                            disabled={isLoading}
                                            className="social-btn flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
                                        >
                                            <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-700">GitHub</span>
                                        </motion.button>
                                    </div>

                                    <div className="relative flex items-center gap-4">
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                        <span className="text-xs font-medium text-gray-400 uppercase">or continue with email</span>
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                    </div>

                                    <form onSubmit={handleLogin} className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Email address</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={loginForm.email}
                                                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                                    className="auth-input w-full"
                                                    placeholder="you@company.com"
                                                    required
                                                    autoComplete="email"
                                                />
                                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={loginForm.password}
                                                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                                    className="auth-input w-full pr-20"
                                                    placeholder="••••••••"
                                                    required
                                                    autoComplete="current-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="auth-checkbox"
                                                />
                                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                                    Remember me
                                                </span>
                                            </label>
                                            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                                Forgot password?
                                            </Link>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            type="submit"
                                            disabled={isLoading}
                                            className="auth-btn-primary w-full"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <span>Sign in to Dashboard</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </motion.button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="register"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                            14-Day Free Trial
                                        </div>
                                        <h2 className="font-display text-2xl font-bold text-gray-900">Start your journey</h2>
                                        <p className="text-gray-500">
                                            Join 2,000+ companies making smarter forecasts
                                        </p>
                                    </div>

                                    {/* Social Signup */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSocialAuth('google')}
                                            disabled={isLoading}
                                            className="social-btn flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all disabled:opacity-50"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-700">Google</span>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSocialAuth('github')}
                                            disabled={isLoading}
                                            className="social-btn flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
                                        >
                                            <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-700">GitHub</span>
                                        </motion.button>
                                    </div>

                                    <div className="relative flex items-center gap-4">
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                        <span className="text-xs font-medium text-gray-400 uppercase">or register with email</span>
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                    </div>

                                    <form onSubmit={handleRegister} className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Full name</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={registerForm.fullName}
                                                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                                                    className="auth-input w-full"
                                                    placeholder="John Smith"
                                                    required
                                                    autoComplete="name"
                                                />
                                                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Work email</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={registerForm.email}
                                                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                                    className="auth-input w-full"
                                                    placeholder="you@company.com"
                                                    required
                                                    autoComplete="email"
                                                />
                                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Create password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={registerForm.password}
                                                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                                    className="auth-input w-full pr-12"
                                                    placeholder="••••••••"
                                                    required
                                                    autoComplete="new-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {registerForm.password && (
                                            <PasswordStrength password={registerForm.password} />
                                        )}

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Confirm password</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={registerForm.confirmPassword}
                                                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                                                    className="auth-input w-full pr-12"
                                                    placeholder="••••••••"
                                                    required
                                                    autoComplete="new-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="auth-checkbox mt-0.5"
                                                required
                                            />
                                            <span className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                                                I agree to the{' '}
                                                <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</Link>
                                                {' '}and{' '}
                                                <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</Link>
                                            </span>
                                        </label>

                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            type="submit"
                                            disabled={isLoading}
                                            className="auth-btn-primary w-full"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <span>Create Free Account</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </motion.button>

                                        <p className="text-center text-xs text-gray-400">
                                            No credit card required • Cancel anytime
                                        </p>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
