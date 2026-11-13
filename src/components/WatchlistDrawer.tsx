'use client';

import React from 'react';
import { X, Trash2, ArrowUpRight, TrendingUp, TrendingDown, Bookmark } from 'lucide-react';
import { WatchlistCoin } from '@/types/crypto';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: WatchlistCoin[];
  onSelectCoin: (symbol: string) => void;
  onRemoveCoin: (symbol: string) => void;
}

export function WatchlistDrawer({
  isOpen,
  onClose,
  watchlist,
  onSelectCoin,
  onRemoveCoin,
}: WatchlistDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Your Surveillance Radar</h2>
            <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-800">
              {watchlist.length} Coins
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Coin List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
          {watchlist.length > 0 ? (
            watchlist.map((coin) => {
              const isPositive = coin.change24h >= 0;

              return (
                <div
                  key={coin.symbol}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all"
                >
                  <button
                    onClick={() => {
                      onSelectCoin(coin.symbol);
                      onClose();
                    }}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{coin.symbol}</span>
                        <span className="text-xs text-zinc-400">{coin.name}</span>
                      </div>
                      <div className="text-xs font-mono font-medium text-zinc-300">
                        ${coin.price >= 1 ? coin.price.toFixed(2) : coin.price.toFixed(6)}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center text-xs font-semibold ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="mr-0.5 h-3 w-3" /> : <TrendingDown className="mr-0.5 h-3 w-3" />}
                      {isPositive ? '+' : ''}
                      {coin.change24h.toFixed(1)}%
                    </span>

                    <button
                      onClick={() => onRemoveCoin(coin.symbol)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                      title="Remove from Radar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-sm text-zinc-500">
              <Bookmark className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
              <p>Your surveillance radar is empty.</p>
              <p className="text-xs text-zinc-600 mt-1">
                Click &quot;Track Coin&quot; on any surveyed coin to pin it here.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 pt-4 text-center text-xs text-zinc-500">
          Saved locally in your browser storage.
        </div>
      </div>
    </div>
  );
}
