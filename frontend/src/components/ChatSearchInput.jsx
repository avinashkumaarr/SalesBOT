import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_PROMPTS = [
  "Suggest best coding laptop under ₹50,000 with good battery",
  "Compare iPhone 15 vs Samsung Galaxy S24 for camera quality",
  "Top 4K Smart TVs under ₹40,000 with Dolby Vision",
  "Best wireless noise-canceling headphones under ₹10,000",
  "Recommend a high-performance gaming PC build under ₹1,00,000",
  "What are the top discounts on smartphones today?",
];

export default function ChatSearchInput({ onSend, credits = 60, maxCredits = 450, placeholder = "Ask ShopBot AI anything..." }) {
  const [input, setInput] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  
  const textareaRef = useRef(null);
  const promptMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [input]);

  // Click outside listener to close prompt dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (promptMenuRef.current && !promptMenuRef.current.contains(e.target)) {
        setShowPrompts(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!input.trim() && !attachedFile) return;
    onSend(input, attachedFile);
    setInput('');
    setAttachedFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectPrompt = (prompt) => {
    setInput(prompt);
    setShowPrompts(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Indian English / Hindi accent support
    recognition.interimResults = true;
    recognition.continuous = false;

    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleFileAttach = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        content: event.target.result,
      });
    };
    if (file.type.includes('text') || file.name.match(/\.(txt|csv|json|md|log|js|py|html|css)$/i)) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleUpgradeClick = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('navigate'));
    }
    const attemptScroll = (retries = 30, delay = 50) => {
      const element = document.getElementById('plans');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const el = document.getElementById('plans');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 200);
        setTimeout(() => {
          const el = document.getElementById('plans');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 500);
        setTimeout(() => {
          const el = document.getElementById('plans');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 800);
      } else if (retries > 0) {
        setTimeout(() => attemptScroll(retries - 1, delay), delay);
      }
    };
    attemptScroll();
  };

  return (
    <div className="w-full max-w-3xl relative px-1 sm:px-0">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.csv"
      />

      {/* 1. Top Status Bar (Dark theme, floating look) */}
      <div className="w-[96%] mx-auto bg-[#18181b]/95 border border-zinc-800 border-b-0 backdrop-blur-md rounded-t-2xl py-1.5 sm:py-2 px-3 sm:px-5 flex items-center justify-between text-[11px] sm:text-xs text-zinc-400 gap-1 overflow-hidden">
        {/* Left Status */}
        <div className="flex items-center gap-1.5 shrink-0 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-medium font-body text-zinc-300 truncate">
            {credits}/{maxCredits} cr
          </span>
          <button onClick={handleUpgradeClick} className="bg-white hover:bg-zinc-200 text-black text-[9px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded transition-colors cursor-pointer ml-0.5 shadow shrink-0">
            Upgrade
          </button>
        </div>
        
        {/* Right Status */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-zinc-400 truncate ml-1 shrink-0">
          <span className="font-body text-zinc-300 truncate">Gemini 2.5</span>
          <svg className="w-3.5 h-3.5 text-blue-400 shrink-0 hidden sm:inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L14.907 18M18 10.5C18 14.642 14.642 18 10.5 18C6.358 18 3 14.642 3 10.5C3 6.358 6.358 3 10.5Z" />
          </svg>
        </div>
      </div>

      {/* 2. Main Search Input Card (White theme) */}
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col relative overflow-hidden">
        
        {/* Input Textarea Area */}
        <div className="relative flex-1 flex pr-12 sm:pr-16 min-h-[55px] sm:min-h-[120px]">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 3000))}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full p-3 sm:p-6 pb-1.5 sm:pb-2 text-zinc-900 placeholder-zinc-400 bg-transparent resize-none border-none outline-none focus:ring-0 text-sm sm:text-lg font-body leading-relaxed max-h-[160px]"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() && !attachedFile}
            className={`absolute top-2 right-2 sm:top-5 sm:right-5 w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ${
              input.trim() || attachedFile
                ? 'bg-black text-white hover:scale-105 hover:shadow-lg shadow-black/20'
                : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
            }`}
          >
            {/* Arrow up icon */}
            <svg className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          </button>
        </div>

        {/* Attachment Indicator Alert */}
        {attachedFile && (
          <div className="mx-4 sm:mx-6 mb-2 flex items-center gap-2 bg-zinc-100 border border-zinc-300 px-3 py-1 rounded-lg w-max max-w-[90%] text-xs text-zinc-800 font-medium truncate">
            <span className="truncate">📎 {attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)</span>
            <button onClick={() => setAttachedFile(null)} className="text-zinc-500 hover:text-black ml-1 cursor-pointer shrink-0">✕</button>
          </div>
        )}

        {/* 3. Bottom Toolbar */}
        <div className="border-t border-zinc-100 px-3 sm:px-6 py-1.5 sm:py-4 flex items-center justify-between text-zinc-500 relative">
          
          {/* Action buttons (Left) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Attach button */}
            <button
              onClick={handleFileAttach}
              className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold tracking-wide text-zinc-500 hover:text-black hover:bg-zinc-100 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all cursor-pointer"
            >
              <span>📎</span> Attach
            </button>

            {/* Voice button */}
            <button
              onClick={toggleVoice}
              className={`flex items-center gap-1 text-[11px] sm:text-xs font-semibold tracking-wide px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500/10 text-red-600 font-bold'
                  : 'text-zinc-500 hover:text-black hover:bg-zinc-100'
              }`}
            >
              <span>🎤</span> {isListening ? "Listening..." : "Voice"}
            </button>

          </div>

          {/* Character counter (Right) */}
          <div className="text-[10px] sm:text-xs text-zinc-400 font-body shrink-0">
            {input.length}/3000
          </div>
        </div>

      </div>

      {/* Voice Listening Overlay Wave Animation */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-3xl bg-black/5 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none"
          >
            <div className="bg-black/95 text-white py-3 px-6 rounded-full flex items-center gap-3 shadow-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider animate-pulse text-zinc-300">Listening to voice</span>
              <div className="flex items-center gap-1 h-3">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <motion.span
                    key={bar}
                    animate={{ height: ["4px", "12px", "4px"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6,
                      delay: bar * 0.1,
                      ease: "easeInOut"
                    }}
                    className="w-[2px] bg-blue-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
