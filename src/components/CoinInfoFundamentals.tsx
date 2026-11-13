'use client';

import React from 'react';
import { Info, FileText, Globe, ExternalLink, Cpu, Calendar, Coins, CheckCircle2 } from 'lucide-react';
import { CoinFundamentals, SurveillanceReport } from '@/types/crypto';

interface CoinInfoFundamentalsProps {
  fundamentals: CoinFundamentals;
  coin: SurveillanceReport['coin'];
}

export function CoinInfoFundamentals({ fundamentals, coin }: CoinInfoFundamentalsProps) {
  const { description, categories, hashingAlgorithm, genesisDate, maxSupply, circulatingPercent, homepage, whitepaper, explorers } =
    fundamentals;

  const formatNumber = (val?: number | null) => {
    if (!val) return 'Infinite / Uncapped';
    if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
    return val.toLocaleString();
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Project Fundamentals & Tokenomics</h2>
        </div>
        <span className="text-xs text-zinc-400">Deep Coin Intelligence</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Description & Tags */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <h3 className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">About {coin.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
              {description}
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-zinc-400 mb-2">Ecosystem Categories</h4>
            <div className="flex flex-wrap gap-1.5">
              {categories.slice(0, 6).map((cat, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-300 font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Technical Specs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                <span>Consensus / Architecture</span>
              </div>
              <div className="mt-1 text-sm font-bold text-white">{hashingAlgorithm}</div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                <span>Genesis / Launch Date</span>
              </div>
              <div className="mt-1 text-sm font-bold text-white">{genesisDate}</div>
            </div>
          </div>
        </div>

        {/* Right: Tokenomics & Official Links */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tokenomics Supply Box */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 border-b border-zinc-800/80 pb-2">
              <span className="flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-emerald-400" />
                Supply Tokenomics
              </span>
              <span className="text-emerald-400 font-bold">{circulatingPercent}% Circulating</span>
            </div>

            {/* Unlocked Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span>Circulating Supply</span>
                <span className="text-white font-mono font-semibold">
                  {formatNumber(coin.circulatingSupply)} {coin.symbol}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                  style={{ width: `${circulatingPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Supply:</span>
                <span className="font-mono text-zinc-200">{formatNumber(coin.totalSupply)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Max Supply:</span>
                <span className="font-mono text-zinc-200">{formatNumber(maxSupply)}</span>
              </div>
            </div>
          </div>

          {/* Official Verification Links */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <h4 className="text-xs uppercase font-semibold text-zinc-400 mb-3">Official Verification Links</h4>
            <div className="space-y-2 text-xs">
              {homepage && (
                <a
                  href={homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg bg-zinc-900 px-3 py-2 text-zinc-200 hover:text-cyan-400 hover:bg-zinc-800/80 transition-colors border border-zinc-800/60"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-cyan-400" />
                    Official Website
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {whitepaper && (
                <a
                  href={whitepaper}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg bg-zinc-900 px-3 py-2 text-zinc-200 hover:text-cyan-400 hover:bg-zinc-800/80 transition-colors border border-zinc-800/60"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-amber-400" />
                    Whitepaper / Research Docs
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {explorers.map((exp, idx) => {
                let name = 'Blockchain Explorer';
                try {
                  const urlObj = new URL(exp);
                  name = urlObj.hostname.replace('www.', '');
                } catch (e) {}

                return (
                  <a
                    key={idx}
                    href={exp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg bg-zinc-900 px-3 py-2 text-zinc-200 hover:text-cyan-400 hover:bg-zinc-800/80 transition-colors border border-zinc-800/60"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      {name}
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
