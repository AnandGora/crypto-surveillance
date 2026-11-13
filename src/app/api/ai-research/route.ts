import { NextRequest, NextResponse } from 'next/server';
import { runSurveillance } from '@/lib/surveillance-engine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const coin = searchParams.get('coin') || 'BTC';
  const format = searchParams.get('format') || 'markdown';

  try {
    const report = await runSurveillance(coin, '1h');
    const {
      coin: c,
      ticker: t,
      futures: f,
      liquidationData: l,
      aiNarrative: n,
      marketExchanges: m,
      atAGlance: a,
      security: s,
      devMetrics: dev,
      sentiment: sent,
      risk: r,
    } = report;

    if (format === 'json') {
      return NextResponse.json(report, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=5',
        },
      });
    }

    // Markdown Output Optimized for ChatGPT / Claude / Gemini
    const markdown = `# CryptoEye Institutional Surveillance Report: ${c.name} (${c.symbol})
*Generated: ${new Date(report.lastUpdated).toUTCString()}*
*Platform: CryptoEye Multi-API Surveillance (https://crypto-surveillance-tau.vercel.app)*

---

## 📌 Executive Summary & Market Snapshot
- **Asset**: ${c.name} (${c.symbol}) | Rank: #${c.rank || 'N/A'}
- **Current Price**: $${t.price < 0.01 ? t.price.toFixed(6) : t.price.toFixed(4)}
- **24h Price Change**: ${t.priceChangePercent24h >= 0 ? '+' : ''}${t.priceChangePercent24h.toFixed(2)}% ($${t.priceChange24h.toFixed(4)})
- **24h Range**: Low $${t.low24h < 0.01 ? t.low24h.toFixed(6) : t.low24h.toFixed(4)} — High $${t.high24h < 0.01 ? t.high24h.toFixed(6) : t.high24h.toFixed(4)}
- **Market Cap**: $${c.marketCap ? (c.marketCap / 1e6).toFixed(2) + 'M' : 'N/A'}
- **Circulating Supply**: ${c.circulatingSupply ? (c.circulatingSupply / 1e6).toFixed(2) + 'M' : 'N/A'} ${c.symbol}
- **Bid-Ask Spread**: ${t.spreadPercent.toFixed(4)}% (Liquidity Slippage Check)
- **Surveillance Verdict**: **${r.verdict}** (Health Score: ${r.overallScore}/100, Grade: ${r.healthGrade})

---

## 🧠 AI Market Narrative: Why is ${c.name} moving today?
> **${n.title}**  
> ${n.summary}

### Key Market Microstructure Drivers:
${n.drivers
  .map(
    (d) =>
      `- **${d.label}**: \`${d.value}\` [${d.status.toUpperCase()}]\n  *Detail*: ${d.detail}`
  )
  .join('\n')}

> ⚡ **${n.whatToWatchNext}**

---

## 💥 Liquidation Heatmap Clusters & Key Price Levels
- **Current Spot Price**: **$${t.price < 0.01 ? t.price.toFixed(6) : t.price.toFixed(4)}**
- **Upper Short Liquidation Cluster**: **$${l.shortCluster.price < 0.01 ? l.shortCluster.price.toFixed(6) : l.shortCluster.price.toFixed(4)}** (+${l.shortCluster.percentFromCurrent.toFixed(2)}% above)
  - Estimated Short Liquidation Intensity: **${l.shortCluster.intensityLabel}**
- **Lower Long Liquidation Cluster**: **$${l.longCluster.price < 0.01 ? l.longCluster.price.toFixed(6) : l.longCluster.price.toFixed(4)}** (${l.longCluster.percentFromCurrent.toFixed(2)}% below)
  - Estimated Long Liquidation Intensity: **${l.longCluster.intensityLabel}**
- **Total 24h Liquidations**: **$${(l.totalLiquidations24hUsd / 1e6).toFixed(2)}M**
  - Long Liquidations: $${(l.longLiquidationUsd / 1e6).toFixed(2)}M (${l.longLiquidationPercent}%)
  - Short Liquidations: $${(l.shortLiquidationUsd / 1e6).toFixed(2)}M (${l.shortLiquidationPercent}%)

---

## ⚡ Derivatives & Perpetual Futures Surveillance
- **Open Interest (OI)**: $${(f.openInterestUsd / 1e6).toFixed(2)}M (${f.openInterestChange24h >= 0 ? '+' : ''}${f.openInterestChange24h.toFixed(1)}% 24h change)
- **OI / Market Cap Ratio**: ${a.oiToMarketCapPercent.toFixed(1)}% (High ratio = elevated leverage risk)
- **8h Funding Rate**: ${(f.fundingRate * 100).toFixed(4)}% | **Annualized APR**: ${f.annualizedFundingRate.toFixed(2)}%
- **Funding Countdown**: Settles in \`${f.fundingCountdown}\` (${f.fundingPayer})
- **Top Trader Position Ratio (Whales)**: ${f.topLongShortPositionRatio.ratio}x (Long: ${f.topLongShortPositionRatio.longPercent}% / Short: ${f.topLongShortPositionRatio.shortPercent}%)
- **Taker Buy/Sell Volume Ratio**: ${f.takerBuySell.ratio}x (Buy Vol: ${f.takerBuySell.buyPercent}% / Sell Vol: ${f.takerBuySell.sellPercent}%)
- **Squeeze Risk Assessment**: **${f.squeezeRisk}**

---

## 📊 Multi-Exchange Futures & Spot Markets Breakdown
| Exchange | Contract / Pair | Price | 24h Change | Open Interest | Funding Rate | Long Liq | Short Liq |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${m
  .map(
    (row) =>
      `| **${row.exchange}** | \`${row.pair}\` | $${row.price < 0.01 ? row.price.toFixed(6) : row.price.toFixed(4)} | ${row.change24h >= 0 ? '+' : ''}${row.change24h}% | $${(row.openInterestUsd / 1e6).toFixed(2)}M | ${(row.fundingRate * 100).toFixed(4)}% | $${(row.longLiqUsd / 1e3).toFixed(1)}K | $${(row.shortLiqUsd / 1e3).toFixed(1)}K |`
  )
  .join('\n')}

---

## 🔍 Technical & Flow Indicators (At A Glance)
- **Daily RSI (14D)**: ${a.dailyRsi}
- **Weekly RSI**: ${a.weeklyRsi}
- **20D SMA Deviation**: ${a.sma20dDeviationPercent >= 0 ? '+' : ''}${a.sma20dDeviationPercent}%
- **30D Historical Volatility**: ${a.volatility30dPercent}%
- **Spot Turnover Rate**: ${a.spotTurnoverPercent}% (Top exchange by volume: **${a.topExchangeByVolume}**)
- **Spot 24h Net Inflow/Outflow**: $${(a.spotNetInflow24hUsd / 1e3).toFixed(1)}K
- **Futures 24h Net Inflow/Outflow**: $${(a.futuresNetInflow24hUsd / 1e3).toFixed(1)}K
- **Token Unlock Schedule**: Next unlock on \`${a.tokenUnlocks?.nextDate}\` (${a.tokenUnlocks?.amountFormatted}, est. ${a.tokenUnlocks?.amountUsdFormatted}); Fully unlocked: \`${a.tokenUnlocks?.fullyUnlockedDate}\`

---

## 🛡️ Smart Contract Security & Developer Health
- **Contract Honeypot Check**: ${s.isHoneypot ? '🚨 POTENTIAL HONEYPOT DETECTED' : '✅ Clean — No Honeypot Detected'}
- **Buy / Sell Taxes**: Buy ${s.buyTax}% / Sell ${s.sellTax}%
- **Audit Status**: **${s.auditStatus.toUpperCase()}**
- **GitHub Repository**: \`${dev.repo || 'Not Linked / Closed Source'}\`
- **Developer Activity**: **${dev.activityStatus}** (${dev.stars} stars, ${dev.forks} forks, ${dev.daysSinceLastCommit} days since last commit)
- **Crowd Sentiment**: Fear & Greed Index **${sent.fearAndGreedIndex.value}/100** (${sent.fearAndGreedIndex.classification})

---

## 🤖 Instructions for AI Reviewers (ChatGPT, Gemini, Claude)
When analyzing this coin research data, evaluate:
1. **Derivatives Froth vs Reality**: Is the open interest ($${(f.openInterestUsd / 1e6).toFixed(2)}M) disproportional to spot market cap? Is there imminent short squeeze or long cascade liquidation risk?
2. **Whale Sentiment vs Retail**: Top traders are ${f.topLongShortPositionRatio.longPercent}% Long while taker buy/sell ratio is ${f.takerBuySell.ratio}x. What does this divergence signal?
3. **Key Execution Levels**: Assess the short liquidation cluster at $${l.shortCluster.price.toFixed(4)} and long cluster at $${l.longCluster.price.toFixed(4)} as tactical take-profit or stop-loss zones.
4. **On-Chain & Fundamental Viability**: Give a definitive final verdict on risk-reward profile over 24h, 7D, and 30D horizons.
`;

    return new NextResponse(markdown, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=5',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate AI research briefing', details: String(error) },
      { status: 500 }
    );
  }
}
