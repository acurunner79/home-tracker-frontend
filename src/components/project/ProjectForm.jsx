// client/src/components/project/ProjectForm.jsx
import React, { useState, useRef } from 'react';

const STAGES = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'started',     label: 'Started' },
  { value: 'on-hold',     label: 'On Hold' },
  { value: 'completed',   label: 'Completed' },
];

function totalCost(materials) {
  return materials.reduce((s, m) => s + (parseFloat(m.cost) || 0), 0);
}
function fmtMoney(v) {
  return '$' + Number(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function ProjectForm({ project, onSave, onClose, onUploadImages, onDeleteImage }) {
  const isEdit = Boolean(project?.id);

  const [name, setName]       = useState(project?.name || '');
  const [room, setRoom]       = useState(project?.room || '');
  const [year, setYear]       = useState(project?.year || String(new Date().getFullYear()));
  const [stage, setStage]     = useState(project?.stage || 'not-started');
  const [notes, setNotes]     = useState(project?.notes || '');
  const [measurements, setMeasurements] = useState(
    project?.measurements?.length ? project.measurements : [{ label: '', value: '' }]
  );
  const [materials, setMaterials] = useState(
    project?.materials?.length ? project.materials : [{ name: '', cost: '' }]
  );
  const [links, setLinks] = useState(
    project?.links?.length ? project.links : [{ url: '', label: '' }]
  );
  const [images, setImages]   = useState(project?.images || []);
  const [newFiles, setNewFiles] = useState([]); // {file, preview, label}
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const fileInputRef = useRef();

  // ── Measurements ────────────────────────────────────────────────────
  const addMeasure = () => setMeasurements(prev => [...prev, { label: '', value: '' }]);
  const removeMeasure = i => setMeasurements(prev => prev.length > 1 ? prev.filter((_, j) => j !== i) : prev);
  const updateMeasure = (i, field, val) =>
    setMeasurements(prev => prev.map((m, j) => j === i ? { ...m, [field]: val } : m));

  // ── Materials ────────────────────────────────────────────────────────
  const addMaterial = () => setMaterials(prev => [...prev, { name: '', cost: '' }]);
  const removeMaterial = i => setMaterials(prev => prev.filter((_, j) => j !== i));
  const updateMaterial = (i, field, val) =>
    setMaterials(prev => prev.map((m, j) => j === i ? { ...m, [field]: val } : m));

  // ── Links ────────────────────────────────────────────────────────────
  const addLink = () => setLinks(prev => [...prev, { url: '', label: '' }]);
  const removeLink = i => setLinks(prev => prev.filter((_, j) => j !== i));
  const updateLink = (i, field, val) =>
    setLinks(prev => prev.map((l, j) => j === i ? { ...l, [field]: val } : l));

  // ── Images ───────────────────────────────────────────────────────────
  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      label: '',
    }));
    setNewFiles(prev => [...prev, ...previews]);
    e.target.value = '';
  };
  const updateNewFileLabel = (i, label) =>
    setNewFiles(prev => prev.map((f, j) => j === i ? { ...f, label } : f));
  const removeNewFile = i => setNewFiles(prev => prev.filter((_, j) => j !== i));
  const removeExistingImage = async (imageId) => {
    if (onDeleteImage) await onDeleteImage(imageId);
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  // ── Save ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) { setError('Project name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: name.trim(),
        room: room.trim(),
        year: year.trim(),
        stage,
        notes: notes.trim(),
        measurements: measurements.filter(m => m.label || m.value),
        materials: materials.filter(m => m.name),
        links: links.filter(l => l.url.trim()),
      };
      const saved = await onSave(payload);

      // Upload new images if any
      if (newFiles.length && onUploadImages) {
        await onUploadImages(
          saved.id,
          newFiles.map(f => f.file),
          newFiles.map(f => f.label)
        );
      }
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const cost = totalCost(materials);

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{isEdit ? 'Edit Project' : 'New Project'}</div>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-banner">{error}</div>}

          {/* Name + Year */}
          <div className="form-row">
            <div className="form-group">
              <label>Project Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Kitchen Remodel" />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="text" value={year} onChange={e => setYear(e.target.value)}
                placeholder="2025" style={{ maxWidth: 120 }} />
            </div>
          </div>

          {/* Room + Stage */}
          <div className="form-row">
            <div className="form-group">
              <label>Room / Area</label>
              <input type="text" value={room} onChange={e => setRoom(e.target.value)}
                placeholder="e.g. Kitchen, Backyard" />
            </div>
            <div className="form-group">
              <label>Stage</label>
              <div className="stage-picker">
                {STAGES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    className={`stage-opt ${stage === s.value ? `active-${s.value}` : ''}`}
                    onClick={() => setStage(s.value)}
                  >{s.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div className="form-group full">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Measurements
              <button className="add-row-btn" type="button" onClick={addMeasure}>+ Add</button>
            </label>
            {measurements.map((m, i) => (
              <div className="dyn-row meas-row" key={i}>
                <input type="text" placeholder="Label (e.g. Width)" value={m.label}
                  onChange={e => updateMeasure(i, 'label', e.target.value)} />
                <input type="text" placeholder="Value (e.g. 12 ft)" value={m.value}
                  onChange={e => updateMeasure(i, 'value', e.target.value)} />
                <button className="remove-btn" type="button" onClick={() => removeMeasure(i)}>✕</button>
              </div>
            ))}
          </div>

          {/* Materials */}
          <div className="form-group full">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Materials &amp; Costs
              <button className="add-row-btn" type="button" onClick={addMaterial}>+ Add</button>
            </label>
            {materials.map((m, i) => (
              <div className="dyn-row mat-row" key={i}>
                <input type="text" placeholder="Material name" value={m.name}
                  onChange={e => updateMaterial(i, 'name', e.target.value)} />
                <input type="number" placeholder="Cost $" value={m.cost} min="0" step="0.01"
                  onChange={e => updateMaterial(i, 'cost', e.target.value)} />
                <button className="remove-btn" type="button" onClick={() => removeMaterial(i)}>✕</button>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="total-bar">
            <span className="total-label">Total Cost</span>
            <span className="total-val">{fmtMoney(cost)}</span>
          </div>

          {/* Links */}
          <div className="form-group full">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Material Links
              <button className="add-row-btn" type="button" onClick={addLink}>+ Add</button>
            </label>
            {links.map((l, i) => (
              <div className="dyn-row link-row" key={i}>
                <input type="text" placeholder="Label (e.g. Tiles at Home Depot)" value={l.label}
                  onChange={e => updateLink(i, 'label', e.target.value)} />
                <input type="url" placeholder="https://..." value={l.url}
                  onChange={e => updateLink(i, 'url', e.target.value)} />
                <button className="remove-btn" type="button" onClick={() => removeLink(i)}>✕</button>
              </div>
            ))}
          </div>

          {/* Images */}
          <div className="form-group full">
            <label>Images</label>
            <div className="upload-zone" onClick={() => fileInputRef.current.click()}>
              <div className="upload-icon">📷</div>
              <p>Click to upload images (JPG, PNG, WEBP — max 20MB each)</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple
              style={{ display: 'none' }} onChange={handleFileChange} />

            {(images.length > 0 || newFiles.length > 0) && (
              <div className="img-grid" style={{ marginTop: 12 }}>
                {/* Existing saved images */}
                {images.map(img => (
                  <div className="img-wrap" key={img.id}>
                    <img 
                      className="img-thumb" 
                      // src={img.src} 
                      src={`${import.meta.env.VITE_API_URL}${img.src}`}
                      alt={img.label || ''} 
                    />
                    <button className="img-del" type="button"
                      onClick={() => removeExistingImage(img.id)}>✕</button>
                    <input className="img-label-input" type="text"
                      placeholder="Label…" defaultValue={img.label || ''}
                      onBlur={e => {
                        if (e.target.value !== img.label) {
                          // Optimistically update label — full refresh happens on save
                        }
                      }} />
                  </div>
                ))}
                {/* New files not yet uploaded */}
                {newFiles.map((f, i) => (
                  <div className="img-wrap" key={i}>
                    <img className="img-thumb" src={f.preview} alt={f.label || ''} />
                    <button className="img-del" type="button" onClick={() => removeNewFile(i)}>✕</button>
                    <input className="img-label-input" type="text"
                      placeholder="Label…" value={f.label}
                      onChange={e => updateNewFileLabel(i, e.target.value)} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="form-group full">
            <label>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Details, ideas, reminders…" rows={3} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? '💾 Save Changes' : '💾 Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
