import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../services/api';
import usePageTitle from '../hooks/usePageTitle';
import logo from '../assets/images/logo.png';
import '../styles/Landing.css';

function Landing() {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    usePageTitle(null); // → ExamSystem — Smart Assessment Platform

    useEffect(() => {
        const user = getUser();
        if (user) {
            navigate('/home');
            return;
        }
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme, navigate]);

    const features = [
        { icon: '📝', title: 'Smart Assessments', description: 'Create and take timed exams with auto-submission when the timer hits zero.' },
        { icon: '🔒', title: 'Secure Environment', description: 'Full-screen enforcement and tab-switch monitoring keep every exam honest.' },
        { icon: '📊', title: 'Instant Results', description: 'Get detailed score breakdowns and performance analytics immediately after submission.' },
        { icon: '🏆', title: 'Live Leaderboard', description: 'Compete with peers and see real-time rankings across all exams.' },
        { icon: '⚙️', title: 'Admin Controls', description: 'Admins can manage exams, questions, and user accounts from a unified dashboard.' },
        { icon: '🌙', title: 'Dark & Light Mode', description: 'Switch themes effortlessly for a comfortable experience any time of day.' },
    ];

    const stats = [
        { value: '100%', label: 'Secure', sub: 'Full-screen monitored' },
        { value: 'Live', label: 'Rankings', sub: 'Real-time leaderboard' },
        { value: 'Multi', label: 'Question Types', sub: 'Single & Multi-choice' },
    ];

    return (
        <div className="landing-page">
            {/* NAVBAR */}
            <header className="landing-nav">
                <div className="landing-nav-brand">
                    <img src={logo} alt="Logo" className="landing-nav-logo" />
                    <div className="landing-nav-title">
                        <span className="landing-nav-name">ExamSystem</span>
                        <span className="landing-nav-tag">Assessment Platform</span>
                    </div>
                </div>
                <div className="landing-nav-actions">
                    <button
                        className="landing-theme-btn"
                        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                        title="Toggle theme"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button className="btn-outline-landing" onClick={() => navigate('/login')}>
                        Sign In
                    </button>
                    <button className="btn-primary-landing" onClick={() => navigate('/register')}>
                        Get Started →
                    </button>
                </div>
            </header>

            {/* HERO */}
            <section className="landing-hero">
                <div className="hero-glow hero-glow-1" />
                <div className="hero-glow hero-glow-2" />
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="hero-badge-dot" />
                        Exam System v2.0 — Now Live
                    </div>
                    <h1 className="hero-title">
                        The Smarter Way<br />
                        to <span className="gradient-text">Assess & Learn</span>
                    </h1>
                    <p className="hero-subtitle">
                        A secure, real-time exam platform with instant results,
                        live leaderboards, and powerful admin tools — built for modern learners.
                    </p>
                    <div className="hero-cta">
                        <button className="btn-primary-landing btn-lg-landing" onClick={() => navigate('/register')}>
                            Create Free Account
                            <span className="btn-arrow">→</span>
                        </button>
                        <button className="btn-outline-landing btn-lg-landing" onClick={() => navigate('/login')}>
                            Sign In
                        </button>
                    </div>

                    {/* Stats row */}
                    <div className="hero-stats">
                        {stats.map((s, i) => (
                            <div className="hero-stat" key={i}>
                                <span className="hero-stat-value">{s.value}</span>
                                <span className="hero-stat-label">{s.label}</span>
                                <span className="hero-stat-sub">{s.sub}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="landing-features">
                <div className="section-header">
                    <h2>Everything You Need</h2>
                    <p>Powerful features packed into a clean, intuitive interface</p>
                </div>
                <div className="features-grid-landing">
                    {features.map((f, i) => (
                        <div className="feature-card-landing" key={i}>
                            <div className="feature-icon-landing">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA BANNER */}
            <section className="landing-cta-banner">
                <div className="cta-banner-glow" />
                <h2>Ready to take your first exam?</h2>
                <p>Join in seconds — no credit card required.</p>
                <div className="hero-cta">
                    <button className="btn-primary-landing btn-lg-landing" onClick={() => navigate('/register')}>
                        Register Now →
                    </button>
                    <button className="btn-outline-landing btn-lg-landing" onClick={() => navigate('/login')}>
                        Already have an account? Sign In
                    </button>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer">
                <span>© 2026 ExamSystem. Built for learners.</span>
            </footer>
        </div>
    );
}

export default Landing;
