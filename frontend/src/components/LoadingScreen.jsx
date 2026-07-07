import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = ["Search", "Compare", "Save"];

export default function LoadingScreen({ onComplete }) {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  // requestAnimationFrame Counter
  useEffect(() => {
    let startTime = null;
    const duration = 2700; // 2700ms total

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentCount = Math.floor(progress * 100);
      setCount(currentCount);

      // Cycle word index every 900ms (2700 / 3 = 900)
      const currentWordIndex = Math.min(Math.floor(elapsed / 900), WORDS.length - 1);
      setWordIndex(currentWordIndex);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Delay 400ms after reaching 100, then call onComplete
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-bg flex flex-col justify-between p-6 md:p-10 overflow-hidden">
      {/* Top Left Label */}
      <div className="flex items-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-xs text-muted uppercase tracking-[0.3em] font-body flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          ShopBot AI Brain v2.5
        </motion.div>
      </div>

      {/* Center Rotating Words */}
      <div className="flex justify-center items-center h-40">
        <AnimatePresence mode="wait">
          <motion.div
            key={wordIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 0.8 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary text-center"
          >
            {WORDS[wordIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Layout: Counter & Progress Bar */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-end items-end">
          <div className="text-6xl md:text-8xl lg:text-9xl font-display text-text-primary leading-none tabular-nums">
            {String(count).padStart(3, "0")}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-[3px] bg-stroke/50 rounded-full overflow-hidden relative">
          <div
            className="absolute left-0 top-0 h-full accent-gradient transition-transform duration-75 ease-out origin-left"
            style={{
              width: "100%",
              transform: `scaleX(${count / 100})`,
              boxShadow: "0 0 8px rgba(137, 170, 204, 0.35)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
