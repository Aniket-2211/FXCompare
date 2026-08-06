// hooks/useHistoricalRates.ts

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  HistoricalRange,
  HistoricalRatePoint,
} from "../components/historical/HistoricalChart";

import {
  fetchHistoricalRates,
} from "../services/historyApi";

type UseHistoricalRatesOptions = {
  fromCurrency: string;
  toCurrency: string;
  initialRange?: HistoricalRange;
  autoLoad?: boolean;
};

export default function useHistoricalRates({
  fromCurrency,
  toCurrency,
  initialRange = "1M",
  autoLoad = true,
}: UseHistoricalRatesOptions) {
  const [
    selectedRange,
    setSelectedRange,
  ] = useState<HistoricalRange>(
    initialRange
  );

  const [
    data,
    setData,
  ] = useState<
    HistoricalRatePoint[]
  >([]);

  const [
    loading,
    setLoading,
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

  const loadHistoricalRates =
    useCallback(
      async (
        range: HistoricalRange =
          selectedRange
      ) => {
        const normalizedFrom =
          fromCurrency
            .trim()
            .toUpperCase();

        const normalizedTo =
          toCurrency
            .trim()
            .toUpperCase();

        if (
          !normalizedFrom ||
          !normalizedTo
        ) {
          setData([]);
          setError(
            "Select a valid currency pair."
          );

          return;
        }

        if (
          normalizedFrom ===
          normalizedTo
        ) {
          setData([]);
          setError(
            "Choose two different currencies."
          );

          return;
        }

        try {
          setLoading(true);
          setError(null);

          const result =
            await fetchHistoricalRates(
              normalizedFrom,
              normalizedTo,
              range
            );

          setData(result);
          setLastUpdated(
            new Date()
          );
        } catch (
          fetchError
        ) {
          console.log(
            "Historical rates error:",
            fetchError
          );

          const message =
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load historical exchange rates.";

          setData([]);
          setError(message);
        } finally {
          setLoading(false);
        }
      },
      [
        fromCurrency,
        toCurrency,
        selectedRange,
      ]
    );

  const changeRange =
    useCallback(
      (
        range: HistoricalRange
      ) => {
        setSelectedRange(range);
      },
      []
    );

  const retry =
    useCallback(() => {
      void loadHistoricalRates(
        selectedRange
      );
    }, [
      loadHistoricalRates,
      selectedRange,
    ]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    void loadHistoricalRates(
      selectedRange
    );
  }, [
    autoLoad,
    fromCurrency,
    toCurrency,
    selectedRange,
    loadHistoricalRates,
  ]);

  return {
    data,
    loading,
    error,
    lastUpdated,

    selectedRange,
    setSelectedRange:
      changeRange,

    fetchHistoricalRates:
      loadHistoricalRates,

    retry,
  };
}