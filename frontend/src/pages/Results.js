import React, { useState, useEffect } from 'react';
import { getMyResults, getExams } from '../services/api';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import '../styles/Results.css';

function Results() {
    usePageTitle('My Results');
    const [results, setResults] = useState([]);
    const [allExams, setAllExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const [attemptsData, examsData] = await Promise.all([
                getMyResults(),
                getExams()
            ]);
            setResults(attemptsData);
            setAllExams(examsData);
            setLoading(false);
        } catch (err) {
            setError(err.message || 'Failed to load results');
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getPercentage = (score, total) => {
        if (!total) return 0;
        return ((score / total) * 100).toFixed(1);
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return { label: 'O', color: '#10b981' };
        if (percentage >= 80) return { label: 'A+', color: '#10b981' };
        if (percentage >= 70) return { label: 'A', color: '#3b82f6' };
        if (percentage >= 60) return { label: 'B', color: '#3b82f6' };
        if (percentage >= 50) return { label: 'C', color: '#f59e0b' };
        if (percentage >= 40) return { label: 'D', color: '#f59e0b' };
        return { label: 'F', color: '#ef4444' };
    };

    const filteredExams = allExams.filter(exam => {
        const hasAttempt = results.some(r => r.examId === exam.id);
        const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase());
        return hasAttempt && matchesSearch;
    });

    return (
        <div className="results-page">
            <Navbar />
            <div className="results-container">
                <header className="results-header">
                    <div className="header-content">
                        <h1>📊 My Performance</h1>
                        <p>Review your scores and performance for all completed exams.</p>
                    </div>
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search exams..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {loading ? (
                    <div className="results-loading">
                        <div className="spinner"></div>
                        <p>Loading your results...</p>
                    </div>
                ) : error ? (
                    <div className="results-error">
                        <div className="error-icon">❌</div>
                        <p>{error}</p>
                        <button className="btn-retry" onClick={fetchResults}>Retry</button>
                    </div>
                ) : (
                    <div className="results-table-wrapper">
                        <table className="results-table">
                            <thead>
                                <tr>
                                    <th>Exam Name</th>
                                    <th>Score</th>
                                    <th>Percentage</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExams.length > 0 ? (
                                    filteredExams.map((exam) => {
                                        const attempt = results.find(r => r.examId === exam.id);
                                        const percent = attempt ? getPercentage(attempt.score, attempt.totalMarks) : 0;
                                        const grade = attempt ? getGrade(percent) : null;
                                        
                                        return (
                                            <tr key={exam.id} className={!attempt ? 'row-unattempted' : ''}>
                                                <td>
                                                    <div className="exam-info">
                                                        <span className="exam-name">{exam.name}</span>
                                                        <span className="exam-duration">{exam.durationMinutes} mins</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {attempt ? (
                                                        <span className="score-badge">
                                                            {attempt.score} / {attempt.totalMarks}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="table-progress">
                                                        <div className="progress-bg">
                                                            <div 
                                                                className="progress-fill" 
                                                                style={{ 
                                                                    width: `${percent}%`,
                                                                    background: attempt ? grade.color : '#94a3b8' 
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span>{attempt ? `${percent}%` : '0%'}</span>
                                                    </div>
                                                </td>
                                                <td>{formatDate(attempt.completedAt) || 'N/A'}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="no-data">No exams match your search.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Results;
