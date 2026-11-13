export interface FearAndGreedData {
  value: number;
  classification: string;
  history: {
    value: number;
    classification: string;
    timestamp: string;
  }[];
}

export async function fetchFearAndGreed(): Promise<FearAndGreedData> {
  const fallback: FearAndGreedData = {
    value: 50,
    classification: 'Neutral',
    history: [],
  };

  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=7', {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return fallback;

    const data = await res.json();
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return fallback;
    }

    const current = data.data[0];
    const history = data.data.map((item: any) => ({
      value: parseInt(item.value, 10),
      classification: item.value_classification,
      timestamp: item.timestamp,
    }));

    return {
      value: parseInt(current.value, 10) || 50,
      classification: current.value_classification || 'Neutral',
      history,
    };
  } catch (err) {
    console.warn('[Fear and Greed Error]:', err);
    return fallback;
  }
}
