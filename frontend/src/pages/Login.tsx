import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('analyst');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-lg shadow-2xl border border-outline-variant/40 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <span className="material-symbols-outlined text-primary text-[3rem]">security</span>
          <h1 className="font-bold text-2xl tracking-wider text-primary">SENTINEL AI SOC</h1>
          <p className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">
            AI-Assisted Security Operations Center Platform
          </p>
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container rounded text-xs font-mono border border-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-on-surface-variant mb-1 font-semibold uppercase">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-on-surface-variant mb-1 font-semibold uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-container text-on-primary-container hover:bg-primary font-bold py-2.5 rounded transition-all shadow-md font-sans text-sm flex justify-center items-center gap-2"
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS SOC COMMAND CENTER'}
          </button>
        </form>

        <div className="p-3 bg-surface-container-low rounded border border-outline-variant/30 text-center font-mono text-[0.7rem] text-on-surface-variant">
          Default Credentials: <span className="text-primary font-bold">analyst</span> / <span className="text-secondary font-bold">password123</span>
        </div>
      </div>
    </div>
  );
};
