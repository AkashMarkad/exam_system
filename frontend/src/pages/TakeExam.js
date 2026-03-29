import React, { useState, useEffect } from 'react';
import { getExams } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/TakeExam.css';

function TakeExam() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const data = await getExams();
            setExams(data);
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
        // Navigation to actual exam execution page would go here.
        alert(`Starting Exam ID: ${examId}`);
    };

    return (
        <div className="take-exam-page">
            <Navbar />
            <div className="take-exam-container">
                <div className="take-exam-header">
                    <h2>Available Exams</h2>
                    <p>Select a live exam to start your assessment.</p>
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading exams...</div>
                ) : error ? (
                    <div className="error-msg">{error}</div>
                ) : exams.length === 0 ? (
                    <div className="no-exams-card">
                        <span className="no-exams-icon">📚</span>
                        <h3>No Exams Found</h3>
                        <p>There are currently no exams scheduled for you.</p>
                    </div>
                ) : (
                    <div className="exams-grid">
                        {exams.map((exam) => {
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
                                    
                                    <div className="exam-meta">
                                        <div className="meta-item">
                                            <span className="meta-icon">⏱️</span>
                                            <span className="meta-text">{exam.durationMinutes} mins</span>
                                        </div>
                                        <div className="meta-item">
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

                                    <button 
                                        className={`take-btn ${!status.isLive ? 'btn-disabled' : ''}`}
                                        onClick={() => handleTakeExam(exam.id, status.isLive)}
                                        disabled={!status.isLive}
                                    >
                                        {status.isLive ? 'Start Exam' : (status.label === 'Upcoming' ? 'Not Yet Open' : 'Not Available')}
                                    </button>
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
