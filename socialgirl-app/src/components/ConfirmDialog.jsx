import React from 'react';
import '../styles/components/Dialog.css';

const ConfirmDialog = ({ isOpen, title, onConfirm, onCancel, confirmText = "CONFIRM", cancelText = "CANCEL" }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div className="dialog-overlay" onClick={handleOverlayClick}>
            <div className="dialog fractal-dialog">
                <h3>{title}</h3>
                <div className="aurora-btn-group dialog-btn-group">
                    <button className="aurora-btn aurora-btn-primary" onClick={onConfirm}>
                        {confirmText}
                    </button>
                    {cancelText && (
                        <button className="aurora-btn aurora-btn-ghost-secondary" onClick={onCancel}>
                            {cancelText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;