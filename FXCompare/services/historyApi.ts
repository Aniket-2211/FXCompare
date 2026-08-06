// services/historyApi.ts

import {
  HistoricalRange,
  HistoricalRatePoint,
} from "../components/historical/HistoricalChart";

type FrankfurterRateResponse = {
  amount?: number;
  base?: string;
  start_date?: string;
  end_date?: string;
  rates?: Record<
    string,
    Record<string, number>
  >;
};

const API_URL =
  "https://api.frankfurter.dev/v1";

const getDateString = (
  date: Date
) => {
  return date
    .toISOString()
    .split("T")[0];
};

const subtractDays = (
  date: Date,
  days: number
) => {
  const result = new Date(date);

  result.setDate(
    result.getDate() - days
  );

  return result;
};

const subtractMonths = (
  date: Date,
  months: number
) => {
  const result = new Date(date);

  result.setMonth(
    result.getMonth() - months
  );

  return result;
};

const subtractYears = (
  date: Date,
  years: number
) => {
  const result = new Date(date);

  result.setFullYear(
    result.getFullYear() - years
  );

  return result;
};

const getStartDate = (
  range: HistoricalRange,
  endDate: Date
) => {
  switch (range) {
    case "1D":
      return subtractDays(
        endDate,
        5
      );

    case "7D":
      return subtractDays(
        endDate,
        14
      );

    case "1M":
      return subtractMonths(
        endDate,
        1
      );

    case "3M":
      return subtractMonths(
        endDate,
        3
      );

    case "1Y":
      return subtractYears(
        endDate,
        1
      );

    default:
      return subtractMonths(
        endDate,
        1
      );
  }
};

const getMaximumPoints = (
  range: HistoricalRange
) => {
  switch (range) {
    case "1D":
      return 2;

    case "7D":
      return 7;

    case "1M":
      return 18;

    case "3M":
      return 24;

    case "1Y":
      return 30;

    default:
      return 18;
  }
};

const sampleData = (
  data: HistoricalRatePoint[],
  maximumPoints: number
) => {
  if (
    data.length <= maximumPoints
  ) {
    return data;
  }

  const sampled:
    HistoricalRatePoint[] = [];

  const lastIndex =
    data.length - 1;

  for (
    let index = 0;
    index < maximumPoints;
    index += 1
  ) {
    const sourceIndex =
      Math.round(
        (index /
          (maximumPoints - 1)) *
          lastIndex
      );

    const point =
      data[sourceIndex];

    if (
      !sampled.some(
        (item) =>
          item.date === point.date
      )
    ) {
      sampled.push(point);
    }
  }

  const finalPoint =
    data[lastIndex];

  if (
    sampled[
      sampled.length - 1
    ]?.date !== finalPoint.date
  ) {
    sampled.push(finalPoint);
  }

  return sampled;
};

const isValidRate = (
  value: unknown
): value is number => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
};

export async function fetchHistoricalRates(
  fromCurrency: string,
  toCurrency: string,
  range: HistoricalRange
): Promise<HistoricalRatePoint[]> {
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
    throw new Error(
      "Select a valid currency pair."
    );
  }

  if (
    normalizedFrom ===
    normalizedTo
  ) {
    throw new Error(
      "Historical data requires two different currencies."
    );
  }

  const endDate = new Date();

  const startDate =
    getStartDate(
      range,
      endDate
    );

  const startDateString =
    getDateString(startDate);

  const endDateString =
    getDateString(endDate);

  const requestUrl =
    `${API_URL}/${startDateString}` +
    `..${endDateString}` +
    `?base=${encodeURIComponent(
      normalizedFrom
    )}` +
    `&symbols=${encodeURIComponent(
      normalizedTo
    )}`;

  const response =
    await fetch(requestUrl);

  if (!response.ok) {
    throw new Error(
      "Unable to load historical exchange rates."
    );
  }

  const result =
    (await response.json()) as FrankfurterRateResponse;

  if (
    !result.rates ||
    typeof result.rates !==
      "object"
  ) {
    throw new Error(
      "Invalid historical exchange-rate data received."
    );
  }

  const historicalData =
    Object.entries(
      result.rates
    )
      .map(
        ([
          date,
          dailyRates,
        ]) => {
          const rate =
            dailyRates[
              normalizedTo
            ];

          return {
            date,
            rate,
          };
        }
      )
      .filter(
        (
          item
        ): item is HistoricalRatePoint =>
          typeof item.date ===
            "string" &&
          isValidRate(item.rate)
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
    historicalData.length === 0
  ) {
    throw new Error(
      `No historical rates are available for ${normalizedFrom}/${normalizedTo}.`
    );
  }

  const maximumPoints =
    getMaximumPoints(range);

  return sampleData(
    historicalData,
    maximumPoints
  );
}