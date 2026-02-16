/**
 * Enhanced Login Page
 * Exceptional authentication with 3D effects, particles, tab switching, and GSAP animations
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import SocialAuth from '../components/common/SocialAuth';
import MagneticButton from '../components/ui/MagneticButton';
import LoadingTheater from '../components/auth/LoadingTheater';
import PasswordStrength from '../components/auth/PasswordStrength';

const Login = () => {
    const [activeMode, setActiveMode] = useState('signin');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        remember: false,
        terms: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loadingStage, setLoadingStage] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingStage('loading');

        try {
            if (activeMode === 'signin') {
                await login(formData.email, formData.password);
            } else {
                await register(formData.name, formData.email, formData.password);
            }

            // Show success animation
            setLoadingStage('success');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            setLoadingStage(null);
            setError(err.response?.data?.detail || 'An error occurred. Please try again.');
        }
    };

    const switchTab = (mode) => {
        if (mode === activeMode) return;

        const currentForm = document.getElementById(`${activeMode}-form`);
        const nextForm = document.getElementById(`${mode}-form`);
        const indicator = document.getElementById('tab-indicator');

        // Animate tab indicator
        indicator.style.transform = mode === 'signin' ? 'translateX(0)' : 'translateX(100%)';

        // Animate form transition
        gsap.to(currentForm, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            onComplete: () => {
                currentForm.classList.add('hidden');
                nextForm.classList.remove('hidden');
                gsap.fromTo(nextForm,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.3 }
                );
            }
        });

        // Update titles
        const titleElement = document.getElementById('welcome-title');
        const subtitleElement = document.getElementById('welcome-subtitle');

        if (mode === 'signin') {
            titleElement.textContent = 'Welcome back';
            subtitleElement.textContent = 'Enter your credentials to access your dashboard';
        } else {
            titleElement.textContent = 'Start your journey';
            subtitleElement.textContent = 'Create your account to unlock intelligent forecasting';
        }

        setActiveMode(mode);
        setError('');
    };

    return (
        <>
            <LoadingTheater show={loadingStage !== null} stage={loadingStage} />

            <AuthLayout mode={activeMode}>
                <div className="w-full max-w-md relative z-10">

                    {/* Pro Card Container */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">

                        {/* Tab Switcher */}
                        <div className="relative mb-8">
                            <div className="flex bg-gray-50 rounded-lg p-1 relative border border-gray-200">
                                <div
                                    id="tab-indicator"
                                    className="absolute top-1 left-1 w-[calc(50%-4px)] h-[calc(100%-8px)] bg-white rounded-md shadow-sm border border-gray-100 transition-transform duration-300 ease-out"
                                />
                                <button
                                    onClick={() => switchTab('signin')}
                                    className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors ${activeMode === 'signin' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => switchTab('register')}
                                    className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors ${activeMode === 'register' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Register
                                </button>
                            </div>
                        </div>

                        {/* Welcome Text */}
                        <div className="mb-8 text-center">
                            <h2 id="welcome-title" className="font-display text-3xl font-bold text-gray-900 mb-2">
                                Welcome back
                            </h2>
                            <p id="welcome-subtitle" className="text-gray-500">
                                Enter your credentials to access your dashboard
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-50 border border-red-200 text-red-700">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {/* Social Auth */}
                        <SocialAuth />

                        {/* Sign In Form */}
                        <form id="signin-form" onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@company.com"
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 hover:border-gray-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 hover:border-gray-400"
                                        required
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
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={formData.remember}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                                    />
                                    <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                                        Remember me
                                    </span>
                                </label>
                                <Link to="/forgot-password" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <MagneticButton
                                type="submit"
                                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                <span>Sign In</span>
                                <ArrowRight className="w-4 h-4" />
                            </MagneticButton>
                        </form>

                        {/* Register Form (Hidden by default) */}
                        <form id="register-form" onSubmit={handleSubmit} className="space-y-5 hidden">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 hover:border-gray-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@company.com"
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 hover:border-gray-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 hover:border-gray-400"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password Strength Meter */}
                                <PasswordStrength password={formData.password} />
                            </div>

                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="terms"
                                    checked={formData.terms}
                                    onChange={handleChange}
                                    className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                                    required
                                />
                                <label className="ml-2 text-sm text-gray-600">
                                    I agree to the <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-semibold">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-semibold">Privacy Policy</Link>
                                </label>
                            </div>

                            <MagneticButton
                                type="submit"
                                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                <span>Create Account</span>
                                <ArrowRight className="w-4 h-4" />
                            </MagneticButton>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                By continuing, you agree to our <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.<br />
                                Protected by reCAPTCHA and subject to Google's Privacy Policy and Terms of Service.
                            </p>
                        </div>
                    </div>
                </div>
            </AuthLayout>
        </>
    );
};

export default Login;
