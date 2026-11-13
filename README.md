# 👁️ CryptoEye — Advanced Crypto Surveillance & Intelligence Platform

CryptoEye ek powerful, multi-source decentralized and centralized cryptocurrency surveillance engine hai. Yeh token research ke har parameter ko real-time monitor karta hai — **Order Book Depth, DEX Liquidity, Smart Contract Honeypot/Tax Safety, GitHub Developer Activity, Crowd Sentiment aur Live News Wire** — sab kuch **100% Free Public APIs** ke sath!

![CryptoEye Surveillance](https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop)

---

## 🚀 Key Surveillance Capabilities (Coin Research Pillars)

1. **📊 Real-Time Market & Price Surveillance**:
   - Live 24h Ticker data, 24h High/Low range tracker, Market Cap, Circulating vs Total Supply, ATH Distance tracker.
   - Interactive SVG 24h Candlestick & Area Price Chart with hover inspection and volume bars.

2. **🌊 Order Book & Liquidity Surveillance (Binance Public API)**:
   - Live Bid vs Ask depth levels and cumulative depth volume.
   - **Buy Pressure vs Sell Pressure Meter** with flow imbalance ratios.
   - Real-time Bid-Ask Spread % monitoring (slippage threat detection).

3. **🔍 DEX & Smart Contract Threat Scanner (DexScreener Public API)**:
   - Multi-chain DEX pools scanner (Uniswap, Raydium, PancakeSwap, Aerodrome, etc.).
   - 24h DEX buy/sell transaction count ratios.
   - **Automated Honeypot & Tax Detector**: Flags contracts with 0 sells or anomalous buy-only patterns.
   - Mintability and liquidity lock verification checklist.

4. **💻 Developer & Codebase Surveillance (GitHub REST API)**:
   - Project repository commit recency tracker (Days since last commit).
   - Stargazers, Forks, and Open Issues analytics.
   - **Abandonment Risk Detection**: Automatically flags dormant or abandoned projects (>90 days without commits).

5. **🧠 Crowd Sentiment & Macro Intelligence (CoinGecko + Alternative.me)**:
   - Community Bullish vs Bearish voting ratios.
   - **Macro Crypto Fear & Greed Index** with automated risk tiers.
   - Social audience tracking (Twitter/X & Reddit).

6. **📰 Live Crypto News Wire**:
   - Real-time filtered crypto intelligence news stream with sentiment classification (Bullish / Bearish / Neutral).

7. **⚡ Personal Surveillance Radar (Watchlist)**:
   - LocalStorage-backed radar drawer to pin, track, and switch between monitored assets.
   - Configurable live auto-polling intervals (15s, 30s, 60s, or Manual).

---

## 🌐 Free Public APIs Integrated

| Data Source | Purpose | Authentication |
| :--- | :--- | :--- |
| **Binance API** | Real-time 24h ticker, Depth order book, 1h Klines | Free / No Key |
| **DexScreener API** | Multi-chain DEX pairs, liquidity, 24h txns (buys/sells) | Free / No Key |
| **CoinGecko API** | Token metadata, market cap rank, community voting | Free / No Key |
| **GitHub REST API** | Developer commit history, stars, forks, issues | Free / No Key |
| **Alternative.me** | Macro Crypto Fear & Greed Index | Free / No Key |
| **Cointelegraph RSS** | Live breaking crypto intelligence news | Free / No Key |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Dark Cyber Surveillance Theme)
- **Icons**: Lucide React
- **Architecture**: Serverless Next.js API route handlers to eliminate CORS issues and optimize client caching.

---

## 💻 Local Development Setup

1. **Clone repository**:
   ```bash
   git clone https://github.com/AnandGora/crypto-surveillance.git
   cd crypto-surveillance
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## ☁️ Deploy on Vercel

Is project ko direct Vercel pe 1-click me deploy kiya ja sakta hai:

1. Push your code to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the `crypto-surveillance` repository.
4. Framework Preset automatically select ho jayega as **Next.js**.
5. Click **Deploy**!
