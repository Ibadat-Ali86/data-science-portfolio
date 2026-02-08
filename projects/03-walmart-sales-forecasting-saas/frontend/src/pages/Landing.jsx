import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Sliders, Shield, Zap, Users, ArrowRight, CheckCircle, Play, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const Landing = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const stats = [
        { value: 98.77, label: 'Forecast Accuracy', suffix: '%', prefix: '' },
        { value: 500, label: 'Enterprise Clients', suffix: '+', prefix: '' },
        { value: 10, label: 'Daily Predictions', suffix: 'M+', prefix: '' },
    ];

    const features = [
        {
            icon: TrendingUp,
            title: 'AI-Powered Forecasting',
            description: 'Leverage XGBoost, LSTM, and Prophet models for highly accurate demand predictions.',
            gradient: 'from-[#4A9EFF] to-[#00D9FF]',
        },
        {
            icon: BarChart3,
            title: 'Interactive Dashboards',
            description: 'Visualize trends and forecasts with beautiful, real-time charts.',
            gradient: 'from-[#B794F6] to-[#FF6B9D]',
        },
        {
            icon: Sliders,
            title: 'Scenario Planning',
            description: 'Run what-if analyses to optimize inventory and reduce costs.',
            gradient: 'from-[#4ADE80] to-[#00D9FF]',
        },
        {
            icon: Shield,
            title: 'Enterprise Security',
            description: 'Bank-level encryption, SOC 2 compliance, and GDPR-ready.',
            gradient: 'from-[#FFC947] to-[#FF8A5B]',
        },
        {
            icon: Zap,
            title: 'Real-time Updates',
            description: 'Get instant forecast updates with 24/7 automated processing.',
            gradient: 'from-[#4A9EFF] to-[#B794F6]',
        },
        {
            icon: Users,
            title: 'Team Collaboration',
            description: 'Share insights and align your team on demand strategy.',
            gradient: 'from-[#00D9FF] to-[#4ADE80]',
        },
    ];

    // Animated counter hook
    const AnimatedCounter = ({ value, suffix = '', prefix = '' }) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            let start = 0;
            const increment = value / 60;
            const timer = setInterval(() => {
                start += increment;
                if (start >= value) {
                    setCount(value);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start * 100) / 100);
                }
            }, 30);
            return () => clearInterval(timer);
        }, [value]);

        return <span>{prefix}{typeof value === 'number' && value % 1 !== 0 ? count.toFixed(2) : Math.floor(count)}{suffix}</span>;
    };

    return (
        <div className="min-h-screen gradient-mesh">
            {/* Fixed Glass Navigation */}
            <nav className={`nav-bar transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <span className="gradient-text">ForecastAI</span>
                    </Link>

                    <div className="hidden lg:flex nav-links">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#stats" className="nav-link">Results</a>
                        <a href="#cta" className="nav-link">Pricing</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/login" className="btn-secondary btn-sm hidden sm:inline-flex">
                            Sign In
                        </Link>
                        <Link to="/register" className="btn-primary btn-sm">
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 sm:pt-40 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Animated gradient orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-30"
                        style={{ background: 'radial-gradient(circle, rgba(74, 158, 255, 0.4) 0%, transparent 70%)' }} />
                    <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle, rgba(183, 148, 246, 0.4) 0%, transparent 70%)' }} />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center lg:text-left"
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                style={{ background: 'rgba(74, 158, 255, 0.1)', border: '1px solid rgba(74, 158, 255, 0.3)' }}
                            >
                                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent-green)' }} />
                                <span className="text-sm font-medium" style={{ color: 'var(--accent-blue)' }}>
                                    Powered by Advanced ML Models
                                </span>
                            </motion.div>

                            <h1 className="text-hero mb-6" style={{ color: 'var(--text-primary)' }}>
                                Transform Sales Data Into{' '}
                                <span className="gradient-text block sm:inline">
                                    Accurate Forecasts
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0"
                                style={{ color: 'var(--text-secondary)' }}>
                                ML-powered forecasting platform that helps businesses reduce stockouts by 80% and save millions in operational costs.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link to="/register" className="btn-primary btn-large group">
                                    <span>Start Free Trial</span>
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <button className="btn-secondary btn-large group">
                                    <Play className="w-5 h-5" />
                                    <span>Watch Demo</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start text-sm"
                                style={{ color: 'var(--text-tertiary)' }}>
                                <span className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                                    No credit card required
                                </span>
                                <span className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                                    14-day free trial
                                </span>
                            </div>
                        </motion.div>

                        {/* Hero Dashboard Preview */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="hidden lg:block"
                        >
                            <div className="glass-card p-6 rounded-2xl relative">
                                {/* Terminal header */}
                                <div className="flex items-center gap-2 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full" style={{ background: 'var(--accent-red)' }} />
                                        <div className="w-3 h-3 rounded-full" style={{ background: 'var(--accent-yellow)' }} />
                                        <div className="w-3 h-3 rounded-full" style={{ background: 'var(--accent-green)' }} />
                                    </div>
                                    <span className="text-sm font-mono ml-4" style={{ color: 'var(--text-tertiary)' }}>
                                        forecast_dashboard.py
                                    </span>
                                </div>

                                {/* Chart placeholder */}
                                <div className="h-44 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden"
                                    style={{ background: 'var(--bg-tertiary)' }}>
                                    <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
                                        {[40, 65, 45, 80, 55, 70, 90, 60].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                                                className="w-6 rounded-t"
                                                style={{
                                                    background: i === 6
                                                        ? 'linear-gradient(180deg, var(--accent-blue), var(--accent-purple))'
                                                        : 'var(--bg-elevated)'
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div className="absolute top-4 right-4 badge badge-success">
                                        <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ background: 'currentColor' }} />
                                        LIVE
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-4 rounded-lg text-center" style={{ background: 'var(--bg-tertiary)' }}>
                                        <div className="text-2xl font-bold font-mono gradient-text">98.77%</div>
                                        <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Accuracy</div>
                                    </div>
                                    <div className="p-4 rounded-lg text-center" style={{ background: 'var(--bg-tertiary)' }}>
                                        <div className="text-2xl font-bold font-mono" style={{ color: 'var(--accent-green)' }}>$2.5M</div>
                                        <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Saved</div>
                                    </div>
                                    <div className="p-4 rounded-lg text-center" style={{ background: 'var(--bg-tertiary)' }}>
                                        <div className="text-2xl font-bold font-mono" style={{ color: 'var(--accent-cyan)' }}>-80%</div>
                                        <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Stockouts</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <ChevronDown className="w-6 h-6" style={{ color: 'var(--text-tertiary)' }} />
                </motion.div>
            </section>

            {/* Stats Section */}
            <section id="stats" className="py-20 sm:py-28" style={{ background: 'var(--bg-secondary)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className="text-center"
                            >
                                <div className="text-5xl sm:text-6xl font-bold font-mono gradient-text mb-3">
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                                </div>
                                <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="badge badge-info mb-4">Features</span>
                            <h2 className="text-h1 mb-4" style={{ color: 'var(--text-primary)' }}>
                                Everything you need for{' '}
                                <span className="gradient-text">intelligent forecasting</span>
                            </h2>
                            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                                Advanced ML models combined with intuitive dashboards and real-time insights
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="feature-card group"
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.gradient}`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                                    {feature.title}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="cta" className="py-20 sm:py-28 relative overflow-hidden">
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(135deg, rgba(74, 158, 255, 0.1) 0%, rgba(183, 148, 246, 0.1) 100%)' }} />

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-h1 mb-6" style={{ color: 'var(--text-primary)' }}>
                            Ready to transform your{' '}
                            <span className="gradient-text">forecasting?</span>
                        </h2>
                        <p className="text-xl mb-10" style={{ color: 'var(--text-secondary)' }}>
                            Join 500+ companies using AI to optimize their supply chain
                        </p>
                        <Link to="/register" className="btn-primary btn-large">
                            Start Free Trial
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-primary)' }}>
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
                            <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>ForecastAI</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm hover:text-[var(--accent-blue)]" style={{ color: 'var(--text-tertiary)' }}>Privacy</a>
                        <a href="#" className="text-sm hover:text-[var(--accent-blue)]" style={{ color: 'var(--text-tertiary)' }}>Terms</a>
                        <a href="#" className="text-sm hover:text-[var(--accent-blue)]" style={{ color: 'var(--text-tertiary)' }}>Contact</a>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        © 2024 ForecastAI. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
