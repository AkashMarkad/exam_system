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

export async function createExamWithQuestions(examData, file, uploadType) {
    const formData = new FormData();
    formData.append('exam', JSON.stringify(examData));
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/exams/create-with-questions?uploadType=${uploadType}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create exam and upload questions');
    }
    return response.text();
}

export async function getExams() {
    const response = await fetch(`${API_BASE}/exams`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch exams');
    }

    return data;
}

export async function updateExam(id, examData) {
    const response = await fetch(`${API_BASE}/exams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(examData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to update exam');
    }

    return data;
}

export async function deleteExam(id) {
    const response = await fetch(`${API_BASE}/exams/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete exam');
    }

    return response.text();
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

export async function startExam(examId) {
    const response = await fetch(`${API_BASE}/attempts/start/${examId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to start exam');
    }

    return data;
}

export async function submitExam(attemptId, answers) {
    const response = await fetch(`${API_BASE}/attempts/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ attemptId, answers }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to submit exam');
    }

    return data;
}

export async function getMyResults() {
    const response = await fetch(`${API_BASE}/attempts/my-results`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch results');
    }

    return data;
}


export async function getLeaderboard() {
    const response = await fetch(`${API_BASE}/leaderboard`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch leaderboard');
    }

    return data;
}

export async function getLeaderboardByExam(examId) {
    const response = await fetch(`${API_BASE}/leaderboard/${examId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch exam leaderboard');
    }

    return data;
}

export async function getAllUsers() {
    const response = await fetch(`${API_BASE}/admin/users`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
    }

    return data;
}

export async function updateUserRole(email, role) {
    const response = await fetch(`${API_BASE}/admin/users/${email}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to update user role');
    }

    return data;
}

export async function deleteUserAdmin(email) {
    const response = await fetch(`${API_BASE}/admin/users/${email}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
    }

    return data;
}
