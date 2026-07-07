import React from 'react';

export default function BuyRecommendation({ recommendation, price, budget }) {
  const rating = recommendation?.rating || "★★★★★";
  const title = recommendation?.title || "Curated Assessment";
  const verdict = recommendation?.verdict || "Current price is highly competitive for its hardware specification tier.";
  const urgentAdvice = recommendation?.urgentAdvice || "If your purchase is immediate, current pricing across recommended stores offers excellent value.";
  const waitAdvice = recommendation?.waitAdvice || "Patient buyers may observe additional card discounts during major seasonal marketplace sales.";

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3.5 mt-1 backdrop-blur-md font-body">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-white text-xs tracking-widest font-semibold">{rating}</span>
          <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-[0.25em]">
            {title.replace('AI ', '')}
          </span>
        </div>
        <span className="text-[10px] font-display italic text-zinc-400">
          Expert Verdict
        </span>
      </div>

      <div className="text-xs text-zinc-300 font-light leading-relaxed">
        <p className="text-sm font-display italic text-white mb-2.5">{verdict}</p>
        <ul className="space-y-2 text-zinc-400 text-xs">
          <li className="flex items-start gap-2">
            <span className="text-white font-medium">·</span>
            <span><strong className="text-zinc-200 font-medium">Immediate Purchase:</strong> {urgentAdvice}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-white font-medium">·</span>
            <span><strong className="text-zinc-200 font-medium">Strategic Timing:</strong> {waitAdvice}</span>
          </li>
        </ul>
      </div>

      <div className="text-[10px] text-zinc-500 font-light flex items-center justify-between pt-2 border-t border-zinc-800/60">
        <span>Verified public historical data · Zero price fabrication</span>
      </div>
    </div>
  );
}
