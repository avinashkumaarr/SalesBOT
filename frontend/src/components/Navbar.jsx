import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';
import { API_BASE } from '../utils/apiConfig';

export default function Navbar({ currentPath }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync active tab with route path
  useEffect(() => {
    if (currentPath === '/chatbot') {
      setActiveTab('ShopBot AI');
    } else {
      setActiveTab('Home');
    }
  }, [currentPath]);

  // Sync authentication state across tabs & pages
  useEffect(() => {
    const syncAuth = () => {
      const savedUser = localStorage.getItem('tc_user');
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch(e) { setUser(null); }
      } else {
        setUser(null);
      }
    };
    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('auth_change', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth_change', syncAuth);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('tc_access_token');
      if (token) {
        fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem('tc_access_token');
      localStorage.removeItem('tc_refresh_token');
      localStorage.removeItem('tc_user');
      setUser(null);
      window.dispatchEvent(new Event('auth_change'));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const scrollToElement = (target) => {
    const attemptScroll = (retries = 30, delay = 50) => {
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const el = document.getElementById(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 200);
        setTimeout(() => {
          const el = document.getElementById(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 500);
        setTimeout(() => {
          const el = document.getElementById(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 800);
      } else if (retries > 0) {
        setTimeout(() => attemptScroll(retries - 1, delay), delay);
      }
    };
    attemptScroll();
  };

  const handleNavClick = (tabName, target) => {
    if (tabName === 'ShopBot AI' || tabName === 'Sales Bot') {
      window.history.pushState({}, '', '/chatbot');
      window.dispatchEvent(new Event('navigate'));
      return;
    }

    setActiveTab(tabName);

    // If not on Home page, navigate to Home first
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('navigate'));
    }

    // Scroll with automatic retry while page transition completes
    scrollToElement(target);
  };

  const handleLogoClick = () => {
    if (window.location.pathname === '/chatbot') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('navigate'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
      <div
        className={`inline-flex items-center rounded-full border border-white/10 bg-surface px-3 py-2 transition-all duration-300 backdrop-blur-md ${
          isScrolled ? 'shadow-md shadow-black/30 bg-surface/90' : ''
        }`}
      >
        {/* 1. Nav links */}
        <div className="flex items-center gap-1">
          {[
            { name: 'Home', target: 'hero' },
            { name: 'Categories', target: 'work' },
            { name: 'ShopBot AI', target: '/chatbot' }
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleNavClick(tab.name, tab.target)}
              className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 font-medium cursor-pointer transition-all duration-200 ${
                activeTab === tab.name
                  ? 'text-text-primary bg-stroke/50'
                  : 'text-muted hover:text-text-primary hover:bg-stroke/30'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* 4. Divider */}
        <div className="w-px h-5 bg-stroke mx-2" />

        {/* 5. Subscription / Plans button */}
        <button
          onClick={() => handleNavClick('Plans', 'plans')}
          className="relative p-[1px] rounded-full overflow-hidden group/sayhi cursor-pointer flex items-center justify-center"
        >
          {/* Accent gradient behind on hover */}
          <div className="absolute inset-[-2px] accent-gradient opacity-0 group-hover/sayhi:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-surface/90 backdrop-blur-md text-muted group-hover/sayhi:text-text-primary transition-colors duration-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1 text-xs sm:text-sm font-medium">
            Plans <span className="font-sans text-[10px] sm:text-xs">↓</span>
          </div>
        </button>

        {/* 6. Divider */}
        <div className="w-px h-5 bg-stroke mx-2 hidden sm:block" />

        {/* 7. Download APK button */}
        <a
          href="/SalesBOT.apk"
          download="SalesBOT.apk"
          className="relative p-[1px] rounded-full overflow-hidden group/apk cursor-pointer flex items-center justify-center hidden sm:flex shadow-md shadow-emerald-500/10"
          title="Download SalesBOT APK for Android & iOS"
        >
          <div className="absolute inset-[-2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 opacity-70 group-hover/apk:opacity-100 transition-opacity duration-300 animate-pulse" />
          <div className="relative bg-surface/95 backdrop-blur-md text-emerald-400 group-hover/apk:text-white transition-colors duration-300 rounded-full px-3.5 py-1.5 sm:py-2 flex items-center gap-1.5 text-xs sm:text-sm font-semibold">
            <span>📱</span> Download APK
          </div>
        </a>

        {/* 8. Auth / Profile Pill */}
        <div className="w-px h-5 bg-stroke mx-2" />
        {user ? (
          <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 backdrop-blur-md rounded-full px-3 py-1 sm:py-1.5 transition-all">
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <span className="text-black text-[10px] font-bold">{user.name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <span className="text-text-primary text-xs font-medium max-w-[70px] sm:max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
            <button
              onClick={handleLogout}
              className="text-muted hover:text-red-400 text-[11px] ml-0.5 transition-colors cursor-pointer"
              title="Logout"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1.5 bg-white text-black font-semibold rounded-full px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-zinc-200 transition-colors cursor-pointer shadow-md"
          >
            🔒 Sign In
          </button>
        )}
      </div>

      {/* Global Auth Modal Triggered from Navbar */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onAuth={(u) => {
              setUser(u);
              setShowAuthModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </nav>
  );
}
