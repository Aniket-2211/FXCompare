// hooks/useExchangeRate.ts

import {
  useCallback,
  useEffect,
  useState,
} from "react";

const API_URL =
  "https://api.frankfurter.dev/v2";

const REFRESH_INTERVAL = 15000;

type LatestRateResponse = {
  date?: string;
  base?: string;
  quote?: string;
  rate?: number;
};

const round = (
  value: number,
  decimalPlaces = 4
) => {
  const multiplier = Math.pow(
    10,
    decimalPlaces
  );

  return (
    Math.round(value * multiplier) /
    multiplier
  );
};

type Props = {
  fromCurrency: string;
  toCurrency: string;
  enabled?: boolean;
};

export default function useExchangeRate({
  fromCurrency,
  toCurrency,
  enabled = true,
}: Props) {
  const [rate, setRate] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState<Date | null>(null);

  const fetchRate =
    useCallback(async () => {
      if (!enabled) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (
          fromCurrency ===
          toCurrency
        ) {
          setRate(1);

          setLastUpdated(
            new Date()
          );

          return;
        }

        const response =
          await fetch(
            `${API_URL}/rate/${fromCurrency}/${toCurrency}`
          );

        if (!response.ok) {
          throw new Error(
            "Unable to fetch the exchange rate."
          );
        }

        const result =
          (await response.json()) as
            LatestRateResponse;

        const fetchedRate =
          Number(result.rate);

        if (
          !Number.isFinite(
            fetchedRate
          ) ||
          fetchedRate <= 0
        ) {
          throw new Error(
            "Invalid exchange rate received."
          );
        }

        setRate(
          round(
            fetchedRate,
            4
          )
        );

        setLastUpdated(
          new Date()
        );
      } catch (fetchError) {
        console.log(
          "Exchange rate error:",
          fetchError
        );

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to fetch exchange rate."
        );
      } finally {
        setLoading(false);
      }
    }, [
      enabled,
      fromCurrency,
      toCurrency,
    ]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void fetchRate();

    const refreshTimer =
      setInterval(() => {
        void fetchRate();
      }, REFRESH_INTERVAL);

    return () => {
      clearInterval(
        refreshTimer
      );
    };
  }, [
    enabled,
    fetchRate,
  ]);

  const resetRate = () => {
    setRate(0);
    setError(null);
    setLastUpdated(null);
  };

  return {
    rate,
    loading,
    error,
    lastUpdated,

    fetchRate,
    resetRate,
  };
}