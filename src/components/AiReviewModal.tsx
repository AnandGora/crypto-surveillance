'use client';

import React, { useState } from 'react';
import {
  X,
  Bot,
  Copy,
  Check,
  ExternalLink,
  Download,
  Terminal,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SurveillanceReport } from '@/types/crypto';

interface AiReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SurveillanceReport;
}

export function AiReviewModal({ isOpen, onClose, report }: AiReviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!isOpen) return null;

  const { coin: c, ticker: t, futures: f, liquidationData: l, aiNarrative: n, risk: r, security: s, devMetrics: dev, sentiment: sent } = report;

  // AI Prompt formatted for LLMs
  const aiPrompt = `You are an elite cryptocurrency derivatives specialist, smart contract auditor, and institutional risk analyst.
Please perform a rigorous institutional review of the following real-time cryptocurrency surveillance data captured by CryptoEye:

# ASSET IDENTITY & SNAPSHOT
- Asset: ${c.name} (${c.symbol}) | Rank: #${c.rank || 'N/A'}
- Spot Price: $${t.price < 0.01 ? t.price.toFixed(6) : t.price.toFixed(4)} (24h Change: ${t.priceChangePercent24h >= 0 ? '+' : ''}${t.priceChangePercent24h.toFixed(2)}%)
- 24h High: $${t.high24h < 0.01 ? t.high24h.toFixed(6) : t.high24h.toFixed(4)} | 24h Low: $${t.low24h < 0.01 ? t.low24h.toFixed(6) : t.low24h.toFixed(4)}
- Market Cap: $${c.marketCap ? (c.marketCap / 1e6).toFixed(2) + 'M' : 'N/A'} | FDV: $${(report.atAGlance.oiToMarketCapPercent).toFixed(1)}% OI/MCap ratio
- Spread: ${t.spreadPercent.toFixed(4)}% | Health Verdict: ${r.verdict} (Score: ${r.overallScore}/100)

# MARKET MICROSTRUCTURE & WHY IT IS MOVING TODAY
- Title: ${n.title}
- Summary: ${n.summary}
- Key Drivers:
${n.drivers.map((d) => `  * ${d.label}: ${d.value} (${d.status.toUpperCase()}) - ${d.detail}`).join('\n')}
- Watch Zones: ${n.whatToWatchNext}

# LIQUIDATION HEATMAP CLUSTERS
- Upper Short Squeeze Cluster: $${l.shortCluster.price < 0.01 ? l.shortCluster.price.toFixed(6) : l.shortCluster.price.toFixed(4)} (+${l.shortCluster.percentFromCurrent.toFixed(1)}%) | Intensity: ${l.shortCluster.intensityLabel}
- Lower Long Liquidation Cluster: $${l.longCluster.price < 0.01 ? l.longCluster.price.toFixed(6) : l.longCluster.price.toFixed(4)} (${l.longCluster.percentFromCurrent.toFixed(1)}%) | Intensity: ${l.longCluster.intensityLabel}
- Total 24h Liquidations: $${(l.totalLiquidations24hUsd / 1e6).toFixed(2)}M (Longs: ${l.longLiquidationPercent}% | Shorts: ${l.shortLiquidationPercent}%)

# DERIVATIVES & PERPETUAL ORDER FLOW
- Open Interest: $${(f.openInterestUsd / 1e6).toFixed(2)}M (${f.openInterestChange24h >= 0 ? '+' : ''}${f.openInterestChange24h.toFixed(1)}% 24h)
- 8h Funding Rate: ${(f.fundingRate * 100).toFixed(4)}% (Annualized: ${f.annualizedFundingRate.toFixed(2)}% APR - ${f.fundingPayer})
- Top Trader (Whale) Long/Short Ratio: ${f.topLongShortPositionRatio.ratio}x (${f.topLongShortPositionRatio.longPercent}% Long / ${f.topLongShortPositionRatio.shortPercent}% Short)
- Taker Buy/Sell Volume: ${f.takerBuySell.ratio}x (${f.takerBuySell.buyPercent}% Buys / ${f.takerBuySell.sellPercent}% Sells)
- Squeeze Risk Rating: ${f.squeezeRisk}

# ON-CHAIN SECURITY & DEVELOPER ACTIVITY
- Honeypot Risk: ${s.isHoneypot ? 'CRITICAL RISK' : 'CLEAN / SAFE'} (Buy Tax: ${s.buyTax}%, Sell Tax: ${s.sellTax}%)
- Developer Commits: ${dev.activityStatus} (${dev.daysSinceLastCommit} days since last commit, ${dev.stars} stars)
- Crowd Sentiment: ${sent.fearAndGreedIndex.value}/100 (${sent.fearAndGreedIndex.classification})

---
CRITICAL QUESTIONS FOR YOUR ANALYSIS:
1. Is there an imminent Short Squeeze or Long Liquidation Cascade? What probability do you assign?
2. Are Whales currently distributing or accumulating relative to retail taker flow?
3. What are the key tactical entry zones, invalidation stop-losses, and realistic profit targets?
4. What is the final risk-adjusted recommendation (Strong Buy, Speculative Long, Avoid, or Short)?`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCurl = async () => {
    const curlCmd = `curl -s "https://crypto-surveillance-tau.vercel.app/api/ai-research?coin=${c.symbol}"`;
    try {
      await navigator.clipboard.writeText(curlCmd);
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadReport = () => {
    const blob = new Blob([aiPrompt], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${c.symbol}_CryptoEye_AI_Report.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(
    `Analyze this crypto surveillance data for ${c.name} (${c.symbol}) from CryptoEye:\n\n${aiPrompt.slice(0, 1500)}...`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
              <Bot className="h-5 w-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  AI Surveillance Review & Data Exporter
                </h2>
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-800">
                  ChatGPT • Claude • Gemini
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Machine-readable institutional intelligence packet ready for LLM consumption
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 bg-zinc-900/30 px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-3.5 py-1.5 text-xs font-bold text-black shadow-md shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied Prompt!' : 'Copy AI Prompt'}</span>
            </button>

            <a
              href={chatGptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-emerald-800 bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open in ChatGPT</span>
            </a>

            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .md</span>
            </button>
          </div>

          {/* Direct API Endpoint Pill */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 text-[11px]">Direct API:</span>
            <button
              onClick={handleCopyCurl}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 font-mono text-[11px] text-cyan-400 hover:border-cyan-800 transition-colors"
              title="Copy cURL command"
            >
              <Terminal className="h-3 w-3" />
              <span>/api/ai-research?coin={c.symbol}</span>
              {copiedCurl && <span className="text-emerald-400 font-bold ml-1">Copied!</span>}
            </button>
          </div>
        </div>

        {/* Modal Body / Markdown Content Preview */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs text-zinc-300">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 leading-relaxed whitespace-pre-wrap select-all">
            {aiPrompt}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/60 px-6 py-3 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Compatible with OpenAI ChatGPT, Google Gemini, Anthropic Claude, Perplexity & LLM Agents
          </span>
          <span>CryptoEye AI Spec v2.0</span>
        </div>
      </div>
    </div>
  );
}
