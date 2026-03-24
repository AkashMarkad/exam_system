import config from '../config';

const API_BASE = config.API_BASE_URL;

export async function registerUser(name, email, password) {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'Registration failed');
        error.data = data;
        throw error;
    }

    return data;
}

export async function loginUser(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'Login failed');
        error.data = data;
        throw error;
    }

    return data;
}

export async function getProfile() {
    const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
    }

    return data;
}

export async function updateProfile(profileData) {
    const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'Failed to update profile');
        error.data = data;
        throw error;
    }

    return data;
}

export async function deleteProfile() {
    const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete profile');
    }

    return data;
}

export async function forgotPassword(email) {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
    }

    return data;
}

export async function verifyOtp(email, otp) {
    const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
    }

    return data;
}

export async function resetPassword(email, otp, newPassword) {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
    }

    return data;
}

export function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

export function clearUser() {
    localStorage.removeItem('user');
}
