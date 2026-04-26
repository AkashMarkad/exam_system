import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, updateUserRole, deleteUserAdmin } from '../services/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/ManageUsers.css';

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // UI state
    const [toast, setToast] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            showToast(err.message || 'Failed to fetch users.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (email, newRole) => {
        try {
            await updateUserRole(email, newRole);
            showToast(`Role updated to ${newRole} successfully.`);
            fetchUsers();
        } catch (err) {
            showToast(err.message || 'Failed to update role.', 'error');
        }
    };

    const handleDeleteClick = (email) => {
        setDeleteTarget(email);
    };

    const confirmDelete = async () => {
        const email = deleteTarget;
        setDeleteTarget(null);
        try {
            await deleteUserAdmin(email);
            showToast('User deleted successfully.');
            fetchUsers();
        } catch (err) {
            showToast(err.message || 'Failed to delete user.', 'error');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="manage-users-page">
            <Navbar />
            <div className="manage-users-container">
                <div className="users-list-content">
                    <h2>👥 User Management</h2>
                    <p className="users-count">Total Users: {users.length}</p>
                    
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
                        )}
                    </div>

                    {loading ? (
                        <p className="loading-msg">Loading users...</p>
                    ) : filteredUsers.length === 0 ? (
                        <p className="no-users-msg">
                            {users.length === 0 ? 'No users found.' : 'No users match your search.'}
                        </p>
                    ) : (
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id || u.email}>
                                            <td className="user-name-col">
                                                <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                                                <span>{u.name}</span>
                                            </td>
                                            <td>{u.email}</td>
                                            <td>
                                                <select
                                                    className={`role-select ${u.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.email, e.target.value)}
                                                >
                                                    <option value="USER">USER</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                            </td>
                                            <td>{formatDate(u.createdAt)}</td>
                                            <td>
                                                <button 
                                                    className="action-btn delete-btn" 
                                                    onClick={() => handleDeleteClick(u.email)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <ConfirmModal
                    title="Delete User"
                    message="Are you sure you want to delete this user? This action cannot be undone."
                    confirmText="Delete User"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}

export default ManageUsers;
