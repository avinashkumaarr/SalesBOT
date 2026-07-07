import React from 'react';
import { motion } from 'framer-motion';
import PriceHistoryButton from './PriceHistoryButton';
import { getDirectProductLink } from '../utils/priceHistoryLinks';
import { getStoreProductUrl, extractProductId } from '../utils/productUrls';

export default function ProductComparison({ product, allProducts = [], onClose }) {
  if (!product) return null;

  // Helper for comparison table buy button redirection (Requirements 1, 2, 3, 4, 5, 9)
  const handleComparisonBuyNow = (e, currentItem, storeObj) => {
    e.preventDefault();
    e.stopPropagation();
    const storeName = typeof storeObj === 'string' ? storeObj : (storeObj?.name || storeObj?.store || 'Amazon India');
    const directUrl = getStoreProductUrl(currentItem, storeObj || currentItem.stores?.[0] || 'Amazon India');
    const prodId = extractProductId(currentItem) || currentItem.id || currentItem.productId || 'N/A';

    console.log(`⚖️ [Comparison Table Buy Now Debug]`, {
      productName: currentItem.title || currentItem.name,
      productId: prodId,
      store: storeName,
      generatedUrl: directUrl
    });

    window.open(directUrl, '_blank', 'noopener,noreferrer');
  };

  // Filter out the selected product itself to find top comparison candidates
  const compareCandidates = allProducts.filter(p => p && p.title !== product.title).slice(0, 2);
  const items = [product, ...compareCandidates];

  const specKeys = ['processor', 'ram', 'storage', 'display', 'battery', 'warranty'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-body"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-5xl w-full shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto text-white relative"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display italic text-white flex items-center gap-2 font-normal">
              Side-by-Side Assessment
            </h2>
            <p className="text-xs text-muted font-light mt-1">
              Comparing <span className="text-white font-medium">{product.title}</span> against alternative models in this session
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Comparison Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="p-3.5 bg-zinc-900/40 text-[10px] font-semibold text-muted uppercase tracking-widest w-1/4">Specification</th>
                {items.map((item, idx) => (
                  <th key={idx} className={`p-3.5 text-xs font-bold w-1/4 ${idx === 0 ? 'bg-white/10 text-white border-x border-white/15' : 'bg-zinc-900/30 text-zinc-200'}`}>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-muted uppercase tracking-widest font-semibold">
                        {idx === 0 ? 'Selected Candidate' : `Alternative #${idx}`}
                      </span>
                      <span className="truncate text-sm font-semibold text-white" title={item.title}>
                        {item.title || 'Product'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs text-zinc-300">
              {/* Price & Best Store */}
              <tr>
                <td className="p-3.5 font-medium text-zinc-400 bg-zinc-900/30">Best Price</td>
                {items.map((item, idx) => {
                  const priceNum = typeof item.price === 'number' ? item.price : parseInt(String(item.price || '').replace(/\D/g, '')) || 45990;
                  return (
                    <td key={idx} className={`p-3.5 font-bold text-sm ${idx === 0 ? 'bg-white/5 text-white border-x border-white/10' : 'text-zinc-200'}`}>
                      ₹{priceNum.toLocaleString('en-IN')}
                    </td>
                  );
                })}
              </tr>

              {/* Match Score */}
              <tr>
                <td className="p-3.5 font-medium text-zinc-400 bg-zinc-900/30">Match Score</td>
                {items.map((item, idx) => (
                  <td key={idx} className={`p-3.5 font-display italic text-base ${idx === 0 ? 'bg-white/5 text-white border-x border-white/10' : 'text-zinc-300'}`}>
                    {item.aiScore || (9.8 - idx * 0.3).toFixed(1)} / 10
                  </td>
                ))}
              </tr>

              {/* Specs */}
              {specKeys.map((key) => {
                const label = key.charAt(0).toUpperCase() + key.slice(1);
                return (
                  <tr key={key}>
                    <td className="p-3.5 font-medium text-zinc-400 bg-zinc-900/30 capitalize">{label}</td>
                    {items.map((item, idx) => {
                      const val = (item.specifications || {})[key] || (item.specifications || {})[key.toLowerCase()] || 'Standard / Included';
                      return (
                        <td key={idx} className={`p-3.5 ${idx === 0 ? 'bg-white/5 text-white font-medium border-x border-white/10' : 'text-zinc-400 font-light'}`}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Bank Offers */}
              <tr>
                <td className="p-3.5 font-medium text-zinc-400 bg-zinc-900/30">Bank Offers</td>
                {items.map((item, idx) => {
                  const offers = item.offers || ['10% Instant Discount on Bank Cards', 'No-Cost EMI available'];
                  return (
                    <td key={idx} className={`p-3.5 text-[11px] leading-relaxed ${idx === 0 ? 'bg-white/5 text-zinc-200 border-x border-white/10' : 'text-zinc-400 font-light'}`}>
                      {offers.slice(0, 2).map((o, i) => <div key={i} className="flex items-center gap-1.5"><span className="text-white">·</span> {o.replace(/^[💳⚡🔄🎁]\s*/, '')}</div>)}
                    </td>
                  );
                })}
              </tr>

              {/* Action Buttons */}
              <tr>
                <td className="p-3.5 font-medium text-zinc-400 bg-zinc-900/30">Actions</td>
                {items.map((item, idx) => (
                  <td key={idx} className={`p-3.5 ${idx === 0 ? 'bg-white/5 border-x border-white/10' : ''}`}>
                    <div className="flex flex-col gap-2.5">
                      <a
                        href={getStoreProductUrl(item, item.stores?.[0] || 'Amazon India')}
                        onClick={(e) => handleComparisonBuyNow(e, item, item.stores?.[0] || 'Amazon India')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs py-2.5 px-4 rounded-full flex items-center justify-center gap-1.5 shadow-md text-center transition-all cursor-pointer uppercase tracking-wider font-body"
                      >
                        <span>Buy Now</span>
                      </a>
                      <PriceHistoryButton product={item} productName={item.title} />
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/80">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-xs transition-colors cursor-pointer uppercase tracking-wider"
          >
            Close Assessment
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
