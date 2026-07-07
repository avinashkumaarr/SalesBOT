import { motion } from 'framer-motion';

const PROJECTS = [
  {
    id: 1,
    title: "Coding & AI Laptops",
    category: "Laptops & PCs",
    colSpan: "md:col-span-7",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=80",
    aspectRatio: "aspect-video md:aspect-[1.4/1]",
    year: "Live",
    tags: ["16GB RAM", "512GB SSD", "Ryzen 5 / i5", "Under ₹40k"],
    desc: "Search for high-performance laptops optimized for Android Studio, VS Code, and college research with long-lasting battery backup.",
    prompt: "Find the best coding laptops under 40000 with 16GB RAM and good battery"
  },
  {
    id: 2,
    title: "5G Camera Flagships",
    category: "Smartphones & Mobiles",
    colSpan: "md:col-span-5",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80",
    aspectRatio: "aspect-video md:aspect-[1.0/1]",
    year: "Live",
    tags: ["5G Ready", "120Hz AMOLED", "Fast Charging", "Bank EMI"],
    desc: "Compare AMOLED displays, Snapdragon processors, and 108MP cameras with live multi-store pricing across Amazon and Flipkart.",
    prompt: "Best 5G smartphones under 25000 with camera and good battery"
  },
  {
    id: 3,
    title: "ANC Earbuds & Watches",
    category: "Audio & Wearables",
    colSpan: "md:col-span-5",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
    aspectRatio: "aspect-video md:aspect-[1.0/1]",
    year: "Live",
    tags: ["ANC Support", "AMOLED Display", "Long Battery", "Under ₹5k"],
    desc: "Discover Active Noise Cancelling TWS earbuds and fitness smartwatches with heart rate tracking and crisp AMOLED displays.",
    prompt: "Best ANC earbuds and smartwatches under 5000"
  },
  {
    id: 4,
    title: "4K TVs & Home Audio",
    category: "Home Entertainment",
    colSpan: "md:col-span-7",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1000&q=80",
    aspectRatio: "aspect-video md:aspect-[1.4/1]",
    year: "Live",
    tags: ["4K Ultra HD", "Dolby Vision", "Smart OS", "Best Deals"],
    desc: "Find OLED & QLED 4K televisions with Dolby Vision and Dolby Atmos sound systems at the lowest online prices.",
    prompt: "Best 4K Smart TVs under 40000 with Dolby Atmos"
  }
];

export default function SelectedWorks() {
  const handleCardClick = (project) => {
    localStorage.setItem('shopbot_initial_prompt', project.prompt);
    window.history.pushState({}, '', '/chatbot');
    window.dispatchEvent(new Event('navigate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="work" className="bg-bg py-16 md:py-24">
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
                ShopBot AI Search
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-body text-text-primary tracking-tight font-medium">
              What you can <span className="font-display italic text-text-primary/95">search</span>
            </h2>
            <p className="text-sm md:text-base text-muted max-w-md mt-2">
              Explore our intelligent product categories. Click any card to instantly launch ShopBot AI and compare live prices across India.
            </p>
          </div>

          {/* Desktop Only Try Now Button */}
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
              Open ShopBot AI <span className="font-sans text-xs">→</span>
            </div>
          </button>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {PROJECTS.map((project) => (
            <motion.div
              key={project.id}
              onClick={() => handleCardClick(project)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`group relative overflow-hidden bg-surface border border-stroke rounded-[2rem] cursor-pointer ${project.colSpan} ${project.aspectRatio}`}
            >
              {/* Project Image */}
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Halftone Pattern Overlay */}
              <div className="absolute inset-0 halftone-overlay opacity-20 mix-blend-multiply pointer-events-none" />

              {/* Default Content (Bottom Left Overlay) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8 transition-opacity duration-300 group-hover:opacity-0">
                <span className="text-[10px] text-cyan-400 uppercase tracking-[0.2em] font-bold mb-1">
                  {project.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-body text-text-primary tracking-tight font-medium">
                  {project.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 line-clamp-2">
                  {project.desc}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] bg-white/10 text-zinc-200 px-2.5 py-0.5 rounded-full border border-white/10">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hover Overlay: blur + animated gradient border pill */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-400 backdrop-blur-md flex flex-col justify-center items-center p-6 text-center">
                <div className="relative p-[1.5px] rounded-full overflow-hidden shadow-2xl transform scale-95 group-hover:scale-100 transition-transform duration-300 ease-out max-w-[92%]">
                  <div className="absolute inset-0 accent-gradient animate-gradient-shift" />
                  <div className="relative px-5 py-3.5 bg-white text-black font-body text-xs sm:text-sm font-bold rounded-full flex items-center justify-center gap-2">
                    <span>🔍</span> Click to Search: <span className="font-display italic font-normal text-zinc-800 line-clamp-1">"{project.prompt}"</span>
                  </div>
                </div>
                <span className="text-[11px] text-cyan-400 mt-3 font-semibold tracking-wide flex items-center gap-1 animate-pulse">
                  ⚡ Click to launch live AI comparison in ShopBot
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
