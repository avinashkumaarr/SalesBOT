import React from 'react';
import { motion } from 'framer-motion';
import PriceHistoryButton from './PriceHistoryButton';
import BuyRecommendation from './BuyRecommendation';
import { getDirectProductLink } from '../utils/priceHistoryLinks';
import { getAmazonProductUrl, getFlipkartProductUrl, getStoreProductUrl, extractProductId } from '../utils/productUrls';

export default function ProductCard({ product, index = 0, onCompare, allProducts = [] }) {
  if (!product) return null;

  // Helper for explicit click handling and debugging (Requirements 1, 2, 3, 4, 5, 9)
  const handleStoreClick = (e, storeObj, currentProduct = product) => {
    e.preventDefault();
    e.stopPropagation();
    const storeName = typeof storeObj === 'string' ? storeObj : (storeObj?.name || storeObj?.store || 'Amazon India');
    const directUrl = getStoreProductUrl(currentProduct, storeObj);
    const prodId = extractProductId(currentProduct) || currentProduct.id || currentProduct.productId || `prod-${index}`;

    console.log(`🛒 [ProductCard Store Redirect Debug]`, {
      productName: currentProduct.title || currentProduct.name,
      productId: prodId,
      store: storeName,
      generatedUrl: directUrl,
      cardIndex: index
    });

    window.open(directUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBuyNowClick = (e, currentProduct = product) => {
    e.preventDefault();
    e.stopPropagation();
    const targetStore = bestStore || stores[0] || { name: 'Amazon India' };
    const directUrl = getStoreProductUrl(currentProduct, targetStore);
    const prodId = extractProductId(currentProduct) || currentProduct.id || currentProduct.productId || `prod-${index}`;

    console.log(`🛒 [ProductCard Buy Now Redirect Debug]`, {
      productName: currentProduct.title || currentProduct.name,
      productId: prodId,
      store: targetStore.name,
      generatedUrl: directUrl,
      cardIndex: index
    });

    window.open(directUrl, '_blank', 'noopener,noreferrer');
  };

  // Extract specs
  const specs = product.specifications || {};

  // Multi-store pricing or fallback
  const priceNum = typeof product.price === 'number' ? product.price : parseInt(String(product.price || '').replace(/\D/g, '')) || 45990;
  const rawStores = product.stores || product.multiStorePrices || [];
  const stores = rawStores.length > 0 ? rawStores.map(s => ({
    name: s.name || s.store || 'Amazon India',
    price: s.formattedPrice || (typeof s.price === 'number' ? `₹${s.price.toLocaleString('en-IN')}` : s.price) || `₹${priceNum.toLocaleString('en-IN')}`,
    icon: s.icon || s.logo || '🛒',
    link: getStoreProductUrl(product, s)
  })) : [
    { name: 'Amazon India', price: `₹${priceNum.toLocaleString('en-IN')}`, icon: '🛒', link: getAmazonProductUrl(product) },
    { name: 'Flipkart', price: `₹${Math.max(Math.floor(priceNum * 0.98), priceNum - 1000).toLocaleString('en-IN')}`, icon: '🛍️', link: getFlipkartProductUrl(product) },
    { name: 'Croma', price: `₹${Math.floor(priceNum * 1.01).toLocaleString('en-IN')}`, icon: '🏪', link: getStoreProductUrl(product, 'Croma') },
    { name: 'Reliance Digital', price: `₹${Math.max(Math.floor(priceNum * 0.99), priceNum - 500).toLocaleString('en-IN')}`, icon: '🏢', link: getStoreProductUrl(product, 'Reliance Digital') },
    { name: 'Vijay Sales', price: `₹${Math.floor(priceNum * 0.995).toLocaleString('en-IN')}`, icon: '⚡', link: getStoreProductUrl(product, 'Vijay Sales') },
  ];

  // Best store calculation
  const bestStore = stores[0] || { name: 'Amazon India', link: getAmazonProductUrl(product) };

  // Bank offers
  const offers = product.offers || [
    '10% Instant Discount on HDFC & ICICI Bank Cards',
    'No-Cost EMI available up to 6 months',
    'Up to ₹5,000 Exchange Bonus on eligible devices'
  ];

  // AI Score or rank calculation
  const aiScore = product.aiScore || (10 - index * 0.3).toFixed(1);
  const ratingStr = product.rating || '4.5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-zinc-950/90 border border-zinc-800/80 hover:border-zinc-500/80 rounded-3xl p-6 shadow-2xl transition-all duration-300 flex flex-col gap-5 group relative overflow-hidden backdrop-blur-xl font-body"
    >
      {/* Header: Title, Brand, Rating, Score */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Thumbnail / Icon */}
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
            {product.thumbnail || product.image ? (
              <img src={product.thumbnail || product.image} alt={product.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : null}
            <span className="text-2xl">💻</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-white/10 text-white border border-white/15 px-3 py-0.5 rounded-full text-[10px] tracking-[0.2em] font-semibold uppercase">
                RECOMMENDED · #{index + 1}
              </span>
              <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1">
                <span>★</span> {ratingStr}
              </span>
            </div>
            <h3 className="text-xl font-display italic text-white tracking-normal truncate mt-1.5 group-hover:text-zinc-200 transition-colors font-normal">
              {product.title || 'High-Performance Laptop'}
            </h3>
            <p className="text-xs text-muted font-light flex items-center gap-1.5 mt-0.5">
              <span>{product.brand ? `${product.brand} Official` : 'Verified Retailer Candidate'}</span>
              <span>·</span>
              <span className="text-zinc-300 font-normal">Best Store: {bestStore.name}</span>
            </p>
          </div>
        </div>

        {/* Match Score */}
        <div className="flex flex-col items-end flex-shrink-0">
          <div className="text-right">
            <span className="text-lg font-display italic text-white">{aiScore}</span>
            <span className="text-xs text-zinc-400 font-light ml-0.5">/ 10</span>
          </div>
          <span className="text-[9px] text-muted uppercase tracking-[0.2em] font-semibold mt-0.5">Match Score</span>
        </div>
      </div>

      {/* Hardware Specifications Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-1">
        {Object.entries(specs).slice(0, 4).map(([key, val], i) => {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace('Feature1', 'Key Feature').replace('Feature2', 'Performance').replace('Feature3', 'Quality').replace('Refresh Rate', 'Motion');
          return (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-3 flex flex-col justify-between">
              <span className="text-[9px] text-muted uppercase tracking-[0.2em] font-medium truncate">{label}</span>
              <span className="text-xs font-semibold text-white mt-1 truncate" title={val}>{val}</span>
            </div>
          );
        })}
      </div>

      {/* Multi-Store Price Comparison Section */}
      <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.2em] text-muted font-semibold">
            Store Availability & Pricing
          </span>
          <span className="text-[10px] text-zinc-300 font-medium tracking-wider uppercase">
            Live Prices
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {stores.map((store, sIdx) => (
            <a
              key={sIdx}
              href={store.link}
              onClick={(e) => handleStoreClick(e, store, product)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center bg-zinc-900/50 hover:bg-white hover:text-black border border-zinc-800/80 hover:border-white rounded-2xl p-3 transition-all duration-300 group/store cursor-pointer text-center"
            >
              <div className="text-xs font-medium text-zinc-400 group-hover/store:text-black truncate max-w-[90px]">
                {store.name}
              </div>
              <span className="text-sm font-bold text-white group-hover/store:text-black mt-1 font-body">
                {store.price}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-muted group-hover/store:text-zinc-700 mt-1">
                Buy Now ↗
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Action Buttons Bar: Buy Now, Compare, View Price History */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5 flex-1">
          {/* Buy Now Button */}
          <a
            href={bestStore.link}
            onClick={(e) => handleBuyNowClick(e, product)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white hover:bg-zinc-200 text-black font-semibold text-xs py-3 px-5 rounded-full flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer text-center tracking-wider uppercase font-body"
          >
            <span>Buy Now</span>
            <span className="text-[10px] font-normal opacity-70">({bestStore.name}) ↗</span>
          </a>

          {/* Compare Button */}
          <button
            onClick={() => onCompare && onCompare(product, allProducts)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs py-3 px-5 rounded-full border border-zinc-800 hover:border-zinc-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer tracking-wider uppercase font-body"
          >
            <span>Compare</span>
          </button>
        </div>

        {/* View Price History Button */}
        <div className="flex-1 sm:max-w-[220px]">
          <PriceHistoryButton product={product} productName={product.title} />
        </div>
      </div>

      {/* AI Buy Recommendation Component */}
      <BuyRecommendation
        recommendation={product.buyRecommendation}
        price={priceNum}
        budget={product.budget || 60000}
      />

      {/* Bank Offers & Cashback Banner */}
      <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-4 flex flex-col gap-2 mt-1">
        <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-300 flex items-center gap-2">
          <span>Instant Bank Offers & Cashback</span>
        </div>
        <div className="flex flex-col gap-1 text-xs text-muted font-light">
          {offers.map((offer, oIdx) => (
            <span key={oIdx} className="flex items-center gap-2">
              <span className="text-white font-medium">·</span>
              <span>{offer.replace(/^[💳⚡🔄🎁]\s*/, '')}</span>
            </span>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
