import { useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE } from '../utils/apiConfig';

export default function AuthModal({ onAuth, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login'
        ? { email: form.email.trim(), password: form.password }
        : {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            ...(form.phone && form.phone.trim() ? { phone: form.phone.trim() } : {}),
          };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.map(e => `${e.field}: ${e.message}`).join(' | '));
        }
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('tc_access_token', data.accessToken);
      localStorage.setItem('tc_refresh_token', data.refreshToken);
      localStorage.setItem('tc_user', JSON.stringify(data.user));

      // Notify all components across the app to sync user state
      window.dispatchEvent(new Event('auth_change'));
      window.dispatchEvent(new Event('storage'));

      if (onAuth) {
        onAuth(data.user, data.accessToken);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10 text-sm"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-xl font-bold text-black">SB</span>
          </div>
          <h2 className="text-xl font-bold text-white font-display">SalesBOT Account</h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
            {mode === 'login' ? 'Sign in to sync your wishlist, price alerts & chat history' : 'Create your account to get started'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-zinc-800 rounded-2xl p-1 mb-6">
          {['login', 'register'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all cursor-pointer ${
                mode === m ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full bg-zinc-800/90 border border-zinc-700/80 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={form.phone}
                  onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-zinc-800/90 border border-zinc-700/80 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </>
          )}
          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              required
              className="w-full bg-zinc-800/90 border border-zinc-700/80 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder={mode === 'register' ? 'Create Password (min. 6 characters)' : 'Password'}
              value={form.password}
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              required
              minLength={mode === 'register' ? 6 : 1}
              className="w-full bg-zinc-800/90 border border-zinc-700/80 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-xl px-3.5 py-2.5 font-medium leading-snug">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3.5 rounded-xl text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer mt-2 shadow-lg"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-zinc-500 text-xs hover:text-zinc-300 transition-colors cursor-pointer text-center"
        >
          Continue without account (limited features)
        </button>
      </motion.div>
    </motion.div>
  );
}
