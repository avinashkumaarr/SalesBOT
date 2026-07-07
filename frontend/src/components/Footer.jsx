import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Hls from 'hls.js';

const VIDEO_URL = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";

export default function Footer() {
  const videoRef = useRef(null);
  const marqueeRef = useRef(null);

  // 1. GSAP Infinite Marquee
  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    gsap.to(marquee, {
      xPercent: -50,
      duration: 40,
      ease: "none",
      repeat: -1
    });
  }, []);

  // 2. HLS Video Setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(VIDEO_URL);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(err => console.log("HLS Play prevented: ", err));
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS fallback (Safari)
      video.src = VIDEO_URL;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(err => console.log("Native HLS Play prevented: ", err));
      });
    }
  }, []);

  return (
    <footer className="relative w-full pt-20 pb-8 md:pb-12 bg-bg overflow-hidden px-6">
      
      {/* Background Video Container */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          className="absolute min-w-full min-h-full object-cover left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-y-[-1]"
        />
        {/* Dark overlay (heavier than hero) */}
        <div className="absolute inset-0 bg-black/60 z-10" />
      </div>

      {/* GSAP Marquee (z-10) */}
      <div className="w-full overflow-hidden whitespace-nowrap mb-16 relative z-10 border-t border-b border-stroke/20 py-4 sm:py-6 bg-black/10">
        <div
          ref={marqueeRef}
          className="flex whitespace-nowrap text-5xl sm:text-7xl md:text-9xl font-display italic tracking-wider text-text-primary/10 uppercase w-max"
        >
          <span>{Array(10).fill("SHOP SMARTER WITH AI • GUARANTEED LOWEST PRICES • INSTANT MULTI-STORE COMPARISON • ").join("")}</span>
          <span>{Array(10).fill("SHOP SMARTER WITH AI • GUARANTEED LOWEST PRICES • INSTANT MULTI-STORE COMPARISON • ").join("")}</span>
        </div>
      </div>

      {/* CTA Center Content */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center mb-16">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-body text-text-primary tracking-tight font-medium mb-8">
          Ready to find your <span className="font-display italic text-text-primary/95">perfect deal?</span>
        </h3>
        
        {/* Launch button */}
        <button
          onClick={() => {
            window.history.pushState({}, '', '/chatbot');
            window.dispatchEvent(new Event('navigate'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="relative group p-[1.5px] rounded-full hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center inline-block shadow-xl shadow-cyan-500/10"
        >
          <div className="absolute inset-0 bg-stroke group-hover:accent-gradient transition-all duration-300" />
          <div className="relative px-8 sm:px-12 py-4 sm:py-5 rounded-full bg-bg text-text-primary text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 flex items-center gap-2">
            <span>⚡</span> Launch ShopBot AI Assistant ↗
          </div>
        </button>
      </div>

      {/* Footer Bar */}
      <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between border-t border-stroke/40 pt-8 mt-12 gap-6">
        
        {/* Available Pulse Status */}
        <div className="flex items-center gap-2.5 bg-surface/50 border border-stroke/60 px-4 py-2 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[10px] sm:text-xs text-muted uppercase tracking-[0.15em] font-semibold font-body">
            AI Brain Online & Searching
          </span>
        </div>

        {/* Social / Store Links */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-xs sm:text-sm text-muted font-body">
          {["Amazon", "Flipkart", "Croma", "Reliance", "Tata CliQ"].map((link) => (
            <span
              key={link}
              className="hover:text-cyan-400 transition-colors duration-200 cursor-default font-medium"
            >
              {link}
            </span>
          ))}
        </div>

        {/* Copyright */}
        <span className="text-[10px] sm:text-xs text-muted/50 font-body">
          © 2026 ShopBot AI Inc. Built for Indian E-Commerce.
        </span>
      </div>

    </footer>
  );
}
