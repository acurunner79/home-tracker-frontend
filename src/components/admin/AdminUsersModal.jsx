// client/src/components/admin/AdminUsersModal.jsx
import React, { useEffect, useState } from 'react';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  resetAdminUserPassword,
} from '../../lib/api';

export default function AdminUsersModal({ currentUser, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user',
  });

  const [passwordResetUser, setPasswordResetUser] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');

  const [disableConfirmUser, setDisableConfirmUser] = useState(null);

  async function loadUsers() {
    setLoading(true);
    setError('');

    try {
      const data = await getAdminUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!message) return undefined;

    const timer = window.setTimeout(() => {
      setMessage('');
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [message]);

  async function handleCreateUser(e) {
    e.preventDefault();

    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (!newUser.email.trim()) {
        throw new Error('Email is required.');
      }

      if (newUser.password.length < 12) {
        throw new Error('Password must be at least 12 characters.');
      }

      const data = await createAdminUser({
        email: newUser.email.trim(),
        name: newUser.name.trim(),
        password: newUser.password,
        role: newUser.role,
      });

      setUsers(prev => [...prev, data.user]);
      setNewUser({
        email: '',
        name: '',
        password: '',
        role: 'user',
      });
      setMessage('User created successfully.');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateUser(id, data) {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await updateAdminUser(id, data);

      setUsers(prev => prev.map(user =>
        user.id === id ? response.user : user
      ));

      setMessage('User updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  }

  function openDisableConfirm(user) {
    setError('');
    setMessage('');
    setDisableConfirmUser(user);
  }

  function closeDisableConfirm() {
    if (saving) return;
    setDisableConfirmUser(null);
  }

  async function handleConfirmDisable(e) {
    e.preventDefault();

    if (!disableConfirmUser) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await updateAdminUser(disableConfirmUser.id, { active: false });

      setUsers(prev => prev.map(user =>
        user.id === disableConfirmUser.id ? response.user : user
      ));

      setMessage(`${disableConfirmUser.email} has been disabled.`);
      setDisableConfirmUser(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to disable user');
    } finally {
      setSaving(false);
    }
  }

  function openPasswordReset(user) {
    setError('');
    setMessage('');
    setPasswordResetUser(user);
    setResetPassword('');
    setResetPasswordConfirm('');
  }

  function closePasswordReset() {
    if (saving) return;

    setPasswordResetUser(null);
    setResetPassword('');
    setResetPasswordConfirm('');
  }

  async function handleResetPassword(e) {
    e.preventDefault();

    if (!passwordResetUser) return;

    setError('');
    setMessage('');

    try {
      if (resetPassword.length < 12) {
        throw new Error('Password must be at least 12 characters.');
      }

      if (resetPassword !== resetPasswordConfirm) {
        throw new Error('Passwords do not match.');
      }

      setSaving(true);

      await resetAdminUserPassword(passwordResetUser.id, resetPassword);

      setMessage(`Password reset for ${passwordResetUser.email}.`);
      setPasswordResetUser(null);
      setResetPassword('');
      setResetPasswordConfirm('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to reset password');
    } finally {
      setSaving(false);
    }
  }

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 20000,
      background: 'rgba(0,0,0,0.68)',
      display: 'grid',
      placeItems: 'center',
      padding: '1rem',
    },
    modal: {
      width: isMobile ? 'min(100%, 94vw)' : 'min(980px, 96vw)',
      maxHeight: isMobile ? '82vh' : '88vh',
      overflow: 'auto',
      background: '#101522',
      color: '#f5f7fb',
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: isMobile ? '0.9rem' : '1rem',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      fontFamily: 'system-ui, sans-serif',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '0.9rem 1rem' : '1rem 1.25rem',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      position: 'sticky',
      top: 0,
      zIndex: 4,
      background: '#101522',
    },
    body: {
      padding: isMobile ? '0.9rem 1rem 1rem' : '1rem 1.25rem',
      display: 'grid',
      gap: '1rem',
    },
    title: {
      margin: 0,
      fontSize: '1.1rem',
    },
    closeButton: {
      border: '1px solid rgba(255,255,255,0.18)',
      borderRadius: '999px',
      background: 'rgba(255,255,255,0.08)',
      color: '#f5f7fb',
      padding: '0.35rem 0.65rem',
      cursor: 'pointer',
    },
    form: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr)) auto',
      gap: isMobile ? '0.75rem' : '0.5rem',
      alignItems: 'end',
      border: isMobile ? '1px solid rgba(255,255,255,0.12)' : 'none',
      borderRadius: isMobile ? '0.85rem' : 0,
      padding: isMobile ? '0.85rem' : 0,
      background: isMobile ? 'rgba(255,255,255,0.035)' : 'transparent',
    },
    formField: {
      display: 'grid',
      gap: '0.35rem',
    },
    input: {
      width: '100%',
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: '0.65rem',
      background: 'rgba(255,255,255,0.08)',
      color: '#f5f7fb',
      padding: '0.65rem',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      border: '1px solid rgba(255,255,255,0.14)',
      borderRadius: '0.65rem',
      background: '#171f31',
      color: '#f5f7fb',
      padding: '0.65rem',
      boxSizing: 'border-box',
    },
    button: {
      border: '1px solid rgba(255,255,255,0.18)',
      borderRadius: '0.65rem',
      background: 'rgba(255,255,255,0.1)',
      color: '#f5f7fb',
      padding: '0.65rem 0.85rem',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    primaryButton: {
      border: '1px solid rgba(100,180,255,0.45)',
      borderRadius: '0.65rem',
      background: 'rgba(40,120,220,0.45)',
      color: '#fff',
      padding: '0.65rem 0.85rem',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    dangerButton: {
      border: '1px solid rgba(255,110,110,0.45)',
      borderRadius: '0.65rem',
      background: 'rgba(150,45,45,0.45)',
      color: '#fff',
      padding: '0.65rem 0.85rem',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    toastStack: {
      position: 'sticky',
      top: 0,
      zIndex: 2,
      display: 'grid',
      gap: '0.5rem',
      marginBottom: '0.25rem',
    },
    toastBase: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '0.7rem 0.8rem',
      borderRadius: '0.75rem',
      border: '1px solid rgba(255,255,255,0.14)',
      boxShadow: '0 10px 28px rgba(0,0,0,0.28)',
      fontSize: '0.9rem',
      lineHeight: 1.35,
    },
    toastError: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '0.7rem 0.8rem',
      borderRadius: '0.75rem',
      border: '1px solid rgba(255,140,140,0.26)',
      boxShadow: '0 10px 28px rgba(0,0,0,0.28)',
      fontSize: '0.9rem',
      lineHeight: 1.35,
      background: 'rgba(130, 30, 30, 0.92)',
      color: '#fff',
    },
    toastSuccess: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '0.7rem 0.8rem',
      borderRadius: '0.75rem',
      border: '1px solid rgba(120,255,180,0.22)',
      boxShadow: '0 10px 28px rgba(0,0,0,0.28)',
      fontSize: '0.9rem',
      lineHeight: 1.35,
      background: 'rgba(25, 100, 65, 0.92)',
      color: '#fff',
    },
    toastClose: {
      marginLeft: 'auto',
      border: 'none',
      borderRadius: '999px',
      background: 'rgba(255,255,255,0.12)',
      color: '#fff',
      width: '1.6rem',
      height: '1.6rem',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    tableWrap: {
      overflowX: 'auto',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '0.85rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: 760,
    },
    th: {
      textAlign: 'left',
      padding: '0.75rem',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      color: '#aab6cc',
      fontWeight: 600,
      fontSize: '0.85rem',
    },
    td: {
      padding: '0.75rem',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      verticalAlign: 'middle',
    },
    badge: active => ({
      display: 'inline-block',
      padding: '0.2rem 0.5rem',
      borderRadius: '999px',
      background: active ? 'rgba(40,140,80,0.35)' : 'rgba(150,50,50,0.35)',
      border: '1px solid rgba(255,255,255,0.12)',
      fontSize: '0.8rem',
    }),
    resetOverlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 21000,
      background: 'rgba(0,0,0,0.72)',
      display: 'grid',
      placeItems: 'center',
      padding: '1rem',
    },
    resetModal: {
      width: isMobile ? 'min(100%, 92vw)' : 'min(460px, 94vw)',
      background: '#101522',
      color: '#f5f7fb',
      border: '1px solid rgba(255,255,255,0.16)',
      borderRadius: '1rem',
      boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
      fontFamily: 'system-ui, sans-serif',
      overflow: 'hidden',
    },
    resetHeader: {
      padding: '1rem 1.25rem',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
    },
    resetBody: {
      padding: '1rem 1.25rem',
      display: 'grid',
      gap: '0.75rem',
    },
    resetFooter: {
      padding: '1rem 1.25rem',
      borderTop: '1px solid rgba(255,255,255,0.12)',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.5rem',
    },
    helperText: {
      color: '#aab6cc',
      fontSize: '0.85rem',
      lineHeight: 1.4,
    },
    warningText: {
      color: '#ffd3d3',
      fontSize: '0.9rem',
      lineHeight: 1.45,
      background: 'rgba(150,45,45,0.22)',
      border: '1px solid rgba(255,120,120,0.22)',
      borderRadius: '0.75rem',
      padding: '0.75rem',
    },
    label: {
      color: '#aab6cc',
      fontSize: '0.78rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    },
    mobileSectionTitle: {
      color: '#aab6cc',
      fontSize: '0.78rem',
      fontWeight: 800,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      marginTop: '0.25rem',
    },
    mobileUserList: {
      display: 'grid',
      gap: '0.75rem',
    },
    mobileUserCard: {
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '0.9rem',
      background: 'rgba(255,255,255,0.035)',
      padding: '0.85rem',
      display: 'grid',
      gap: '0.75rem',
    },
    mobileUserHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '0.75rem',
    },
    mobileUserName: {
      fontWeight: 800,
      fontSize: '1rem',
      lineHeight: 1.2,
      wordBreak: 'break-word',
    },
    mobileUserEmail: {
      color: '#aab6cc',
      fontSize: '0.86rem',
      marginTop: '0.2rem',
      wordBreak: 'break-word',
    },
    mobileUserMetaGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '0.65rem',
    },
    mobileMetaLabel: {
      color: '#aab6cc',
      fontSize: '0.72rem',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: '0.25rem',
    },
    mobileActions: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '0.5rem',
    },
    mobileFullButton: {
      width: '100%',
      justifyContent: 'center',
      textAlign: 'center',
    },
    modalBottomBar: {
      position: 'sticky',
      bottom: 0,
      zIndex: 3,
      display: isMobile ? 'flex' : 'none',
      justifyContent: 'center',
      padding: '0.75rem 1rem',
      borderTop: '1px solid rgba(255,255,255,0.12)',
      background: '#101522',
    },
  };

  return (
    <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>User Management</h2>
          <button type="button" style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.body}>
          {(error || message) && (
            <div style={styles.toastStack}>
              {error && (
                <div style={styles.toastError}>
                  <span>⚠</span>
                  <span>{error}</span>
                  <button type="button" style={styles.toastClose} onClick={() => setError('')}>
                    ✕
                  </button>
                </div>
              )}

              {message && (
                <div style={styles.toastSuccess}>
                  <span>✓</span>
                  <span>{message}</span>
                  <button type="button" style={styles.toastClose} onClick={() => setMessage('')}>
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {isMobile && <div style={styles.mobileSectionTitle}>Create User</div>}

          <form style={styles.form} onSubmit={handleCreateUser}>
            <div style={styles.formField}>
              {isMobile && <label style={styles.label} htmlFor="new-user-email">Email</label>}
              <input
                id="new-user-email"
                style={styles.input}
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div style={styles.formField}>
              {isMobile && <label style={styles.label} htmlFor="new-user-name">Name</label>}
              <input
                id="new-user-name"
                style={styles.input}
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div style={styles.formField}>
              {isMobile && <label style={styles.label} htmlFor="new-user-password">Temporary Password</label>}
              <input
                id="new-user-password"
                style={styles.input}
                type="password"
                placeholder="Temporary password"
                value={newUser.password}
                onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <div style={styles.formField}>
              {isMobile && <label style={styles.label} htmlFor="new-user-role">Role</label>}
              <select
                id="new-user-role"
                style={styles.select}
                value={newUser.role}
                onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              style={isMobile ? { ...styles.primaryButton, ...styles.mobileFullButton } : styles.primaryButton}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Create'}
            </button>
          </form>

          {loading ? (
            <div>Loading users...</div>
          ) : isMobile ? (
            <>
              <div style={styles.mobileSectionTitle}>Users</div>

              <div style={styles.mobileUserList}>
                {users.map(user => {
                  const isSelf = user.id === currentUser?.id;

                  return (
                    <div key={user.id} style={styles.mobileUserCard}>
                      <div style={styles.mobileUserHeader}>
                        <div>
                          <div style={styles.mobileUserName}>{user.name || 'Unnamed User'}</div>
                          <div style={styles.mobileUserEmail}>{user.email}</div>
                        </div>

                        <span style={styles.badge(user.active)}>
                          {user.active ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      <div style={styles.mobileUserMetaGrid}>
                        <div>
                          <div style={styles.mobileMetaLabel}>Role</div>
                          <select
                            style={styles.select}
                            value={user.role}
                            disabled={saving || isSelf}
                            onChange={e => handleUpdateUser(user.id, { role: e.target.value })}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>

                        <div>
                          <div style={styles.mobileMetaLabel}>Created</div>
                          <div>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</div>
                        </div>
                      </div>

                      <div style={styles.mobileActions}>
                        <button
                          type="button"
                          style={{ ...styles.button, ...styles.mobileFullButton }}
                          disabled={saving}
                          onClick={() => openPasswordReset(user)}
                        >
                          Reset Password
                        </button>

                        <button
                          type="button"
                          style={{ ...styles.button, ...styles.mobileFullButton }}
                          disabled={saving || isSelf}
                          onClick={() => {
                            if (user.active) {
                              openDisableConfirm(user);
                            } else {
                              handleUpdateUser(user.id, { active: true });
                            }
                          }}
                        >
                          {user.active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {!users.length && (
                  <div style={styles.mobileUserCard}>
                    No users found.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Created</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map(user => {
                    const isSelf = user.id === currentUser?.id;

                    return (
                      <tr key={user.id}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 700 }}>{user.name || 'Unnamed User'}</div>
                          <div style={{ color: '#aab6cc', fontSize: '0.85rem' }}>{user.email}</div>
                        </td>

                        <td style={styles.td}>
                          <select
                            style={styles.select}
                            value={user.role}
                            disabled={saving || isSelf}
                            onChange={e => handleUpdateUser(user.id, { role: e.target.value })}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.badge(user.active)}>
                            {user.active ? 'Active' : 'Disabled'}
                          </span>
                        </td>

                        <td style={styles.td}>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                        </td>

                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              style={styles.button}
                              disabled={saving}
                              onClick={() => openPasswordReset(user)}
                            >
                              Reset Password
                            </button>

                            <button
                              type="button"
                              style={styles.button}
                              disabled={saving || isSelf}
                              onClick={() => {
                                if (user.active) {
                                  openDisableConfirm(user);
                                } else {
                                  handleUpdateUser(user.id, { active: true });
                                }
                              }}
                            >
                              {user.active ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!users.length && (
                    <tr>
                      <td style={styles.td} colSpan="5">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div style={styles.modalBottomBar}>
            <button
              type="button"
              style={{ ...styles.button, width: '100%', justifyContent: 'center' }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {disableConfirmUser && (
        <div
          style={styles.resetOverlay}
          onClick={e => {
            if (e.target === e.currentTarget) closeDisableConfirm();
          }}
        >
          <form style={styles.resetModal} onSubmit={handleConfirmDisable}>
            <div style={styles.resetHeader}>
              <h3 style={{ ...styles.title, fontSize: '1rem' }}>Disable User?</h3>
              <button type="button" style={styles.closeButton} onClick={closeDisableConfirm} disabled={saving}>
                ✕
              </button>
            </div>

            <div style={styles.resetBody}>
              <div style={styles.warningText}>
                This will prevent <strong>{disableConfirmUser.email}</strong> from logging in.
                Existing sessions may remain valid until they expire or are refreshed.
              </div>

              <div style={styles.helperText}>
                Use this when an account should temporarily lose access. You can enable the user again later.
              </div>
            </div>

            <div style={styles.resetFooter}>
              <button type="button" style={styles.button} onClick={closeDisableConfirm} disabled={saving}>
                Cancel
              </button>
              <button type="submit" style={styles.dangerButton} disabled={saving}>
                {saving ? 'Disabling…' : 'Disable User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {passwordResetUser && (
        <div
          style={styles.resetOverlay}
          onClick={e => {
            if (e.target === e.currentTarget) closePasswordReset();
          }}
        >
          <form style={styles.resetModal} onSubmit={handleResetPassword}>
            <div style={styles.resetHeader}>
              <h3 style={{ ...styles.title, fontSize: '1rem' }}>Reset Password</h3>
              <button type="button" style={styles.closeButton} onClick={closePasswordReset} disabled={saving}>
                ✕
              </button>
            </div>

            <div style={styles.resetBody}>
              <div style={styles.helperText}>
                Set a new password for <strong>{passwordResetUser.email}</strong>. Passwords must be at least 12 characters.
              </div>

              <label style={styles.label} htmlFor="reset-password">
                New password
              </label>
              <input
                id="reset-password"
                style={styles.input}
                type="password"
                autoFocus
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                placeholder="Enter new password"
              />

              <label style={styles.label} htmlFor="reset-password-confirm">
                Confirm password
              </label>
              <input
                id="reset-password-confirm"
                style={styles.input}
                type="password"
                value={resetPasswordConfirm}
                onChange={e => setResetPasswordConfirm(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            <div style={styles.resetFooter}>
              <button type="button" style={styles.button} onClick={closePasswordReset} disabled={saving}>
                Cancel
              </button>
              <button type="submit" style={styles.dangerButton} disabled={saving}>
                {saving ? 'Resetting…' : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
