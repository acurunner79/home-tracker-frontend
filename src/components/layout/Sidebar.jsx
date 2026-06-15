// client/src/components/layout/Sidebar.jsx
import React from 'react';
import { THEMES } from '../../themes/themes';

export default function Sidebar({ projects, navState, setNavState, activePage, setActivePage, isOpen, onClose, theme, toggleTheme }) {
  const years = [...new Set(projects.map(p => p.year).filter(Boolean))].sort().reverse();
  const getRooms = year =>
    [...new Set(projects.filter(p => p.year === year).map(p => p.room).filter(Boolean))].sort();

  const other = theme === 'darkside' ? 'lightside' : 'darkside';
  const otherTheme = THEMES[other];

  const setNav = (type, year = null, room = null) => {
    setActivePage('projects');
    setNavState({ type, year, room });
    if (window.innerWidth < 768) onClose();
  };

  const goTo = (page) => {
    setActivePage(page);
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-title">
            {/* <span>🏠</span>  */}
            Home Tracker
          </div>
          <div className="sidebar-logo-sub">Improvement Projects</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          <button
            className={`nav-item ${activePage === 'stats' ? 'active' : ''}`}
            onClick={() => goTo('stats')}
          >
            <span className="nav-item-icon">📊</span>
            Dashboard
          </button>
          <button
            className={`nav-item ${activePage === 'projects' && navState.type === 'all' ? 'active' : ''}`}
            onClick={() => setNav('all')}
          >
            <span className="nav-item-icon">⊞</span>
            All Projects
            <span className="nav-badge">{projects.length}</span>
          </button>

          {years.length > 0 && (
            <>
              <div className="sidebar-section-label" style={{ marginTop: 12 }}>By Year</div>
              {years.map(year => {
                const rooms = getRooms(year);
                const yCount = projects.filter(p => p.year === year).length;
                const yActive = activePage === 'projects' && navState.type === 'year' && navState.year === year && !navState.room;
                return (
                  <div className="year-group" key={year}>
                    <button
                      className={`nav-item ${yActive ? 'active' : ''}`}
                      onClick={() => setNav('year', year)}
                    >
                      <span className="nav-item-icon">📅</span>
                      {year}
                      <span className="nav-badge">{yCount}</span>
                    </button>
                    <div className="room-list">
                      {rooms.map(room => {
                        const rActive = activePage === 'projects' && navState.year === year && navState.room === room;
                        return (
                          <button
                            key={room}
                            className={`room-btn ${rActive ? 'active' : ''}`}
                            onClick={() => setNav('room', year, room)}
                          >
                            <span className="room-dot" />
                            {room}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          {/* Theme toggle — only visible on mobile */}
          <button className="theme-toggle mobile-only sidebar-theme-btn" onClick={toggleTheme}>
            {otherTheme.icon} Switch to {otherTheme.label}
          </button>
          <button className="sidebar-add-btn" onClick={() => {
            window.dispatchEvent(new CustomEvent('ht:new-project'));
            if (window.innerWidth < 768) onClose();
          }}>
            + New Project
          </button>
        </div>
      </div>

      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
    </>
  );
}
