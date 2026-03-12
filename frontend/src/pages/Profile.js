import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, deleteProfile, getUser, saveUser, clearUser } from '../services/api';
import Navbar from '../components/Navbar';
import './Auth.css'; // Reuse auth styles for the form

function Profile() {
    const navigate = useNavigate();
    const currentUser = getUser();
    
    const [form, setForm] = useState({ name: '', newPassword: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                setForm({ name: data.name, newPassword: '' });
            } catch (err) {
                setMessage({ text: 'Failed to load profile. Please sign in again.', type: 'error' });
                clearUser();
                setTimeout(() => navigate('/login'), 2000);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate, currentUser]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
        }
        if (message.text) setMessage({ text: '', type: '' });
    };

    const validate = () => {
        const errors = {};
        if (!form.name.trim()) errors.name = 'Name is required';
        else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
        
        if (form.newPassword && form.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setSaving(true);
        setMessage({ text: '', type: '' });
        setFieldErrors({});

        try {
            const data = await updateProfile({
                name: form.name.trim(),
                newPassword: form.newPassword || undefined
            });
            
            // Update local storage user data
            saveUser({ name: data.name, email: data.email, role: data.role });
            setForm({ ...form, newPassword: '' }); // Clear password field
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (err) {
            if (err.data?.errors) {
                setFieldErrors(err.data.errors);
            } else {
                setMessage({ text: err.message, type: 'error' });
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            await deleteProfile();
            clearUser();
            navigate('/login');
        } catch (err) {
            setMessage({ text: err.message || 'Failed to delete account', type: 'error' });
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="home-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <Navbar />
            <div className="auth-container" style={{ margin: '3rem auto' }}>
                <div className="auth-card">
                    <div className="auth-brand">
                        <div className="auth-brand-icon">👤</div>
                        <h1>Manage Profile</h1>
                        <p>Update your personal information</p>
                    </div>

                    {message.text && (
                        <div className={message.type === 'error' ? 'general-error' : 'general-success'} style={{
                            background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : undefined,
                            borderColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : undefined,
                            color: message.type === 'success' ? 'var(--success)' : undefined,
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius)',
                            marginBottom: '1.25rem',
                            textAlign: 'center'
                        }}>
                            {message.text}
                        </div>
                    )}

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
                            />
                            {fieldErrors.name && <div className="field-error">⚠ {fieldErrors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password (Leave blank to keep current)</label>
                            <input
                                id="newPassword"
                                type="password"
                                name="newPassword"
                                placeholder="Enter new password"
                                value={form.newPassword}
                                onChange={handleChange}
                                className={fieldErrors.newPassword ? 'input-error' : ''}
                            />
                            {fieldErrors.newPassword && <div className="field-error">⚠ {fieldErrors.newPassword}</div>}
                        </div>

                        <button type="submit" className="auth-btn" disabled={saving || deleting}>
                            {saving && <span className="spinner"></span>}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--error)', marginBottom: '0.5rem' }}>Danger Zone</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button 
                            onClick={handleDelete}
                            disabled={saving || deleting} 
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--error)',
                                color: 'var(--error)',
                                padding: '0.6rem 1.2rem',
                                borderRadius: 'var(--radius)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'transparent';
                            }}
                        >
                            {deleting ? 'Deleting...' : 'Delete Account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
