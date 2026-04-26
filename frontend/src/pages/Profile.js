import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, deleteProfile, getUser, saveUser, clearUser } from '../services/api';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import ConfirmModal from '../components/ConfirmModal';
import logo from '../assets/images/logo.png';
import '../styles/Auth.css'; // Reuse auth styles for the form

function Profile() {
    const navigate = useNavigate();
    const currentUser = getUser();
    usePageTitle('Profile');
    
    const [form, setForm] = useState({ name: '', email: '', newPassword: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const userEmail = currentUser?.email;
    
    useEffect(() => {
        if (!userEmail) {
            navigate('/');
            return;
        }

        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                setForm({ 
                    name: data.name || '', 
                    email: data.email || '', 
                    newPassword: '' 
                });
            } catch (err) {
                if (err.message && !err.message.includes('JSON')) {
                    setMessage({ text: 'Failed to load profile. Please sign in again.', type: 'error' });
                    clearUser();
                    setTimeout(() => navigate('/'), 2000);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate, userEmail]);

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
            saveUser({ 
                name: data.name, 
                email: data.email, 
                role: data.role
            });
            setForm({ ...form, newPassword: '' }); // Clear password field
            setShowPassword(false);
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
        setDeleting(true);
        try {
            await deleteProfile();
            clearUser();
            navigate('/');
        } catch (err) {
            setMessage({ text: err.message || 'Failed to delete account', type: 'error' });
            setDeleting(false);
            setShowDeleteModal(false);
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
                        <div className="auth-brand-icon">
                            <img src={logo} alt="Profile Icon" className="auth-logo-img" />
                        </div>
                        <h1>Manage Profile</h1>
                        <p>Update your personal information</p>
                    </div>

                    {message.text && (
                        <div className={message.type === 'error' ? 'general-error' : 'general-success'}>
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
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={form.email}
                                disabled
                                style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed', border: '1px dashed var(--border-color)' }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password (Leave blank to keep current)</label>
                            <div className="password-wrapper">
                                <input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    placeholder="Enter new password"
                                    value={form.newPassword}
                                    onChange={handleChange}
                                    className={fieldErrors.newPassword ? 'input-error' : ''}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁'}
                                </button>
                            </div>
                            {fieldErrors.newPassword && <div className="field-error">⚠ {fieldErrors.newPassword}</div>}
                        </div>

                        <button type="submit" className="auth-btn" disabled={saving || deleting}>
                            {saving && <span className="spinner"></span>}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>

                    <div className="danger-zone" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--error)', marginBottom: '0.5rem' }}>Danger Zone</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button 
                            onClick={() => setShowDeleteModal(true)}
                            disabled={saving || deleting} 
                            className="btn-danger-outline"
                        >
                            {deleting ? 'Deleting...' : 'Delete Account'}
                        </button>
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <ConfirmModal 
                    title="Delete Account"
                    message="Are you sure you want to permanently delete your account? This action cannot be undone."
                    confirmText={deleting ? "Deleting..." : "Delete Account"}
                    onConfirm={handleDelete} 
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    );
}

export default Profile;
