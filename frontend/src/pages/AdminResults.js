import React, { useState, useEffect } from 'react';
import { getAllResults } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/AdminResults.css';

function AdminResults() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const data = await getAllResults();
            setResults(data);
            setLoading(false);
        } catch (err) {
            setError(err.message || 'Failed to load results');
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString([], {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredResults = results.filter(res => 
        res.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-results-page">
            <Navbar />
            <div className="admin-results-container">
                <header className="admin-results-header">
                    <div className="header-content">
                        <h1>🎓 Student Performances</h1>
                        <p>Detailed overview of all exam submissions across the system.</p>
                    </div>
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search by student or exam..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {loading ? (
                    <div className="admin-results-loading">
                        <div className="spinner"></div>
                        <p>Loading submission data...</p>
                    </div>
                ) : error ? (
                    <div className="admin-results-error">
                        <div className="error-icon">❌</div>
                        <p>{error}</p>
                        <button className="btn-retry" onClick={fetchResults}>Retry</button>
                    </div>
                ) : (
                    <div className="results-table-wrapper">
                        <table className="results-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Exam</th>
                                    <th>Score</th>
                                    <th>Percentage</th>
                                    <th>Completed At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.length > 0 ? (
                                    filteredResults.map((res) => {
                                        const percent = ((res.score / res.totalMarks) * 100).toFixed(1);
                                        return (
                                            <tr key={res.attemptId}>
                                                <td>
                                                    <div className="student-info">
                                                        <span className="student-name">{res.studentName}</span>
                                                        <span className="student-email">{res.studentEmail}</span>
                                                    </div>
                                                </td>
                                                <td>{res.examName}</td>
                                                <td>
                                                    <span className="score-badge">
                                                        {res.score} / {res.totalMarks}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="table-progress">
                                                        <div className="progress-bg">
                                                            <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                                                        </div>
                                                        <span>{percent}%</span>
                                                    </div>
                                                </td>
                                                <td>{formatDate(res.completedAt)}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="no-data">No results match your search.</td>
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

export default AdminResults;
