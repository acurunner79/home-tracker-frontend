// client/src/pages/StatsPage.jsx
import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from 'recharts';

function fmtMoney(v) {
  return '$' + Number(v || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function totalCost(mats) {
  return (mats || []).reduce((s, m) => s + (parseFloat(m.cost) || 0), 0);
}

const STAGE_LABEL = {
  'not-started': 'Not Started',
  'started':     'Started',
  'on-hold':     'On Hold',
  'completed':   'Completed',
};

// Theme-aware chart colors pulled from CSS variables at render time
function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const STAGE_COLORS = {
  'not-started': '#6b6055',
  'started':     '#185FA5',
  'on-hold':     '#BA7517',
  'completed':   '#3B6D11',
};

// Custom tooltip for charts
function ChartTooltip({ active, payload, label, money = true }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border2)',
      borderRadius: 'var(--radius-sm)',
      padding: '8px 12px',
      fontSize: 13,
      boxShadow: 'var(--shadow)',
    }}>
      {label && <div style={{ color: 'var(--text3)', marginBottom: 4, fontSize: 11 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: 'var(--text)', fontWeight: 600 }}>
          {money ? fmtMoney(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

export default function StatsPage({ projects, onAddProject, onNavigate }) {
  const accent = getCSSVar('--accent') || '#cc0000';

  const stats = useMemo(() => {
    const total = projects.length;
    const totalSpend = projects.reduce((s, p) => s + totalCost(p.materials), 0);
    const completed = projects.filter(p => p.stage === 'completed').length;
    const completedPct = total ? Math.round((completed / total) * 100) : 0;

    // Most expensive room
    const roomSpend = {};
    projects.forEach(p => {
      const r = p.room || 'Unknown';
      roomSpend[r] = (roomSpend[r] || 0) + totalCost(p.materials);
    });
    const topRoom = Object.entries(roomSpend).sort((a, b) => b[1] - a[1])[0];

    // Spend by year
    const byYear = {};
    projects.forEach(p => {
      const y = p.year || 'Unknown';
      byYear[y] = (byYear[y] || 0) + totalCost(p.materials);
    });
    const yearData = Object.entries(byYear)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, spend]) => ({ year, spend }));

    // Spend by room
    const roomData = Object.entries(roomSpend)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([room, spend]) => ({ room, spend }));

    // Projects by stage
    const stageCount = { 'not-started': 0, 'started': 0, 'on-hold': 0, 'completed': 0 };
    projects.forEach(p => { if (stageCount[p.stage] !== undefined) stageCount[p.stage]++; });
    const stageData = Object.entries(stageCount)
      .filter(([, v]) => v > 0)
      .map(([stage, count]) => ({ name: STAGE_LABEL[stage], value: count, stage }));

    // Recent projects (last 5)
    const recent = [...projects]
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 5);

    return { total, totalSpend, completed, completedPct, topRoom, yearData, roomData, stageData, recent };
  }, [projects]);

  return (
    <div className="main-scroll">
      {/* ── Top stat cards ────────────────────────────────── */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-card-label">Total Projects</div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-sub">across all years &amp; rooms</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-card-label">Total Spend</div>
          <div className="stat-card-value">{fmtMoney(stats.totalSpend)}</div>
          <div className="stat-card-sub">all materials combined</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Completed</div>
          <div className="stat-card-value">{stats.completedPct}%</div>
          <div className="stat-card-sub">{stats.completed} of {stats.total} projects done</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Top Room</div>
          <div className="stat-card-value" style={{ fontSize: stats.topRoom?.[0]?.length > 12 ? 18 : 26 }}>
            {stats.topRoom?.[0] || '—'}
          </div>
          <div className="stat-card-sub">
            {stats.topRoom ? fmtMoney(stats.topRoom[1]) + ' spent' : 'no data yet'}
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-icon">📊</div>
          <div className="empty-title">No data yet</div>
          <p className="empty-sub">Add your first project to start seeing stats.</p>
          <button className="btn btn-primary" onClick={onAddProject}>+ Add First Project</button>
        </div>
      ) : (
        <>
          {/* ── Charts row ─────────────────────────────────── */}
          <div className="charts-row">

            {/* Spend by Year */}
            {stats.yearData.length > 0 && (
              <div className="chart-card chart-card-wide">
                <div className="chart-card-title">Spend by Year</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.yearData} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
                    <XAxis dataKey="year" tick={{ fill: 'var(--text3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)}
                      tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--accent-light)' }} />
                    <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                      {stats.yearData.map((_, i) => (
                        <Cell key={i} fill={accent} opacity={0.85 - i * 0.05} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Projects by Stage — Donut */}
            {stats.stageData.length > 0 && (
              <div className="chart-card">
                <div className="chart-card-title">Projects by Stage</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.stageData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.stageData.map((entry, i) => (
                        <Cell key={i} fill={STAGE_COLORS[entry.stage] || accent} />
                      ))}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 13 }}>
                          <div style={{ color: 'var(--text)', fontWeight: 600 }}>{payload[0].name}</div>
                          <div style={{ color: 'var(--text3)' }}>{payload[0].value} project{payload[0].value !== 1 ? 's' : ''}</div>
                        </div>
                      );
                    }} />
                    <Legend
                      formatter={(value) => <span style={{ color: 'var(--text2)', fontSize: 12 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Spend by Room */}
          {stats.roomData.length > 0 && (
            <div className="chart-card" style={{ marginBottom: 24 }}>
              <div className="chart-card-title">Spend by Room</div>
              <ResponsiveContainer width="100%" height={Math.max(180, stats.roomData.length * 44)}>
                <BarChart
                  data={stats.roomData}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                >
                  <XAxis type="number"
                    tickFormatter={v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)}
                    tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="room" width={110}
                    tick={{ fill: 'var(--text2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--accent-light)' }} />
                  <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
                    {stats.roomData.map((_, i) => (
                      <Cell key={i} fill={accent} opacity={1 - i * 0.08} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Projects */}
          <div className="chart-card" style={{ marginBottom: 24 }}>
            <div className="chart-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Recent Projects
              <button className="btn btn-sm btn-ghost" onClick={() => onNavigate('projects')}>
                View All →
              </button>
            </div>
            <div className="recent-list">
              {stats.recent.map(p => (
                <div className="recent-item" key={p.id}>
                  <div className="recent-item-left">
                    <div className={`stage-badge stage-${p.stage}`} style={{ marginBottom: 0 }}>
                      {STAGE_LABEL[p.stage]}
                    </div>
                    <div>
                      <div className="recent-item-name">{p.name}</div>
                      <div className="recent-item-meta">📍 {p.room} · {p.year}</div>
                    </div>
                  </div>
                  <div className="recent-item-cost">{fmtMoney(totalCost(p.materials))}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
