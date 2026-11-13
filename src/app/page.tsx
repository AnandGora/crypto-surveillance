'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { TickerBar } from '@/components/TickerBar';
import { CoinHeader } from '@/components/CoinHeader';
import { RiskRadar } from '@/components/RiskRadar';
import { TradingViewChart } from '@/components/TradingViewChart';
import { FuturesSurveillance } from '@/components/FuturesSurveillance';
import { CoinInfoFundamentals } from '@/components/CoinInfoFundamentals';
import { OrderBookDepth } from '@/components/OrderBookDepth';
import { DexScanner } from '@/components/DexScanner';
import { GithubSurveillance } from '@/components/GithubSurveillance';
import { SentimentGauge } from '@/components/SentimentGauge';
import { NewsWire } from '@/components/NewsWire';
import { WatchlistDrawer } from '@/components/WatchlistDrawer';
import { AnomalyAlerts } from '@/components/AnomalyAlerts';
import { CoinGlassIntelligence } from '@/components/CoinGlassIntelligence';
import { AiReviewModal } from '@/components/AiReviewModal';
import { WhaleTradesTape } from '@/components/WhaleTradesTape';
import { FuturesCalculatorModal } from '@/components/FuturesCalculatorModal';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { SurveillanceReport, CryptoNewsItem, WatchlistCoin } from '@/types/crypto';
import {
  ShieldCheck,
  Layers,
  Compass,
  Code,
  HeartHandshake,
  Newspaper,
  RefreshCw,
  AlertCircle,
  Zap,
  Info,
  LineChart,
  Flame,
  Bot,
  Radio,
  Calculator,
  Keyboard,
} from 'lucide-react';

export default function SurveillancePage() {
  const [selectedCoin, setSelectedCoin] = useState<string>('BTC');
  const [currentInterval, setCurrentInterval] = useState<string>('1h');
  const [report, setReport] = useState<SurveillanceReport | null>(null);
  const [news, setNews] = useState<CryptoNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'coinglass' | 'tradingview' | 'futures' | 'trades' | 'depth' | 'dex' | 'fundamentals' | 'dev' | 'sentiment' | 'news'>('overview');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(3); // 3s fast default
  const [isWatchlistOpen, setIsWatchlistOpen] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<WatchlistCoin[]>([]);
  const [quickTickers, setQuickTickers] = useState<{ [symbol: string]: { price: number; change24h: number } }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Persistent live Binance Futures reference to prevent stale server overrides
  const liveBinanceTickerRef = useRef<{
    symbol: string;
    price: number;
    priceChange24h: number;
    priceChangePercent24h: number;
    high24h: number;
    low24h: number;
    quoteVolume24h: number;
    timestamp: number;
  } | null>(null);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('crypto_eye_watchlist');
      if (saved) {
        setWatchlist(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load watchlist from localStorage', e);
    }
  }, []);

  // Save watchlist to localStorage
  const saveWatchlist = (newList: WatchlistCoin[]) => {
    setWatchlist(newList);
    try {
      localStorage.setItem('crypto_eye_watchlist', JSON.stringify(newList));
    } catch (e) {
      console.warn('Failed to save watchlist to localStorage', e);
    }
  };

  const handleToggleWatchlist = () => {
    if (!report) return;
    const exists = watchlist.some((w) => w.symbol === report.coin.symbol);
    if (exists) {
      saveWatchlist(watchlist.filter((w) => w.symbol !== report.coin.symbol));
    } else {
      const newItem: WatchlistCoin = {
        symbol: report.coin.symbol,
        name: report.coin.name,
        price: report.ticker.price,
        change24h: report.ticker.priceChangePercent24h,
        score: report.risk.overallScore,
        addedAt: Date.now(),
      };
      saveWatchlist([newItem, ...watchlist]);
    }
  };

  const isCurrentWatchlisted = report ? watchlist.some((w) => w.symbol === report.coin.symbol) : false;

  // Global Keyboard Shortcuts Listener for High-Frequency Traders
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === '1') {
        setActiveTab('overview');
      } else if (e.key === '2') {
        setActiveTab('coinglass');
      } else if (e.key === '3') {
        setActiveTab('tradingview');
      } else if (e.key === '4') {
        setActiveTab('futures');
      } else if (e.key === '5') {
        setActiveTab('trades');
      } else if (e.key === '6') {
        setActiveTab('depth');
      } else if (e.key.toLowerCase() === 'r') {
        handleToggleWatchlist();
      } else if (e.key.toLowerCase() === 'c') {
        setIsCalculatorOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'a') {
        setIsAiModalOpen((prev) => !prev);
      } else if (e.key === '?') {
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCalculatorOpen(false);
        setIsAiModalOpen(false);
        setIsShortcutsOpen(false);
        setIsWatchlistOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [report, watchlist]);

  // Fetch Surveillance Report
  const loadSurveillance = useCallback(async (coinSymbol: string, interval = currentInterval, silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/surveillance?coin=${encodeURIComponent(coinSymbol)}&interval=${interval}&_t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`Surveillance request failed with status ${res.status}`);
      }
      const data: SurveillanceReport = await res.json();

      // Ensure live Binance Futures ticker is NEVER overwritten by stale server fallback!
      const cleanSym = coinSymbol.toUpperCase().replace(/USDT$/, '');
      if (liveBinanceTickerRef.current && liveBinanceTickerRef.current.symbol === cleanSym) {
        data.ticker.price = liveBinanceTickerRef.current.price;
        data.ticker.priceChangePercent24h = liveBinanceTickerRef.current.priceChangePercent24h;
        data.ticker.high24h = liveBinanceTickerRef.current.high24h;
        data.ticker.low24h = liveBinanceTickerRef.current.low24h;
        data.ticker.quoteVolume24h = liveBinanceTickerRef.current.quoteVolume24h;
        if (data.futures) {
          data.futures.markPrice = liveBinanceTickerRef.current.price;
        }
      }

      setReport(data);

      setQuickTickers((prev) => ({
        ...prev,
        [data.coin.symbol]: {
          price: data.ticker.price,
          change24h: data.ticker.priceChangePercent24h,
        },
      }));
    } catch (err: any) {
      console.error('Surveillance fetch error:', err);
      if (!silent) {
        setErrorMessage(err?.message || 'Error fetching surveillance data');
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [currentInterval]);

  // Fetch News Feed
  const loadNews = useCallback(async () => {
    setIsNewsLoading(true);
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        if (data.news) setNews(data.news);
      }
    } catch (err) {
      console.warn('Failed to fetch news feed', err);
    } finally {
      setIsNewsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSurveillance(selectedCoin, currentInterval, false);
    loadNews();
  }, [selectedCoin, currentInterval, loadSurveillance, loadNews]);

  // Fast Auto-refresh polling (1s / 3s)
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const timer = setInterval(() => {
      loadSurveillance(selectedCoin, currentInterval, true);
    }, refreshInterval * 1000);

    return () => clearInterval(timer);
  }, [refreshInterval, selectedCoin, currentInterval, loadSurveillance]);

  // Bulk Quick Radar & Watchlist Ticker Synchronizer
  useEffect(() => {
    let isCancelled = false;

    const fetchAllQuickTickers = async () => {
      try {
        // 1. Fetch bulk Binance Futures 24hr tickers (single request for 800+ symbols)
        const res = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr');
        if (res.ok && !isCancelled) {
          const list = await res.json();
          const tickerMap: { [symbol: string]: { price: number; change24h: number } } = {};

          if (Array.isArray(list)) {
            for (const item of list) {
              const sym = item.symbol.replace(/USDT$/, '').replace(/^1000/, '');
              tickerMap[sym] = {
                price: parseFloat(item.lastPrice || '0'),
                change24h: parseFloat(item.priceChangePercent || '0'),
              };
            }
          }

          // 2. Fetch for any Watchlist or Quick Radar coin not on Binance Futures (e.g. JCT on MEXC)
          const allWatchlistSymbols = watchlist.map((w) => w.symbol.toUpperCase());
          const missingWatchlistCoins = allWatchlistSymbols.filter((sym) => !tickerMap[sym]);

          for (const mSym of missingWatchlistCoins) {
            try {
              const mexcRes = await fetch(
                `https://api.mexc.com/api/v3/ticker/24hr?symbol=${mSym}USDT`
              );
              if (mexcRes.ok) {
                const mexcData = await mexcRes.json();
                if (mexcData && mexcData.lastPrice) {
                  tickerMap[mSym] = {
                    price: parseFloat(mexcData.lastPrice),
                    change24h: parseFloat(mexcData.priceChangePercent || '0') * 100,
                  };
                }
              }
            } catch (e) {}
          }

          setQuickTickers((prev) => ({
            ...prev,
            ...tickerMap,
          }));

          // 3. Keep watchlist in localStorage & state synced with live refreshed prices
          setWatchlist((prevWatchlist) => {
            let hasChanged = false;
            const updated = prevWatchlist.map((item) => {
              const clean = item.symbol.toUpperCase();
              const live = tickerMap[clean];
              if (
                live &&
                live.price > 0 &&
                (Math.abs(live.price - item.price) > 0.000001 ||
                  Math.abs(live.change24h - item.change24h) > 0.1)
              ) {
                hasChanged = true;
                return {
                  ...item,
                  price: live.price,
                  change24h: live.change24h,
                };
              }
              return item;
            });
            if (hasChanged) {
              try {
                localStorage.setItem('crypto_eye_watchlist', JSON.stringify(updated));
              } catch (e) {}
              return updated;
            }
            return prevWatchlist;
          });
        }
      } catch (e) {
        console.warn('Failed to bulk sync quick tickers', e);
      }
    };

    fetchAllQuickTickers();
    const interval = setInterval(fetchAllQuickTickers, 3000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [watchlist.length]);

  // Live Binance Futures Ticker Synchronizer (Zero price difference with live Binance!)
  useEffect(() => {
    if (!selectedCoin) return;
    let isCancelled = false;
    const clean = selectedCoin.toUpperCase().replace(/USDT$/, '');
    const isMemeThousand = ['PEPE', 'SHIB', 'LUNC', 'FLOKI', 'BONK', 'RATS', 'SATS', 'CAT'].includes(clean);
    const binancePair = isMemeThousand ? `1000${clean}USDT` : `${clean}USDT`;

    // 1. Immediate client-side fetch from Binance Futures
    const syncDirectFutures = async () => {
      try {
        const res = await fetch(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${binancePair}`);
        if (res.ok && !isCancelled) {
          const d = await res.json();
          const lastPrice = parseFloat(d.lastPrice);
          const priceChange = parseFloat(d.priceChange);
          const priceChangePercent = parseFloat(d.priceChangePercent);
          const highPrice = parseFloat(d.highPrice);
          const lowPrice = parseFloat(d.lowPrice);
          const quoteVolume = parseFloat(d.quoteVolume);

          liveBinanceTickerRef.current = {
            symbol: clean,
            price: lastPrice,
            priceChange24h: priceChange,
            priceChangePercent24h: priceChangePercent,
            high24h: highPrice,
            low24h: lowPrice,
            quoteVolume24h: quoteVolume,
            timestamp: Date.now(),
          };

          setReport((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              ticker: {
                ...prev.ticker,
                price: lastPrice,
                priceChange24h: priceChange,
                priceChangePercent24h: priceChangePercent,
                high24h: highPrice,
                low24h: lowPrice,
                quoteVolume24h: quoteVolume,
              },
              futures: prev.futures
                ? {
                    ...prev.futures,
                    markPrice: lastPrice,
                  }
                : prev.futures,
            };
          });
        }
      } catch (e) {}
    };

    syncDirectFutures();
    const futuresTimer = setInterval(syncDirectFutures, 1500);

    // 2. Real-Time Binance Futures WebSocket
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`wss://fstream.binance.com/ws/${binancePair.toLowerCase()}@ticker`);
      ws.onmessage = (event) => {
        if (isCancelled) return;
        try {
          const d = JSON.parse(event.data);
          if (d.c) {
            const lastPrice = parseFloat(d.c);
            const priceChangePercent = parseFloat(d.P || '0');
            const highPrice = parseFloat(d.h || '0');
            const lowPrice = parseFloat(d.l || '0');

            if (liveBinanceTickerRef.current && liveBinanceTickerRef.current.symbol === clean) {
              liveBinanceTickerRef.current.price = lastPrice;
              liveBinanceTickerRef.current.priceChangePercent24h = priceChangePercent;
              if (highPrice > 0) liveBinanceTickerRef.current.high24h = highPrice;
              if (lowPrice > 0) liveBinanceTickerRef.current.low24h = lowPrice;
              liveBinanceTickerRef.current.timestamp = Date.now();
            }

            setReport((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                ticker: {
                  ...prev.ticker,
                  price: lastPrice,
                  priceChangePercent24h: priceChangePercent,
                  high24h: highPrice > 0 ? highPrice : prev.ticker.high24h,
                  low24h: lowPrice > 0 ? lowPrice : prev.ticker.low24h,
                },
                futures: prev.futures
                  ? {
                      ...prev.futures,
                      markPrice: lastPrice,
                    }
                  : prev.futures,
              };
            });
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      isCancelled = true;
      clearInterval(futuresTimer);
      if (ws) ws.close();
    };
  }, [selectedCoin]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Navigation */}
      <Navbar
        currentSymbol={selectedCoin}
        onSelectCoin={(sym) => setSelectedCoin(sym)}
        onRefresh={() => loadSurveillance(selectedCoin, currentInterval, false)}
        isLoading={isLoading}
        refreshInterval={refreshInterval}
        onSetRefreshInterval={(val) => setRefreshInterval(val)}
        watchlistCount={watchlist.length}
        onToggleWatchlist={() => setIsWatchlistOpen(true)}
        fearAndGreed={report?.sentiment?.fearAndGreedIndex}
      />

      {/* Top Ticker Bar */}
      <TickerBar
        currentSymbol={selectedCoin}
        onSelectCoin={(sym) => setSelectedCoin(sym)}
        quickTickers={quickTickers}
        watchlist={watchlist}
        onOpenRadar={() => setIsWatchlistOpen(true)}
      />

      {/* Main Surveillance Container */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6">
        {errorMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-800 bg-rose-950/60 p-4 text-xs text-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage} - Using decentralized intelligence fallbacks.</span>
          </div>
        )}

        {report ? (
          <div className="space-y-6">
            {/* Coin Header */}
            <CoinHeader
              report={report}
              isWatchlisted={isCurrentWatchlisted}
              onToggleWatchlist={handleToggleWatchlist}
              onOpenAiReview={() => setIsAiModalOpen(true)}
              onOpenCalculator={() => setIsCalculatorOpen(true)}
            />

            {/* Anomaly Alerts Banner */}
            <AnomalyAlerts report={report} />

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto no-scrollbar items-center gap-2 border-b border-zinc-800 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Overview & Threat Radar</span>
              </button>

              <button
                onClick={() => setActiveTab('coinglass')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'coinglass'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Flame className="h-4 w-4 text-amber-400" />
                <span>CoinGlass Deep Intel</span>
              </button>

              <button
                onClick={() => setActiveTab('tradingview')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'tradingview'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <LineChart className="h-4 w-4 text-cyan-400" />
                <span>TradingView Chart</span>
              </button>

              <button
                onClick={() => setActiveTab('futures')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'futures'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Zap className="h-4 w-4 text-amber-400" />
                <span>Futures, OI & Funding</span>
              </button>

              <button
                onClick={() => setActiveTab('trades')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'trades'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Radio className="h-4 w-4 text-cyan-400" />
                <span>Whale Trades Tape</span>
              </button>

              <button
                onClick={() => setActiveTab('depth')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'depth'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Order Book & Depth</span>
              </button>

              <button
                onClick={() => setActiveTab('dex')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'dex'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Compass className="h-4 w-4" />
                <span>DEX & Security Scanner</span>
              </button>

              <button
                onClick={() => setActiveTab('fundamentals')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'fundamentals'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Info className="h-4 w-4" />
                <span>Info & Tokenomics</span>
              </button>

              <button
                onClick={() => setActiveTab('dev')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'dev'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Code className="h-4 w-4" />
                <span>Developer Surveillance</span>
              </button>

              <button
                onClick={() => setActiveTab('sentiment')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'sentiment'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <HeartHandshake className="h-4 w-4" />
                <span>Sentiment & Crowd</span>
              </button>

              <button
                onClick={() => setActiveTab('news')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'news'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Newspaper className="h-4 w-4" />
                <span>News Wire</span>
              </button>

              {/* Pro Trader Utilities on the right */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setIsCalculatorOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-xs font-bold text-zinc-200 hover:border-cyan-500 hover:text-cyan-300 hover:bg-zinc-800 transition-all whitespace-nowrap shadow-sm"
                  title="Open Leverage & Liquidation Calculator (Press C)"
                >
                  <Calculator className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Calculator</span>
                </button>

                <button
                  onClick={() => setIsShortcutsOpen(true)}
                  className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 px-2.5 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all whitespace-nowrap"
                  title="Keyboard Shortcuts Guide (Press ?)"
                >
                  <Keyboard className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">?</span>
                </button>

                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-800 bg-cyan-950/80 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-900 shadow-md shadow-cyan-500/10 transition-all whitespace-nowrap"
                >
                  <Bot className="h-4 w-4 text-cyan-400" />
                  <span>AI Exporter</span>
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <RiskRadar risk={report.risk} />

                {/* CoinGlass Deep Intelligence & Liquidation Heatmap */}
                <CoinGlassIntelligence
                  report={report}
                  onOpenAiModal={() => setIsAiModalOpen(true)}
                />

                {/* TradingView Chart right inside Overview */}
                <TradingViewChart
                  symbol={report.coin.symbol}
                  isBinanceAvailable={report.dataSource.binance}
                  dexPairs={report.dexPairs}
                />

                {/* Futures Highlight Card if available */}
                {report.futures.hasFutures && (
                  <FuturesSurveillance
                    futures={report.futures}
                    symbol={report.coin.symbol}
                    onOpenCalculator={() => setIsCalculatorOpen(true)}
                  />
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <WhaleTradesTape symbol={report.coin.symbol} currentPrice={report.ticker.price} />
                  <OrderBookDepth orderBook={report.orderBook} symbol={report.coin.symbol} />
                </div>

                <DexScanner
                  dexPairs={report.dexPairs}
                  security={report.security}
                  symbol={report.coin.symbol}
                />
              </div>
            )}

            {activeTab === 'coinglass' && (
              <div className="space-y-6">
                <CoinGlassIntelligence
                  report={report}
                  onOpenAiModal={() => setIsAiModalOpen(true)}
                />
              </div>
            )}

            {activeTab === 'tradingview' && (
              <div className="space-y-6">
                <TradingViewChart
                  symbol={report.coin.symbol}
                  isBinanceAvailable={report.dataSource.binance}
                  dexPairs={report.dexPairs}
                />
              </div>
            )}

            {activeTab === 'futures' && (
              <div className="space-y-6">
                <FuturesSurveillance
                  futures={report.futures}
                  symbol={report.coin.symbol}
                  onOpenCalculator={() => setIsCalculatorOpen(true)}
                />
              </div>
            )}

            {activeTab === 'trades' && (
              <div className="space-y-6">
                <WhaleTradesTape symbol={report.coin.symbol} currentPrice={report.ticker.price} />
              </div>
            )}

            {activeTab === 'depth' && (
              <div className="space-y-6">
                <OrderBookDepth orderBook={report.orderBook} symbol={report.coin.symbol} />
              </div>
            )}

            {activeTab === 'dex' && (
              <div className="space-y-6">
                <DexScanner
                  dexPairs={report.dexPairs}
                  security={report.security}
                  symbol={report.coin.symbol}
                />
              </div>
            )}

            {activeTab === 'fundamentals' && (
              <div className="space-y-6">
                <CoinInfoFundamentals fundamentals={report.fundamentals} coin={report.coin} />
              </div>
            )}

            {activeTab === 'dev' && (
              <div className="space-y-6">
                <GithubSurveillance metrics={report.devMetrics} symbol={report.coin.symbol} />
              </div>
            )}

            {activeTab === 'sentiment' && (
              <div className="space-y-6">
                <SentimentGauge sentiment={report.sentiment} symbol={report.coin.symbol} />
              </div>
            )}

            {activeTab === 'news' && (
              <div className="space-y-6">
                <NewsWire news={news} isLoading={isNewsLoading} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-96 flex-col items-center justify-center text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
            <h3 className="text-lg font-bold text-white">Connecting Real-Time Exchange Feeds...</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Polling live order books, futures metrics, and global market prices
            </p>
          </div>
        )}
      </main>

      {/* Watchlist Drawer */}
      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlist={watchlist}
        onSelectCoin={(sym) => setSelectedCoin(sym)}
        onRemoveCoin={(sym) => saveWatchlist(watchlist.filter((w) => w.symbol !== sym))}
      />

      {/* AI Review Modal for ChatGPT, Claude, Gemini */}
      {report && (
        <AiReviewModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          report={report}
        />
      )}

      {/* Binance Futures Leverage & Liquidation Calculator */}
      <FuturesCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        symbol={selectedCoin}
        currentPrice={report?.ticker?.price || 0}
      />

      {/* Pro Trader Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-zinc-300">CryptoEye Surveillance System</span>
            <span>• TradingView & Binance Intelligence</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:border-zinc-700 transition-colors"
            >
              <Keyboard className="h-3.5 w-3.5" />
              <span>Hotkeys (Press ?)</span>
            </button>
            <span>TradingView Pro</span>
            <span>Binance Futures API</span>
            <span>Bybit</span>
            <span>MEXC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
