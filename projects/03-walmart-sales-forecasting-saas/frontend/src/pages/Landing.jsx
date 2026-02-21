import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Sliders, Shield, Zap, Users, ArrowRight, CheckCircle, Play, ChevronDown, Building2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AmbientBackground from '../components/ui/AmbientBackground';
import MagneticButton from '../components/ui/MagneticButton';
import DashboardPreview from '../components/landing/DashboardPreview';
import NavigationUnderline from '../components/landing/NavigationUnderline';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import AdaptIQLogo from '../components/ui/AdaptIQLogo';
import AnimatedText from '../components/auth/AnimatedText';

gsap.registerPlugin(ScrollTrigger);

// Custom Text Reveal Component (Alternative to SplitText)
const TextReveal = ({ children, className = '', delay = 0 }) => {
    // Safely handle non-string children to prevent runtime crashes
    if (typeof children !== 'string') {
        return <span className={`inline-block ${className}`}>{children}</span>;
    }

    const chars = children.split('');
    return (
        <span className={`inline-block ${className}`}>
            {chars.map((char, index) => (
                <span
                    key={index}
                    className="inline-block opacity-0 reveal-char"
                    style={{
                        transformOrigin: 'bottom center',
                        whiteSpace: char === ' ' ? 'pre' : 'normal'
                    }}
                >
                    {char}
                </span>
            ))}
        </span>
    );
};

// Animated counter component
const AnimatedCounter = ({ value, suffix = '', prefix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (typeof value !== 'number') return;

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

const Landing = () => {
    const [scrolled, setScrolled] = useState(false);
    // useSmoothScroll();

    const heroRef = useRef(null);
    const statsRef = useRef(null);
    const featuresRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        // GSAP Animations
        const ctx = gsap.context(() => {
            // Hero Loading Sequence
            const tl = gsap.timeline();

            // Headline Character Animation
            tl.to('.reveal-char', {
                y: 0,
                opacity: 1,
                rotateX: 0,
                stagger: 0.02,
                duration: 0.8,
                ease: 'back.out(1.7)',
                startAt: { y: 100, rotateX: -90, opacity: 0 }
            });

            // Subtitle & CTAs Fade In
            tl.from('.hero-fade', {
                y: 20,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out'
            }, '-=0.4');

            // Dashboard Preview 3D Entrance
            tl.from('#dashboard-preview-container', {
                y: 50,
                opacity: 0,
                rotateX: 10,
                duration: 1,
                ease: 'power3.out'
            }, '-=0.6');

            // Stats Counter Animation
            ScrollTrigger.batch('.stat-item', {
                onEnter: batch => gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    stagger: 0.15,
                    overwrite: true,
                    duration: 0.8,
                    ease: 'power3.out'
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

            // Parallax Effects
            gsap.to('.hero-content-parallax', {
                y: -100,
                opacity: 0,
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
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
            iconBg: 'bg-brand-50',
            iconColor: 'text-brand-600',
        },
        {
            icon: BarChart3,
            title: 'Interactive Dashboards',
            description: 'Visualize trends and forecasts with beautiful, real-time charts.',
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
        },
        {
            icon: Sliders,
            title: 'Scenario Planning',
            description: 'Run what-if analyses to optimize inventory and reduce costs.',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
        },
        {
            icon: Shield,
            title: 'Enterprise Security',
            description: 'Bank-level encryption, SOC 2 compliance, and GDPR-ready.',
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
        {
            icon: Zap,
            title: 'Real-time Updates',
            description: 'Get instant forecast updates with 24/7 automated processing.',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            icon: Users,
            title: 'Team Collaboration',
            description: 'Share insights and align your team on demand strategy.',
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
        },
    ];

    const trustedLogos = [
        { name: 'Walmart', icon: Building2 },
        { name: 'Amazon', icon: Building2 },
        { name: 'Target', icon: Building2 },
        { name: 'Costco', icon: Building2 },
    ];

    return (
        <div className="min-h-screen bg-bg-primary font-sans selection:bg-brand-200">
            {/* Ambient Background */}
            <AmbientBackground />

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
                                <AdaptIQLogo className="w-10 h-10 drop-shadow-sm" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-text-primary font-display hidden sm:block drop-shadow-sm">
                                AdaptIQ
                            </span>
                        </div>
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
                                <Button variant="ghost" className="hidden sm:inline-flex text-text-secondary hover:text-brand-600">
                                    <Link to="/login">Sign In</Link>
                                </Button>
                            </MagneticButton>

                            <MagneticButton>
                                <Link to="/register">
                                    <Button variant="primary" className="rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5" icon={ArrowRight} iconPosition="right">
                                        Get Started
                                    </Button>
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
                        <div className="text-center lg:text-left hero-content-parallax">
                            <div className="hero-fade inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm mb-8">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
                                </span>
                                <span className="text-sm font-medium text-text-secondary tracking-wide">
                                    AdaptIQ v3.0 Early Access
                                </span>
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-bold text-text-primary leading-[1.1] mb-8 tracking-tight font-display">
                                <div className="mb-2">Access Your Data's</div>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-500 to-accent-600 relative inline-block pb-2 animate-gradient-x">
                                    <AnimatedText />
                                </span>
                            </h1>

                            <p className="hero-fade text-lg sm:text-xl text-text-secondary mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                Enterprise-grade demand forecasting that helps businesses reduce stockouts by 80% and save millions in operational costs.
                            </p>

                            <div className="hero-fade flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <MagneticButton>
                                    <Link to="/register">
                                        <Button variant="primary" size="lg" className="rounded-full shadow-lg shadow-brand-500/25 min-w-[180px]" icon={ArrowRight} iconPosition="right">
                                            Start Free Trial
                                        </Button>
                                    </Link>
                                </MagneticButton>

                                <MagneticButton>
                                    <Button variant="secondary" size="lg" className="rounded-full min-w-[180px]" icon={Play}>
                                        View Demo
                                    </Button>
                                </MagneticButton>
                            </div>

                            <div className="hero-fade flex items-center gap-8 mt-12 justify-center lg:justify-start text-sm font-medium text-text-tertiary">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-accent-500" />
                                    <span>SOC 2 Type II Ready</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-accent-500" />
                                    <span>14-day free trial</span>
                                </div>
                            </div>
                        </div>

                        {/* Glassmorphism Dashboard Preview */}
                        <div id="dashboard-preview-container" className="hidden lg:block">
                            <DashboardPreview />
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
                    <ChevronDown className="w-6 h-6 text-text-tertiary/80" />
                </motion.div>
            </section>

            {/* Trusted Logos */}
            <section id="trusted" className="py-16 border-y border-border-default bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm font-semibold text-text-tertiary uppercase tracking-widest mb-10">Trusted by industry leaders</p>
                    <div className="flex items-center justify-center gap-16 flex-wrap grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        {trustedLogos.map((logo, index) => (
                            <div key={index} className="flex items-center gap-3 text-text-tertiary hover:text-text-primary">
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
                                <div className="text-6xl sm:text-7xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-br from-text-primary to-text-tertiary mb-4 tracking-tight">
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                                </div>
                                <div className="text-lg font-medium text-text-secondary uppercase tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" ref={featuresRef} className="py-32 bg-bg-secondary/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-20">
                        <span className="text-brand-600 font-bold tracking-wider uppercase text-sm mb-4 block">Capabilities</span>
                        <h2 className="text-4xl md:text-5xl font-bold font-display text-text-primary mb-6">
                            Constructed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">scale</span>
                        </h2>
                        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                            Comprehensive tools designed for modern supply chain teams
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="feature-card-item h-full hover:shadow-xl hover:border-brand-200" variant="feature">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-3">{feature.title}</h3>
                                <p className="text-text-secondary leading-relaxed">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="cta" className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-text-primary rounded-[3rem] mx-4 md:mx-10 z-0">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/30 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-600/30 rounded-full blur-[120px]"></div>
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
                            <Link to="/register">
                                <Button variant="secondary" size="lg" className="rounded-full font-bold min-w-[200px]" icon={ArrowRight} iconPosition="right">
                                    Start Free Trial
                                </Button>
                            </Link>
                        </MagneticButton>
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-border-default bg-white">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-text-primary rounded-lg flex items-center justify-center text-white font-bold">A</div>
                        <span className="font-bold text-text-primary tracking-tight">AdaptIQ</span>
                    </div>
                    <div className="text-text-tertiary text-sm">
                        © 2026 AdaptIQ Inc. All rights reserved.
                    </div>
                    <div className="flex gap-8">
                        {['Twitter', 'LinkedIn', 'GitHub'].map(social => (
                            <a key={social} href="#" className="text-text-tertiary hover:text-text-primary transition-colors text-sm font-medium">{social}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
