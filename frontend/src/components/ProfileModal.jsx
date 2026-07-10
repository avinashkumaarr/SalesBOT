import { motion } from 'framer-motion';

export default function ProfileModal({ user, onClose, onLogout }) {
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10 text-sm"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header Avatar */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg p-0.5">
            <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{user.name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white font-display">{user.name}</h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">Verified SalesBOT Account</p>
        </div>

        {/* User Details Box */}
        <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-4 space-y-3.5 mb-6 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-1 border-b border-zinc-700/40">
            <span className="text-zinc-400">Email Address</span>
            <span className="text-white font-medium truncate max-w-[200px]">{user.email || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-zinc-700/40">
            <span className="text-zinc-400">Phone Number</span>
            <span className="text-white font-medium">{user.phone || 'Not provided'}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-zinc-400">Account Status</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Active Cloud Sync
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-3 px-4 bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/20"
          >
            <span>🚪</span> Log Out of Account
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
