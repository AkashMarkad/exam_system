import React, { useState, useEffect, useRef } from 'react';
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
    const timerRef = useRef(null);
    const instructionTimerRef = useRef(null);
    const answersRef = useRef(answers);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        initExam();
    }, []); // Run once on mount

    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
            clearInterval(instructionTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (stage === 'instructions' && instructionTimeLeft > 0) {
            const timer = setInterval(() => {
                setInstructionTimeLeft(prev => {
                    if (prev <= 1) return 0;
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [stage, instructionTimeLeft]);

    useEffect(() => {
        if (stage !== 'result' && stage !== 'loading' && timeLeft !== null && timeLeft > 0) {
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
        }
    }, [stage === 'instructions', stage === 'exam']);

    useEffect(() => {
        if (timeLeft === 0 && !submitting && stage === 'exam') {
            autoSubmit();
        }
    }, [timeLeft, stage, submitting]);

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
            setStage('exam');
        } catch (err) {
            console.error("Fullscreen failed:", err);
            setStage('exam'); // Proceed anyway
        }
    };

    const autoSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const res = await submitExam(attemptId, answersRef.current);
            setResult(res);
            setStage('result');
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        } catch (err) {
            setError('Failed to auto-submit exam. Time is up.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleManualSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        setShowSubmitModal(false);
        clearInterval(timerRef.current);
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

    if (loading) {
        return (
            <div className="exam-exec-container flex-center">
                <div className="spinner"></div>
                <p>Loading Exam...</p>
            </div>
        );
    }

    if (error && !exam) {
        return (
            <div className="exam-exec-container flex-center">
                <div className="error-card">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button className="btn-primary" onClick={() => navigate('/exams')}>Return to Exams</button>
                </div>
            </div>
        );
    }

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
                    <button className="btn-exit-dashboard" onClick={() => navigate('/exams')}>Exit to Dashboard</button>
                </div>
            </div>
        );
    }

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
                    <div className="instructions-card">
                        <h2>Exam Instructions</h2>
                        <div className="exam-info-grid">
                            <div className="info-item"><strong>Exam:</strong> {exam.name}</div>
                            <div className="info-item"><strong>Duration:</strong> {exam.durationMinutes} Minutes</div>
                            <div className="info-item"><strong>Total Marks:</strong> {exam.totalMarks}</div>
                            <div className="info-item"><strong>Questions:</strong> {exam.questions.length}</div>
                        </div>
                        <div className="instructions-text">
                            <ul>
                                <li>Once the exam starts, the window will enter full-screen mode.</li>
                                <li>Do not refresh the page or exit full-screen until completion.</li>
                                <li>Ensure you have a stable internet connection.</li>
                                <li>The exam will auto-submit when the timer reaches zero.</li>
                            </ul>
                        </div>
                        <div className="start-actions">
                            <button
                                className="btn-primary start-actual-btn"
                                disabled={instructionTimeLeft > 0}
                                onClick={startActualExam}
                            >
                                {instructionTimeLeft > 0 ? `Wait ${instructionTimeLeft}s to Start` : 'Start Exam Now'}
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
                <button className="btn-primary" onClick={() => navigate('/exams')}>Back to Dashboard</button>
            </div>
        );
    }

    const currentQuestion = exam.questions[currentQuestionIndex];
    const isAnswered = (idx) => answers[exam.questions[idx].id] !== undefined;

    return (
        <div className="exam-exec-page">
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
                    <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button className="btn-submit-top" onClick={() => setShowSubmitModal(true)} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                </div>
            </header>

            {showSubmitModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <div className="modal-icon">📤</div>
                        <h3>Submit Exam?</h3>
                        <p>Are you sure you want to submit your assessment? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setShowSubmitModal(false)}>Continue Exam</button>
                            <button className="btn-modal-submit" onClick={handleManualSubmit}>Yes, Submit Now</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="exam-layout">
                <main className="exam-main-panel">
                    <div className="question-header">
                        <h3>Question {currentQuestionIndex + 1} of {exam.questions.length}</h3>
                        <span className="question-marks">[{currentQuestion.marks} Marks]</span>
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
                            className="btn-action clear-btn"
                            onClick={() => handleClearSelection(currentQuestion.id)}
                            disabled={!isAnswered(currentQuestionIndex)}
                        >
                            Clear Selection
                        </button>

                        <div className="nav-actions">
                            <button
                                className="btn-action prev-btn"
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                disabled={currentQuestionIndex === 0}
                            >
                                ← Previous
                            </button>
                            {currentQuestionIndex < exam.questions.length - 1 ? (
                                <button
                                    className="btn-action next-btn"
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                >
                                    Next →
                                </button>
                            ) : (
                                <button
                                    className="btn-action submit-btn"
                                    onClick={handleManualSubmit}
                                    disabled={submitting}
                                >
                                    Submit
                                </button>
                            )}
                        </div>
                    </div>
                </main>

                <aside className="exam-sidebar">
                    <div className="palette-header">
                        <h3>Question Palette</h3>
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
