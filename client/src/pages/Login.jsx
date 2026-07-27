import React, { useState } from 'react';
import { loginUser } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(formData);
      if (data.success) {
        onLoginSuccess(data.token || true);
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        <h1 className="text-2xl font-extrabold text-center mb-1 bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
          Welcome Back
        </h1>

        {error && (
          <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center flex items-center justify-center gap-2">
            <span>🙈</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-pink-500/60 rounded-xl text-sm focus:outline-none text-slate-100 transition-all placeholder:text-slate-600"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            
            {/* Input with Monkey Toggle */}
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-3.5 pr-12 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-pink-500/60 rounded-xl text-sm focus:outline-none text-slate-100 transition-all placeholder:text-slate-600"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 px-2 py-1 text-lg hover:scale-110 active:scale-95 transition-transform rounded-lg select-none"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🐵' : '🙈'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-pink-500/10 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In ✨'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-700/40 text-center">
          <p className="text-[11px] text-slate-500 italic">
            Built for growth, step by step ❤️
          </p>
        </div>
      </div>
    </div>
  );
}