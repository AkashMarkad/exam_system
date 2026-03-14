import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser, saveUser } from '../services/api';
import logo from '../assets/images/logo.png';
import '../styles/Auth.css';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
        }
        if (error) setError('');
    };

    const validate = () => {
        const errors = {};
        if (!form.email.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Please enter a valid email';
        if (!form.password) errors.password = 'Password is required';
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);
        setError('');
        setFieldErrors({});

        try {
            const data = await loginUser(form.email.trim(), form.password);
            saveUser({ name: data.name, email: data.email, role: data.role });
            navigate('/home');
        } catch (err) {
            if (err.data?.errors) {
                setFieldErrors(err.data.errors);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
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
                        <h1>Welcome Back</h1>
                        <p>Sign in to your Exam System account</p>
                    </div>

                    {location.state?.successMessage && (
                        <div className="general-success">{location.state.successMessage}</div>
                    )}

                    {error && <div className="general-error">{error}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                                className={fieldErrors.email ? 'input-error' : ''}
                                autoComplete="email"
                            />
                            {fieldErrors.email && <div className="field-error">⚠ {fieldErrors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="login-password">Password</label>
                            <div className="password-wrapper">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className={fieldErrors.password ? 'input-error' : ''}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁'}
                                </button>
                            </div>
                            {fieldErrors.password && <div className="field-error">⚠ {fieldErrors.password}</div>}
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading && <span className="spinner"></span>}
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
