import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Shield, Zap, BarChart3, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VideoBackground from '../components/common/VideoBackground';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '', remember: false });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    const benefits = [
        { icon: BarChart3, text: '98.77% forecast accuracy' },
        { icon: Zap, text: 'Real-time predictions' },
        { icon: Shield, text: 'Enterprise-grade security' },
    ];

    return (
        <div className="min-h-screen flex text-white font-sans bg-[#0f172a]">
            {/* Left Side (40%) - Branding & Info */}
            <div className="hidden lg:flex lg:w-[40%] flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
                {/* Background Effects */}
                <VideoBackground showForGuests={true} opacity={0.05} />
                <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[1px]" />

                {/* Header */}
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            ForecastAI
                        </span>
                    </Link>
                </div>

                {/* Main Content */}
                <div className="relative z-10 max-w-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl font-bold leading-tight mb-6">
                            Welcome back to <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                                smarter forecasting
                            </span>
                        </h1>
                        <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                            Access your dashboard to view predictions and optimize your supply chain with our advanced ML models.
                        </p>

                        <div className="space-y-6">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="flex items-center gap-4 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center border border-slate-700/50 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-colors">
                                        <benefit.icon className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <span className="font-medium text-slate-300">{benefit.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Footer Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="relative z-10 flex items-center gap-6 text-sm font-medium text-slate-500"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        99.9% Uptime
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        SOC 2 Compliant
                    </div>
                </motion.div>
            </div>

            {/* Right Side (60%) - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-[#0f172a]">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[480px] relative z-10"
                >
                    {/* Mobile Logo */}
                    <Link to="/" className="lg:hidden flex items-center gap-3 mb-10 justify-center">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">ForecastAI</span>
                    </Link>

                    {/* Glassmorphic Card */}
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/50">
                        <div className="mb-8 text-center sm:text-left">
                            <h2 className="text-3xl font-bold mb-2">Sign in</h2>
                            <p className="text-slate-400">
                                Welcome back! Please enter your details.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@company.com"
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-12 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-12 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={formData.remember}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0"
                                    />
                                    <span className="text-sm text-slate-400">Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Sign in <ArrowRight className="w-5 h-5" /></>
                                )}
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 text-sm text-slate-500 bg-slate-900/80 backdrop-blur-xl">
                                    or continue with
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white py-3 rounded-xl transition-all">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="font-medium">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white py-3 rounded-xl transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                <span className="font-medium">GitHub</span>
                            </button>
                        </div>

                        <div className="mt-8 text-center text-sm text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
                                Sign up now
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
