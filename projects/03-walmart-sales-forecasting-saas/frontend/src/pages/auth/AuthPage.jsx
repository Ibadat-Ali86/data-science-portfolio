import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle, Github } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordStrength from '../../components/auth/PasswordStrength';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validation';

// Custom SVG Icons
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const MicrosoftIcon = () => (
    <svg viewBox="0 0 21 21" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
);

const AuthPage = () => {
    const [activeMode, setActiveMode] = useState('signin');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        remember: false,
        terms: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};
        const emailError = validateEmail(formData.email);
        if (emailError) newErrors.email = emailError;

        if (activeMode === 'register') {
            const passError = validatePassword(formData.password);
            if (passError) newErrors.password = passError;
            if (!validateRequired(formData.name)) newErrors.name = 'Full Name is required';
            if (!formData.terms) newErrors.terms = 'Agreement required';
        } else {
            if (!formData.password) newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        setApiError('');

        try {
            if (activeMode === 'signin') {
                await login(formData.email, formData.password);
            } else {
                await register(formData.name, formData.email, formData.password);
            }
            navigate('/dashboard');
        } catch (err) {
            setApiError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full max-w-[440px] relative z-10"
            >
                {/* Premium Glass Container */}
                <div className="bg-[rgba(28,35,51,0.6)] backdrop-blur-[24px] border border-[rgba(163,173,191,0.12)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

                    {/* Tab Switcher (Segmented Control style) */}
                    <div className="relative mb-8 p-1 bg-[#0A0E1A]/50 border border-white/5 rounded-xl flex">
                        <motion.div
                            className="absolute top-1 bottom-1 bg-[#1C2333] rounded-lg border border-white/10 z-0"
                            initial={false}
                            animate={{
                                left: activeMode === 'signin' ? '4px' : '50%',
                                width: 'calc(50% - 4px)'
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setActiveMode('signin')}
                            className={`flex-1 py-2 text-sm font-semibold relative z-10 transition-colors ${activeMode === 'signin' ? 'text-white' : 'text-[#A3ADBF] hover:text-white'}`}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => setActiveMode('register')}
                            className={`flex-1 py-2 text-sm font-semibold relative z-10 transition-colors ${activeMode === 'register' ? 'text-white' : 'text-[#A3ADBF] hover:text-white'}`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Header */}
                    <div className="mb-8 text-center sm:text-left">
                        <h2 className="font-display text-2xl font-bold text-white mb-2">
                            {activeMode === 'signin' ? 'Welcome Back' : 'Initialize Account'}
                        </h2>
                        <p className="text-[#A3ADBF] text-sm">
                            {activeMode === 'signin'
                                ? 'Authenticate to access your forecast intelligence'
                                : 'Configure your enterprise access credentials'}
                        </p>
                    </div>

                    {/* API Error Alert */}
                    <AnimatePresence>
                        {apiError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="p-3 rounded-lg flex items-start gap-3 bg-[#FF5757]/10 border border-[#FF5757]/30 text-[#FF5757]">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p className="text-sm">{apiError}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Social OAuth Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1C2333]/80 hover:bg-[#1C2333] border border-white/5 hover:border-white/10 rounded-xl transition-all text-sm font-medium text-slate-300 hover:text-white group">
                            <GoogleIcon />
                            <span>Google</span>
                        </button>
                        <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1C2333]/80 hover:bg-[#1C2333] border border-white/5 hover:border-white/10 rounded-xl transition-all text-sm font-medium text-slate-300 hover:text-white group">
                            <MicrosoftIcon />
                            <span>Microsoft</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        <span className="text-xs font-medium text-[#A3ADBF] uppercase tracking-wider">or continue with email</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    </div>

                    {/* Main Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeMode}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {/* Name Input */}
                                {activeMode === 'register' && (
                                    <div>
                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-[#A3ADBF] group-focus-within/input:text-[#4A9EFF] transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Full Legal Name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`block w-full pl-10 pr-3 py-3 rounded-xl bg-[#1C2333] border ${errors.name ? 'border-[#FF5757]' : 'border-transparent'} text-white !text-white dark-autofill placeholder-[#A3ADBF] focus:outline-none focus:ring-1 focus:ring-[#4A9EFF] focus:border-[#4A9EFF] outline-none shadow-sm focus:shadow-[0_0_15px_rgba(74,158,255,0.3)] transition-all duration-250 sm:text-sm`}
                                            />
                                        </div>
                                        {errors.name && <p className="mt-1 text-xs text-[#FF5757]">{errors.name}</p>}
                                    </div>
                                )}

                                {/* Email Input */}
                                <div>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-[#A3ADBF] group-focus-within/input:text-[#4A9EFF] transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Corporate Email Address"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-3 rounded-xl bg-[#1C2333] border ${errors.email ? 'border-[#FF5757]' : 'border-transparent'} text-white !text-white dark-autofill placeholder-[#A3ADBF] focus:outline-none focus:ring-1 focus:ring-[#4A9EFF] focus:border-[#4A9EFF] outline-none shadow-sm focus:shadow-[0_0_15px_rgba(74,158,255,0.3)] transition-all duration-250 sm:text-sm`}
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-xs text-[#FF5757]">{errors.email}</p>}
                                </div>

                                {/* Password Input */}
                                <div>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-[#A3ADBF] group-focus-within/input:text-[#4A9EFF] transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Secure Password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-3 rounded-xl bg-[#1C2333] border ${errors.password ? 'border-[#FF5757]' : 'border-transparent'} text-white !text-white dark-autofill placeholder-[#A3ADBF] focus:outline-none focus:ring-1 focus:ring-[#4A9EFF] focus:border-[#4A9EFF] outline-none shadow-sm focus:shadow-[0_0_15px_rgba(74,158,255,0.3)] transition-all duration-250 sm:text-sm`}
                                        />
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-[#FF5757]">{errors.password}</p>}

                                    {activeMode === 'register' && formData.password.length > 0 && (
                                        <div className="mt-3">
                                            <PasswordStrength password={formData.password} />
                                        </div>
                                    )}
                                </div>

                                {/* Form Actions */}
                                {activeMode === 'signin' ? (
                                    <div className="flex items-center justify-between pt-2">
                                        <label className="flex items-center cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                checked={formData.remember}
                                                onChange={handleChange}
                                                className="w-4 h-4 rounded bg-[#1C2333] border-white/10 text-[#4A9EFF] focus:ring-[#4A9EFF] focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
                                            />
                                            <span className="ml-2 text-sm text-[#A3ADBF] group-hover:text-white transition-colors">
                                                Keep me logged in
                                            </span>
                                        </label>
                                        <Link to="/forgot-password" className="text-sm font-semibold text-[#4A9EFF] hover:text-[#B794F6] transition-colors">
                                            Forgot password?
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex items-start pt-2">
                                        <div className="flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                name="terms"
                                                checked={formData.terms}
                                                onChange={handleChange}
                                                className="w-4 h-4 rounded bg-[#1C2333] border-white/10 text-[#4A9EFF] focus:ring-[#4A9EFF] focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
                                            />
                                        </div>
                                        <div className="ml-2 text-sm">
                                            <label className="text-[#A3ADBF] cursor-pointer" onClick={() => handleChange({ target: { name: 'terms', type: 'checkbox', checked: !formData.terms } })}>
                                                I agree to the <Link to="/terms" onClick={(e) => e.stopPropagation()} className="text-[#4A9EFF] hover:text-[#B794F6] font-semibold transition-colors">Enterprise TOS</Link>
                                            </label>
                                            {errors.terms && <p className="text-[#FF5757] text-xs mt-1">{errors.terms}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Primary CTA */}
                                <div className="pt-4">
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-[#4A9EFF] to-[#B794F6] hover:shadow-[0_0_20px_rgba(74,158,255,0.4)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
                                    >
                                        {/* Light sweep animation */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>

                                        <span className="relative z-10 flex items-center justify-center">
                                            {isLoading ? (
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <>
                                                    {activeMode === 'signin' ? 'Authenticate' : 'Initialize Account'}
                                                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <p className="text-xs text-[#A3ADBF]/70 leading-relaxed font-medium">
                            Secure Intelligence Gateway<br />
                            Protected by Advanced ML Analytics & 256-bit Encryption
                        </p>
                    </div>
                </div>
            </motion.div>
        </AuthLayout>
    );
};

export default AuthPage;
