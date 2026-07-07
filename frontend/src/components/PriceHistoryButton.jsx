import React from 'react';
import { getDirectPriceHistoryLink, extractProductId } from '../utils/priceHistoryLinks';

export default function PriceHistoryButton({ product, productName, className = "" }) {
  const handleClick = (e, provider = 'PRICE_HISTORY_APP') => {
    e.preventDefault();
    e.stopPropagation();
    const target = product || productName;
    const url = getDirectPriceHistoryLink(target, provider);
    const prodId = extractProductId(target) || (typeof target === 'object' && target ? (target.id || target.productId || target.sku) : null) || 'N/A';

    console.log(`📈 [Price History Redirect Debug]`, {
      productName: typeof target === 'object' ? (target.title || target.name) : target,
      productId: prodId,
      store: provider === 'PRICE_BEFORE' ? 'PriceBefore' : 'PriceHistory.app',
      generatedUrl: url
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`flex items-center gap-1.5 w-full ${className}`}>
      <button
        onClick={(e) => handleClick(e, 'PRICE_HISTORY_APP')}
        title="Check historical pricing trends on PriceHistory.app"
        className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-200 hover:text-white text-xs font-semibold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer group/btn uppercase tracking-wider font-body"
      >
        <span className="text-sm group-hover/btn:scale-110 transition-transform">📈</span>
        <span>Price History</span>
      </button>
      
      {/* Fallback link to PriceBefore */}
      <button
        onClick={(e) => handleClick(e, 'PRICE_BEFORE')}
        title="Compare historical trends on PriceBefore.com"
        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] font-semibold py-2.5 px-3 rounded-full border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer flex items-center justify-center uppercase tracking-wider font-body"
      >
        <span>PB ↗</span>
      </button>
    </div>
  );
}
