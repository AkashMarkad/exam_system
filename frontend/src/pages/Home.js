import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, getMyResults } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Home.css';

function Home() {
    const navigate = useNavigate();
    const user = getUser();
    const userEmail = user?.email;

    const [stats, setStats] = useState({ examsTaken: 0, passed: 0, avgScore: null });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (!userEmail) {
            navigate('/login');
        }
    }, [userEmail, navigate]);

    useEffect(() => {
        if (!userEmail) return;
        getMyResults()
            .then(results => {
                const taken = results.length;
                const passed = results.filter(r =>
                    r.totalMarks > 0 && (r.score / r.totalMarks) >= 0.5
                ).length;
                const avg = taken > 0
                    ? (results.reduce((sum, r) =>
                        sum + (r.totalMarks > 0 ? (r.score / r.totalMarks) * 100 : 0), 0) / taken
                    ).toFixed(1)
                    : null;
                setStats({ examsTaken: taken, passed, avgScore: avg });
            })
            .catch(() => { /* silently ignore — stats are non-critical */ })
            .finally(() => setStatsLoading(false));
    }, [userEmail]);

    if (!user) return null;

    // Base features available to all users
    const features = [
        {
            icon: '📝',
            title: 'Take Exam',
            description: 'Browse available exams and test your knowledge with timed assessments.',
            tag: 'Available',
            link: '/exams'
        },
        {
            icon: '📊',
            title: 'View Results',
            description: 'Check your scores, review answers, and track your performance over time.',
            tag: 'Available',
            link: '/results'
        },
        {
            icon: '🏆',
            title: 'Leaderboard',
            description: 'See how you rank among other students and compete for the top position.',
            tag: 'New',
            tagClass: 'tag-new',
            link: '/leaderboard'
        },
        {
            icon: '📚',
            title: 'Study Materials',
            description: 'Access study guides and resources to prepare for upcoming exams.',
            tag: 'Coming Soon',
            tagClass: 'coming-soon',
        }

    ];

    // Admin-only features
    if (user.role === 'ADMIN') {
        features.push(
            {
                icon: '⚙️',
                title: 'Manage Exams',
                description: 'Create, edit, and manage exam questions and settings.',
                tag: 'Admin',
                tagClass: '',
                link: '/admin/manage-exams'
            },
            {
                icon: '👥',
                title: 'User Management',
                description: 'Manage user accounts, roles, and permissions.',
                tag: 'Admin',
                tagClass: '',
            }
        );
    }

    const avgDisplay = statsLoading ? '...' : (stats.avgScore !== null ? `${stats.avgScore}%` : '—');

    return (
        <div className="home-page">
            <Navbar />
            <div className="home-content">
                <div className="welcome-section">
                    <h1>
                        Welcome back, <span className="gradient-text">{user.name}</span>
                    </h1>
                    <p>Here's your exam dashboard overview</p>
                    <span className="role-badge">{user.role}</span>
                </div>

                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon purple">📋</div>
                        <div className="stat-info">
                            <h3>{statsLoading ? '...' : stats.examsTaken}</h3>
                            <p>Exams Taken</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blue">✅</div>
                        <div className="stat-info">
                            <h3>{statsLoading ? '...' : stats.passed}</h3>
                            <p>Passed</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon teal">⭐</div>
                        <div className="stat-info">
                            <h3>{avgDisplay}</h3>
                            <p>Avg. Score</p>
                        </div>
                    </div>
                </div>

                <h2 className="features-heading">Quick Actions</h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div
                            className="feature-card"
                            key={index}
                            onClick={() => feature.link && navigate(feature.link)}
                            style={{ cursor: feature.link ? 'pointer' : 'default' }}
                        >
                            <div className="feature-card-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                            <span className={`feature-tag ${feature.tagClass || ''}`}>
                                {feature.tag}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;