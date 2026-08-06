// hooks/useMarkets.ts

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchAllMarkets,
  MarketPair,
} from "../services/marketsApi";

type UseMarketsOptions = {
  autoRefresh?: boolean;
  refreshInterval?: number;
};

type UseMarketsResult = {
  marketPairs: MarketPair[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;

  topGainer: MarketPair | null;
  topLoser: MarketPair | null;

  fetchMarkets: (
    refreshRequest?: boolean
  ) => Promise<void>;
};

const DEFAULT_REFRESH_INTERVAL =
  60000;

export default function useMarkets(
  options: UseMarketsOptions = {}
): UseMarketsResult {
  const {
    autoRefresh = true,
    refreshInterval =
      DEFAULT_REFRESH_INTERVAL,
  } = options;

  const [
    marketPairs,
    setMarketPairs,
  ] = useState<MarketPair[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState<Date | null>(
    null
  );

  const fetchMarkets =
    useCallback(
      async (
        refreshRequest = false
      ) => {
        try {
          if (refreshRequest) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError(null);

          const {
            pairs,
            failedPairs,
          } =
            await fetchAllMarkets();

          setMarketPairs(pairs);
          setLastUpdated(
            new Date()
          );

          if (
            failedPairs.length >
            0
          ) {
            setError(
              `Some currency pairs could not be loaded: ${failedPairs.join(
                ", "
              )}.`
            );
          }
        } catch (
          fetchError
        ) {
          console.log(
            "Markets hook error:",
            fetchError
          );

          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load market rates."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    void fetchMarkets();

    if (!autoRefresh) {
      return;
    }

    const timer =
      setInterval(() => {
        void fetchMarkets(true);
      }, refreshInterval);

    return () => {
      clearInterval(timer);
    };
  }, [
    autoRefresh,
    fetchMarkets,
    refreshInterval,
  ]);

  const sortedByChange =
    useMemo(() => {
      return [
        ...marketPairs,
      ].sort(
        (
          first,
          second
        ) =>
          second.change -
          first.change
      );
    }, [marketPairs]);

  const topGainer =
    sortedByChange.length > 0
      ? sortedByChange[0]
      : null;

  const topLoser =
    sortedByChange.length > 0
      ? sortedByChange[
          sortedByChange.length -
            1
        ]
      : null;

  return {
    marketPairs,
    loading,
    refreshing,
    error,
    lastUpdated,

    topGainer,
    topLoser,

    fetchMarkets,
  };
}