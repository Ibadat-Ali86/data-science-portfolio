import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Sliders, Shield, Zap, Users, ArrowRight, CheckCircle, Play, ChevronDown, Building2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AmbientBackground from '../components/ui/AmbientBackground';
import MagneticButton from '../components/ui/MagneticButton';
import GradientText from '../components/landing/GradientText';
import ShimmerCard from '../components/landing/ShimmerCard';
import PulseRing from '../components/landing/PulseRing';
import NavigationUnderline from '../components/landing/NavigationUnderline';

gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
    const [scrolled, setScrolled] = useState(false);
    useSmoothScroll();

    const heroRef = useRef(null);
    const statsRef = useRef(null);
    const featuresRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        // GSAP Animations
        const ctx = gsap.context(() => {
            // Hero Elements Stagger
            gsap.from('.hero-animate', {
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out'
            });

            // Stats Counter Animation
            ScrollTrigger.batch('.stat-item', {
                onEnter: batch => gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    stagger: 0.15,
                    overwrite: true
                }),
                start: 'top 85%'
            });

            // Feature Cards Stagger
            gsap.from('.feature-card-item', {
                scrollTrigger: {
                    trigger: featuresRef.current,
                    start: 'top 75%'
                },
                y: 60,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            ctx.revert();
        };
    }, []);

    const navItems = [
        { label: 'Features', href: '#features' },
        { label: 'Results', href: '#stats' },
        { label: 'Pricing', href: '#cta' },
    ];

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
            iconBg: 'bg-primary-100',
            iconColor: 'text-primary-600',
        },
        {
            icon: BarChart3,
            title: 'Interactive Dashboards',
            description: 'Visualize trends and forecasts with beautiful, real-time charts.',
            iconBg: 'bg-secondary-100',
            iconColor: 'text-secondary-600',
        },
        {
            icon: Sliders,
            title: 'Scenario Planning',
            description: 'Run what-if analyses to optimize inventory and reduce costs.',
            iconBg: 'bg-success-100',
            iconColor: 'text-success-600',
        },
        {
            icon: Shield,
            title: 'Enterprise Security',
            description: 'Bank-level encryption, SOC 2 compliance, and GDPR-ready.',
            iconBg: 'bg-warning-100',
            iconColor: 'text-warning-600',
        },
        {
            icon: Zap,
            title: 'Real-time Updates',
            description: 'Get instant forecast updates with 24/7 automated processing.',
            iconBg: 'bg-info-100',
            iconColor: 'text-info-600',
        },
        {
            icon: Users,
            title: 'Team Collaboration',
            description: 'Share insights and align your team on demand strategy.',
            iconBg: 'bg-primary-100',
            iconColor: 'text-primary-600',
        },
    ];

    const trustedLogos = [
        { name: 'Walmart', icon: Building2 },
        { name: 'Amazon', icon: Building2 },
        { name: 'Target', icon: Building2 },
        { name: 'Costco', icon: Building2 },
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
        <div className="min-h-screen bg-bg-primary font-sans selection:bg-primary-200">
            {/* Ambient Background */}
            <AmbientBackground />

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg group-hover:shadow-primary-500/30 transition-shadow">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold font-display tracking-tight text-gray-900">AdaptIQ</span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-8">
                            <NavigationUnderline
                                items={navItems}
                                onItemClick={(index, item) => {
                                    const element = document.querySelector(item.href);
                                    element?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <MagneticButton>
                                <Link to="/login" className="hidden sm:inline-flex px-5 py-2.5 text-gray-600 font-medium hover:text-primary-600 transition-colors">
                                    Sign In
                                </Link>
                            </MagneticButton>

                            <MagneticButton>
                                <Link to="/register" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                    Get Started
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </MagneticButton>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="pt-40 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="text-center lg:text-left">
                            <div className="hero-animate inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm mb-8">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
                                </span>
                                <span className="text-sm font-medium text-gray-600 tracking-wide">
                                    v3.0 Now Available
                                </span>
                            </div>

                            <h1 className="hero-animate text-5xl sm:text-6xl lg:text-7xl font-extrabold font-display text-gray-900 mb-8 leading-[1.1] tracking-tight">
                                Transform data into{' '}
                                <span className="transparent-text bg-clip-text bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 animate-shimmer bg-[length:200%_100%]">
                                    intelligence
                                </span>
                            </h1>

                            <p className="hero-animate text-xl text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                                Enterprise-grade demand forecasting that helps businesses reduce stockouts by 80% and save millions in operational costs.
                            </p>

                            <div className="hero-animate flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <MagneticButton>
                                    <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 min-w-[180px]">
                                        <span>Start Free Trial</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </MagneticButton>

                                <MagneticButton>
                                    <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-full font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm min-w-[180px]">
                                        <Play className="w-5 h-5 fill-current" />
                                        <span>View Demo</span>
                                    </button>
                                </MagneticButton>
                            </div>

                            <div className="hero-animate flex items-center gap-8 mt-12 justify-center lg:justify-start text-sm font-medium text-gray-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-secondary-500" />
                                    <span>SOC 2 Type II Ready</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-secondary-500" />
                                    <span>14-day free trial</span>
                                </div>
                            </div>
                        </div>

                        {/* Glassmorphism Dashboard Preview */}
                        <div className="hero-animate hidden lg:block perspective-1000">
                            <div className="glass-panel rounded-2xl p-6 relative transform transition-all duration-500 hover:scale-[1.02] hover:rotate-y-2 hover:rotate-x-2">
                                {/* Dashboard Header */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-white flex items-center justify-center shadow-inner">
                                            <BarChart3 className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-lg">Demand Forecast</div>
                                            <div className="text-sm text-gray-500">Real-time predictive analytics</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur rounded-full shadow-sm border border-gray-100 text-success-600 text-sm font-bold tracking-wide">
                                        <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                                        LIVE
                                    </div>
                                </div>

                                {/* Animated Chart Bars */}
                                <div className="h-64 rounded-2xl mb-6 flex items-end justify-between px-6 pb-0 relative overflow-hidden bg-gradient-to-b from-transparent to-gray-50/50 border border-gray-100/50">
                                    {[35, 55, 45, 70, 60, 85, 95, 75, 90].map((h, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                height: `${h}%`,
                                                animation: `growBar 1s cubic-bezier(0.4, 0, 0.2, 1) ${0.5 + i * 0.1}s forwards`,
                                                transform: 'scaleY(0)',
                                                transformOrigin: 'bottom'
                                            }}
                                            className={`w-8 rounded-t-lg ${i >= 6 ? 'bg-gradient-to-t from-primary-600 to-secondary-400 shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'bg-gray-200/80'}`}
                                        />
                                    ))}
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: 'Accuracy', value: '98.7%', color: 'text-gray-900' },
                                        { label: 'Savings', value: '$2.4M', color: 'text-success-600' },
                                        { label: 'Stockouts', value: '-82%', color: 'text-secondary-600' }
                                    ].map((stat, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/60 border border-white/60 shadow-sm backdrop-blur-sm text-center transform transition-all hover:-translate-y-1">
                                            <div className={`text-2xl font-bold font-mono ${stat.color} mb-1`}>{stat.value}</div>
                                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrolldown indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    onClick={() => document.getElementById('trusted').scrollIntoView({ behavior: 'smooth' })}
                >
                    <ChevronDown className="w-6 h-6 text-gray-400/80" />
                </motion.div>
            </section>

            {/* Trusted Logos */}
            <section id="trusted" className="py-16 border-y border-gray-100 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-10">Trusted by industry leaders</p>
                    <div className="flex items-center justify-center gap-16 flex-wrap grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        {trustedLogos.map((logo, index) => (
                            <div key={index} className="flex items-center gap-3 text-gray-500 hover:text-gray-900">
                                <logo.icon className="w-8 h-8" />
                                <span className="font-bold text-xl">{logo.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section with ScrollTrigger */}
            <section id="stats" ref={statsRef} className="py-32 bg-white relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-12">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item text-center opacity-0 translate-y-8">
                                <div className="text-6xl sm:text-7xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-500 mb-4 tracking-tight">
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                                </div>
                                <div className="text-lg font-medium text-gray-500 uppercase tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" ref={featuresRef} className="py-32 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-20">
                        <span className="text-secondary-600 font-bold tracking-wider uppercase text-sm mb-4 block">Capabilities</span>
                        <h2 className="text-4xl md:text-5xl font-bold font-display text-gray-900 mb-6">
                            Constructed for <span className="gradient-text">scale</span>
                        </h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            Comprehensive tools designed for modern supply chain teams
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card-item group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-100 transition-all duration-300">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="cta" className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 rounded-[3rem] mx-4 md:mx-10 z-0">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/30 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-600/30 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center px-4 py-20">
                    <h2 className="text-4xl md:text-6xl font-bold font-display text-white mb-8 leading-tight">
                        Ready to future-proof your inventory?
                    </h2>
                    <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-light">
                        Join the fastest growing companies using AdaptIQ to master their demand planning.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <MagneticButton>
                            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-colors min-w-[200px]">
                                Start Free Trial
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </MagneticButton>
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                        <span className="font-bold text-gray-900 tracking-tight">AdaptIQ</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                        © 2026 AdaptIQ Inc. All rights reserved.
                    </div>
                    <div className="flex gap-8">
                        {['Twitter', 'LinkedIn', 'GitHub'].map(social => (
                            <a key={social} href="#" className="text-gray-400 hover:text-gray-900 transition-colors text-sm font-medium">{social}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
