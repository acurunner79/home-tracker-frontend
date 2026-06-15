// client/src/components/ui/Lightbox.jsx
import React, { useEffect } from 'react';

export default function Lightbox({ images, index, onClose, onNav }) {
  // images: [{src, label}]
  const current = images[index];
  const total = images.length;

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && total > 1) onNav(-1);
      if (e.key === 'ArrowRight' && total > 1) onNav(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onNav, total]);

  if (!current) return null;

  return (
    <div className="lightbox" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <img 
        className="lightbox-img" 
        // src={current.src} 
        src={`${import.meta.env.VITE_API_URL}${current.src}`}
        alt={current.label || ''} 
      />

      <button className="lightbox-close" onClick={onClose}>✕</button>

      {total > 1 && (
        <>
          <button className="lightbox-nav lightbox-prev" onClick={() => onNav(-1)}>‹</button>
          <button className="lightbox-nav lightbox-next" onClick={() => onNav(1)}>›</button>
        </>
      )}

      <div className="lightbox-footer">
        {current.label && <div className="lightbox-caption">{current.label}</div>}
        {total > 1 && <div className="lightbox-counter">{index + 1} / {total}</div>}
      </div>
    </div>
  );
}
