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
  initialRange?: HistoricalRange;
};

type Result = {
  data: HistoricalRatePoint[];
  loading: boolean;
  error: string | null;

  selectedRange: HistoricalRange;
  setSelectedRange: (
    range: HistoricalRange
  ) => void;

  refresh: () => void;
  retry: () => void;
};

export default function useHistoricalRates({
  fromCurrency,
  toCurrency,
  initialRange = "7D",
}: Params): Result {
  const [
    selectedRange,
    setSelectedRange,
  ] =
    useState<HistoricalRange>(
      initialRange
    );

  const [
    data,
    setData,
  ] =
    useState<
      HistoricalRatePoint[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
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
                range:
                  selectedRange,
                signal,
              }
            );

          if (
            !signal?.aborted
          ) {
            setData(
              points
            );
          }
        } catch (err) {
          if (
            signal?.aborted
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

          console.log(
            "Historical rates error:",
            err
          );

          setData([]);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load historical rates."
          );
        } finally {
          if (
            !signal?.aborted
          ) {
            setLoading(
              false
            );
          }
        }
      },
      [
        fromCurrency,
        toCurrency,
        selectedRange,
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

    selectedRange,
    setSelectedRange,

    refresh,
    retry: refresh,
  };
}