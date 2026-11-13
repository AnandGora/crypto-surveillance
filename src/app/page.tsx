'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

export default function SurveillancePage() {
  const [selectedCoin, setSelectedCoin] = useState<string>('BTC');
  const [currentInterval, setCurrentInterval] = useState<string>('1h');
  const [report, setReport] = useState<SurveillanceReport | null>(null);
  const [news, setNews] = useState<CryptoNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'coinglass' | 'tradingview' | 'futures' | 'depth' | 'dex' | 'fundamentals' | 'dev' | 'sentiment' | 'news'>('overview');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(3); // 3s fast default
  const [isWatchlistOpen, setIsWatchlistOpen] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<WatchlistCoin[]>([]);
  const [quickTickers, setQuickTickers] = useState<{ [symbol: string]: { price: number; change24h: number } }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            };
          });
        }
      } catch (e) {}
    };

    syncDirectFutures();

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
              };
            });
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      isCancelled = true;
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
            />

            {/* Anomaly Alerts Banner */}
            <AnomalyAlerts report={report} />

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-zinc-800 pb-2">
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

              <button
                onClick={() => setIsAiModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-800 bg-cyan-950/80 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-900 shadow-md shadow-cyan-500/10 transition-all whitespace-nowrap ml-auto"
              >
                <Bot className="h-4 w-4 text-cyan-400" />
                <span>AI Exporter (ChatGPT/Claude/Gemini)</span>
              </button>
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
                  <FuturesSurveillance futures={report.futures} symbol={report.coin.symbol} />
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <OrderBookDepth orderBook={report.orderBook} symbol={report.coin.symbol} />
                  <DexScanner
                    dexPairs={report.dexPairs}
                    security={report.security}
                    symbol={report.coin.symbol}
                  />
                </div>
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
                <FuturesSurveillance futures={report.futures} symbol={report.coin.symbol} />
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

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-zinc-300">CryptoEye Surveillance System</span>
            <span>• TradingView & Binance Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>TradingView Pro</span>
            <span>Binance Authenticated API</span>
            <span>Bybit</span>
            <span>CoinGecko</span>
            <span>GitHub</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
