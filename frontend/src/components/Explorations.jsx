import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  { 
    id: 1, 
    title: "AI Coding Laptops", 
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80", 
    rotation: "rotate-[3deg]",
    prompt: "Best coding laptops under 40000 with 16GB RAM and good battery",
    desc: "Compare Ryzen 5 & Core i5 laptops optimized for development and Android Studio."
  },
  { 
    id: 2, 
    title: "5G Camera Mobiles", 
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80", 
    rotation: "rotate-[-2deg]",
    prompt: "Best 5G smartphones under 25000 with camera and good battery",
    desc: "120Hz AMOLED displays and 108MP camera sensors with instant bank discounts."
  },
  { 
    id: 3, 
    title: "ANC Earbuds & Watches", 
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80", 
    rotation: "rotate-[4deg]",
    prompt: "Best ANC earbuds and smartwatches under 5000",
    desc: "Active Noise Cancelling TWS earbuds and fitness smartwatches with AMOLED screens."
  },
  { 
    id: 4, 
    title: "4K OLED Smart TVs", 
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1000&q=80", 
    rotation: "rotate-[-3deg]",
    prompt: "Best 4K Smart TVs under 40000 with Dolby Atmos",
    desc: "Dolby Vision & Dolby Atmos home theater setups at the lowest online prices."
  },
  { 
    id: 5, 
    title: "Gaming Workstations", 
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1000&q=80", 
    rotation: "rotate-[2deg]",
    prompt: "Best gaming PCs and monitors under 60000",
    desc: "High-FPS gaming rigs, dual curved monitors, and RGB mechanical keyboards."
  },
  { 
    id: 6, 
    title: "Smart Home & IoT", 
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1000&q=80", 
    rotation: "rotate-[-4deg]",
    prompt: "Best smart speakers and home automation devices under 5000",
    desc: "Voice-controlled AI speakers and automated smart lighting systems."
  },
];

export default function Explorations() {
  const containerRef = useRef(null);
  const col1Ref = useRef(null);
  const col2Ref = useRef(null);
  const [activeImage, setActiveImage] = useState(null);

  const handleLaunchShopBot = (prompt) => {
    localStorage.setItem('shopbot_initial_prompt', prompt);
    window.history.pushState({}, '', '/chatbot');
    window.dispatchEvent(new Event('navigate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Column 1 Parallax (Left)
      gsap.fromTo(col1Ref.current,
        { y: 0 },
        {
          y: -150,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          }
        }
      );

      // 2. Column 2 Parallax (Right)
      gsap.fromTo(col2Ref.current,
        { y: 100 },
        {
          y: -400,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="explorations"
      ref={containerRef}
      className="relative w-full min-h-[200vh] md:min-h-[250vh] bg-bg flex flex-col justify-start"
    >
      {/* Sticky Pinned Center Content */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center text-center z-10 pointer-events-none px-6">
        <div className="flex flex-col items-center max-w-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-px bg-stroke" />
            <span className="text-[10px] sm:text-xs text-muted uppercase tracking-[0.3em] font-semibold font-body">
              ShopBot AI Gallery
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-body text-text-primary tracking-tight font-medium mb-4">
            Live Product <span className="font-display italic text-text-primary/95">Showcase</span>
          </h2>
          <p className="text-muted text-sm sm:text-base max-w-sm mb-8 font-light leading-relaxed">
            An interactive visual archive of top-rated consumer tech, gaming workstations, and AI devices. Click any card to compare!
          </p>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/chatbot');
              window.dispatchEvent(new Event('navigate'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="relative group p-[1px] rounded-full overflow-hidden cursor-pointer pointer-events-auto inline-block"
          >
            <div className="absolute inset-0 bg-stroke group-hover:accent-gradient transition-all duration-300" />
            <div className="relative px-6 py-2.5 rounded-full bg-surface text-muted group-hover:text-text-primary text-xs sm:text-sm font-semibold transition-colors duration-300 flex items-center gap-2">
              Launch ShopBot AI <span className="font-sans text-xs">↗</span>
            </div>
          </button>
        </div>
      </div>

      {/* Parallax Floating Columns */}
      <div className="relative w-full max-w-[1200px] mx-auto px-6 md:px-10 z-20 grid grid-cols-2 gap-8 md:gap-24 -mt-[80vh] pb-32">
        
        {/* Column 1 (Left side) */}
        <div ref={col1Ref} className="flex flex-col gap-12 md:gap-24 pt-24">
          {ITEMS.filter((_, idx) => idx % 2 === 0).map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item)}
              className={`relative aspect-square max-w-[320px] bg-surface border border-stroke rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer group shadow-lg ${item.rotation} hover:rotate-0 hover:scale-105 hover:border-white/20 transition-all duration-500 ease-out`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 halftone-overlay opacity-10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5 opacity-80 group-hover:opacity-100 transition-opacity">
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-zinc-300 mt-1 line-clamp-2">
                  {item.desc}
                </p>
                <span className="text-[10px] text-cyan-400 mt-2 font-semibold tracking-wide">
                  ⚡ Click to view & compare
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Column 2 (Right side) */}
        <div ref={col2Ref} className="flex flex-col gap-12 md:gap-24">
          {ITEMS.filter((_, idx) => idx % 2 !== 0).map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item)}
              className={`relative aspect-square max-w-[320px] bg-surface border border-stroke rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer group shadow-lg ${item.rotation} hover:rotate-0 hover:scale-105 hover:border-white/20 transition-all duration-500 ease-out`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 halftone-overlay opacity-10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5 opacity-80 group-hover:opacity-100 transition-opacity">
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-zinc-300 mt-1 line-clamp-2">
                  {item.desc}
                </p>
                <span className="text-[10px] text-cyan-400 mt-2 font-semibold tracking-wide">
                  ⚡ Click to view & compare
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal overlay */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImage(null)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-xl cursor-default"
          >
            {/* Modal Body container */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl max-h-[75vh] overflow-hidden rounded-3xl border border-white/15 shadow-2xl bg-zinc-900/80 flex flex-col items-center"
            >
              <img
                src={activeImage.image}
                alt={activeImage.title}
                className="w-full h-full max-h-[55vh] object-cover"
              />
              <div className="p-6 w-full flex flex-col items-center text-center gap-3 bg-gradient-to-b from-transparent to-black/80">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {activeImage.title}
                </h3>
                <p className="text-sm text-zinc-300 max-w-md">
                  {activeImage.desc}
                </p>
                <button
                  onClick={() => handleLaunchShopBot(activeImage.prompt)}
                  className="mt-2 px-8 py-3 rounded-full accent-gradient text-black font-bold text-sm sm:text-base hover:scale-105 transition-transform shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>🔍</span> Ask ShopBot AI to Compare Prices & Deals ↗
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
