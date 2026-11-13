'use client';

import React from 'react';
import { Layers, ArrowDownUp, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { OrderBookData } from '@/types/crypto';

interface OrderBookDepthProps {
  orderBook: OrderBookData;
  symbol: string;
}

export function OrderBookDepth({ orderBook, symbol }: OrderBookDepthProps) {
  const { bids, asks, totalBidVolume, totalAskVolume, buyPressurePercent, sellPressurePercent, imbalanceRatio } =
    orderBook;

  const maxTotal = Math.max(
    bids[bids.length - 1]?.total || 1,
    asks[asks.length - 1]?.total || 1
  );

  const formatPrice = (p: number) => {
    if (p >= 1000) return p.toFixed(2);
    if (p >= 1) return p.toFixed(3);
    return p.toFixed(6);
  };

  const isBuyHeavy = buyPressurePercent > 55;
  const isSellHeavy = sellPressurePercent > 55;

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Order Book Liquidity & Depth Surveillance</h2>
        </div>
        <span className="text-xs text-zinc-400">Binance Real-Time Depth</span>
      </div>

      {/* Buy vs Sell Pressure Meter */}
      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>BUY PRESSURE: {buyPressurePercent}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span>SELL PRESSURE: {sellPressurePercent}%</span>
            <TrendingDown className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Dual Bar */}
        <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${buyPressurePercent}%` }}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${sellPressurePercent}%` }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Bid Volume: {totalBidVolume.toFixed(2)}</span>
          <span className="font-semibold text-zinc-200">
            Flow Imbalance: {imbalanceRatio.toFixed(2)}x
          </span>
          <span>Ask Volume: {totalAskVolume.toFixed(2)}</span>
        </div>
      </div>

      {/* Dual Table: Bids (left) and Asks (right) */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* BIDS */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-emerald-400 border-b border-zinc-800 pb-1.5">
            <span>Bid Price (USDT)</span>
            <span>Size</span>
            <span>Depth</span>
          </div>
          <div className="mt-1 space-y-1">
            {bids.slice(0, 7).map((b, idx) => {
              const widthPct = Math.min(100, Math.round((b.total / maxTotal) * 100));
              return (
                <div key={idx} className="relative flex items-center justify-between px-1.5 py-1 text-xs">
                  {/* Depth background fill */}
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 rounded"
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="relative font-mono font-medium text-emerald-400">
                    {formatPrice(b.price)}
                  </span>
                  <span className="relative font-mono text-zinc-300">{b.quantity.toFixed(3)}</span>
                  <span className="relative font-mono text-[10px] text-zinc-500">{b.total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ASKS */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-rose-400 border-b border-zinc-800 pb-1.5">
            <span>Ask Price (USDT)</span>
            <span>Size</span>
            <span>Depth</span>
          </div>
          <div className="mt-1 space-y-1">
            {asks.slice(0, 7).map((a, idx) => {
              const widthPct = Math.min(100, Math.round((a.total / maxTotal) * 100));
              return (
                <div key={idx} className="relative flex items-center justify-between px-1.5 py-1 text-xs">
                  {/* Depth background fill */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-rose-500/10 rounded"
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="relative font-mono font-medium text-rose-400">
                    {formatPrice(a.price)}
                  </span>
                  <span className="relative font-mono text-zinc-300">{a.quantity.toFixed(3)}</span>
                  <span className="relative font-mono text-[10px] text-zinc-500">{a.total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Surveillance Summary Footer */}
      <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-950/40 p-2.5 text-xs text-zinc-400 border border-zinc-800/60">
        <div className="flex items-center gap-1.5">
          <ArrowDownUp className="h-3.5 w-3.5 text-cyan-400" />
          <span>
            {isBuyHeavy
              ? 'Strong Buy Wall detected in order book. Accumulation pattern active.'
              : isSellHeavy
              ? 'Heavy Sell Wall detected. Resistance overhead.'
              : 'Balanced order depth between buyers and sellers.'}
          </span>
        </div>
      </div>
    </div>
  );
}
