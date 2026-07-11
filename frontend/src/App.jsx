import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SelectedWorks from './components/SelectedWorks';
import Journal from './components/Journal';
import Explorations from './components/Explorations';
import Stats from './components/Stats';
import Footer from './components/Footer';
import ChatbotPage from './components/ChatbotPage';
import PlansSection from './components/PlansSection';
import PWAInstallBanner from './components/PWAInstallBanner';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('navigate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('navigate', handleLocationChange);
    };
  }, []);

  return (
    <>
      {/* Loading Screen Overlay */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999]"
          >
            <LoadingScreen onComplete={() => setIsLoading(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      {!isLoading && (
        <div className="w-full min-h-screen bg-bg relative">
          {/* Global Floating Navbar */}
          <Navbar currentPath={currentPath} />

          <AnimatePresence mode="wait">
            {currentPath === '/chatbot' ? (
              <motion.div
                key="chatbot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ChatbotPage />
              </motion.div>
            ) : (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <main>
                  <Hero />
                  <SelectedWorks />
                  <Journal />
                  <Explorations />
                  <PlansSection />
                  <Stats />
                </main>
                <Footer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* PWA Install Banner — shown to iOS Safari & Android Chrome users who haven't installed yet */}
      {!isLoading && <PWAInstallBanner />}
    </>
  );
}

export default App;
