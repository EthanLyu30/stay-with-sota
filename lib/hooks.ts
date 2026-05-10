import useSWR from 'swr';
import type { Stats, Digest, Source } from './types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const fetcherWithRetry = async (url: string, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // 指数退避
    }
  }
};

export function useStats() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: Stats }>('/api/stats', fetcherWithRetry, {
    refreshInterval: 30000, // 每 30 秒刷新
    revalidateOnFocus: false,
  });

  return {
    stats: data?.data,
    error,
    isLoading,
  };
}

export function useDigests(page = 1) {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: Digest[]; meta: any }>(
    `/api/digests?page=${page}`,
    fetcherWithRetry,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    digests: data?.data,
    meta: data?.meta,
    error,
    isLoading,
  };
}

export function useSources() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: Source[] }>(
    '/api/sources',
    fetcherWithRetry,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    sources: data?.data,
    error,
    isLoading,
    mutate,
  };
}
