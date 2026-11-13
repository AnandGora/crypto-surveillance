'use client';

import React, { useEffect, useRef } from 'react';
import { ExternalLink, LineChart, Sparkles } from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
}

export function TradingViewChart({ symbol }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanSymbol = symbol.toUpperCase().replace(/USDT$/, '');

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    // Create TradingView widget script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    // Symbol mapping for TradingView
    const tvSymbol = `BINANCE:${cleanSymbol}USDT`;

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
  }, [cleanSymbol]);

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 shadow-xl backdrop-blur-md">
      {/* Header Banner */}
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
              Live Binance WebSocket Feed • Full Indicators • Drawing Tools
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <a
            href={`https://www.tradingview.com/symbols/BINANCE-${cleanSymbol}USDT/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-zinc-400 hover:text-cyan-400 transition-colors"
          >
            <span>TradingView.com</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* TradingView Widget Embed Box */}
      <div className="h-[600px] w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
        <div
          ref={containerRef}
          className="tradingview-widget-container h-full w-full"
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/60 pt-2">
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          Directly switch timeframes (1m, 5m, 15m, 1H, 4H, 1D) or search any symbol inside the chart
        </span>
        <span>TradingView Engine v2</span>
      </div>
    </div>
  );
}
