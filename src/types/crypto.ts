export interface MarketTicker {
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  bidPrice: number;
  askPrice: number;
  spreadPercent: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  totalBidVolume: number;
  totalAskVolume: number;
  buyPressurePercent: number;
  sellPressurePercent: number;
  imbalanceRatio: number; // buy / sell
}

export interface KlinePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi?: number;
  ema20?: number;
  ema50?: number;
}

export interface DexPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    symbol: string;
  };
  priceUsd: string;
  liquidityUsd: number;
  fdv: number;
  volume24h: number;
  txns24h: {
    buys: number;
    sells: number;
  };
  priceChange24h?: number;
}

export interface ContractSecurity {
  isHoneypot: boolean;
  buyTax: number;
  sellTax: number;
  isMintable: boolean;
  isProxy: boolean;
  liquidityLocked: boolean;
  auditStatus: 'Safe' | 'Caution' | 'High Risk';
  notes: string[];
}

export interface DevMetrics {
  repo: string;
  stars: number;
  forks: number;
  openIssues: number;
  lastCommitDate: string;
  daysSinceLastCommit: number;
  activityStatus: 'High Activity' | 'Moderate' | 'Low Activity' | 'Dormant' | 'Unavailable';
}

export interface SocialSentiment {
  sentimentScore: number; // 0 - 100
  sentimentVotesUp: number;
  sentimentVotesDown: number;
  twitterFollowers?: number;
  redditSubscribers?: number;
  fearAndGreedIndex: {
    value: number;
    classification: string;
  };
}

export interface FuturesMetrics {
  hasFutures: boolean;
  markPrice: number;
  indexPrice: number;
  openInterest: number;
  openInterestUsd: number;
  openInterestChange24h: number;
  openInterestHistory: { time: number; value: number }[];
  fundingRate: number;
  fundingRatePercent: number;
  annualizedFundingRate: number;
  nextFundingTime: number;
  fundingCountdown: string;
  fundingPayer: 'Longs Pay Shorts' | 'Shorts Pay Longs' | 'Neutral';
  topLongShortPositionRatio: {
    ratio: number;
    longPercent: number;
    shortPercent: number;
  };
  topLongShortAccountRatio: {
    ratio: number;
    longPercent: number;
    shortPercent: number;
  };
  globalLongShortAccountRatio: {
    ratio: number;
    longPercent: number;
    shortPercent: number;
  };
  takerBuySell: {
    ratio: number;
    buyVol: number;
    sellVol: number;
    buyPercent: number;
    sellPercent: number;
  };
  squeezeRisk: 'HIGH SHORT SQUEEZE RISK' | 'HIGH LONG LIQUIDATION RISK' | 'BALANCED / NEUTRAL';
}

export interface CoinFundamentals {
  description: string;
  categories: string[];
  hashingAlgorithm?: string;
  genesisDate?: string;
  maxSupply?: number | null;
  circulatingPercent: number;
  homepage?: string;
  whitepaper?: string;
  explorers: string[];
}

export interface RiskAnalysis {
  overallScore: number; // 0 - 100 (100 is safest / strongest)
  healthGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  verdict: 'STRONG ACCUMULATION' | 'SAFE / STABLE' | 'MODERATE SPECULATION' | 'HIGH RISK / VOLATILE' | 'EXTREME DANGER';
  breakdown: {
    liquidity: number; // max 25
    volatility: number; // max 25
    development: number; // max 25
    sentiment: number; // max 25
  };
  redFlags: string[];
  greenFlags: string[];
}

export interface CryptoNewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
}

// CoinGlass-Style Deep Derivatives & Key Price Levels
export interface LiquidationCluster {
  price: number;
  percentFromCurrent: number;
  volumeUsd: number;
  intensityLabel: string;
}

export interface LiquidationData {
  shortCluster: LiquidationCluster;
  longCluster: LiquidationCluster;
  totalLiquidations24hUsd: number;
  longLiquidationUsd: number;
  shortLiquidationUsd: number;
  longLiquidationPercent: number;
  shortLiquidationPercent: number;
}

export interface MarketExchangeRow {
  exchange: string;
  pair: string;
  price: number;
  change24h: number;
  openInterestUsd: number;
  oiChange24h: number;
  fundingRate: number;
  volume24h: number;
  longLiqUsd: number;
  shortLiqUsd: number;
}

export interface AiMarketNarrative {
  title: string;
  summary: string;
  drivers: {
    label: string;
    value: string;
    status: 'bullish' | 'bearish' | 'neutral';
    detail: string;
  }[];
  whatToWatchNext: string;
}

export interface AtAGlanceStats {
  dailyRsi: number;
  weeklyRsi: number;
  sma20dDeviationPercent: number;
  volatility30dPercent: number;
  spotTurnoverPercent: number;
  topExchangeByVolume: string;
  spotNetInflow24hUsd: number;
  futuresNetInflow24hUsd: number;
  oiToMarketCapPercent: number;
  tokenUnlocks?: {
    nextDate: string;
    amountFormatted: string;
    amountUsdFormatted: string;
    fullyUnlockedDate: string;
  };
}

export interface HistoricalPriceRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  changePercent: number;
  volumeUsd: number;
}

export interface SurveillanceReport {
  coin: {
    id: string;
    name: string;
    symbol: string;
    rank?: number;
    icon?: string;
    marketCap?: number;
    circulatingSupply?: number;
    totalSupply?: number;
    ath?: number;
    athChangePercent?: number;
  };
  ticker: MarketTicker;
  orderBook: OrderBookData;
  klines: KlinePoint[];
  dexPairs: DexPair[];
  security: ContractSecurity;
  devMetrics: DevMetrics;
  sentiment: SocialSentiment;
  futures: FuturesMetrics;
  fundamentals: CoinFundamentals;
  risk: RiskAnalysis;
  lastUpdated: string;
  dataSource: {
    binance: boolean;
    binanceFutures: boolean;
    dexScreener: boolean;
    coingecko: boolean;
    github: boolean;
    alternativeMe: boolean;
  };
  // Extended Deep Data
  liquidationData: LiquidationData;
  aiNarrative: AiMarketNarrative;
  marketExchanges: MarketExchangeRow[];
  atAGlance: AtAGlanceStats;
  historicalPrices: HistoricalPriceRow[];
}

export interface WatchlistCoin {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  score: number;
  addedAt: number;
}

export interface TradeTick {
  id: string | number;
  time: number;
  price: number;
  quantity: number;
  quoteQuantity: number;
  isBuyerMaker: boolean;
  isWhale: boolean;
  isDolphin: boolean;
}
