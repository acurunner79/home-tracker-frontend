import React, { useState } from 'react';
import { login } from '../lib/api';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('jorgelsotojr.coder@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      onLogin(data.user);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Unable to log in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background:
          'radial-gradient(circle at top, rgba(60,80,120,0.35), transparent 45%), #080b12',
        color: '#f5f7fb',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2rem',
          borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.14)',
          background: 'rgba(12,16,26,0.92)',
          boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
        }}
      >
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem' }}>
          Home Tracker
        </h1>

        <p style={{ margin: '0 0 1.5rem', color: '#aeb8cc' }}>
          Sign in to access your project dashboard.
        </p>

        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          <span style={{ display: 'block', marginBottom: '0.35rem' }}>
            Email
          </span>
          <input
            type="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.16)',
              background: '#0e1422',
              color: '#fff',
            }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <span style={{ display: 'block', marginBottom: '0.35rem' }}>
            Password
          </span>
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.16)',
              background: '#0e1422',
              color: '#fff',
            }}
          />
        </label>

        {error && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              borderRadius: '10px',
              background: 'rgba(255,70,70,0.12)',
              color: '#ffb4b4',
              border: '1px solid rgba(255,70,70,0.25)',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '10px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#4b5563' : '#6ea8fe',
            color: '#07101f',
            fontWeight: 700,
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </main>
  );
}
