import React, { useState, useEffect } from 'react';
import { getLeaderboard, getLeaderboardByExam, getExams, getUser } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Leaderboard.css';

function Leaderboard() {
    const [entries, setEntries] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const currentUser = getUser();

    useEffect(() => {
        fetchExams();
    }, []);

    useEffect(() => {
        fetchLeaderboard();
    }, [selectedExamId]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchExams = async () => {
        try {
            const data = await getExams();
            setExams(data);
        } catch (err) {
            // Ignore — exams are optional for filter
        }
    };

    const fetchLeaderboard = async () => {
        setLoading(true);
        setError('');
        try {
            let data;
            if (selectedExamId === 'all') {
                data = await getLeaderboard();
            } else {
                data = await getLeaderboardByExam(selectedExamId);
            }
            setEntries(data);
        } catch (err) {
            setError(err.message || 'Failed to load leaderboard.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString(undefined, {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    const getPercentageColor = (pct) => {
        if (pct >= 90) return '#10b981';
        if (pct >= 75) return '#3b82f6';
        if (pct >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const isCurrentUser = (email) => currentUser && currentUser.email === email;

    return (
        <div className="leaderboard-page">
            <Navbar />
            <div className="leaderboard-container">
                {/* Header */}
                <div className="leaderboard-header">
                    <div className="leaderboard-header-left">
                        <div className="leaderboard-title-icon">🏆</div>
                        <div>
                            <h1>Leaderboard</h1>
                            <p>Top performers across all exams</p>
                        </div>
                    </div>
                    <div className="leaderboard-filter">
                        <label htmlFor="exam-filter">Filter by Exam</label>
                        <select
                            id="exam-filter"
                            value={selectedExamId}
                            onChange={(e) => setSelectedExamId(e.target.value)}
                        >
                            <option value="all">All Exams</option>
                            {exams.map(exam => (
                                <option key={exam.id} value={exam.id}>{exam.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Top 3 Podium */}
                {!loading && !error && entries.length >= 3 && (
                    <div className="podium-section">
                        {/* 2nd Place */}
                        <div className="podium-card silver">
                            <div className="podium-avatar">
                                {entries[1].studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="podium-medal">🥈</div>
                            <div className="podium-name">{entries[1].studentName}</div>
                            <div className="podium-score">{entries[1].percentage}%</div>
                            <div className="podium-exam">{entries[1].examName}</div>
                            <div className="podium-bar bar-2"></div>
                        </div>
                        {/* 1st Place */}
                        <div className="podium-card gold">
                            <div className="crown-icon">👑</div>
                            <div className="podium-avatar large">
                                {entries[0].studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="podium-medal">🥇</div>
                            <div className="podium-name">{entries[0].studentName}</div>
                            <div className="podium-score">{entries[0].percentage}%</div>
                            <div className="podium-exam">{entries[0].examName}</div>
                            <div className="podium-bar bar-1"></div>
                        </div>
                        {/* 3rd Place */}
                        <div className="podium-card bronze">
                            <div className="podium-avatar">
                                {entries[2].studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="podium-medal">🥉</div>
                            <div className="podium-name">{entries[2].studentName}</div>
                            <div className="podium-score">{entries[2].percentage}%</div>
                            <div className="podium-exam">{entries[2].examName}</div>
                            <div className="podium-bar bar-3"></div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="leaderboard-table-wrapper">
                    {loading ? (
                        <div className="lb-loading">
                            <div className="spinner"></div>
                            <p>Loading leaderboard...</p>
                        </div>
                    ) : error ? (
                        <div className="lb-error">
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
                            <p>{error}</p>
                            <button className="btn btn-primary btn-md" style={{ marginTop: '1.2rem' }} onClick={fetchLeaderboard}>
                                Retry
                            </button>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="lb-empty">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                            <h3>No results yet</h3>
                            <p>Be the first to complete an exam and claim the top spot!</p>
                        </div>
                    ) : (
                        <table className="leaderboard-table">
                            <colgroup>
                                <col /> {/* Rank */}
                                <col /> {/* Student */}
                                <col /> {/* Exam */}
                                <col /> {/* Score */}
                                <col /> {/* Performance */}
                                <col /> {/* Date */}
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Student</th>
                                    <th>Exam</th>
                                    <th>Score</th>
                                    <th>Performance</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, idx) => (
                                    <tr
                                        key={idx}
                                        className={`lb-row ${isCurrentUser(entry.studentEmail) ? 'current-user-row' : ''}`}
                                    >
                                        <td className="rank-cell">
                                            <span className={`rank-display rank-${entry.rank <= 3 ? entry.rank : 'other'}`}>
                                                {getRankIcon(entry.rank)}
                                            </span>
                                        </td>
                                        <td className="student-cell">
                                            <div className="student-info">
                                                <div>
                                                    <div className="student-name">
                                                        {entry.studentName}
                                                        {isCurrentUser(entry.studentEmail) && (
                                                            <span className="you-badge">You</span>
                                                        )}
                                                    </div>
                                                    <div className="student-email">{entry.studentEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="exam-cell">
                                            <span className="exam-name-lb">{entry.examName}</span>
                                        </td>
                                        <td className="score-cell">
                                            <span className="score-display-lb">{entry.score} / {entry.totalMarks}</span>
                                        </td>
                                        <td className="perf-cell">
                                            <div className="perf-wrapper">
                                                <div className="perf-bar-bg">
                                                    <div
                                                        className="perf-bar-fill"
                                                        style={{
                                                            width: `${entry.percentage}%`,
                                                            background: getPercentageColor(entry.percentage)
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="perf-label" style={{ color: getPercentageColor(entry.percentage) }}>
                                                    {entry.percentage}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="date-cell">{formatDate(entry.completedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Leaderboard;
