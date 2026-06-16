// client/src/main.jsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import { useTheme } from './hooks/useTheme';
import { applyTheme } from './themes/themes';
import { getMe, logout, AUTH_EXPIRED_EVENT, resetAuthExpiredNotice } from './lib/api';
import './index.css';

// Apply saved theme immediately to avoid flash
const savedTheme = localStorage.getItem('ht_theme') || 'darkside';
applyTheme(savedTheme);

function App() {
  const { theme, toggleTheme } = useTheme();
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sessionMessage, setSessionMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        const data = await getMe();
        if (active) setUser(data.user);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleAuthExpired = event => {
      setSessionMessage(event.detail?.message || 'Your session expired. Please log in again.');
      setUser(null);
      setAuthLoading(false);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, []);

  function handleLogin(userData) {
    resetAuthExpiredNotice();
    setSessionMessage('');
    setUser(userData);
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // If logout fails server-side, still clear local app state.
    } finally {
      resetAuthExpiredNotice();
      setSessionMessage('');
      setUser(null);
    }
  }

  if (authLoading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#080b12',
          color: '#f5f7fb',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div>Checking secure session...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <>
        {sessionMessage && (
          <div
            style={{
              position: 'fixed',
              top: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10000,
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              background: 'rgba(120, 30, 30, 0.92)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '0.9rem',
            }}
          >
            {sessionMessage}
          </div>
        )}

        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 9999,
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          padding: '0.5rem 0.75rem',
          borderRadius: '999px',
          background: 'rgba(8, 11, 18, 0.82)',
          border: '1px solid rgba(255,255,255,0.14)',
          color: '#f5f7fb',
          boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
          backdropFilter: 'blur(10px)',
          fontSize: '0.85rem',
        }}
      >
        <span>{user.name || user.email}</span>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.08)',
            color: '#f5f7fb',
            padding: '0.35rem 0.65rem',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <Dashboard theme={theme} toggleTheme={toggleTheme} user={user} onLogout={handleLogout} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
