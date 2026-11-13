'use client';

import React, { useState } from 'react';
import {
  X,
  Calculator,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  Zap,
  Target,
} from 'lucide-react';

interface FuturesCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
}

export function FuturesCalculatorModal({
  isOpen,
  onClose,
  symbol,
  currentPrice,
}: FuturesCalculatorModalProps) {
  if (!isOpen) return null;

  const cleanSymbol = symbol.toUpperCase().replace(/USDT$/, '');

  const [side, setSide] = useState<'long' | 'short'>('long');
  const [leverage, setLeverage] = useState<number>(20);
  const [entryPrice, setEntryPrice] = useState<number>(currentPrice || 1);
  const [marginUsdt, setMarginUsdt] = useState<number>(1000);
  const [targetExitPrice, setTargetExitPrice] = useState<number>(
    side === 'long' ? (currentPrice || 1) * 1.05 : (currentPrice || 1) * 0.95
  );

  // Maintenance margin rate for Binance (typically 0.4% - 1%)
  const maintenanceMarginRate = 0.005; // 0.5%

  // Calculations
  const positionSizeUsd = marginUsdt * leverage;
  const positionSizeCoins = entryPrice > 0 ? positionSizeUsd / entryPrice : 0;

  // Liquidation Price calculation:
  // Long Liq: Entry * (1 - (1/Leverage) + MMR)
  // Short Liq: Entry * (1 + (1/Leverage) - MMR)
  let liquidationPrice = 0;
  if (side === 'long') {
    liquidationPrice = Math.max(0, entryPrice * (1 - 1 / leverage + maintenanceMarginRate));
  } else {
    liquidationPrice = entryPrice * (1 + 1 / leverage - maintenanceMarginRate);
  }

  // Distance to liquidation
  const distanceDollar = Math.abs(entryPrice - liquidationPrice);
  const distancePercent = entryPrice > 0 ? (distanceDollar / entryPrice) * 100 : 0;

  // Target Exit P&L & ROE
  let pnlUsd = 0;
  if (side === 'long') {
    pnlUsd = (targetExitPrice - entryPrice) * positionSizeCoins;
  } else {
    pnlUsd = (entryPrice - targetExitPrice) * positionSizeCoins;
  }
  const roePercent = marginUsdt > 0 ? (pnlUsd / marginUsdt) * 100 : 0;

  const getRiskLevel = () => {
    if (leverage >= 50 || distancePercent <= 2) return { label: 'EXTREME DEGEN RISK', color: 'text-rose-400 border-rose-800 bg-rose-950/80' };
    if (leverage >= 20 || distancePercent <= 5) return { label: 'HIGH RISK', color: 'text-amber-400 border-amber-800 bg-amber-950/80' };
    if (leverage >= 10 || distancePercent <= 10) return { label: 'MODERATE RISK', color: 'text-yellow-400 border-yellow-800 bg-yellow-950/80' };
    return { label: 'CONSERVATIVE / SAFE', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/80' };
  };

  const risk = getRiskLevel();

  const formatPrice = (p: number) => {
    if (p >= 1000) return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (p >= 1) return `$${p.toFixed(4)}`;
    return `$${p.toFixed(6)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Binance Futures Calculator</h2>
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-800">
                  {cleanSymbol}USDT.P
                </span>
              </div>
              <p className="text-xs text-zinc-400">Precise liquidation price, margin requirement & ROE profit planner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="mt-5 space-y-4">
          {/* Side Selector (Long / Short) */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => {
                setSide('long');
                setTargetExitPrice(entryPrice * 1.05);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                side === 'long'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              LONG / BUY
            </button>
            <button
              onClick={() => {
                setSide('short');
                setTargetExitPrice(entryPrice * 0.95);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                side === 'short'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingDown className="h-4 w-4" />
              SHORT / SELL
            </button>
          </div>

          {/* Leverage Selector & Presets */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-zinc-300">Leverage: <strong className="text-cyan-400">{leverage}x</strong></span>
              <div className="flex items-center gap-1.5">
                {[5, 10, 20, 50, 100].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => setLeverage(lev)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${
                      leverage === lev
                        ? 'border-cyan-500 bg-cyan-950 text-cyan-300'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="125"
              step="1"
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Entry Price & Margin Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">
                Entry Price (USDT)
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-mono text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">
                Margin Deposit (USDT)
              </label>
              <input
                type="number"
                step="any"
                value={marginUsdt}
                onChange={(e) => setMarginUsdt(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-mono text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Target Exit Price */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">
              Target Take Profit Price (USDT)
            </label>
            <input
              type="number"
              step="any"
              value={targetExitPrice}
              onChange={(e) => setTargetExitPrice(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-mono text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* RESULTS CARD */}
        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
          {/* Liquidation Price Highlight */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <span className="text-xs text-zinc-400 font-medium">Estimated Liquidation Price</span>
              <div className="font-mono text-2xl font-black text-rose-400">
                {formatPrice(liquidationPrice)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 font-medium">Distance to Liq</span>
              <div className="font-mono text-base font-bold text-amber-400">
                -{distancePercent.toFixed(2)}% ({formatPrice(distanceDollar)})
              </div>
            </div>
          </div>

          {/* Position & PnL Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-zinc-500">Position Size:</span>
              <div className="font-mono font-semibold text-white">
                ${positionSizeUsd.toLocaleString()} ({positionSizeCoins.toFixed(2)} {cleanSymbol})
              </div>
            </div>
            <div>
              <span className="text-zinc-500">Risk Assessment:</span>
              <div className={`mt-0.5 inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${risk.color}`}>
                {risk.label}
              </div>
            </div>
          </div>

          {/* Target ROE & Net Profit */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-zinc-300 font-medium">Target ROE / Net Profit</span>
            </div>
            <div className="text-right font-mono">
              <span className={`text-sm font-extrabold ${roePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {roePercent >= 0 ? '+' : ''}{roePercent.toFixed(1)}% (${pnlUsd >= 0 ? '+' : ''}{pnlUsd.toFixed(2)})
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
}
