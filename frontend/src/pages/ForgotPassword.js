import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword } from '../services/api';
import logo from '../assets/images/logo.png';
import '../styles/Auth.css';

function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setError('Email is required');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const data = await forgotPassword(email.trim());
            setSuccess(data.message);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp.trim()) {
            setError('OTP is required');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await verifyOtp(email.trim(), otp.trim());
            setSuccess('OTP verified! Set your new password.');
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword) {
            setError('Password is required');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await resetPassword(email.trim(), otp.trim(), newPassword);
            navigate('/login', { state: { successMessage: 'Password reset successful! Please login with your new password.' } });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await forgotPassword(email.trim());
            setSuccess(data.message);
            setOtp('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Forgot Password';
            case 2: return 'Verify OTP';
            case 3: return 'Reset Password';
            default: return 'Forgot Password';
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 1: return 'Enter your email to receive a verification code';
            case 2: return `We sent a 6-digit code to ${email}`;
            case 3: return 'Create a new password for your account';
            default: return '';
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-brand">
                        <div className="auth-brand-icon">
                            <img src={logo} alt="Exam System Logo" className="auth-logo-img" />
                        </div>
                        <h1>{getStepTitle()}</h1>
                        <p>{getStepDescription()}</p>
                    </div>

                    {/* Step indicator */}
                    <div className="step-indicator">
                        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                        <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                        <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
                        <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
                    </div>

                    {success && <div className="general-success">{success}</div>}
                    {error && <div className="general-error">{error}</div>}

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} noValidate>
                            <div className="form-group">
                                <label htmlFor="forgot-email">Email</label>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    autoComplete="email"
                                />
                            </div>
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading && <span className="spinner"></span>}
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} noValidate>
                            <div className="form-group">
                                <label htmlFor="forgot-otp">Verification Code</label>
                                <input
                                    id="forgot-otp"
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setOtp(val);
                                        setError('');
                                    }}
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                    style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: '600' }}
                                />
                            </div>
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading && <span className="spinner"></span>}
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <div className="auth-footer" style={{ marginTop: '1rem' }}>
                                Didn't receive the code?{' '}
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontWeight: '600', fontSize: '0.88rem',
                                        backgroundImage: 'var(--accent-gradient)',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text', padding: 0
                                    }}
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} noValidate>
                            <div className="form-group">
                                <label htmlFor="new-password">New Password</label>
                                <div className="password-wrapper">
                                    <input
                                        id="new-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '🙈' : '👁'}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirm-password">Confirm Password</label>
                                <div className="password-wrapper">
                                    <input
                                        id="confirm-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Re-enter new password"
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading && <span className="spinner"></span>}
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    <div className="auth-footer">
                        Remember your password? <Link to="/login">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
