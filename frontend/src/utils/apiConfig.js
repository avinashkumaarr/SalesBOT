// Normalized API Base URL for seamless local, Vercel, and Render integration
const rawUrl = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
    ? 'https://salesbot-fqjx.onrender.com/api' // Exact Render backend URL
    : 'http://localhost:3001/api'
);

export const API_BASE = (() => {
  let u = rawUrl.trim().replace(/\/+$/, '');
  if (!u.endsWith('/api')) {
    u += '/api';
  }
  return u;
})();
