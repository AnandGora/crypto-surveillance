'use client';

import React from 'react';
import { Compass, ShieldAlert, ShieldCheck, ExternalLink, Zap, AlertTriangle } from 'lucide-react';
import { DexPair, ContractSecurity } from '@/types/crypto';

interface DexScannerProps {
  dexPairs: DexPair[];
  security: ContractSecurity;
  symbol: string;
}

export function DexScanner({ dexPairs, security, symbol }: DexScannerProps) {
  const formatUSD = (val?: number) => {
    if (!val || val === 0) return '$0.00';
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">DEX Liquidity & Smart Contract Security</h2>
        </div>
        <span className="text-xs text-zinc-400">DexScreener Multi-Chain Scanner</span>
      </div>

      {/* Contract Audit Security Checklist */}
      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            {security.auditStatus === 'Safe' ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            ) : security.auditStatus === 'Caution' ? (
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-rose-500" />
            )}
            <span className="text-xs font-bold text-white">Security Checklist & Threat Flags</span>
          </div>
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
              security.auditStatus === 'Safe'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : security.auditStatus === 'Caution'
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            {security.auditStatus.toUpperCase()}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div className="rounded-lg bg-zinc-900/60 p-2 border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px]">Honeypot Check</span>
            <div className={`mt-0.5 font-bold ${security.isHoneypot ? 'text-rose-400' : 'text-emerald-400'}`}>
              {security.isHoneypot ? 'DANGER: HONEYPOT' : 'Passed (Can Sell)'}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900/60 p-2 border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px]">Buy / Sell Tax</span>
            <div className="mt-0.5 font-bold text-emerald-400">
              {security.buyTax}% / {security.sellTax}% (Clean)
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900/60 p-2 border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px]">Mint Function</span>
            <div className={`mt-0.5 font-bold ${security.isMintable ? 'text-amber-400' : 'text-emerald-400'}`}>
              {security.isMintable ? 'Mintable Risk' : 'Disabled / Capped'}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900/60 p-2 border border-zinc-800/60">
            <span className="text-zinc-500 text-[10px]">Liquidity State</span>
            <div className={`mt-0.5 font-bold ${security.liquidityLocked ? 'text-emerald-400' : 'text-amber-400'}`}>
              {security.liquidityLocked ? 'Established' : 'Low / Unverified'}
            </div>
          </div>
        </div>

        {security.notes.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-zinc-800/60 pt-2 text-[11px] text-amber-300">
            {security.notes.map((n, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>{n}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DEX Pools Table */}
      <div className="mt-4">
        <div className="text-xs font-semibold text-zinc-300 mb-2">
          Top Verified DEX Pools for {symbol}
        </div>

        {dexPairs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase">
                <tr>
                  <th className="py-2">DEX / Chain</th>
                  <th className="py-2">Pair</th>
                  <th className="py-2">Price USD</th>
                  <th className="py-2">Liquidity</th>
                  <th className="py-2">24h Volume</th>
                  <th className="py-2">Buys / Sells</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 font-mono">
                {dexPairs.slice(0, 5).map((pair, idx) => {
                  const buyRatio =
                    pair.txns24h.buys + pair.txns24h.sells > 0
                      ? Math.round(
                          (pair.txns24h.buys / (pair.txns24h.buys + pair.txns24h.sells)) * 100
                        )
                      : 50;

                  return (
                    <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-2.5 font-sans font-medium text-white flex items-center gap-1.5">
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-cyan-400 uppercase">
                          {pair.chainId}
                        </span>
                        <span className="capitalize">{pair.dexId}</span>
                      </td>
                      <td className="py-2.5 text-zinc-300 font-sans">
                        {pair.baseToken.symbol}/{pair.quoteToken.symbol}
                      </td>
                      <td className="py-2.5 text-white">${parseFloat(pair.priceUsd).toFixed(4)}</td>
                      <td className="py-2.5 font-semibold text-emerald-400">
                        {formatUSD(pair.liquidityUsd)}
                      </td>
                      <td className="py-2.5 text-zinc-300">{formatUSD(pair.volume24h)}</td>
                      <td className="py-2.5 font-sans">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-emerald-400">{pair.txns24h.buys}</span>
                          <span className="text-zinc-600">/</span>
                          <span className="text-rose-400">{pair.txns24h.sells}</span>
                          <span className="text-[10px] text-zinc-500">({buyRatio}% buy)</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-sans">
                        {pair.pairAddress && (
                          <a
                            href={`https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs"
                          >
                            <span>DEX</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-zinc-500">
            No active DEX pools found for this ticker on DexScreener.
          </div>
        )}
      </div>
    </div>
  );
}
