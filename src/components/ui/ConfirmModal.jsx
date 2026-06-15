// client/src/components/ui/ConfirmModal.jsx
import React from 'react';

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) {
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="icon-btn" onClick={onCancel}>✕</button>
        </div>
        <div style={{ padding: '20px 22px' }}>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
