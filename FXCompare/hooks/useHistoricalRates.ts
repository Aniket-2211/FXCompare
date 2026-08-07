import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchHistoricalRates,
  HistoricalRange,
  HistoricalRatePoint,
} from "../services/historyApi";

type Params = {
  fromCurrency: string;
  toCurrency: string;
  range: HistoricalRange;
};

export default function useHistoricalRates({
  fromCurrency,
  toCurrency,
  range,
}: Params) {
  const [
    data,
    setData,
  ] = useState<
    HistoricalRatePoint[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const load =
    useCallback(
      async (
        signal?: AbortSignal
      ) => {
        try {
          setLoading(true);
          setError(null);

          const points =
            await fetchHistoricalRates(
              {
                fromCurrency,
                toCurrency,
                range,
                signal,
              }
            );

          setData(points);
        } catch (err) {
          if (
            err instanceof
              DOMException &&
            err.name ===
              "AbortError"
          ) {
            return;
          }

          if (
            err instanceof Error &&
            err.name ===
              "AbortError"
          ) {
            return;
          }

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load historical rates."
          );
        } finally {
          if (
            !signal?.aborted
          ) {
            setLoading(false);
          }
        }
      },
      [
        fromCurrency,
        toCurrency,
        range,
      ]
    );

  useEffect(() => {
    const controller =
      new AbortController();

    void load(
      controller.signal
    );

    return () => {
      controller.abort();
    };
  }, [load]);

  const refresh =
    useCallback(() => {
      void load();
    }, [load]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}