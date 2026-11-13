# 👁️ CryptoEye — Advanced Crypto & Derivatives Surveillance Platform

CryptoEye ek powerful, multi-source decentralized and centralized cryptocurrency surveillance engine hai. Yeh token research ke har parameter ko real-time monitor karta hai — **Perpetual Futures Open Interest, Funding Rate, Top Trader Long/Short Ratio, Taker Buy/Sell Aggression, Multi-Timeframe Charts with RSI/EMA, Order Book Depth, DEX Liquidity, Smart Contract Honeypot/Tax Safety, Tokenomics Fundamentals, GitHub Developer Activity, Crowd Sentiment aur Live News Wire** — sab kuch **100% Free Public APIs** ke sath!

![CryptoEye Surveillance](https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop)

---

## 🚀 Key Surveillance Capabilities (Coin Research Pillars)

1. **⚡ Perpetual Futures & Derivatives Intelligence (Binance Futures Public API)**:
   - **Open Interest (OI)**: Real-time contracts, Total OI Value in USD (e.g. $7.0B), 24h OI % change, and 24h historical OI sparkline.
   - **8h Funding Rate**: Real-time funding rate %, Annualized APR %, Settlement countdown timer, aur Longs Pay Shorts vs Shorts Pay Longs indicator.
   - **Top Trader (Whale) Long/Short Position Ratio**: Smart money position bias vs retail traders.
   - **Taker Buy/Sell Volume**: Market order aggression meter (Aggressive market buys vs panic market dumps).
   - **Squeeze Risk Detector**: High Short Squeeze Risk vs High Long Liquidation Cascade Risk.

2. **📈 Multi-Timeframe Technical Price Charts**:
   - Timeframe switcher: `15m`, `1h`, `4h`, `1d`.
   - **RSI (14)** Subgraph with Overbought (70) and Oversold (30) levels.
   - **EMA 20 & EMA 50** trend overlays.
   - Interactive SVG Area and Candlestick modes with live hover inspector.

3. **🌊 Order Book & Liquidity Surveillance (Binance Public API)**:
   - Live Bid vs Ask depth levels and cumulative depth volume.
   - **Buy Pressure vs Sell Pressure Meter** with flow imbalance ratios.
   - Real-time Bid-Ask Spread % monitoring (slippage threat detection).

4. **🛡️ DEX & Smart Contract Threat Scanner (DexScreener Public API)**:
   - Multi-chain DEX pools scanner (Uniswap, Raydium, PancakeSwap, Aerodrome, etc.).
   - 24h DEX buy/sell transaction count ratios.
   - **Automated Honeypot & Tax Detector**: Flags contracts with 0 sells or anomalous buy-only patterns.
   - Mintability and liquidity lock verification checklist.

5. **📖 Project Fundamentals & Tokenomics**:
   - Deep coin background description & category ecosystem tags.
   - Supply Tokenomics: Circulating vs Total vs Max Supply unlocked % bar.
   - Consensus architecture & Genesis launch date.
   - Official research links (Whitepaper, Blockchain Explorers, Official website).

6. **💻 Developer & Codebase Surveillance (GitHub REST API)**:
   - Project repository commit recency tracker (Days since last commit).
   - Stargazers, Forks, and Open Issues analytics.
   - **Abandonment Risk Detection**: Automatically flags dormant or abandoned projects (>90 days without commits).

7. **🧠 Crowd Sentiment & Macro Intelligence (CoinGecko + Alternative.me)**:
   - Community Bullish vs Bearish voting ratios.
   - **Macro Crypto Fear & Greed Index** with automated risk tiers.
   - Social audience tracking (Twitter/X & Reddit).

8. **📰 Live Crypto News Wire**:
   - Real-time filtered crypto intelligence news stream with sentiment classification (Bullish / Bearish / Neutral).

9. **⚡ Personal Surveillance Radar (Watchlist)**:
   - LocalStorage-backed radar drawer to pin, track, and switch between monitored assets.
   - Configurable live auto-polling intervals (15s, 30s, 60s, or Manual).

---

## 🌐 Free Public APIs Integrated

| Data Source | Purpose | Authentication |
| :--- | :--- | :--- |
| **Binance Futures API** | Open Interest, Funding Rate, Top Trader Ratios, Taker Volume | Free / No Key |
| **Binance Spot API** | Real-time 24h ticker, Depth order book, 15m/1h/4h/1d Klines | Free / No Key |
| **DexScreener API** | Multi-chain DEX pairs, liquidity, 24h txns (buys/sells) | Free / No Key |
| **CoinGecko API** | Token metadata, tokenomics, descriptions, whitepapers | Free / No Key |
| **GitHub REST API** | Developer commit history, stars, forks, issues | Free / No Key |
| **Alternative.me** | Macro Crypto Fear & Greed Index | Free / No Key |
| **Cointelegraph RSS** | Live breaking crypto intelligence news | Free / No Key |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Dark Cyber Surveillance Theme)
- **Icons**: Lucide React
- **Hosting**: Vercel Serverless Production
