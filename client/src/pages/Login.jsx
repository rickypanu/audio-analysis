import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';

export default function AuthPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to reset form state
  const resetForm = () => {
    setFormData({ username: '', email: '', password: '' });
    setError('');
    setSuccessMessage('');
    setShowPassword(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handles mode toggle (Sign In <-> Register) with full state cleanup
  const toggleMode = (registerMode) => {
    if (isRegister === registerMode) return;
    setIsRegister(registerMode);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const payload = {
      username: formData.username.trim(),
      password: formData.password,
    };

    try {
      if (isRegister) {
        // --- Registration Flow ---
        const response = await registerUser({
          ...payload,
          email: formData.email.trim(),
        });

        if (response) {
          setSuccessMessage('Account created successfully! Please sign in.');
          // Switch to login tab, prefill username, clear sensitive data
          setIsRegister(false);
          setFormData({
            username: payload.username,
            email: '',
            password: '',
          });
        }
      } else {
        // --- Login Flow ---
        const data = await loginUser(payload);

        if (data.success || data.token || data.access_token) {
          const token = data.token || data.access_token;
          if (token) {
            localStorage.setItem('token', token);
          }

          const userData = {
            username: data.username || data.user?.username || payload.username,
            userId: data.user_id || data.user?.id,
            ...data.user,
          };

          localStorage.setItem('user_profile', JSON.stringify(userData));
          
          resetForm();
          onLoginSuccess(userData);
        } else {
          setError(data.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || err.message || 'An error occurred. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-slate-800/90 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl mb-6 border border-slate-700/50">
          <button
            type="button"
            onClick={() => toggleMode(false)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              !isRegister
                ? 'bg-slate-700 text-pink-400 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => toggleMode(true)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isRegister
                ? 'bg-slate-700 text-pink-400 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-center mb-6 bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h1>

        {/* Notifications */}
        {error && (
          <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center flex items-center justify-center gap-2">
            <span>{'🙈'}</span> {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs text-center flex items-center justify-center gap-2">
            <span>{'🎉'}</span> {successMessage}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Username {isRegister && '/ Identifier'}
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-pink-500/60 rounded-xl text-sm focus:outline-none text-slate-100 transition-all placeholder:text-slate-600"
              placeholder={isRegister ? 'Choose a username' : 'Username or Email'}
            />
          </div>

          {/* Email field conditionally rendered on registration */}
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-pink-500/60 rounded-xl text-sm focus:outline-none text-slate-100 transition-all placeholder:text-slate-600"
                placeholder="you@example.com"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Password
            </label>
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
            {loading
              ? isRegister
                ? 'Creating account...'
                : 'Signing in...'
              : isRegister
              ? 'Register ✨'
              : 'Sign In ✨'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/40 text-center">
          <p className="text-[11px] text-slate-500 italic">
            Built for growth, step by step ❤️
          </p>
        </div>
      </div>
    </div>
  );
}