'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, LineChart, Sparkles, AlertTriangle, Layers, Activity } from 'lucide-react';
import { DexPair } from '@/types/crypto';

interface TradingViewChartProps {
  symbol: string;
  isBinanceAvailable?: boolean;
  dexPairs?: DexPair[];
}

type SupportedExchange = 'BINANCE' | 'MEXC' | 'BYBIT' | 'KUCOIN' | 'BITGET' | 'GATEIO' | 'DEX';

const EXCHANGES: { id: SupportedExchange; label: string; badge: string; color: string }[] = [
  { id: 'BINANCE', label: 'Binance', badge: 'Tier-1', color: 'hover:border-yellow-500/50' },
  { id: 'MEXC', label: 'MEXC', badge: 'Altcoin Gem', color: 'hover:border-emerald-500/50' },
  { id: 'BYBIT', label: 'Bybit', badge: 'Derivatives', color: 'hover:border-amber-500/50' },
  { id: 'KUCOIN', label: 'KuCoin', badge: 'Global', color: 'hover:border-teal-500/50' },
  { id: 'BITGET', label: 'Bitget', badge: 'Futures', color: 'hover:border-cyan-500/50' },
  { id: 'GATEIO', label: 'Gate.io', badge: 'New Listings', color: 'hover:border-blue-500/50' },
  { id: 'DEX', label: 'DEX Screener', badge: 'On-Chain DEX', color: 'hover:border-purple-500/50' },
];

export function TradingViewChart({ symbol, isBinanceAvailable = true, dexPairs = [] }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanSymbol = symbol.toUpperCase().replace(/USDT$/, '');

  // Intelligent initial exchange selection based on coin listing status
  const getInitialExchange = (): SupportedExchange => {
    if (cleanSymbol === 'JCT') return 'MEXC';
    if (!isBinanceAvailable) {
      if (dexPairs && dexPairs.length > 0) return 'MEXC';
      return 'MEXC';
    }
    return 'BINANCE';
  };

  const [selectedExchange, setSelectedExchange] = useState<SupportedExchange>(getInitialExchange);
  const [contractType, setContractType] = useState<'spot' | 'perp'>('spot');
  const [selectedDexIndex, setSelectedDexIndex] = useState<number>(0);

  // Update exchange when coin changes
  useEffect(() => {
    setSelectedExchange(getInitialExchange());
  }, [cleanSymbol, isBinanceAvailable]);

  // Load TradingView Embed Widget when an exchange is selected
  useEffect(() => {
    if (selectedExchange === 'DEX') return;
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const suffix = contractType === 'perp' ? 'USDT.P' : 'USDT';
    const isMemeThousand =
      selectedExchange === 'BINANCE' &&
      ['PEPE', 'SHIB', 'LUNC', 'FLOKI', 'BONK', 'RATS', 'SATS'].includes(cleanSymbol);
    const pairSymbol = isMemeThousand ? `1000${cleanSymbol}${suffix}` : `${cleanSymbol}${suffix}`;
    const tvSymbol = `${selectedExchange}:${pairSymbol}`;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    const widgetConfig = {
      autosize: true,
      symbol: tvSymbol,
      interval: '60',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      backgroundColor: 'rgba(9, 9, 11, 1)',
      gridColor: 'rgba(39, 39, 42, 0.4)',
      studies: [
        'STD;RSI',
        'STD;EMA@tv-basicstudies',
        'STD;Bollinger_Bands',
      ],
      support_host: 'https://www.tradingview.com',
      allow_symbol_change: true,
      details: true,
      hotlist: false,
      toolbar_bg: '#09090b',
    };

    script.innerHTML = JSON.stringify(widgetConfig);

    const widgetWrapper = document.createElement('div');
    widgetWrapper.className = 'tradingview-widget-container__widget';
    widgetWrapper.style.height = '100%';
    widgetWrapper.style.width = '100%';

    containerRef.current.appendChild(widgetWrapper);
    containerRef.current.appendChild(script);
  }, [cleanSymbol, selectedExchange, contractType]);

  const activeDexPair = dexPairs && dexPairs.length > 0 ? dexPairs[selectedDexIndex] || dexPairs[0] : null;
  const isBinanceMissing = !isBinanceAvailable && selectedExchange === 'BINANCE';

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 shadow-xl backdrop-blur-md">
      {/* Top Header & Feed Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <LineChart className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-1.5">
              TradingView Advanced Interactive Chart
              <span className="rounded bg-cyan-950/80 border border-cyan-800 px-1.5 py-0.5 text-[10px] text-cyan-300 font-semibold">
                PRO
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Live WebSocket Feed • Full Technical Indicators • Timeframes 1m to 1D
            </p>
          </div>
        </div>

        {/* Spot vs Perp Toggle & External Link */}
        <div className="flex items-center gap-2">
          {selectedExchange !== 'DEX' && (
            <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setContractType('spot')}
                className={`rounded px-2.5 py-1 transition-all ${
                  contractType === 'spot'
                    ? 'bg-cyan-500 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Spot
              </button>
              <button
                onClick={() => setContractType('perp')}
                className={`rounded px-2.5 py-1 transition-all ${
                  contractType === 'perp'
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Perp
              </button>
            </div>
          )}

          <a
            href={
              selectedExchange === 'DEX' && activeDexPair
                ? `https://dexscreener.com/${activeDexPair.chainId}/${activeDexPair.pairAddress}`
                : `https://www.tradingview.com/symbols/${selectedExchange}-${cleanSymbol}USDT/`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-cyan-400 transition-colors px-2 py-1 rounded bg-zinc-900 border border-zinc-800"
          >
            <span>{selectedExchange === 'DEX' ? 'DexScreener' : 'TradingView'}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Exchange Switcher Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 bg-zinc-950/70 p-2 rounded-xl border border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-zinc-400 px-1">Market Feed:</span>
          {EXCHANGES.map((ex) => {
            const isDex = ex.id === 'DEX';
            if (isDex && (!dexPairs || dexPairs.length === 0)) return null;

            const isActive = selectedExchange === ex.id;
            return (
              <button
                key={ex.id}
                onClick={() => setSelectedExchange(ex.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold shadow-md shadow-cyan-500/20'
                    : `bg-zinc-900 text-zinc-300 border border-zinc-800 ${ex.color} hover:bg-zinc-800/80`
                }`}
              >
                <span>{ex.label}</span>
                <span
                  className={`rounded px-1 py-0.2 text-[9px] font-bold ${
                    isActive ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {ex.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* DEX Pool Switcher if DEX mode is active */}
        {selectedExchange === 'DEX' && dexPairs && dexPairs.length > 1 && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-zinc-400">Pool:</span>
            <select
              value={selectedDexIndex}
              onChange={(e) => setSelectedDexIndex(Number(e.target.value))}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              {dexPairs.map((pair, idx) => (
                <option key={pair.pairAddress} value={idx}>
                  {pair.dexId.toUpperCase()} ({pair.chainId.toUpperCase()}) - ${parseFloat(pair.priceUsd).toFixed(5)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Warning banner if coin is not listed on the chosen exchange */}
      {isBinanceMissing && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-amber-800/70 bg-amber-950/40 p-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              <strong>{cleanSymbol} is not listed on Binance Spot.</strong> TradingView may report &quot;Symbol doesn&apos;t exist&quot;.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedExchange('MEXC')}
              className="rounded bg-emerald-500 px-2.5 py-1 text-xs font-bold text-black hover:bg-emerald-400 transition-colors"
            >
              Switch to MEXC
            </button>
            {dexPairs && dexPairs.length > 0 && (
              <button
                onClick={() => setSelectedExchange('DEX')}
                className="rounded bg-purple-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
              >
                Switch to DEX Screener
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Chart Canvas Box */}
      <div className="h-[600px] w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
        {selectedExchange === 'DEX' ? (
          activeDexPair ? (
            <iframe
              src={`https://dexscreener.com/${activeDexPair.chainId}/${activeDexPair.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
              title={`${cleanSymbol} DEX Screener Chart`}
              className="w-full h-full border-0"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-400">
              <Layers className="h-8 w-8 text-zinc-600" />
              <p>No verified on-chain DEX pool found for this symbol.</p>
              <button
                onClick={() => setSelectedExchange('MEXC')}
                className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-black"
              >
                View on MEXC Chart
              </button>
            </div>
          )
        ) : (
          <div
            ref={containerRef}
            className="tradingview-widget-container h-full w-full"
            style={{ height: '100%', width: '100%' }}
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/60 pt-2">
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          Active Feed: <strong className="text-zinc-300">{selectedExchange}</strong> • Switch timeframes (1m, 5m, 15m, 1H, 4H, 1D) or click &apos;Change symbol&apos; inside chart
        </span>
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-emerald-400" />
          Multi-Exchange Engine v2.5
        </span>
      </div>
    </div>
  );
}
