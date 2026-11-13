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
  risk: RiskAnalysis;
  lastUpdated: string;
  dataSource: {
    binance: boolean;
    dexScreener: boolean;
    coingecko: boolean;
    github: boolean;
    alternativeMe: boolean;
  };
}

export interface WatchlistCoin {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  score: number;
  addedAt: number;
}
