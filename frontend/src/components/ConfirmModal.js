import React from 'react';
import '../styles/ConfirmModal.css';

function ConfirmModal({ title, message, onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel' }) {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon">⚠️</div>
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button className="modal-btn modal-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="modal-btn modal-confirm" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
