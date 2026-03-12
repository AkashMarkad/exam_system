import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../services/api';
import Navbar from '../components/Navbar';
import './Home.css';

function Home() {
    const navigate = useNavigate();
    const user = getUser();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    // Base features available to all users
    const features = [
        {
            icon: '📝',
            title: 'Take Exam',
            description: 'Browse available exams and test your knowledge with timed assessments.',
            tag: 'Available',
        },
        {
            icon: '📊',
            title: 'View Results',
            description: 'Check your scores, review answers, and track your performance over time.',
            tag: 'Available',
        },
        {
            icon: '📚',
            title: 'Study Materials',
            description: 'Access study guides and resources to prepare for upcoming exams.',
            tag: 'Coming Soon',
            tagClass: 'coming-soon',
        },
        {
            icon: '🏆',
            title: 'Leaderboard',
            description: 'See how you rank among other students and compete for the top position.',
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
                            <h3>0</h3>
                            <p>Exams Taken</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blue">✅</div>
                        <div className="stat-info">
                            <h3>0</h3>
                            <p>Passed</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon teal">⭐</div>
                        <div className="stat-info">
                            <h3>—</h3>
                            <p>Avg. Score</p>
                        </div>
                    </div>
                </div>

                <h2 className="features-heading">Quick Actions</h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div className="feature-card" key={index}>
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