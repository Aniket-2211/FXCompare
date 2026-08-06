// hooks/useTrendData.ts

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  TrendItem,
  TrendRange,
} from "../components/TrendChart";

const API_URL =
  "https://api.frankfurter.dev/v2";

type HistoricalRateRow = {
  date?: string;
  base?: string;
  quote?: string;
  rate?: number;
};

type Props = {
  fromCurrency: string;
  toCurrency: string;
  enabled?: boolean;
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

const getDateString = (
  date: Date
) => {
  return date
    .toISOString()
    .split("T")[0];
};

const getRangeDays = (
  range: TrendRange
) => {
  switch (range) {
    case "30D":
      return 35;

    case "90D":
      return 100;

    case "1Y":
      return 380;

    case "7D":
    default:
      return 12;
  }
};

const getMaximumPoints = (
  range: TrendRange
) => {
  switch (range) {
    case "30D":
      return 20;

    case "90D":
      return 24;

    case "1Y":
      return 30;

    case "7D":
    default:
      return 7;
  }
};

const getPointStep = (
  itemCount: number,
  maximumPoints: number
) => {
  return Math.max(
    Math.ceil(
      itemCount /
        maximumPoints
    ),
    1
  );
};

const getDayLabel = (
  dateString: string,
  range: TrendRange
) => {
  const date = new Date(
    `${dateString}T00:00:00`
  );

  if (range === "1Y") {
    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
      }
    );
  }

  if (range === "90D") {
    return date.toLocaleDateString(
      "en-US",
      {
        day: "2-digit",
        month: "short",
      }
    );
  }

  if (range === "30D") {
    return date.toLocaleDateString(
      "en-US",
      {
        day: "2-digit",
        month: "short",
      }
    );
  }

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
    }
  );
};

export default function useTrendData({
  fromCurrency,
  toCurrency,
  enabled = true,
}: Props) {
  const [
    selectedRange,
    setSelectedRange,
  ] = useState<TrendRange>(
    "7D"
  );

  const [
    trendData,
    setTrendData,
  ] = useState<TrendItem[]>([]);

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

  const rangeDays = useMemo(
    () =>
      getRangeDays(
        selectedRange
      ),
    [selectedRange]
  );

  const maximumPoints =
    useMemo(
      () =>
        getMaximumPoints(
          selectedRange
        ),
      [selectedRange]
    );

  const fetchTrendData =
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
          setTrendData([
            {
              day: "Now",
              value: 1,
            },
          ]);

          return;
        }

        const startDate =
          new Date();

        startDate.setDate(
          startDate.getDate() -
            rangeDays
        );

        const url =
          `${API_URL}/rates` +
          `?from=${getDateString(
            startDate
          )}` +
          `&base=${encodeURIComponent(
            fromCurrency
          )}` +
          `&quotes=${encodeURIComponent(
            toCurrency
          )}`;

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Unable to load historical exchange-rate data."
          );
        }

        const result =
          (await response.json()) as
            HistoricalRateRow[];

        if (
          !Array.isArray(result)
        ) {
          throw new Error(
            "Invalid historical data received."
          );
        }

        const validRates =
          result
            .filter(
              (
                item
              ): item is HistoricalRateRow & {
                date: string;
                rate: number;
              } =>
                typeof item.date ===
                  "string" &&
                typeof item.rate ===
                  "number" &&
                Number.isFinite(
                  item.rate
                ) &&
                item.rate > 0
            )
            .sort(
              (
                first,
                second
              ) =>
                first.date.localeCompare(
                  second.date
                )
            );

        if (
          validRates.length === 0
        ) {
          throw new Error(
            "No historical rates are available for this currency pair."
          );
        }

        const step =
          getPointStep(
            validRates.length,
            maximumPoints
          );

        const sampledRates =
          validRates.filter(
            (
              _,
              index
            ) =>
              index % step === 0 ||
              index ===
                validRates.length -
                  1
          );

        const chartData =
          sampledRates.map(
            (item) => ({
              day: getDayLabel(
                item.date,
                selectedRange
              ),
              value: round(
                item.rate,
                4
              ),
            })
          );

        if (
          chartData.length > 0
        ) {
          const lastIndex =
            chartData.length - 1;

          chartData[lastIndex] = {
            ...chartData[
              lastIndex
            ],
            day: "Now",
          };
        }

        setTrendData(
          chartData
        );
      } catch (fetchError) {
        console.log(
          "Trend data error:",
          fetchError
        );

        setTrendData([]);

        setError(
          fetchError instanceof
            Error
            ? fetchError.message
            : "Unable to load trend data."
        );
      } finally {
        setLoading(false);
      }
    }, [
      enabled,
      fromCurrency,
      toCurrency,
      rangeDays,
      maximumPoints,
      selectedRange,
    ]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void fetchTrendData();
  }, [
    enabled,
    fetchTrendData,
  ]);

  const changeRange = (
    range: TrendRange
  ) => {
    if (
      range === selectedRange
    ) {
      return;
    }

    setSelectedRange(range);
    setTrendData([]);
    setError(null);
  };

  const resetTrend = () => {
    setTrendData([]);
    setError(null);
  };

  return {
    trendData,
    trendLoading: loading,
    trendError: error,

    selectedRange,
    setSelectedRange:
      changeRange,

    fetchTrendData,
    resetTrend,
  };
}