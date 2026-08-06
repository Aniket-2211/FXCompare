// services/marketsApi.ts

export type CurrencyConfig = {
  code: string;
  name: string;
  flag: string;
};

export type MarketPair = {
  code: string;
  pair: string;
  name: string;
  flag: string;
  rate: number;
  previousRate: number;
  change: number;
  rateDate: string | null;
};

type ApiRate = {
  date?: string;
  base?: string;
  quote?: string;
  rate?: number;
};

const API_URL =
  "https://api.frankfurter.dev/v2/rates";

export const MARKET_CURRENCIES: CurrencyConfig[] = [
  {
    code: "USD",
    name: "US Dollar",
    flag: "🇺🇸",
  },
  {
    code: "EUR",
    name: "Euro",
    flag: "🇪🇺",
  },
  {
    code: "GBP",
    name: "British Pound",
    flag: "🇬🇧",
  },
  {
    code: "AED",
    name: "UAE Dirham",
    flag: "🇦🇪",
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    flag: "🇯🇵",
  },
];

const getDateString = (date: Date) =>
  date.toISOString().split("T")[0];

const isValidRate = (
  item: ApiRate
): item is Required<
  Pick<ApiRate, "date" | "quote" | "rate">
> &
  ApiRate => {
  return (
    typeof item.date === "string" &&
    item.quote === "INR" &&
    typeof item.rate === "number" &&
    Number.isFinite(item.rate) &&
    item.rate > 0
  );
};

export async function fetchMarketPair(
  currency: CurrencyConfig
): Promise<MarketPair> {
  const startDate = new Date();

  startDate.setDate(
    startDate.getDate() - 10
  );

  const requestUrl =
    `${API_URL}` +
    `?base=${encodeURIComponent(currency.code)}` +
    `&quotes=INR` +
    `&from=${getDateString(startDate)}`;

  const response = await fetch(requestUrl);

  if (!response.ok) {
    throw new Error(
      `Unable to load ${currency.code}/INR.`
    );
  }

  const result =
    (await response.json()) as ApiRate[];

  if (!Array.isArray(result)) {
    throw new Error(
      `Invalid market data received for ${currency.code}/INR.`
    );
  }

  const validRates = result
    .filter(isValidRate)
    .sort((first, second) =>
      first.date.localeCompare(second.date)
    );

  if (validRates.length === 0) {
    throw new Error(
      `No rate is currently available for ${currency.code}/INR.`
    );
  }

  const latestRate =
    validRates[validRates.length - 1];

  const previousRate =
    validRates.length > 1
      ? validRates[validRates.length - 2]
      : latestRate;

  const change =
    previousRate.rate > 0
      ? ((latestRate.rate -
          previousRate.rate) /
          previousRate.rate) *
        100
      : 0;

  return {
    code: currency.code,
    pair: `${currency.code} / INR`,
    name: currency.name,
    flag: currency.flag,
    rate: latestRate.rate,
    previousRate: previousRate.rate,
    change,
    rateDate: latestRate.date,
  };
}

export async function fetchAllMarkets(): Promise<{
  pairs: MarketPair[];
  failedPairs: string[];
}> {
  const results = await Promise.allSettled(
    MARKET_CURRENCIES.map(fetchMarketPair)
  );

  const pairs: MarketPair[] = [];
  const failedPairs: string[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      pairs.push(result.value);
    } else {
      failedPairs.push(
        MARKET_CURRENCIES[index].code
      );

      console.log(
        `${MARKET_CURRENCIES[index].code}/INR market error:`,
        result.reason
      );
    }
  });

  if (pairs.length === 0) {
    throw new Error(
      "Unable to load market rates. Check your internet connection and try again."
    );
  }

  return {
    pairs,
    failedPairs,
  };
}