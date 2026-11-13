'use client';

import React, { useState } from 'react';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CryptoNewsItem } from '@/types/crypto';

interface NewsWireProps {
  news: CryptoNewsItem[];
  isLoading?: boolean;
}

export function NewsWire({ news, isLoading }: NewsWireProps) {
  const [filter, setFilter] = useState<'ALL' | 'Bullish' | 'Bearish' | 'Neutral'>('ALL');

  const filteredNews = filter === 'ALL' ? news : news.filter((n) => n.sentiment === filter);

  const getSentimentBadge = (sentiment: CryptoNewsItem['sentiment']) => {
    switch (sentiment) {
      case 'Bullish':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/60">
            <TrendingUp className="h-2.5 w-2.5" /> Bullish
          </span>
        );
      case 'Bearish':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800/60">
            <TrendingDown className="h-2.5 w-2.5" /> Bearish
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
            <Minus className="h-2.5 w-2.5" /> Neutral
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Live Intelligence & Crypto News Wire</h2>
        </div>

        {/* Sentiment Filter Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1 text-xs">
          {(['ALL', 'Bullish', 'Bearish', 'Neutral'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded px-2.5 py-0.5 font-medium transition-colors ${
                filter === tab ? 'bg-cyan-500/20 text-cyan-300' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 divide-y divide-zinc-800/60">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            Scanning crypto intelligence news wires...
          </div>
        ) : filteredNews.length > 0 ? (
          filteredNews.slice(0, 8).map((item) => (
            <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 hover:bg-zinc-800/20 px-2 rounded-lg transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getSentimentBadge(item.sentiment)}
                    <span className="text-[11px] font-medium text-zinc-400">{item.source}</span>
                    <span className="text-[11px] text-zinc-600">•</span>
                    <span className="text-[11px] text-zinc-500">{item.publishedAt}</span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm font-semibold text-zinc-100 hover:text-cyan-400 transition-colors"
                  >
                    {item.title}
                  </a>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{item.summary}</p>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-zinc-500 hover:text-cyan-400 transition-colors"
                  title="Read Source"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-zinc-500">
            No news items matching selected sentiment filter.
          </div>
        )}
      </div>
    </div>
  );
}
