import { useState, useEffect } from 'react';

export default function Navbar({ currentPath }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

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
      </div>
    </nav>
  );
}
