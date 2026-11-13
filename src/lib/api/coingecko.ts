export interface CoinGeckoCoinData {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank?: number;
  description?: { en?: string };
  categories?: string[];
  hashing_algorithm?: string;
  genesis_date?: string;
  image?: { thumb?: string; small?: string; large?: string };
  market_data?: {
    current_price?: { usd?: number };
    market_cap?: { usd?: number };
    total_volume?: { usd?: number };
    fully_diluted_valuation?: { usd?: number };
    circulating_supply?: number;
    total_supply?: number;
    max_supply?: number;
    ath?: { usd?: number };
    ath_change_percentage?: { usd?: number };
    price_change_percentage_24h?: number;
  };
  sentiment_votes_up_percentage?: number;
  sentiment_votes_down_percentage?: number;
  community_data?: {
    twitter_followers?: number;
    reddit_subscribers?: number;
  };
  developer_data?: {
    stars?: number;
    forks?: number;
    subscribers?: number;
    total_issues?: number;
    closed_issues?: number;
    commit_count_4_weeks?: number;
  };
  links?: {
    homepage?: string[];
    whitepaper?: string;
    blockchain_site?: string[];
    repos_url?: {
      github?: string[];
    };
  };
}

export async function fetchCoinGeckoDetails(coinIdOrSymbol: string): Promise<CoinGeckoCoinData | null> {
  const query = coinIdOrSymbol.toLowerCase();

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${query}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`,
      {
        next: { revalidate: 60 },
        headers: { 'Accept': 'application/json' },
      }
    );

    if (res.ok) {
      return await res.json();
    }

    // If direct ID failed, search by symbol/name
    const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`, {
      next: { revalidate: 300 },
    });

    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const matchedCoin = searchData.coins?.[0];

    if (!matchedCoin?.id) return null;

    const retryRes = await fetch(
      `https://api.coingecko.com/api/v3/coins/${matchedCoin.id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`,
      {
        next: { revalidate: 60 },
      }
    );

    if (retryRes.ok) {
      return await retryRes.json();
    }

    return null;
  } catch (err) {
    console.warn(`[CoinGecko Details Error for ${coinIdOrSymbol}]:`, err);
    return null;
  }
}

export async function fetchCoinGeckoTrending(): Promise<any[]> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/search/trending', {
      next: { revalidate: 180 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.coins || [];
  } catch (err) {
    console.warn('[CoinGecko Trending Error]:', err);
    return [];
  }
}
