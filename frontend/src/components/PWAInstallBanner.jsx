import { useState, useEffect } from 'react';

/**
 * PWAInstallBanner
 * - On iOS Safari: shows a persistent "Add to Home Screen" instruction banner
 * - On Android/Chrome: shows a native beforeinstallprompt banner
 * - Hidden when already running as a standalone PWA (already installed)
 */
export default function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already running as standalone PWA (installed)
    const isStandalone =
      window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // Don't show if user dismissed in this session
    if (sessionStorage.getItem('pwa_banner_dismissed')) return;

    const ua = navigator.userAgent || '';
    const ios = /iPhone|iPad|iPod/i.test(ua);
    const android = /Android/i.test(ua);

    if (ios) {
      // iOS Safari — show manual "Add to Home Screen" instructions
      // Only show in Safari (not Chrome iOS, Firefox iOS, etc.)
      const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
      if (isSafari) {
        setIsIOS(true);
        setShow(true);
      }
    } else if (android) {
      // Android Chrome — listen for native install prompt
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShow(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    sessionStorage.setItem('pwa_banner_dismissed', '1');
  };

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  if (!show || dismissed) return null;

  // ── iOS Banner ────────────────────────────────────────────────────────────
  if (isIOS) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
          borderTop: '1px solid rgba(16,185,129,0.3)',
          padding: '14px 16px',
          paddingBottom: 'env(safe-area-inset-bottom, 14px)',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', maxWidth: '480px', margin: '0 auto' }}>
          {/* App Icon */}
          <img
            src="/apple-touch-icon.png"
            width="48"
            height="48"
            alt="SalesBOT"
            style={{ borderRadius: '12px', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>
                📲 Install SalesBOT
              </span>
              <button
                onClick={handleDismiss}
                style={{
                  background: 'none', border: 'none', color: '#71717a',
                  fontSize: '18px', cursor: 'pointer', padding: '0 4px', lineHeight: 1,
                }}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
            <p style={{ color: '#a1a1aa', fontSize: '11px', margin: '0 0 8px', lineHeight: 1.5 }}>
              Tap{' '}
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '2px',
                  color: '#fff', fontWeight: 600, background: '#27272a',
                  border: '1px solid #3f3f46', borderRadius: '6px',
                  padding: '1px 6px', fontSize: '11px',
                }}
              >
                ⎙ Share
              </span>
              {' '}then{' '}
              <strong style={{ color: '#10b981' }}>"Add to Home Screen"</strong>
              {' '}to install — full screen, no browser bar!
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href="/download.html"
                style={{
                  background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                  color: '#000', fontWeight: 700, fontSize: '11px',
                  borderRadius: '50px', padding: '6px 14px',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px',
                }}
              >
                📋 See full guide
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Android / Chrome Banner ───────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
        borderTop: '1px solid rgba(16,185,129,0.3)',
        padding: '14px 16px',
        paddingBottom: 'env(safe-area-inset-bottom, 14px)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '480px', margin: '0 auto' }}>
        <img
          src="/icon-192.png"
          width="48"
          height="48"
          alt="SalesBOT"
          style={{ borderRadius: '12px', flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>
            Install SalesBOT App
          </div>
          <div style={{ color: '#a1a1aa', fontSize: '11px' }}>
            Add to home screen for the best experience
          </div>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none', border: 'none', color: '#71717a',
            fontSize: '20px', cursor: 'pointer', padding: '0 4px', flexShrink: 0,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
        <button
          onClick={handleAndroidInstall}
          style={{
            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
            color: '#000', fontWeight: 700, fontSize: '12px',
            borderRadius: '50px', padding: '8px 16px',
            border: 'none', cursor: 'pointer', flexShrink: 0,
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
}
