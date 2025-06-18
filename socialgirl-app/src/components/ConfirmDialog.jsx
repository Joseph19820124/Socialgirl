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
                <div className="button-group">
                    <button className="btn btn-yes" onClick={onConfirm}>
                        {confirmText}
                    </button>
                    {cancelText && (
                        <button className="btn btn-no" onClick={onCancel}>
                            {cancelText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;