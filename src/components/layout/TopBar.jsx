// client/src/components/layout/TopBar.jsx
import React from 'react';
import { THEMES } from '../../themes/themes';

export default function TopBar({
  title,
  subtitle,
  theme,
  toggleTheme,
  onAddProject,
  onMenuToggle,
  user,
  onOpenAdminUsers,
}) {
  const other = theme === 'darkside' ? 'lightside' : 'darkside';
  const otherTheme = THEMES[other];

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle icon-btn" onClick={onMenuToggle} title="Menu">
          ☰
        </button>
        <div>
          <div className="topbar-title">{title}</div>
          {subtitle && <div className="topbar-sub">{subtitle}</div>}
        </div>
      </div>

      <div className="topbar-right">
        {/* Theme toggle — hidden on mobile, shown in sidebar instead */}
        <button
          className="theme-toggle desktop-only"
          onClick={toggleTheme}
          title={`Switch to ${otherTheme.label}`}
        >
          {otherTheme.icon} {otherTheme.label}
        </button>

        {user?.role === 'admin' && (
          <button
            className="btn desktop-only"
            onClick={onOpenAdminUsers}
            type="button"
          >
            Users
          </button>
        )}

        <button className="btn btn-primary" onClick={onAddProject}>
          + Add Project
        </button>
      </div>
    </div>
  );
}
