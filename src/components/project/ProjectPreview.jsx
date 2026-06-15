// client/src/components/project/ProjectPreview.jsx
import React, { useState } from 'react';
import Lightbox from '../ui/Lightbox';
import LinkPreviewCard from '../ui/LinkPreviewCard';

const STAGE_LABEL = {
  'not-started': 'Not Started',
  'started': 'Started',
  'on-hold': 'On Hold',
  'completed': 'Completed',
};

function fmtMoney(v) {
  return '$' + Number(v || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function totalCost(mats) {
  return (mats || []).reduce((s, m) => s + (parseFloat(m.cost) || 0), 0);
}

export default function ProjectPreview({ project, onClose, onEdit, onDelete }) {
  const [lbOpen, setLbOpen]   = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  const images = project.images || [];
  const validLinks = (project.links || []).filter(l => l.url?.trim());
  const cost = totalCost(project.materials);

  const openLightbox = i => { setLbIndex(i); setLbOpen(true); };
  const navLightbox  = dir => setLbIndex(i => (i + dir + images.length) % images.length);

  return (
    <>
      <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal" style={{ maxWidth: 760 }}>
          {/* Hero image */}
          {images[0] && (
            <img
              className="preview-hero"
              // src={images[0].src}
              src={`${import.meta.env.VITE_API_URL}${images[0].src}`}
              alt={images[0].label || project.name}
              onClick={() => openLightbox(0)}
            />
          )}

          <div className="preview-body">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2 }}>
                  {project.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className={`stage-badge stage-${project.stage}`}>
                    {STAGE_LABEL[project.stage]}
                  </span>
                  <span className="year-badge">{project.year}</span>
                  <span style={{ fontSize: 13, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    📍 {project.room}
                  </span>
                </div>
              </div>
              <button className="icon-btn" onClick={onClose} style={{ flexShrink: 0 }}>✕</button>
            </div>

            {/* Measurements */}
            {project.measurements?.length > 0 && (
              <div className="preview-section">
                <div className="preview-section-label">Measurements</div>
                <div className="meas-grid">
                  {project.measurements.map((m, i) => (
                    <div className="meas-pill" key={i}>
                      <div className="meas-pill-label">{m.label || '—'}</div>
                      <div className="meas-pill-val">{m.value || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {project.materials?.length > 0 && (
              <div className="preview-section">
                <div className="preview-section-label">Materials &amp; Costs</div>
                <table className="mat-table">
                  <tbody>
                    {project.materials.map((m, i) => (
                      <tr key={i}>
                        <td>{m.name}</td>
                        <td>{fmtMoney(m.cost)}</td>
                      </tr>
                    ))}
                    <tr className="mat-total-row">
                      <td>Total</td>
                      <td>{fmtMoney(cost)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Links */}
            {validLinks.length > 0 && (
              <div className="preview-section">
                <div className="preview-section-label">Links</div>
                <div className="link-cards">
                  {validLinks.map((l, i) => (
                    <LinkPreviewCard key={i} url={l.url} label={l.label} />
                  ))}
                </div>
              </div>
            )}

            {/* Images (if more than hero) */}
            {images.length > 1 && (
              <div className="preview-section">
                <div className="preview-section-label">Images</div>
                <div className="preview-img-grid">
                  {images.map((img, i) => (
                    <div className="preview-img-item" key={img.id}>
                      <img
                        className="preview-img-thumb"
                        // src={img.src}
                        src={`${import.meta.env.VITE_API_URL}${img.src}`}
                        alt={img.label || ''}
                        onClick={() => openLightbox(i)}
                      />
                      {img.label && <div className="preview-img-label" title={img.label}>{img.label}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {project.notes && (
              <div className="preview-section">
                <div className="preview-section-label">Notes</div>
                <div className="notes-block">{project.notes}</div>
              </div>
            )}
          </div>

          <div className="preview-footer">
            <button className="btn btn-danger btn-sm" onClick={() => { onClose(); onDelete(); }}>
              🗑 Delete
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onEdit(); }}>
              ✎ Edit Project
            </button>
          </div>
        </div>
      </div>

      {lbOpen && (
        <Lightbox
          images={images}
          index={lbIndex}
          onClose={() => setLbOpen(false)}
          onNav={navLightbox}
        />
      )}
    </>
  );
}
