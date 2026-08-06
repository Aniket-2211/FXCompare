// services/exchangeApi.ts

const API_KEY =
  "dd807cb3b1cc03083a35cb74";

const BASE_URL =
  "https://v6.exchangerate-api.com/v6";

export type HistoricalRate = {
  date: string;
  rate: number;
};

export type ExchangeRateMap =
  Record<string, number>;

export type AlertRateRequest = {
  fromCurrency: string;
  toCurrency: string;
};

export type AlertRateResult = {
  pairKey: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
};

type LatestRatesResponse = {
  result?: string;
  base_code?: string;
  conversion_rates?: Record<
    string,
    number
  >;
  time_last_update_unix?: number;
  time_next_update_unix?: number;
  "error-type"?: string;
};

const normalizeCurrency = (
  currency: string
) => {
  return currency
    .trim()
    .toUpperCase();
};

export const getPairKey = (
  fromCurrency: string,
  toCurrency: string
) => {
  return `${normalizeCurrency(
    fromCurrency
  )}_${normalizeCurrency(
    toCurrency
  )}`;
};

const validateRatesResponse = (
  data: LatestRatesResponse,
  baseCurrency: string
) => {
  if (
    data.result &&
    data.result !== "success"
  ) {
    throw new Error(
      data["error-type"] ??
        `Unable to load rates for ${baseCurrency}.`
    );
  }

  if (
    !data.conversion_rates ||
    typeof data.conversion_rates !==
      "object"
  ) {
    throw new Error(
      `Invalid exchange-rate response for ${baseCurrency}.`
    );
  }

  return data.conversion_rates;
};

export async function getLatestRates(
  base: string
): Promise<LatestRatesResponse> {
  const normalizedBase =
    normalizeCurrency(base);

  if (!normalizedBase) {
    throw new Error(
      "A base currency is required."
    );
  }

  try {
    const response = await fetch(
      `${BASE_URL}/${API_KEY}/latest/${encodeURIComponent(
        normalizedBase
      )}`
    );

    if (!response.ok) {
      throw new Error(
        `Exchange-rate request failed with HTTP ${response.status}.`
      );
    }

    const data =
      (await response.json()) as
        LatestRatesResponse;

    validateRatesResponse(
      data,
      normalizedBase
    );

    return data;
  } catch (error) {
    console.error(
      `Latest rates error for ${normalizedBase}:`,
      error
    );

    throw error;
  }
}

export async function getExchangeRate(
  from: string,
  to: string
): Promise<number> {
  const normalizedFrom =
    normalizeCurrency(from);

  const normalizedTo =
    normalizeCurrency(to);

  if (
    !normalizedFrom ||
    !normalizedTo
  ) {
    throw new Error(
      "Both currencies are required."
    );
  }

  if (
    normalizedFrom ===
    normalizedTo
  ) {
    return 1;
  }

  try {
    const data =
      await getLatestRates(
        normalizedFrom
      );

    const rates =
      validateRatesResponse(
        data,
        normalizedFrom
      );

    const rate =
      Number(
        rates[normalizedTo]
      );

    if (
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      throw new Error(
        `${normalizedTo} is not available for ${normalizedFrom}.`
      );
    }

    return rate;
  } catch (error) {
    console.error(
      `Exchange-rate error for ${normalizedFrom}/${normalizedTo}:`,
      error
    );

    throw error;
  }
}

export async function getMultipleRates(
  base: string,
  currencies: string[]
): Promise<ExchangeRateMap> {
  const normalizedBase =
    normalizeCurrency(base);

  const normalizedCurrencies =
    Array.from(
      new Set(
        currencies
          .map(
            normalizeCurrency
          )
          .filter(Boolean)
      )
    );

  if (!normalizedBase) {
    throw new Error(
      "A base currency is required."
    );
  }

  if (
    normalizedCurrencies.length === 0
  ) {
    return {};
  }

  const data =
    await getLatestRates(
      normalizedBase
    );

  const rates =
    validateRatesResponse(
      data,
      normalizedBase
    );

  const result: ExchangeRateMap =
    {};

  normalizedCurrencies.forEach(
    (currency) => {
      if (
        currency === normalizedBase
      ) {
        result[currency] = 1;
        return;
      }

      const rate =
        Number(rates[currency]);

      if (
        Number.isFinite(rate) &&
        rate > 0
      ) {
        result[currency] =
          rate;
      }
    }
  );

  return result;
}

export async function getAlertRates(
  requests: AlertRateRequest[]
): Promise<{
  rates: Record<string, number>;
  failedPairs: string[];
}> {
  const normalizedRequests =
    requests
      .map((request) => ({
        fromCurrency:
          normalizeCurrency(
            request.fromCurrency
          ),

        toCurrency:
          normalizeCurrency(
            request.toCurrency
          ),
      }))
      .filter(
        (request) =>
          request.fromCurrency &&
          request.toCurrency
      );

  if (
    normalizedRequests.length === 0
  ) {
    return {
      rates: {},
      failedPairs: [],
    };
  }

  const requestsByBase =
    normalizedRequests.reduce<
      Record<string, string[]>
    >(
      (
        groupedRequests,
        request
      ) => {
        const existingTargets =
          groupedRequests[
            request.fromCurrency
          ] ?? [];

        groupedRequests[
          request.fromCurrency
        ] = Array.from(
          new Set([
            ...existingTargets,
            request.toCurrency,
          ])
        );

        return groupedRequests;
      },
      {}
    );

  const baseCurrencies =
    Object.keys(
      requestsByBase
    );

  const baseResults =
    await Promise.allSettled(
      baseCurrencies.map(
        async (baseCurrency) => {
          const targetCurrencies =
            requestsByBase[
              baseCurrency
            ];

          const rates =
            await getMultipleRates(
              baseCurrency,
              targetCurrencies
            );

          return {
            baseCurrency,
            targetCurrencies,
            rates,
          };
        }
      )
    );

  const rates: Record<
    string,
    number
  > = {};

  const failedPairs: string[] =
    [];

  baseResults.forEach(
    (result, index) => {
      const baseCurrency =
        baseCurrencies[index];

      const targetCurrencies =
        requestsByBase[
          baseCurrency
        ];

      if (
        result.status ===
        "rejected"
      ) {
        targetCurrencies.forEach(
          (targetCurrency) => {
            failedPairs.push(
              getPairKey(
                baseCurrency,
                targetCurrency
              )
            );
          }
        );

        console.error(
          `Alert-rate error for ${baseCurrency}:`,
          result.reason
        );

        return;
      }

      targetCurrencies.forEach(
        (targetCurrency) => {
          const pairKey =
            getPairKey(
              baseCurrency,
              targetCurrency
            );

          const rate =
            result.value.rates[
              targetCurrency
            ];

          if (
            Number.isFinite(rate) &&
            rate > 0
          ) {
            rates[pairKey] =
              rate;
          } else {
            failedPairs.push(
              pairKey
            );
          }
        }
      );
    }
  );

  return {
    rates,
    failedPairs,
  };
}

export async function getAlertRateResults(
  requests: AlertRateRequest[]
): Promise<AlertRateResult[]> {
  const {
    rates,
  } = await getAlertRates(
    requests
  );

  return Object.entries(
    rates
  ).map(
    ([pairKey, rate]) => {
      const [
        fromCurrency,
        toCurrency,
      ] = pairKey.split("_");

      return {
        pairKey,
        fromCurrency,
        toCurrency,
        rate,
      };
    }
  );
}

export async function getTrendData(
  from: string,
  to: string
): Promise<HistoricalRate[]> {
  const latestRate =
    await getExchangeRate(
      from,
      to
    );

  const trend: HistoricalRate[] =
    [];

  for (
    let dayIndex = 6;
    dayIndex >= 0;
    dayIndex--
  ) {
    const date =
      new Date();

    date.setDate(
      date.getDate() -
        dayIndex
    );

    const variation =
      latestRate *
      (
        Math.random() *
          0.012 -
        0.006
      );

    const value =
      latestRate -
      variation;

    trend.push({
      date:
        date
          .toISOString()
          .split("T")[0],

      rate:
        Number(
          value.toFixed(4)
        ),
    });
  }

  return trend;
}