import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExams, getMyResults } from '../services/api';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import '../styles/TakeExam.css';

function TakeExam() {
    const navigate = useNavigate();
    usePageTitle('Exams');
    const [exams, setExams] = useState([]);
    const [userAttempts, setUserAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const [examsData, attemptsData] = await Promise.all([
                getExams(),
                getMyResults()
            ]);
            setExams(examsData);
            setUserAttempts(attemptsData);
        } catch (err) {
            setError(err.message || 'Failed to load exams.');
        } finally {
            setLoading(false);
        }
    };

    const getExamStatus = (startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now < start) {
            return { label: 'Upcoming', className: 'status-upcoming', isLive: false };
        } else if (now >= start && now <= end) {
            return { label: 'Live', className: 'status-live', isLive: true };
        } else {
            return { label: 'Ended', className: 'status-ended', isLive: false };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString([], {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleTakeExam = (examId, isLive) => {
        if (!isLive) return;
        navigate(`/exam/${examId}/take`);
    };

    const filteredExams = exams.filter((exam) =>
        exam.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="take-exam-page">
            <Navbar />
            <div className="take-exam-container">
                <div className="take-exam-header">
                    <h2>Available Exams</h2>
                    <p>Select a live exam to start your assessment.</p>
                </div>

                <div className="take-exam-search-wrapper">
                    <span className="take-exam-search-icon">🔍</span>
                    <input
                        type="text"
                        className="take-exam-search-input"
                        placeholder="Search available exams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="take-exam-search-clear" onClick={() => setSearchQuery('')}>✕</button>
                    )}
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading exams...</div>
                ) : error ? (
                    <div className="error-msg">{error}</div>
                ) : filteredExams.length === 0 ? (
                    <div className="no-exams-card">
                        <span className="no-exams-icon">📚</span>
                        <h3>No Exams Found</h3>
                        <p>{exams.length === 0 ? 'There are currently no exams scheduled for you.' : 'No exams match your search.'}</p>
                    </div>
                ) : (
                    <div className="exams-grid">
                        {filteredExams.map((exam) => {
                            const status = getExamStatus(exam.startTime, exam.endTime);
                            return (
                                <div className={`exam-card ${status.isLive ? 'live-card' : ''}`} key={exam.id}>
                                    <div className="exam-card-header">
                                        <h3>{exam.name}</h3>
                                        <span className={`status-badge ${status.className}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <p className="exam-desc">
                                        {exam.description || 'Test your knowledge on this subject.'}
                                    </p>
                                    
                                    <div className="exam-meta-row">
                                        <div className="meta-pill">
                                            <span className="meta-icon">⏱️</span>
                                            <span className="meta-text">{exam.durationMinutes} mins</span>
                                        </div>
                                        <div className="meta-pill">
                                            <span className="meta-icon">🎯</span>
                                            <span className="meta-text">{exam.totalMarks} marks</span>
                                        </div>
                                    </div>
                                    
                                    <div className="exam-schedule">
                                        <div className="schedule-row">
                                            <span className="schedule-label">Starts:</span>
                                            <span className="schedule-val">{formatDate(exam.startTime)}</span>
                                        </div>
                                        <div className="schedule-row">
                                            <span className="schedule-label">Ends:</span>
                                            <span className="schedule-val">{formatDate(exam.endTime)}</span>
                                        </div>
                                    </div>

                                    {(() => {
                                        const hasAttempted = userAttempts.some(a => a.examId === exam.id);
                                        const isDisabled = !status.isLive || hasAttempted;
                                        let btnText = 'Start Exam';
                                        
                                        if (hasAttempted) {
                                            btnText = 'Already Attempted';
                                        } else if (status.label === 'Upcoming') {
                                            btnText = 'Not Yet Open';
                                        } else if (status.label === 'Ended') {
                                            btnText = 'Exam Ended';
                                        }

                                        return (
                                            <button 
                                                className={`take-btn ${isDisabled ? 'btn-disabled' : ''}`}
                                                onClick={() => handleTakeExam(exam.id, status.isLive)}
                                                disabled={isDisabled}
                                            >
                                                {btnText}
                                            </button>
                                        );
                                    })()}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TakeExam;
