import { motion } from 'framer-motion';

const STATS = [
  { id: 1, number: "50+", label: "Indian Stores", desc: "Instant price comparison across Amazon, Flipkart, Croma, Reliance & Tata CliQ." },
  { id: 2, number: "₹15k+", label: "Avg Saved", desc: "Real-time budget enforcement and deal discovery for students & shoppers." },
  { id: 3, number: "9.8/10", label: "AI Accuracy", desc: "Powered by Google Gemini & SerpAPI with live speech synthesis." }
];

export default function Stats() {
  return (
    <section id="stats" className="bg-bg py-16 md:py-24 border-t border-b border-stroke/20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: idx * 0.15, ease: "easeOut" }}
              className="flex flex-col items-center text-center p-8 md:p-10 bg-surface/20 border border-stroke rounded-[2rem] group hover:border-white/10 transition-colors duration-500"
            >
              {/* Stat number with background gradient clip */}
              <span className="text-5xl sm:text-6xl md:text-7xl font-display italic text-text-primary mb-3 group-hover:text-accent-gradient transition-all duration-300">
                {stat.number}
              </span>
              
              {/* Label */}
              <span className="text-xs sm:text-sm text-muted uppercase tracking-[0.2em] font-semibold mb-3 font-body">
                {stat.label}
              </span>
              
              {/* Short desc */}
              <p className="text-xs sm:text-sm text-muted/70 max-w-[240px] leading-relaxed font-light font-body">
                {stat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
