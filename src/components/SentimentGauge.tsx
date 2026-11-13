'use client';

import React from 'react';
import { HeartHandshake, Flame, ThumbsUp, ThumbsDown, MessageSquare, Share2 } from 'lucide-react';
import { SocialSentiment } from '@/types/crypto';

interface SentimentGaugeProps {
  sentiment: SocialSentiment;
  symbol: string;
}

export function SentimentGauge({ sentiment, symbol }: SentimentGaugeProps) {
  const { sentimentScore, sentimentVotesUp, sentimentVotesDown, twitterFollowers, redditSubscribers, fearAndGreedIndex } =
    sentiment;

  const getFearColor = (val: number) => {
    if (val <= 25) return 'text-red-400 bg-red-950/40 border-red-800/60';
    if (val <= 45) return 'text-orange-400 bg-orange-950/40 border-orange-800/60';
    if (val <= 55) return 'text-yellow-400 bg-yellow-950/40 border-yellow-800/60';
    if (val <= 75) return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
    return 'text-green-300 bg-green-950/40 border-green-700/60';
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">Sentiment & Social Intelligence</h2>
        </div>
        <span className="text-xs text-zinc-400">Crowd & Macro Psychology</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Macro Fear & Greed Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase">Macro Market Climate</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-white">{fearAndGreedIndex.value} / 100</div>
              <div className="text-xs text-zinc-400">{fearAndGreedIndex.classification}</div>
            </div>
            <div
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${getFearColor(
                fearAndGreedIndex.value
              )}`}
            >
              {fearAndGreedIndex.classification.toUpperCase()}
            </div>
          </div>

          {/* Meter Bar */}
          <div className="mt-3 h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-400"
              style={{ width: `${fearAndGreedIndex.value}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-zinc-500">
            <span>0 Extreme Fear</span>
            <span>50 Neutral</span>
            <span>100 Extreme Greed</span>
          </div>
        </div>

        {/* Coin Specific Community Vote Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase">Community Bias ({symbol})</span>
            <span className="text-xs font-bold text-cyan-400">Score: {sentimentScore}%</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-400">
              <ThumbsUp className="h-3.5 w-3.5" /> Bullish: {sentimentVotesUp.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              Bearish: {sentimentVotesDown.toFixed(1)}% <ThumbsDown className="h-3.5 w-3.5" />
            </span>
          </div>

          {/* Dual sentiment bar */}
          <div className="mt-2.5 flex h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${sentimentVotesUp}%` }}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${sentimentVotesDown}%` }}
            />
          </div>

          {/* Social Stats */}
          <div className="mt-3.5 flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1">
              <Share2 className="h-3 w-3 text-cyan-400" />
              <span>Twitter / X: {twitterFollowers ? `${(twitterFollowers / 1000).toFixed(0)}k` : 'Active'}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-orange-400" />
              <span>Reddit: {redditSubscribers ? `${(redditSubscribers / 1000).toFixed(0)}k subs` : 'Tracked'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
