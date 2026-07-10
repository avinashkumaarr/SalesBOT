import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Hls from 'hls.js';
import ChatSearchInput from './ChatSearchInput';

const ROLES = ["Amazon & Flipkart", "Croma & Reliance", "Price Drop Alert", "AI Score 9.8/10"];
const VIDEO_URL = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";

export default function Hero() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [roleIndex, setRoleIndex] = useState(0);

  const handleLaunchShopBot = (prompt) => {
    if (prompt) localStorage.setItem('shopbot_initial_prompt', prompt);
    window.history.pushState({}, '', '/chatbot');
    window.dispatchEvent(new Event('navigate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Roles Cycling (every 2s)
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 2. GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.name-reveal', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 1.2, delay: 0.1, ease: 'power3.out' }
      );
      
      gsap.fromTo('.blur-in', 
        { opacity: 0, filter: 'blur(10px)', y: 20 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.0, stagger: 0.1, delay: 0.3, ease: 'power3.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // 3. HLS Video Setup
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
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full min-h-screen bg-bg flex flex-col justify-center items-center overflow-hidden px-6 text-center"
    >
      {/* Background Video Container */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          className="absolute min-w-full min-h-full object-cover left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        {/* Bottom fade to page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent z-20" />
      </div>

      {/* Hero Content (z-10) */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Name */}
        <h1 className="name-reveal text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-6">
          ShopBot AI
        </h1>

        {/* Role line */}
        <div className="blur-in text-lg sm:text-2xl md:text-3xl text-muted font-body mb-6 flex items-center justify-center gap-2 flex-wrap">
          <span>Searching</span>
          <span className="font-display italic text-text-primary inline-block min-w-[200px] sm:min-w-[260px] text-center sm:text-left">
            <span key={roleIndex} className="animate-role-fade-in inline-block">
              {ROLES[roleIndex]}
            </span>
          </span>
          <span>across 50+ stores.</span>
        </div>

        {/* Description */}
        <p className="blur-in text-sm md:text-base text-muted max-w-lg mb-10 font-light leading-relaxed">
          India's most intelligent e-commerce shopping assistant. Compare live prices, enforce strict budgets, analyze specs with Gemini AI, and speak your searches instantly.
        </p>

        {/* CTA Buttons */}
        <div className="blur-in flex flex-col sm:flex-row gap-4 items-center justify-center">
          {/* Explore Categories */}
          <button
            onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
            className="relative group p-[1.5px] rounded-full hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-text-primary group-hover:accent-gradient transition-all duration-300" />
            <div className="relative px-8 py-3.5 rounded-full bg-text-primary group-hover:bg-bg text-bg group-hover:text-text-primary transition-colors duration-300 text-sm font-semibold">
              Explore Categories
            </div>
          </button>

          {/* Launch AI Chatbot */}
          <button
            onClick={() => {
              window.history.pushState({}, '', '/chatbot');
              window.dispatchEvent(new Event('navigate'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="relative group p-[1.5px] rounded-full hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-stroke group-hover:accent-gradient transition-all duration-300" />
            <div className="relative px-8 py-3.5 rounded-full bg-bg text-text-primary text-sm font-semibold transition-all duration-300 flex items-center gap-2">
              <span>⚡</span> Launch AI Assistant ↗
            </div>
          </button>

          {/* Download APK / App */}
          <a
            href="/SalesBOT.apk"
            download="SalesBOT.apk"
            className="relative group p-[1.5px] rounded-full hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center shadow-lg shadow-emerald-500/10"
            title="Download SalesBOT APK for Android & iOS"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 opacity-80 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
            <div className="relative px-8 py-3.5 rounded-full bg-zinc-950 text-emerald-400 group-hover:text-white text-sm font-bold transition-all duration-300 flex items-center gap-2">
              <span>📱</span> Download APK / App ↗
            </div>
          </a>
        </div>
      </div>

      {/* Scroll Indicator (Desktop only) */}
      <div className="hidden sm:flex flex-col items-center gap-2 absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <span className="text-[9px] text-muted uppercase tracking-[0.25em] font-body">Scroll</span>
        <div className="w-[1px] h-10 bg-stroke/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 accent-gradient animate-scroll-down" />
        </div>
      </div>

      {/* Fixed Bottom Prompt Section for Mobile Viewports (< sm) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/98 border-t border-zinc-800/90 px-3 pt-2 pb-1 backdrop-blur-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)] flex flex-col items-center">
        <ChatSearchInput onSend={handleLaunchShopBot} placeholder="Ask ShopBot AI anything..." />
        <div className="w-full py-1 text-center text-[9px] text-zinc-600 tracking-wider uppercase font-body truncate px-1">
          © 2026 ShopBot AI · Powered by Gemini 2-Pass, SerpAPI & ScrapingDog Multi-Store Engine
        </div>
      </div>
    </section>
  );
}
