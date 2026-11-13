'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Shield, Droplets, Activity, GitBranch, HeartHandshake } from 'lucide-react';
import { RiskAnalysis } from '@/types/crypto';

interface RiskRadarProps {
  risk: RiskAnalysis;
}

export function RiskRadar({ risk }: RiskRadarProps) {
  const { overallScore, healthGrade, verdict, breakdown, redFlags, greenFlags } = risk;

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getBarColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.75) return 'bg-emerald-500';
    if (ratio >= 0.5) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white sm:text-lg">Surveillance Threat & Health Radar</h2>
        </div>
        <span className="text-xs text-zinc-400">Algorithmic Risk Assessment</span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Big Overall Score Dial */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-6 text-center lg:col-span-4">
          <div className="relative flex h-36 w-36 items-center justify-center">
            {/* SVG circular progress */}
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="#27272a"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * overallScore) / 100}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${getScoreColor(overallScore)}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-white">{overallScore}</span>
              <span className="text-[10px] uppercase font-semibold text-zinc-400">Score / 100</span>
            </div>
          </div>

          <div className="mt-4">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                overallScore >= 75
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : overallScore >= 50
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              Grade {healthGrade} • {verdict}
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            {overallScore >= 75
              ? 'Multi-factor parameters show solid liquidity, low threat vectors, and active developer support.'
              : overallScore >= 50
              ? 'Moderate volatility and speculative flow observed. Exercise position-sizing discipline.'
              : 'Elevated threat signals detected. High volatility, low order book support or dormant activity.'}
          </p>
        </div>

        {/* Right Column: 4 Factor Breakdown Bars */}
        <div className="flex flex-col justify-between space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-5 lg:col-span-8">
          <div className="space-y-4">
            {/* Liquidity */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                  Order Book & DEX Liquidity
                </span>
                <span className="text-zinc-200">{breakdown.liquidity} / 25</span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getBarColor(
                    breakdown.liquidity,
                    25
                  )}`}
                  style={{ width: `${(breakdown.liquidity / 25) * 100}%` }}
                />
              </div>
            </div>

            {/* Volatility */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Activity className="h-3.5 w-3.5 text-amber-400" />
                  Volatility & Price Stability
                </span>
                <span className="text-zinc-200">{breakdown.volatility} / 25</span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getBarColor(
                    breakdown.volatility,
                    25
                  )}`}
                  style={{ width: `${(breakdown.volatility / 25) * 100}%` }}
                />
              </div>
            </div>

            {/* Development */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <GitBranch className="h-3.5 w-3.5 text-purple-400" />
                  Developer Activity & GitHub Health
                </span>
                <span className="text-zinc-200">{breakdown.development} / 25</span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getBarColor(
                    breakdown.development,
                    25
                  )}`}
                  style={{ width: `${(breakdown.development / 25) * 100}%` }}
                />
              </div>
            </div>

            {/* Sentiment */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <HeartHandshake className="h-3.5 w-3.5 text-emerald-400" />
                  Community Sentiment & Order Flow
                </span>
                <span className="text-zinc-200">{breakdown.sentiment} / 25</span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getBarColor(
                    breakdown.sentiment,
                    25
                  )}`}
                  style={{ width: `${(breakdown.sentiment / 25) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Flags Overview */}
          <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
            <div className="rounded-lg bg-emerald-950/30 border border-emerald-900/40 p-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Positive Indicators ({greenFlags.length})</span>
              </div>
              <ul className="mt-1.5 space-y-1 text-[11px] text-zinc-300">
                {greenFlags.slice(0, 2).map((flag, idx) => (
                  <li key={idx} className="truncate">• {flag}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-rose-950/30 border border-rose-900/40 p-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Threat Warnings ({redFlags.length})</span>
              </div>
              <ul className="mt-1.5 space-y-1 text-[11px] text-zinc-300">
                {redFlags.length > 0 ? (
                  redFlags.slice(0, 2).map((flag, idx) => (
                    <li key={idx} className="truncate">• {flag}</li>
                  ))
                ) : (
                  <li className="text-zinc-400">• No severe red flags detected</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
