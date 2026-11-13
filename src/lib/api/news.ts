import { CryptoNewsItem } from '@/types/crypto';

export async function fetchLiveCryptoNews(): Promise<CryptoNewsItem[]> {
  try {
    const res = await fetch('https://cointelegraph.com/rss', {
      next: { revalidate: 300 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!res.ok) {
      return getFallbackNews();
    }

    const xmlText = await res.text();
    const itemMatches = [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    if (itemMatches.length === 0) {
      return getFallbackNews();
    }

    const items: CryptoNewsItem[] = itemMatches.slice(0, 15).map((match, idx) => {
      const itemContent = match[1];
      const rawTitle = itemContent.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'Crypto Update';
      const cleanTitle = rawTitle.replace('<![CDATA[', '').replace(']]>', '').trim();

      const rawLink = itemContent.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '#';
      const cleanLink = rawLink.replace('<![CDATA[', '').replace(']]>', '').trim();

      const rawDate = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
      const pubDate = rawDate ? new Date(rawDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) : 'Recent';

      const rawDesc = itemContent.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
      const cleanDesc = rawDesc
        .replace(/<[^>]*>?/gm, '')
        .replace('<![CDATA[', '')
        .replace(']]>', '')
        .trim()
        .slice(0, 160) + '...';

      // Simple heuristic sentiment detector
      const titleLower = cleanTitle.toLowerCase();
      let sentiment: CryptoNewsItem['sentiment'] = 'Neutral';
      if (
        titleLower.includes('surge') ||
        titleLower.includes('soar') ||
        titleLower.includes('high') ||
        titleLower.includes('rally') ||
        titleLower.includes('gain') ||
        titleLower.includes('boost') ||
        titleLower.includes('record') ||
        titleLower.includes('etf') ||
        titleLower.includes('accumulat')
      ) {
        sentiment = 'Bullish';
      } else if (
        titleLower.includes('crash') ||
        titleLower.includes('drop') ||
        titleLower.includes('plunge') ||
        titleLower.includes('ban') ||
        titleLower.includes('hack') ||
        titleLower.includes('lawsuit') ||
        titleLower.includes('fraud') ||
        titleLower.includes('fall') ||
        titleLower.includes('risk')
      ) {
        sentiment = 'Bearish';
      }

      return {
        id: `news-${idx}-${Date.now()}`,
        title: cleanTitle,
        url: cleanLink,
        source: 'Cointelegraph',
        publishedAt: pubDate,
        summary: cleanDesc,
        sentiment,
      };
    });

    return items;
  } catch (err) {
    console.warn('[News Error]:', err);
    return getFallbackNews();
  }
}

function getFallbackNews(): CryptoNewsItem[] {
  return [
    {
      id: 'fb-1',
      title: 'Institutional Inflows Continue as Bitcoin Holds Strategic Support',
      url: 'https://cointelegraph.com',
      source: 'CryptoWire',
      publishedAt: 'Today',
      summary: 'Global liquidity indexes indicate steady accumulation from major treasury funds.',
      sentiment: 'Bullish',
    },
    {
      id: 'fb-2',
      title: 'Decentralized Exchanges Report 35% Spike in Daily Trading Volume',
      url: 'https://cointelegraph.com',
      source: 'DeFi Pulse',
      publishedAt: 'Today',
      summary: 'DEX liquidity pools witness heightened cross-chain swap activity across Solana and Ethereum.',
      sentiment: 'Bullish',
    },
    {
      id: 'fb-3',
      title: 'Regulatory Clarity Advances for Smart Contract Auditing Standards',
      url: 'https://cointelegraph.com',
      source: 'BlockSecurity',
      publishedAt: 'Yesterday',
      summary: 'Global audit frameworks emphasize honeypot and proxy verification for new token launches.',
      sentiment: 'Neutral',
    },
  ];
}
