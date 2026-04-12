import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startExam, submitExam } from '../services/api';
import '../styles/ExamExecution.css';

function ExamExecution() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [attemptId, setAttemptId] = useState(null);
    const [exam, setExam] = useState(null);
    const [stage, setStage] = useState('loading'); // loading, instructions, exam, result
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [instructionTimeLeft, setInstructionTimeLeft] = useState(30);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    // Status flags
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    // Tab-switch violation tracking
    const [tabWarnings, setTabWarnings] = useState(0);
    const [showTabWarning, setShowTabWarning] = useState(false);
    const [tabWarningMsg, setTabWarningMsg] = useState('');

    const answersRef = useRef(answers);
    const submittingRef = useRef(submitting);
    const stageRef = useRef(stage);
    const tabWarningsRef = useRef(0);
    const attemptIdRef = useRef(null);

    useEffect(() => { answersRef.current = answers; }, [answers]);
    useEffect(() => { submittingRef.current = submitting; }, [submitting]);
    useEffect(() => { stageRef.current = stage; }, [stage]);
    useEffect(() => { attemptIdRef.current = attemptId; }, [attemptId]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        initExam();
        return () => {
            // Cleanup on unmount
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Instruction countdown (blocks start for 30s)
    useEffect(() => {
        if (stage === 'instructions' && instructionTimeLeft > 0) {
            const timer = setInterval(() => {
                setInstructionTimeLeft(prev => {
                    if (prev <= 1) { clearInterval(timer); return 0; }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [stage, instructionTimeLeft]);

    // Exam countdown timer — starts when stage becomes 'exam'
    useEffect(() => {
        if (stage !== 'exam') return;
        if (timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerId);
    }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-submit when timer hits 0
    useEffect(() => {
        if (timeLeft === 0 && stage === 'exam' && !submittingRef.current) {
            autoSubmit();
        }
    }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

    // ========== TAB-SWITCH DETECTION ==========
    const handleTabViolation = useCallback(() => {
        // Only enforce during active exam, not instructions or result
        if (stageRef.current !== 'exam') return;
        if (submittingRef.current) return;

        const newCount = tabWarningsRef.current + 1;
        tabWarningsRef.current = newCount;
        setTabWarnings(newCount);

        if (newCount >= 3) {
            setTabWarningMsg('🚨 3rd violation detected — auto-submitting your exam now!');
            setShowTabWarning(true);
            // Auto-submit after brief display
            setTimeout(() => {
                autoSubmit();
            }, 1500);
        } else {
            setTabWarningMsg(
                `⚠️ Tab switch detected! Warning ${newCount} of 3. After 3 warnings, your exam will be auto-submitted.`
            );
            setShowTabWarning(true);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleTabViolation();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [handleTabViolation]);
    // ==========================================

    const initExam = async () => {
        try {
            const data = await startExam(id);
            setAttemptId(data.attemptId);
            setExam(data.exam);
            setTimeLeft(data.remainingTimeSeconds);
            setLoading(false);
            setStage('instructions');
        } catch (err) {
            setError(err.message || 'Failed to open exam.');
            setLoading(false);
        }
    };

    const startActualExam = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.error('Fullscreen failed:', err);
        }
        setStage('exam');
    };

    const autoSubmit = async () => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        try {
            const res = await submitExam(attemptIdRef.current, answersRef.current);
            setResult(res);
            setStage('result');
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        } catch (err) {
            setError('Failed to auto-submit exam.');
        } finally {
            setSubmitting(false);
            submittingRef.current = false;
        }
    };

    const handleManualSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        setShowSubmitModal(false);
        try {
            const res = await submitExam(attemptId, answers);
            setResult(res);
            setStage('result');
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        } catch (err) {
            alert(err.message || 'Failed to submit exam.');
            setSubmitting(false);
        }
    };

    const handleOptionSelect = (qId, optionId) => {
        setAnswers(prev => ({ ...prev, [qId]: optionId }));
    };

    const handleClearSelection = (qId) => {
        setAnswers(prev => {
            const updated = { ...prev };
            delete updated[qId];
            return updated;
        });
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getWarningClass = () => {
        if (tabWarnings >= 3) return 'tab-warning-banner critical';
        if (tabWarnings === 2) return 'tab-warning-banner high';
        return 'tab-warning-banner';
    };

    // ===== LOADING =====
    if (loading) {
        return (
            <div className="exam-exec-container flex-center">
                <div className="spinner"></div>
                <p>Loading Exam...</p>
            </div>
        );
    }

    // ===== ERROR =====
    if (error && !exam) {
        return (
            <div className="exam-exec-container flex-center">
                <div className="error-card">
                    <div className="error-icon">⚠️</div>
                    <h2>Unable to Load Exam</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary btn-md" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/exams')}>
                        Return to Exams
                    </button>
                </div>
            </div>
        );
    }

    // ===== RESULT =====
    if (result || stage === 'result') {
        return (
            <div className="exam-exec-container flex-center">
                <div className="result-card masked-result">
                    <div className="success-icon">✔️</div>
                    <h2>Exam Submitted Successfully</h2>
                    <p className="result-msg">
                        Your assessment has been recorded.
                        <strong> Please open the Result Section</strong> to view your detailed performance and marks.
                    </p>
                    <button className="btn-exit-dashboard btn btn-primary btn-lg" onClick={() => navigate('/exams')}>
                        Exit to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // ===== INSTRUCTIONS =====
    if (stage === 'instructions') {
        return (
            <div className="exam-exec-page">
                <header className="exam-topbar">
                    <div className="exam-topbar-left">
                        <div className="navbar-brand">
                            <span className="brand-icon">📝</span>
                            <div className="exam-title-meta">
                                <h2>{exam.name}</h2>
                                <span className="exam-tag-small">Instructions</span>
                            </div>
                        </div>
                    </div>
                    <div className="exam-topbar-right">
                        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                    </div>
                </header>

                <div className="exam-exec-container flex-center" style={{ height: 'calc(100vh - 80px)' }}>
                    <div className="instructions-card premium-glass">
                        <div className="instructions-header">
                            <div className="instructions-icon-wrapper">
                                <span className="instructions-icon">📋</span>
                            </div>
                            <h2>Exam Preparation</h2>
                            <p>Please read the guidelines carefully before starting</p>
                        </div>
                        
                        <div className="exam-info-grid premium-grid">
                            <div className="info-pill">
                                <span className="pill-icon time-icon">⏱️</span>
                                <div className="pill-content">
                                    <span className="pill-label">Duration</span>
                                    <span className="pill-value">{exam.durationMinutes} min</span>
                                </div>
                            </div>
                            <div className="info-pill">
                                <span className="pill-icon target-icon">🎯</span>
                                <div className="pill-content">
                                    <span className="pill-label">Total Marks</span>
                                    <span className="pill-value">{exam.totalMarks}</span>
                                </div>
                            </div>
                            <div className="info-pill">
                                <span className="pill-icon list-icon">📝</span>
                                <div className="pill-content">
                                    <span className="pill-label">Questions</span>
                                    <span className="pill-value">{exam.questions.length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="instructions-rules">
                            <h3 className="rules-heading">Security & Guidelines</h3>
                            <ul className="premium-rules-list">
                                <li>
                                    <span className="rule-icon info-icon">🖥️</span>
                                    <span className="rule-text">The exam will automatically activate <strong>full-screen mode</strong> upon starting.</span>
                                </li>
                                <li>
                                    <span className="rule-icon warning-icon">⚠️</span>
                                    <span className="rule-text"><strong>Tab switching is strictly monitored.</strong> Navigating away from the window may result in penalties.</span>
                                </li>
                                <li>
                                    <span className="rule-icon danger-icon">🚨</span>
                                    <span className="rule-text">After <strong>3 tab-switch violations</strong>, your exam will be automatically submitted without warning.</span>
                                </li>
                                <li>
                                    <span className="rule-icon timer-icon">⏳</span>
                                    <span className="rule-text">The assessment will auto-submit exactly when the timer reaches zero.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="premium-start-wrapper">
                            <button
                                className={`premium-start-btn ${instructionTimeLeft > 0 ? 'disabled' : ''}`}
                                disabled={instructionTimeLeft > 0}
                                onClick={startActualExam}
                            >
                                <span className="btn-content">
                                    {instructionTimeLeft > 0 ? (
                                        <>
                                            <span className="spinner-small"></span>
                                            <span>Reading Time: {instructionTimeLeft}s</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Start Assessment</span> 
                                            <span className="arrow">→</span>
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!exam || !exam.questions || exam.questions.length === 0) {
        return (
            <div className="exam-exec-container flex-center">
                <p>No questions found for this exam.</p>
                <button className="btn btn-primary btn-md" onClick={() => navigate('/exams')}>Back to Dashboard</button>
            </div>
        );
    }

    const currentQuestion = exam.questions[currentQuestionIndex];
    const isAnswered = (idx) => answers[exam.questions[idx].id] !== undefined;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="exam-exec-page">
            {/* Tab Warning Banner */}
            {showTabWarning && (
                <div className={getWarningClass()}>
                    <div className="tab-warning-content">
                        <span className="tab-warning-text">{tabWarningMsg}</span>
                        <div className="tab-warning-dots">
                            {[1, 2, 3].map(i => (
                                <span key={i} className={`warning-dot ${i <= tabWarnings ? 'filled' : ''}`}></span>
                            ))}
                        </div>
                    </div>
                    {tabWarnings < 3 && (
                        <button className="tab-warning-close" onClick={() => setShowTabWarning(false)}>✕</button>
                    )}
                </div>
            )}

            <header className="exam-topbar">
                <div className="exam-topbar-left">
                    <div className="navbar-brand">
                        <span className="brand-icon">📝</span>
                        <div className="exam-title-meta">
                            <h2>{exam.name}</h2>
                            <span className="exam-tag-small">{exam.totalMarks} Marks</span>
                        </div>
                    </div>
                </div>

                <div className="exam-topbar-center">
                    <div className={`timer-display ${timeLeft < 300 ? 'timer-danger' : ''}`}>
                        <span className="timer-text">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="exam-topbar-right">
                    {/* Violation counter in topbar */}
                    {tabWarnings > 0 && (
                        <div className={`violation-badge ${tabWarnings >= 2 ? 'critical' : ''}`}>
                            ⚠️ {tabWarnings}/3 Violations
                        </div>
                    )}
                    <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button className="btn btn-danger btn-sm btn-submit-top" onClick={() => setShowSubmitModal(true)} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                </div>
            </header>

            {showSubmitModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <div className="modal-icon">📤</div>
                        <h3>Submit Exam?</h3>
                        <p>
                            You have answered <strong>{answeredCount}</strong> of <strong>{exam.questions.length}</strong> questions.
                            This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary btn-md btn-modal-cancel" onClick={() => setShowSubmitModal(false)}>Continue Exam</button>
                            <button className="btn btn-success btn-md btn-modal-submit" onClick={handleManualSubmit}>Yes, Submit Now</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="exam-layout">
                <main className="exam-main-panel">
                    <div className="question-header">
                        <h3>Question {currentQuestionIndex + 1} of {exam.questions.length}</h3>
                        <span className="question-marks">[{currentQuestion.marks} Mark{currentQuestion.marks !== 1 ? 's' : ''}]</span>
                    </div>

                    <div className="question-content">
                        <p>{currentQuestion.questionText}</p>
                    </div>

                    <div className="options-container">
                        {currentQuestion.options.map(opt => (
                            <label
                                key={opt.id}
                                className={`option-item ${answers[currentQuestion.id] === opt.id ? 'selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${currentQuestion.id}`}
                                    value={opt.id}
                                    checked={answers[currentQuestion.id] === opt.id}
                                    onChange={() => handleOptionSelect(currentQuestion.id, opt.id)}
                                />
                                <span className="option-text">{opt.optionText}</span>
                            </label>
                        ))}
                    </div>

                    <div className="question-actions">
                        <button
                            className="btn btn-ghost btn-sm clear-btn"
                            onClick={() => handleClearSelection(currentQuestion.id)}
                            disabled={!isAnswered(currentQuestionIndex)}
                        >
                            Clear Selection
                        </button>

                        <div className="nav-actions">
                            <button
                                className="btn btn-secondary btn-md prev-btn"
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                disabled={currentQuestionIndex === 0}
                            >
                                ← Previous
                            </button>
                            {currentQuestionIndex < exam.questions.length - 1 ? (
                                <button
                                    className="btn btn-secondary btn-md next-btn"
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                >
                                    Next →
                                </button>
                            ) : (
                                <button
                                    className="btn btn-success btn-md submit-btn"
                                    onClick={handleManualSubmit}
                                    disabled={submitting}
                                >
                                    Submit Exam
                                </button>
                            )}
                        </div>
                    </div>
                </main>

                <aside className="exam-sidebar">
                    <div className="palette-header">
                        <h3>Question Palette</h3>
                        <p className="palette-progress">{answeredCount}/{exam.questions.length} answered</p>
                    </div>
                    <div className="palette-grid">
                        {exam.questions.map((q, idx) => (
                            <button
                                key={q.id}
                                className={`palette-btn 
                                    ${currentQuestionIndex === idx ? 'active' : ''} 
                                    ${isAnswered(idx) ? 'answered' : 'unanswered'}`}
                                onClick={() => setCurrentQuestionIndex(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                    <div className="palette-legend">
                        <div className="legend-item"><span className="legend-box answered"></span> Answered</div>
                        <div className="legend-item"><span className="legend-box unanswered"></span> Unanswered</div>
                        <div className="legend-item"><span className="legend-box active"></span> Current</div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default ExamExecution;
