import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import { API_BASE } from '../utils/apiConfig';

function getDeviceOS() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

export default function Navbar({ currentPath }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-3 sm:pt-4 md:pt-6 px-2 sm:px-4">
      <div
        className={`inline-flex items-center rounded-full border border-white/10 bg-surface px-1.5 sm:px-3 py-1 sm:py-2 transition-all duration-300 backdrop-blur-md max-w-[96vw] overflow-x-auto no-scrollbar sm:overflow-visible ${
          isScrolled ? 'shadow-md shadow-black/30 bg-surface/90' : ''
        }`}
      >
        {/* 1. Nav links */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {[
            { name: 'Home', labelMobile: 'Home', target: 'hero', hideMobile: false },
            { name: 'Categories', labelMobile: 'Shop', target: 'work', hideMobile: true },
            { name: 'ShopBot AI', labelMobile: 'AI Chat', target: '/chatbot', hideMobile: false }
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleNavClick(tab.name, tab.target)}
              className={`text-[11px] sm:text-xs md:text-sm rounded-full px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 font-medium cursor-pointer transition-all duration-200 whitespace-nowrap ${
                tab.hideMobile ? 'hidden sm:inline-flex' : 'inline-flex'
              } ${
                activeTab === tab.name
                  ? 'text-text-primary bg-stroke/50'
                  : 'text-muted hover:text-text-primary hover:bg-stroke/30'
              }`}
            >
              <span className="sm:hidden">{tab.labelMobile}</span>
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* 4. Divider */}
        <div className="w-px h-4 sm:h-5 bg-stroke mx-1 sm:mx-2 shrink-0" />

        {/* 5. Subscription / Plans button */}
        <button
          onClick={() => handleNavClick('Plans', 'plans')}
          className="relative p-[1px] rounded-full overflow-hidden group/sayhi cursor-pointer flex items-center justify-center shrink-0"
        >
          {/* Accent gradient behind on hover */}
          <div className="absolute inset-[-2px] accent-gradient opacity-0 group-hover/sayhi:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-surface/90 backdrop-blur-md text-muted group-hover/sayhi:text-text-primary transition-colors duration-300 rounded-full px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 flex items-center gap-1 text-[11px] sm:text-xs md:text-sm font-medium whitespace-nowrap">
            Plans <span className="font-sans text-[9px] sm:text-[10px] md:text-xs">↓</span>
          </div>
        </button>

        {/* 6. Divider */}
        <div className="w-px h-5 bg-stroke mx-2 hidden sm:block shrink-0" />

        {/* 7. Download button — links to /download.html which handles OS detection */}
        <a
          href="/download.html"
          className="relative p-[1px] rounded-full overflow-hidden group/apk cursor-pointer flex items-center justify-center hidden sm:flex shadow-md shadow-emerald-500/10 shrink-0"
          title="Download SalesBOT App"
        >
          <div className="absolute inset-[-2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 opacity-70 group-hover/apk:opacity-100 transition-opacity duration-300 animate-pulse" />
          <div className="relative bg-surface/95 backdrop-blur-md text-emerald-400 group-hover/apk:text-white transition-colors duration-300 rounded-full px-3.5 py-1.5 sm:py-2 flex items-center gap-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap">
            <span>📱</span> Download App
          </div>
        </a>

        {/* 8. Auth / Profile Pill */}
        <div className="w-px h-4 sm:h-5 bg-stroke mx-1 sm:mx-2 shrink-0" />
        {user ? (
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-1 sm:gap-2 bg-white/5 hover:bg-white/10 border border-white/15 backdrop-blur-md rounded-full p-1 sm:px-3.5 sm:py-1 md:py-1.5 transition-all cursor-pointer group/profile shadow-sm shrink-0"
            title="Click to view profile details & logout"
          >
            <div className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 p-[1px] flex items-center justify-center shadow-sm group-hover/profile:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] sm:text-[10px] font-bold">{user.name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
            </div>
            <span className="hidden sm:inline text-text-primary text-[11px] sm:text-xs md:text-sm font-medium max-w-[55px] sm:max-w-[90px] md:max-w-[130px] truncate">{user.name?.split(' ')[0]}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center justify-center gap-1 sm:gap-1.5 bg-white text-black font-semibold rounded-full w-7 h-7 sm:w-auto sm:h-auto sm:px-3.5 sm:py-1.5 md:py-2 text-xs sm:text-xs md:text-sm hover:bg-zinc-200 transition-colors cursor-pointer shadow-md shrink-0 whitespace-nowrap"
            title="Sign In"
          >
            <span className="sm:hidden text-xs">🔒</span>
            <span className="hidden sm:inline">🔒 Sign In</span>
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
        {showProfileModal && (
          <ProfileModal
            user={user}
            onClose={() => setShowProfileModal(false)}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </nav>
  );
}
