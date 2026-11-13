export interface CoinPreset {
  symbol: string;
  name: string;
  coingeckoId: string;
  githubRepo?: string;
  isCustomToken?: boolean;
}

export const POPULAR_COINS: CoinPreset[] = [
  { symbol: 'BTC', name: 'Bitcoin', coingeckoId: 'bitcoin', githubRepo: 'bitcoin/bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', coingeckoId: 'ethereum', githubRepo: 'ethereum/go-ethereum' },
  { symbol: 'SOL', name: 'Solana', coingeckoId: 'solana', githubRepo: 'solana-labs/solana' },
  { symbol: 'BNB', name: 'BNB Chain', coingeckoId: 'binancecoin', githubRepo: 'bnb-chain/bsc' },
  { symbol: 'XRP', name: 'XRP', coingeckoId: 'ripple', githubRepo: 'XRPLF/rippled' },
  { symbol: 'DOGE', name: 'Dogecoin', coingeckoId: 'dogecoin', githubRepo: 'dogecoin/dogecoin' },
  { symbol: 'ADA', name: 'Cardano', coingeckoId: 'cardano', githubRepo: 'IntersectMBO/cardano-node' },
  { symbol: 'AVAX', name: 'Avalanche', coingeckoId: 'avalanche-2', githubRepo: 'ava-labs/avalanchego' },
  { symbol: 'SUI', name: 'Sui', coingeckoId: 'sui', githubRepo: 'MystenLabs/sui' },
  { symbol: 'LINK', name: 'Chainlink', coingeckoId: 'chainlink', githubRepo: 'smartcontractkit/chainlink' },
  { symbol: 'PEPE', name: 'Pepe', coingeckoId: 'pepe', githubRepo: '' },
  { symbol: 'NEAR', name: 'NEAR Protocol', coingeckoId: 'near', githubRepo: 'near/nearcore' },
];

export const DEFAULT_TICKERS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'SUI', 'PEPE'];
