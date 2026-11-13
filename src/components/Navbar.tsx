'use client';

import React, { useState } from 'react';
import { Search, Radio, RefreshCw, Bookmark, ShieldCheck, Flame } from 'lucide-react';
import { POPULAR_COINS } from '@/lib/constants';

interface NavbarProps {
  currentSymbol: string;
  onSelectCoin: (symbol: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  refreshInterval: number;
  onSetRefreshInterval: (interval: number) => void;
  watchlistCount: number;
  onToggleWatchlist: () => void;
  fearAndGreed?: { value: number; classification: string };
}

export function Navbar({
  currentSymbol,
  onSelectCoin,
  onRefresh,
  isLoading,
  refreshInterval,
  onSetRefreshInterval,
  watchlistCount,
  onToggleWatchlist,
  fearAndGreed,
}: NavbarProps) {
  const [searchInput, setSearchInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredCoins = POPULAR_COINS.filter(
    (c) =>
      c.symbol.toLowerCase().includes(searchInput.toLowerCase()) ||
      c.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSelectCoin(searchInput.trim().toUpperCase());
      setSearchInput('');
      setShowDropdown(false);
    }
  };

  const getFearColor = (val: number) => {
    if (val <= 25) return 'text-red-400 bg-red-950/40 border-red-800/50';
    if (val <= 45) return 'text-orange-400 bg-orange-950/40 border-orange-800/50';
    if (val <= 55) return 'text-yellow-400 bg-yellow-950/40 border-yellow-800/50';
    if (val <= 75) return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
    return 'text-green-300 bg-green-950/40 border-green-700/50';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="h-6 w-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Crypto<span className="text-cyan-400">Eye</span>
              </span>
              <span className="flex items-center gap-1 rounded-full bg-cyan-950/70 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/60">
                <Radio className="h-2.5 w-2.5 animate-pulse text-cyan-400" />
                SURVEILLANCE LIVE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Multi-API Coin Research & Threat Radar</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mx-4 hidden max-w-md flex-1 md:block">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search coin (e.g. BTC, ETH, SOL, PEPE, SUI)..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 py-2 pl-9 pr-4 text-sm text-zinc-100 placeholder-zinc-500 transition-all focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </form>

          {/* Quick Autocomplete Dropdown */}
          {showDropdown && searchInput && (
            <div className="absolute left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl z-50">
              {filteredCoins.length > 0 ? (
                filteredCoins.map((coin) => (
                  <button
                    key={coin.symbol}
                    onClick={() => {
                      onSelectCoin(coin.symbol);
                      setSearchInput('');
                      setShowDropdown(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-zinc-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{coin.symbol}</span>
                      <span className="text-xs text-zinc-400">{coin.name}</span>
                    </div>
                    {coin.symbol === currentSymbol && (
                      <span className="text-xs text-cyan-400 font-medium">Viewing</span>
                    )}
                  </button>
                ))
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex w-full items-center px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  <Search className="mr-2 h-4 w-4 text-cyan-400" />
                  Surveil custom token: <span className="ml-1 font-semibold text-white">{searchInput}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Fear & Greed pill */}
          {fearAndGreed && (
            <div
              className={`hidden items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold lg:flex ${getFearColor(
                fearAndGreed.value
              )}`}
              title="Alternative.me Fear & Greed Macro Index"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>
                F&G: {fearAndGreed.value} ({fearAndGreed.classification})
              </span>
            </div>
          )}

          {/* Refresh interval dropdown */}
          <select
            value={refreshInterval}
            onChange={(e) => onSetRefreshInterval(Number(e.target.value))}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 focus:border-cyan-500 focus:outline-none"
            title="Auto-refresh interval"
          >
            <option value={15}>15s Auto</option>
            <option value={30}>30s Auto</option>
            <option value={60}>60s Auto</option>
            <option value={0}>Manual</option>
          </select>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Surveillance Data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Watchlist Toggle Button */}
          <button
            onClick={onToggleWatchlist}
            className="relative flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:text-white transition-all"
          >
            <Bookmark className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Radar</span>
            {watchlistCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-black">
                {watchlistCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search input */}
      <div className="block px-4 pb-2.5 md:hidden">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search coin (BTC, SOL, PEPE)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 py-1.5 pl-8 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
          />
        </form>
      </div>
    </header>
  );
}
