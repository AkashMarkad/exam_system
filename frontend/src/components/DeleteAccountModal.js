import React, { useState } from 'react';
import '../styles/DeleteAccountModal.css';

function DeleteAccountModal({ onConfirm, onCancel, deleting }) {
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(password);
    };

    return (
        <div className="modal-overlay" onClick={!deleting ? onCancel : undefined}>
            <div className="modal-card delete-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon text-error">⚠️</div>
                <h3 className="modal-title">Delete Account</h3>
                <p className="modal-message">
                    Are you sure you want to permanently delete your account? This action cannot be undone.
                </p>
                
                <form onSubmit={handleSubmit} className="delete-modal-form">
                    <label className="delete-modal-label">Enter your password to confirm:</label>
                    <input
                        type="password"
                        className="delete-modal-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={deleting}
                        autoFocus
                    />
                    
                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="modal-btn modal-cancel" 
                            onClick={onCancel}
                            disabled={deleting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="modal-btn modal-confirm"
                            disabled={deleting || !password}
                        >
                            {deleting ? 'Deleting...' : 'Delete My Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DeleteAccountModal;
