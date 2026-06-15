// client/src/components/project/ProjectCard.jsx
import React from 'react';

const STAGE_LABEL = {
  'not-started': 'Not Started',
  'started': 'Started',
  'on-hold': 'On Hold',
  'completed': 'Completed',
};
const STAGE_ICON = {
  'not-started': '○',
  'started': '▶',
  'on-hold': '⏸',
  'completed': '✓',
};

function fmtMoney(v) {
  return '$' + Number(v || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function totalCost(materials) {
  return (materials || []).reduce((s, m) => s + (parseFloat(m.cost) || 0), 0);
}

export default function ProjectCard({ project, onClick, onEdit, onDelete }) {
  const cost = totalCost(project.materials);
  const firstImg = project.images?.[0];

  return (
    <div className="project-card" onClick={onClick}>
      <div className="card-actions">
        <button
          className="icon-btn primary"
          title="Edit"
          onClick={e => { e.stopPropagation(); onEdit(); }}
        >✎</button>
        <button
          className="icon-btn danger"
          title="Delete"
          onClick={e => { e.stopPropagation(); onDelete(); }}
        >🗑</button>
      </div>

      {firstImg ? (
        // <img className="card-img" src={firstImg.src} alt={firstImg.label || project.name} />
        <img
          className="card-img"
          src={`${import.meta.env.VITE_API_URL}${firstImg.src}`}
          alt={firstImg.label || project.name}
        />
      ) : (
        <div className="card-img-placeholder">🔨</div>
      )}

      <div className="card-body">
        <div className="year-badge">{project.year || '—'}</div>
        <div className={`stage-badge stage-${project.stage}`}>
          {STAGE_ICON[project.stage]} {STAGE_LABEL[project.stage] || project.stage}
        </div>
        <div className="card-title">{project.name || 'Untitled'}</div>
        <div className="card-room">📍 {project.room || '—'}</div>
        {project.notes && (
          <div className="card-excerpt">{project.notes}</div>
        )}
      </div>

      <div className="card-footer-bar">
        <span>{project.materials?.length || 0} material{project.materials?.length !== 1 ? 's' : ''}</span>
        <span className="card-cost">{fmtMoney(cost)}</span>
      </div>
    </div>
  );
}
