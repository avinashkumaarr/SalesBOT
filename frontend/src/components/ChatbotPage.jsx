import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import ChatSearchInput from './ChatSearchInput';
import ProductCard from './ProductCard';
import ProductComparison from './ProductComparison';
import ReactMarkdown from 'react-markdown';

const ROLES = ["Advisor", "Price Tracker", "Spec Analyst", "Deal Finder"];
const VIDEO_URL = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";
const API_BASE = "http://localhost:3001/api";

// ─── Auth Modal ──────────────────────────────────────────────────────────────
function AuthModal({ onAuth, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
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
            // Only include phone if actually entered
            ...(form.phone && form.phone.trim() ? { phone: form.phone.trim() } : {}),
          };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        // Handle Zod validation errors (array of field errors)
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.map(e => `${e.field}: ${e.message}`).join(' | '));
        }
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('tc_access_token', data.accessToken);
      localStorage.setItem('tc_refresh_token', data.refreshToken);
      localStorage.setItem('tc_user', JSON.stringify(data.user));
      onAuth(data.user, data.accessToken);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10 text-sm"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-xl font-bold text-black">TC</span>
          </div>
          <h2 className="text-xl font-bold text-white">ShopBot AI</h2>
          <p className="text-zinc-400 text-sm mt-1">
            {mode === 'login' ? 'Sign in to save your wishlist & price alerts' : 'Create your account to get started'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-zinc-800 rounded-2xl p-1 mb-6">
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${mode === m ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500"
              />
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                value={form.phone}
                onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500"
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500"
          />

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl text-sm hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <button
          onClick={onClose}
          className="mt-4 w-full text-zinc-500 text-xs hover:text-zinc-300 transition-colors"
        >
          Continue without account (limited features)
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Loan Status Banner ───────────────────────────────────────────────────────
function LoanStatusBanner({ stage, onDownloadPDF, applicationId }) {
  if (!stage || stage === 'GREET' || stage === 'COLLECT_INFO') return null;

  const stageConfig = {
    ELIGIBILITY: { label: 'Checking Eligibility', color: 'bg-blue-500/20 border-blue-500/30 text-blue-300', icon: '🔍' },
    EMI_CALC: { label: 'EMI Calculation', color: 'bg-purple-500/20 border-purple-500/30 text-purple-300', icon: '🧮' },
    KYC: { label: 'KYC Collection', color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300', icon: '📄' },
    CREDIT: { label: 'Credit Assessment', color: 'bg-orange-500/20 border-orange-500/30 text-orange-300', icon: '📊' },
    RISK: { label: 'Risk Analysis', color: 'bg-orange-500/20 border-orange-500/30 text-orange-300', icon: '⚖️' },
    RECOMMENDATION: { label: 'Loan Recommendation', color: 'bg-teal-500/20 border-teal-500/30 text-teal-300', icon: '💡' },
    UNDERWRITING: { label: 'Underwriting Review', color: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300', icon: '🏦' },
    SANCTION: { label: '✅ Loan Approved!', color: 'bg-green-500/20 border-green-500/30 text-green-300', icon: '🎉' },
    COMPLETE: { label: '✅ Application Complete', color: 'bg-green-500/20 border-green-500/30 text-green-300', icon: '✅' },
  };

  const config = stageConfig[stage];
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between px-4 py-2 rounded-xl border text-xs font-semibold mb-3 ${config.color}`}
    >
      <span>{config.icon} {config.label}</span>
      {(stage === 'SANCTION' || stage === 'COMPLETE') && applicationId && (
        <button
          onClick={onDownloadPDF}
          className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg hover:bg-green-600 transition-colors ml-2"
        >
          📥 Download Sanction Letter
        </button>
      )}
    </motion.div>
  );
}

// ─── Main ChatbotPage ─────────────────────────────────────────────────────────
export default function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [credits, setCredits] = useState(60);
  const [roleIndex, setRoleIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [currentStage, setCurrentStage] = useState('GREET');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [guestMsgCount, setGuestMsgCount] = useState(0);
  const [showSignInNudge, setShowSignInNudge] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editText, setEditText] = useState("");
  const [selectedCompareProduct, setSelectedCompareProduct] = useState(null);

  const abortControllerRef = useRef(null);
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // ── Load saved auth on mount ──────────────────────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem('tc_access_token');
    const savedUser = localStorage.getItem('tc_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // ── Roles Cycling (every 2s) ──────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ── 3. HLS Video Setup ────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(VIDEO_URL);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => { });
      });
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = VIDEO_URL;
      video.addEventListener('loadedmetadata', () => video.play().catch(() => { }));
    }
  }, []);

  // ── Auto-scroll inner container only (prevents window jumping) ───────────
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length, isTyping]);

  // ── Refresh token helper ──────────────────────────────────────────────────
  const refreshAccessToken = async () => {
    const rt = localStorage.getItem('tc_refresh_token');
    if (!rt) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('tc_access_token', data.accessToken);
        localStorage.setItem('tc_refresh_token', data.refreshToken);
        setToken(data.accessToken);
        return data.accessToken;
      } else {
        localStorage.removeItem('tc_access_token');
        localStorage.removeItem('tc_refresh_token');
        localStorage.removeItem('tc_user');
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('tc_access_token');
      localStorage.removeItem('tc_refresh_token');
      localStorage.removeItem('tc_user');
      setToken(null);
      setUser(null);
    }
    return null;
  };

  // ── Authenticated fetch helper ────────────────────────────────────────────
  const authFetch = async (url, options = {}) => {
    let currentToken = token || localStorage.getItem('tc_access_token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`;

    let res = await fetch(url, { ...options, headers });

    if (res.status === 401 && currentToken) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        res = await fetch(url, {
          ...options,
          headers: { ...options.headers, 'Authorization': `Bearer ${newToken}`, 'Content-Type': 'application/json' },
        });
      }
    }
    return res;
  };

  // ── Handle auth success ───────────────────────────────────────────────────
  const handleAuth = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    setShowAuthModal(false);
    // Load chat history
    loadChatHistory(accessToken);
  };

  // ── Load chat history ─────────────────────────────────────────────────────
  const loadChatHistory = async (authToken) => {
    if (!authToken && !token) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE}/chat/history`, {
        headers: { 'Authorization': `Bearer ${authToken || token}` },
      });
      const data = await res.json();
      if (data.success && data.sessions?.length > 0) {
        const latest = data.sessions[0];
        if (latest.messages?.length > 0) {
          // Ask user if they want to continue previous session
          const lastMsg = latest.messages[0];
          setMessages([{
            sender: 'ai',
            text: `Welcome back, ${user?.name || 'there'}! 👋 I can see you have a previous conversation. Would you like to continue where you left off, or start a new session?`,
            agentType: 'SALES',
          }]);
          setSessionId(latest.sessionId);
        }
      }
    } catch { }
    setIsLoadingHistory(false);
  };

  // ── Main send handler ─────────────────────────────────────────────────────
  const handleSend = async (text, attachedFile = null) => {
    const displayText = attachedFile ? `${text || 'Attached file:'}\n\n📎 **[Attachment: ${attachedFile.name}]**` : text;
    // Add user message to UI immediately
    setMessages((prev) => [...prev, { sender: 'user', text: displayText, attachment: attachedFile }]);
    setIsTyping(true);
    setCredits((prev) => Math.max(0, prev - 2));

    // Track guest messages and show sign-in nudge after 3
    if (!user) {
      const newCount = guestMsgCount + 1;
      setGuestMsgCount(newCount);
      if (newCount === 3) setShowSignInNudge(true);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const messageToSend = text ? (attachedFile ? `${text} [Attached document/file: ${attachedFile.name}]` : text) : `Please analyze this attached document/file: ${attachedFile?.name || 'file'}`;
      const res = await authFetch(`${API_BASE}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          message: messageToSend,
          sessionId,
          history: messages.slice(-10).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          attachment: attachedFile ? {
            name: attachedFile.name,
            type: attachedFile.type,
            content: attachedFile.content
          } : null
        }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to get response');

      // Update session ID and stage
      if (data.sessionId) setSessionId(data.sessionId);
      if (data.stage) setCurrentStage(data.stage);

      setIsTyping(false);
      setMessages((prev) => [...prev, {
        sender: 'ai',
        text: data.message,
        agentType: data.agentType,
        timestamp: data.timestamp,
        products: data.products || [],
        category: data.category,
        budget: data.budget,
      }]);

    } catch (error) {
      if (error.name === 'AbortError') return;
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        sender: 'ai',
        text: `I'm having trouble connecting to the server. Please check that the backend is running on port 3001. Error: ${error.message}`,
        agentType: 'ERROR',
      }]);
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
    setMessages((prev) => [...prev, {
      sender: 'ai',
      text: '*[AI response generation was stopped by you]*',
      agentType: 'SYSTEM',
    }]);
  };

  const handleDeleteMessage = (indexToRemove) => {
    setMessages((prev) => {
      const newMsgs = [...prev];
      if (newMsgs[indexToRemove + 1] && newMsgs[indexToRemove + 1].sender === 'ai') {
        newMsgs.splice(indexToRemove, 2);
      } else {
        newMsgs.splice(indexToRemove, 1);
      }
      return newMsgs;
    });
  };

  const handleSpeak = (text, idx) => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/\|/g, ' ')
      .replace(/[\u1000-\uFFFF]+/g, '')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '$1')
      .replace(/[\*\_\`\~\-\+\#\=\>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  // ── Check for initial search prompt from SelectedWorks on mount / navigation ──
  useEffect(() => {
    const checkInitialPrompt = () => {
      const initialPrompt = localStorage.getItem('shopbot_initial_prompt');
      if (initialPrompt) {
        localStorage.removeItem('shopbot_initial_prompt');
        setTimeout(() => {
          handleSend(initialPrompt);
        }, 300);
      }
    };
    checkInitialPrompt();
    window.addEventListener('navigate', checkInitialPrompt);
    return () => window.removeEventListener('navigate', checkInitialPrompt);
  }, []);

  // ── Download sanction PDF ─────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!applicationId) return;
    try {
      // First generate sanction
      const genRes = await authFetch(`${API_BASE}/loan/generate-sanction`, {
        method: 'POST',
        body: JSON.stringify({ applicationId }),
      });
      const genData = await genRes.json();
      if (genData.success) {
        window.open(`http://localhost:3001${genData.downloadUrl}`, '_blank');
      }
    } catch {
      alert('Could not generate sanction letter. Please try again.');
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await authFetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch { }
    localStorage.removeItem('tc_access_token');
    localStorage.removeItem('tc_refresh_token');
    localStorage.removeItem('tc_user');
    setUser(null);
    setToken(null);
    setMessages([]);
    setSessionId(null);
    setCurrentStage('GREET');
  };

  const isChatStarted = messages.length > 0;

  return (
    <div className="w-full min-h-screen bg-black text-white relative flex flex-col items-center justify-between font-body overflow-hidden select-text">

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onAuth={handleAuth}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Product Comparison Modal */}
      <AnimatePresence>
        {selectedCompareProduct && (
          <ProductComparison
            product={selectedCompareProduct.product}
            allProducts={selectedCompareProduct.allProducts}
            onClose={() => setSelectedCompareProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* Background HLS Video Container */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          className="absolute min-w-full min-h-full object-cover left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-role-fade-in"
        />
        <div
          className="absolute inset-0 transition-colors duration-1000 z-10"
          style={{ backgroundColor: isChatStarted ? 'rgba(0, 0, 0, 0.78)' : 'rgba(0, 0, 0, 0.42)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent z-20" />
      </div>

      {/* User Badge (top-right) */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 right-6 z-30 flex items-center gap-2"
        >
          <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-700/50 backdrop-blur-md rounded-2xl px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <span className="text-black text-[10px] font-bold">{user.name?.[0]?.toUpperCase()}</span>
            </div>
            <span className="text-zinc-300 text-xs font-medium">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 text-[10px] ml-1 transition-colors"
            >
              Logout
            </button>
          </div>
        </motion.div>
      )}

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 right-6 z-30"
        >
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl px-3 py-1.5 text-white text-xs font-medium hover:bg-white/20 transition-colors"
          >
            🔒 Sign In
          </button>
        </motion.div>
      )}

      {/* Main Container */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center items-center px-6 z-10 pt-28 pb-8 relative min-h-0">

        <AnimatePresence mode="popLayout">
          {!isChatStarted ? (
            /* Layout A: Hero Landing Mode */
            <motion.div
              key="hero-layout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center w-full"
            >
              <p className="text-[10px] sm:text-xs text-muted uppercase tracking-[0.3em] mb-6 font-semibold">
                SHOPBOT · AI SHOPPING ASSISTANT
              </p>

              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-6">
                ShopBot AI
              </h1>

              <div className="text-lg sm:text-2xl md:text-3xl text-muted font-body mb-6 flex items-center justify-center gap-2">
                <span>Your Smart</span>
                <span className="font-display italic text-text-primary inline-block min-w-[180px] text-left">
                  <span key={roleIndex} className="animate-role-fade-in inline-block">
                    {ROLES[roleIndex]}
                  </span>
                </span>
                <span>Advisor</span>
              </div>

              <p className="text-sm md:text-base text-muted max-w-md mb-10 font-light leading-relaxed">
                Experience next-gen AI shopping. We compare prices across Flipkart, Amazon, Croma, Reliance Digital & Vijay Sales in real-time with AI-driven scoring & hardware spec analysis.
              </p>

              {/* Centered Search Input Box */}
              <div className="w-full flex justify-center">
                <ChatSearchInput onSend={handleSend} credits={credits} />
              </div>

              {/* Quick action chips */}
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {[
                  'Best coding laptop under ₹50,000 with good battery',
                  'Compare iPhone 15 vs Samsung S24 for photography',
                  'Suggest 4K Smart TVs under ₹40,000 with Dolby Vision',
                  'Top gaming headphones under ₹5,000',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-xs text-zinc-400 border border-zinc-700/60 hover:border-zinc-500 hover:text-white bg-zinc-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Layout B: Active Chat Session Mode */
            <motion.div
              key="chat-layout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full flex-1 flex flex-col h-[70vh] min-h-0 border border-zinc-800/40 bg-zinc-950/40 backdrop-blur-lg rounded-[2rem] p-6 shadow-2xl"
            >
              {/* Stage banner */}
              <LoanStatusBanner
                stage={currentStage}
                applicationId={applicationId}
                onDownloadPDF={handleDownloadPDF}
              />


              {/* Guest sign-in nudge banner */}
              <AnimatePresence>
                {showSignInNudge && !user && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.35 }}
                    className="flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-950/80 to-zinc-900/80 border border-indigo-500/30 rounded-2xl px-4 py-3 mb-3 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-indigo-400 text-base flex-shrink-0">💾</span>
                      <p className="text-xs text-zinc-300 leading-snug">
                        <span className="font-semibold text-white">Sign in to save your conversation</span> and pick up right where you left off.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="text-[11px] font-semibold bg-white text-black px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors whitespace-nowrap"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setShowSignInNudge(false)}
                        className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors px-1"
                        aria-label="Dismiss"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scrollable Conversation Feed */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6 no-scrollbar pb-6 select-text">
                {messages.map((msg, idx) => (
                  <div key={idx} className="flex flex-col gap-2 w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                        }`}
                    >
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border flex-shrink-0 ${msg.sender === 'user'
                        ? 'bg-zinc-800 border-zinc-700 text-white text-xs font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-white font-display italic text-base'
                        }`}>
                        {msg.sender === 'user' ? (user?.name?.[0]?.toUpperCase() || 'G') : 'SB'}
                      </div>

                      {/* Message bubble */}
                      <div className={`group p-5 rounded-3xl text-sm leading-relaxed w-full ${msg.sender === 'user'
                        ? 'bg-white text-black font-medium rounded-tr-sm shadow-lg'
                        : 'bg-zinc-950/80 text-zinc-200 border border-zinc-800/80 rounded-tl-sm font-light backdrop-blur-xl shadow-2xl'
                        }`}>
                        {msg.sender === 'user' ? (
                          editingIdx === idx ? (
                            <div className="flex flex-col gap-3 w-full">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-zinc-900 text-white p-3 rounded-xl border border-zinc-700 text-sm focus:outline-none focus:border-white resize-none"
                                rows={3}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingIdx(null)}
                                  className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    const updatedText = editText.trim();
                                    if (!updatedText) return;
                                    setEditingIdx(null);
                                    setMessages((prev) => prev.slice(0, idx));
                                    handleSend(updatedText);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 text-xs transition-colors shadow cursor-pointer"
                                >
                                  Save & Resend
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1 relative">
                              <div>{msg.text}</div>
                              <div className="flex justify-end items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-zinc-400">
                                <button
                                  onClick={() => {
                                    setEditingIdx(idx);
                                    setEditText(msg.text.replace(/\n\n📎 \*\*\[Attachment: .*\]\*\*/g, ''));
                                  }}
                                  title="Edit message"
                                  className="p-1 hover:text-white hover:bg-zinc-700/50 rounded transition-colors cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(idx)}
                                  title="Delete message"
                                  className="p-1 hover:text-red-400 hover:bg-zinc-700/50 rounded transition-colors cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2.5 0 0116.138 21H7.862a2.5 2.5 0 01-2.495-1.858L4 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )
                        ) : (
                          <ReactMarkdown
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-display italic text-white mt-4 mb-2 font-normal" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-display italic text-white mt-3 mb-1.5 font-normal" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-xs font-semibold text-zinc-300 mt-3 mb-1 uppercase tracking-widest font-body" {...props} />,
                              p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed text-zinc-300 font-light" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1.5 text-zinc-300 font-light" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1.5 text-zinc-300 font-light" {...props} />,
                              li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                              a: ({node, ...props}) => <a className="text-white underline underline-offset-4 hover:text-zinc-300 inline-flex items-center gap-1 font-medium transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                              table: ({node, ...props}) => <div className="overflow-x-auto my-3"><table className="w-full text-left text-xs border border-zinc-800 rounded-lg" {...props} /></div>,
                              th: ({node, ...props}) => <th className="bg-zinc-900 p-3 border-b border-zinc-800 text-white font-semibold" {...props} />,
                              td: ({node, ...props}) => <td className="p-3 border-b border-zinc-800/60 text-zinc-300" {...props} />
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        )}
                        {msg.sender === 'ai' && (
                          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                            <div className="flex items-center gap-2">
                              {msg.agentType && (
                                <span className="text-[10px] uppercase tracking-widest text-muted">
                                  {msg.agentType.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleSpeak(msg.text, idx)}
                              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-body"
                            >
                              {speakingIdx === idx ? (
                                <><span>🔇</span> Stop Listening</>
                              ) : (
                                <><span>🔊</span> Listen to Results</>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Render Rich Product Comparison Cards if available */}
                    {msg.sender === 'ai' && msg.products && msg.products.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full max-w-[95%] self-start sm:pl-13 pr-2 flex flex-col gap-6 mt-2"
                      >
                        <div className="flex flex-col gap-1 border-b border-zinc-800/80 pb-3 mb-1">
                          <h3 className="font-display italic text-2xl sm:text-3xl text-white font-normal">
                            Curated Selection
                          </h3>
                          <p className="text-xs text-muted font-light">
                            Handpicked recommendations matching your exact criteria {msg.category ? `for ${msg.category}` : ''} {msg.budget ? `· Budget: ₹${msg.budget.toLocaleString('en-IN')}` : ''}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                          {msg.products.map((prod, pIdx) => (
                            <ProductCard
                              key={prod.id || prod.productId || prod.asin || prod.sku || (`prod-${pIdx}-${(prod.title || '').slice(0, 30).replace(/\s+/g, '-')}`)}
                              product={prod}
                              index={pIdx}
                              allProducts={msg.products}
                              onCompare={(selectedProd, allProds) => setSelectedCompareProduct({ product: selectedProd, allProducts: allProds || msg.products })}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}

                {/* AI Typing Loader & Cancel Button */}
                {isTyping && (
                  <div className="flex flex-col gap-3 max-w-[85%] self-start">
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center font-display italic text-base flex-shrink-0">
                        SB
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800/60 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                        {[1, 2, 3].map((dot) => (
                          <motion.span
                            key={dot}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: dot * 0.15 }}
                            className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleCancelGeneration}
                      className="self-start ml-13 px-3.5 py-1.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-medium flex items-center gap-1.5 transition-all shadow"
                    >
                      <span>⏹</span> Stop Generation
                    </button>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Bottom Sticky Search Input */}
              <div className="w-full border-t border-zinc-800/40 pt-4 flex justify-center mt-auto">
                <ChatSearchInput onSend={handleSend} credits={credits} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full z-10 py-5 text-center text-[10px] text-zinc-600 tracking-wider uppercase font-body border-t border-zinc-900 bg-black/40">
        © 2026 ShopBot AI · Powered by Gemini 2-Pass, SerpAPI & ScrapingDog Multi-Store Engine
      </footer>
    </div>
  );
}
