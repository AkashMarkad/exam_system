import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import usePageTitle from '../hooks/usePageTitle';
import logo from '../assets/images/logo.png';
import '../styles/Auth.css';

function Register() {
    const navigate = useNavigate();
    usePageTitle('Register');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
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
        if (!form.name.trim()) errors.name = 'Name is required';
        else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
        if (!form.email.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Please enter a valid email';
        if (!form.password) errors.password = 'Password is required';
        else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';
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
            await registerUser(form.name.trim(), form.email.trim(), form.password);
            navigate('/login', { state: { successMessage: 'Registration successful! Please sign in.' } });
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
                        <h1>Create Account</h1>
                        <p>Join Exam System and start learning</p>
                    </div>

                    {error && <div className="general-error">{error}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={form.name}
                                onChange={handleChange}
                                className={fieldErrors.name ? 'input-error' : ''}
                                autoComplete="name"
                            />
                            {fieldErrors.name && <div className="field-error">⚠ {fieldErrors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
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
                            <label htmlFor="password">Password</label>
                            <div className="password-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className={fieldErrors.password ? 'input-error' : ''}
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
                            {fieldErrors.password && <div className="field-error">⚠ {fieldErrors.password}</div>}
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading && <span className="spinner"></span>}
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
