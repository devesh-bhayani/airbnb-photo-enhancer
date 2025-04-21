// Auth.js
// User authentication form (login/register)
import React, { useState, useContext } from 'react';
import { ThemeContext } from '../App';

function Auth({ onLogin, loading, error }) {
  const { theme } = useContext(ThemeContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) onLogin(username, password);
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: theme === 'dark' ? '#23272f' : '#fff',
      color: theme === 'dark' ? '#f4f4f4' : '#222',
      borderRadius: 12,
      boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
      padding: 24,
      display: 'flex', flexDirection: 'column', gap: 14,
      transition: 'background 0.2s, color 0.2s',
    }}>
      <h3 style={{ color: theme === 'dark' ? '#bbb' : '#222', margin: 0 }}>Login</h3>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        style={{
          background: theme === 'dark' ? '#181c23' : '#fff',
          color: theme === 'dark' ? '#f4f4f4' : '#222',
          border: `1px solid ${theme === 'dark' ? '#444' : '#ccc'}`,
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 16,
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{
          background: theme === 'dark' ? '#181c23' : '#fff',
          color: theme === 'dark' ? '#f4f4f4' : '#222',
          border: `1px solid ${theme === 'dark' ? '#444' : '#ccc'}`,
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 16,
        }}
      />
      <button type="submit" style={{
        background: theme === 'dark' ? '#2d7ff9' : '#2d7ff9',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '10px 0',
        fontWeight: 600,
        fontSize: 16,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1
      }} disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>
      {error && <div style={{ color: '#e53935', marginTop: 8 }}>{error}</div>}
    </form>
  );
}

export default Auth;
