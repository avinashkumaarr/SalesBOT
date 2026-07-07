import { motion } from 'framer-motion';

const ENTRIES = [
  {
    id: 1,
    title: "How AI Score Ranks Laptops for B.Tech & Coding Students",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80",
    readTime: "4 min read",
    date: "July 2026",
    prompt: "Explain how AI Score ranks laptops for coding under 40000"
  },
  {
    id: 2,
    title: "Decoding Smartphone Camera Sensors: 108MP vs Sony IMX Flagships",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80",
    readTime: "6 min read",
    date: "June 2026",
    prompt: "Compare best smartphone camera sensors under 25000"
  },
  {
    id: 3,
    title: "Active Noise Cancellation (ANC) Under ₹5,000: What Really Works?",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
    readTime: "5 min read",
    date: "May 2026",
    prompt: "Explain Active Noise Cancellation earbuds under 5000"
  },
  {
    id: 4,
    title: "OLED vs QLED: Choosing the Perfect 4K TV for Dolby Vision & Atmos",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1000&q=80",
    readTime: "7 min read",
    date: "April 2026",
    prompt: "Explain OLED vs QLED 4K TVs under 40000"
  }
];

export default function Journal() {
  const handleEntryClick = (entry) => {
    localStorage.setItem('shopbot_initial_prompt', entry.prompt);
    window.history.pushState({}, '', '/chatbot');
    window.dispatchEvent(new Event('navigate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="journal" className="bg-bg py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-stroke" />
              <span className="text-[10px] sm:text-xs text-muted uppercase tracking-[0.3em] font-semibold font-body">
                AI Shopping Insights
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-body text-text-primary tracking-tight font-medium">
              Recent <span className="font-display italic text-text-primary/95">thoughts</span>
            </h2>
            <p className="text-sm md:text-base text-muted max-w-md mt-2">
              Insights on Indian E-commerce, AI shopping algorithms, and smart consumer tech. Click any topic to ask ShopBot AI!
            </p>
          </div>

          {/* Desktop Only Ask ShopBot Button */}
          <button
            onClick={() => {
              window.history.pushState({}, '', '/chatbot');
              window.dispatchEvent(new Event('navigate'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hidden md:inline-flex relative group p-[1px] rounded-full overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-stroke group-hover:accent-gradient transition-all duration-300" />
            <div className="relative px-6 py-2.5 rounded-full bg-surface text-muted group-hover:text-text-primary text-xs sm:text-sm font-semibold transition-colors duration-300 flex items-center gap-2">
              Ask ShopBot <span className="font-sans text-xs">↗</span>
            </div>
          </button>
        </motion.div>

        {/* Entries List */}
        <div className="flex flex-col gap-4 md:gap-5">
          {ENTRIES.map((entry, idx) => (
            <motion.div
              key={entry.id}
              onClick={() => handleEntryClick(entry)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 bg-surface/30 hover:bg-surface border border-stroke rounded-[2rem] sm:rounded-full transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-xl hover:border-white/20"
            >
              {/* Image & Title Group */}
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Thumbnail */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-stroke flex-shrink-0">
                  <img
                    src={entry.image}
                    alt={entry.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                </div>
                {/* Title */}
                <div className="flex flex-col">
                  <h3 className="text-sm sm:text-base md:text-lg font-body text-text-primary group-hover:text-cyan-400 transition-colors duration-300 font-medium line-clamp-1">
                    {entry.title}
                  </h3>
                  <span className="text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors hidden sm:block mt-0.5">
                    ⚡ Click to ask ShopBot AI about this topic
                  </span>
                </div>
              </div>

              {/* Read Time & Date Group */}
              <div className="flex items-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-muted sm:pr-4">
                <span className="font-body bg-white/5 px-3 py-1 rounded-full text-zinc-400 border border-white/5">{entry.readTime}</span>
                <span className="font-body text-zinc-500">{entry.date}</span>
                {/* Animated Arrow */}
                <span className="hidden sm:inline-block transform group-hover:translate-x-1.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-cyan-400 font-bold text-sm">
                  ↗
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
