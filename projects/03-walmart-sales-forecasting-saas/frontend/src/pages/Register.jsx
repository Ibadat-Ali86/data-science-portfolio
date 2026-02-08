import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Lock, Eye, EyeOff, User, ArrowRight, AlertCircle, Check, X, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VideoBackground from '../components/common/VideoBackground';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', acceptTerms: false });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setError('');
    };

    const getStrength = () => {
        const { password } = formData;
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[a-z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    };

    const strength = getStrength();
    const strengthColors = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#10b981'];
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

    const requirements = [
        { label: '8+ characters', met: formData.password.length >= 8 },
        { label: 'Uppercase', met: /[A-Z]/.test(formData.password) },
        { label: 'Lowercase', met: /[a-z]/.test(formData.password) },
        { label: 'Number', met: /[0-9]/.test(formData.password) },
    ];

    const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
        if (!formData.acceptTerms) return setError('Please accept terms');

        setIsLoading(true);
        try {
            const result = await register({
                full_name: formData.name,
                email: formData.email,
                password: formData.password
            });

            if (result.success) {
                navigate('/login', { state: { message: 'Account created! Please sign in.' } });
            } else {
                setError(result.error || 'Registration failed');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const benefits = [
        'No credit card required',
        '14-day free trial',
        'Cancel anytime',
        'Full feature access'
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">14-Day Free Trial</span>
                        </div>

                        <h1 className="text-4xl font-bold leading-tight mb-6">
                            Start your journey to <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                                smarter forecasting
                            </span>
                        </h1>

                        <div className="space-y-4">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                    <span className="text-slate-300">{benefit}</span>
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
                        GDPR Compliant
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        256-bit Encryption
                    </div>
                </motion.div>
            </div>

            {/* Right Side (60%) - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-[#0f172a] overflow-y-auto">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[480px] relative z-10 py-8"
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
                            <h2 className="text-3xl font-bold mb-2">Create account</h2>
                            <p className="text-slate-400">
                                Get started with your 14-day free trial.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Full name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-12 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Work email</label>
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
                                        placeholder="Create password"
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

                                {formData.password && (
                                    <div className="pt-2">
                                        <div className="flex gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="h-1 flex-1 rounded-full transition-all duration-300"
                                                    style={{
                                                        background: i < strength ? strengthColors[strength - 1] : '#334155'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {requirements.map((r, i) => (
                                                <div key={i} className="flex items-center gap-1.5 text-xs">
                                                    {r.met ? (
                                                        <Check className="w-3 h-3 text-emerald-500" />
                                                    ) : (
                                                        <X className="w-3 h-3 text-slate-500" />
                                                    )}
                                                    <span className={r.met ? 'text-emerald-500' : 'text-slate-500'}>
                                                        {r.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Confirm password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                        className={`w-full bg-slate-800/50 border rounded-xl px-12 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${formData.confirmPassword && !passwordsMatch
                                                ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500'
                                                : 'border-slate-700 focus:ring-indigo-500/50 focus:border-indigo-500'
                                            }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={handleChange}
                                    className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0"
                                />
                                <span className="text-sm text-slate-400">
                                    I agree to the{' '}
                                    <a href="#" className="text-indigo-400 hover:text-indigo-300 hover:underline">Terms</a>
                                    {' '}and{' '}
                                    <a href="#" className="text-indigo-400 hover:text-indigo-300 hover:underline">Privacy Policy</a>
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={isLoading || !formData.acceptTerms}
                                className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Create account <ArrowRight className="w-5 h-5" /></>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
