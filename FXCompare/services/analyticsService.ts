
import type {
  HistoricalRatePoint,
} from "./historyApi";

import type {
  MarketPair,
} from "./marketsApi";

export type TrendDirection =
  | "up"
  | "down"
  | "neutral";

export type VolatilityLevel =
  | "Low"
  | "Moderate"
  | "High";

export type MarketSentiment =
  | "Bullish"
  | "Neutral"
  | "Bearish";

export type HistoricalAnalytics = {
  currentRate: number;
  firstRate: number;

  high: number;
  low: number;
  average: number;

  change: number;
  changePercent: number;

  volatilityPercent: number;
  volatility: VolatilityLevel;

  trend: TrendDirection;
  sentiment: MarketSentiment;

  dataPoints: number;
};

export type MarketAnalytics = {
  totalPairs: number;

  gainers: number;
  losers: number;
  unchanged: number;

  averageChange: number;

  sentiment: MarketSentiment;

  strongestPair:
    | MarketPair
    | null;

  weakestPair:
    | MarketPair
    | null;

  mostStablePair:
    | MarketPair
    | null;

  mostVolatilePair:
    | MarketPair
    | null;
};

const clampFinite = (
  value: number,
  fallback = 0
) =>
  Number.isFinite(value)
    ? value
    : fallback;

const standardDeviation = (
  values: number[]
) => {
  if (values.length < 2) {
    return 0;
  }

  const average =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length;

  const variance =
    values.reduce(
      (sum, value) => {
        const difference =
          value - average;

        return (
          sum +
          difference *
            difference
        );
      },
      0
    ) / values.length;

  return Math.sqrt(
    variance
  );
};

export const getVolatilityLevel = (
  volatilityPercent: number
): VolatilityLevel => {
  if (
    volatilityPercent <
    0.35
  ) {
    return "Low";
  }

  if (
    volatilityPercent <
    0.9
  ) {
    return "Moderate";
  }

  return "High";
};

export const getSentimentFromChange = (
  changePercent: number
): MarketSentiment => {
  if (
    changePercent > 0.08
  ) {
    return "Bullish";
  }

  if (
    changePercent <
    -0.08
  ) {
    return "Bearish";
  }

  return "Neutral";
};

export function analyzeHistoricalRates(
  data: HistoricalRatePoint[]
): HistoricalAnalytics {
  const validData =
    data.filter(
      (item) =>
        Number.isFinite(
          item.rate
        ) &&
        item.rate > 0
    );

  if (
    validData.length === 0
  ) {
    return {
      currentRate: 0,
      firstRate: 0,

      high: 0,
      low: 0,
      average: 0,

      change: 0,
      changePercent: 0,

      volatilityPercent: 0,
      volatility: "Low",

      trend: "neutral",
      sentiment: "Neutral",

      dataPoints: 0,
    };
  }

  const rates =
    validData.map(
      (item) =>
        item.rate
    );

  const firstRate =
    rates[0];

  const currentRate =
    rates[
      rates.length - 1
    ];

  const high =
    Math.max(...rates);

  const low =
    Math.min(...rates);

  const average =
    rates.reduce(
      (sum, rate) =>
        sum + rate,
      0
    ) / rates.length;

  const change =
    currentRate -
    firstRate;

  const changePercent =
    firstRate > 0
      ? (change /
          firstRate) *
        100
      : 0;

  const deviation =
    standardDeviation(
      rates
    );

  const volatilityPercent =
    average > 0
      ? (deviation /
          average) *
        100
      : 0;

  const trend:
    TrendDirection =
    changePercent > 0.05
      ? "up"
      : changePercent <
          -0.05
        ? "down"
        : "neutral";

  const sentiment =
    getSentimentFromChange(
      changePercent
    );

  return {
    currentRate:
      clampFinite(
        currentRate
      ),

    firstRate:
      clampFinite(
        firstRate
      ),

    high:
      clampFinite(
        high
      ),

    low:
      clampFinite(
        low
      ),

    average:
      clampFinite(
        average
      ),

    change:
      clampFinite(
        change
      ),

    changePercent:
      clampFinite(
        changePercent
      ),

    volatilityPercent:
      clampFinite(
        volatilityPercent
      ),

    volatility:
      getVolatilityLevel(
        volatilityPercent
      ),

    trend,
    sentiment,

    dataPoints:
      validData.length,
  };
}

export function analyzeMarkets(
  pairs: MarketPair[]
): MarketAnalytics {
  const validPairs =
    pairs.filter(
      (item) =>
        Number.isFinite(
          item.rate
        ) &&
        Number.isFinite(
          item.change
        )
    );

  if (
    validPairs.length === 0
  ) {
    return {
      totalPairs: 0,

      gainers: 0,
      losers: 0,
      unchanged: 0,

      averageChange: 0,

      sentiment:
        "Neutral",

      strongestPair:
        null,

      weakestPair:
        null,

      mostStablePair:
        null,

      mostVolatilePair:
        null,
    };
  }

  const gainers =
    validPairs.filter(
      (item) =>
        item.change >
        0
    ).length;

  const losers =
    validPairs.filter(
      (item) =>
        item.change <
        0
    ).length;

  const unchanged =
    validPairs.length -
    gainers -
    losers;

  const averageChange =
    validPairs.reduce(
      (sum, item) =>
        sum +
        item.change,
      0
    ) /
    validPairs.length;

  const sortedByChange =
    [
      ...validPairs,
    ].sort(
      (
        first,
        second
      ) =>
        second.change -
        first.change
    );

  const sortedByAbsoluteChange =
    [
      ...validPairs,
    ].sort(
      (
        first,
        second
      ) =>
        Math.abs(
          second.change
        ) -
        Math.abs(
          first.change
        )
    );

  const sortedByStability =
    [
      ...validPairs,
    ].sort(
      (
        first,
        second
      ) =>
        Math.abs(
          first.change
        ) -
        Math.abs(
          second.change
        )
    );

  let sentiment:
    MarketSentiment =
      "Neutral";

  if (
    averageChange >
      0.08 ||
    gainers >=
      losers + 2
  ) {
    sentiment =
      "Bullish";
  } else if (
    averageChange <
      -0.08 ||
    losers >=
      gainers + 2
  ) {
    sentiment =
      "Bearish";
  }

  return {
    totalPairs:
      validPairs.length,

    gainers,
    losers,
    unchanged,

    averageChange:
      clampFinite(
        averageChange
      ),

    sentiment,

    strongestPair:
      sortedByChange[
        0
      ] ?? null,

    weakestPair:
      sortedByChange[
        sortedByChange.length -
          1
      ] ?? null,

    mostStablePair:
      sortedByStability[
        0
      ] ?? null,

    mostVolatilePair:
      sortedByAbsoluteChange[
        0
      ] ?? null,
  };
}

export function formatAnalyticsRate(
  value: number
) {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return "--";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits:
        value < 1 ? 4 : 2,
      maximumFractionDigits:
        4,
    }
  ).format(value);
}

export function formatAnalyticsPercent(
  value: number
) {
  if (
    !Number.isFinite(value)
  ) {
    return "0.00%";
  }

  return `${
    value >= 0
      ? "+"
      : ""
  }${value.toFixed(2)}%`;
}