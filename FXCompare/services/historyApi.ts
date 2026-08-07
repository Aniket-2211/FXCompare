export type HistoricalRange =
  | "1D"
  | "7D"
  | "30D"
  | "90D"
  | "1Y";

export type HistoricalRatePoint = {
  date: string;
  rate: number;
};

type FrankfurterRateRow = {
  date: string;
  base: string;
  quote: string;
  rate: number;
};

const API_BASE =
  "https://api.frankfurter.dev/v2";

const formatDate = (date: Date) =>
  date.toISOString().slice(0, 10);

const subtractDays = (
  date: Date,
  days: number
) => {
  const copy = new Date(date);
  copy.setDate(
    copy.getDate() - days
  );
  return copy;
};

const subtractYears = (
  date: Date,
  years: number
) => {
  const copy = new Date(date);
  copy.setFullYear(
    copy.getFullYear() - years
  );
  return copy;
};

const getRangeConfig = (
  range: HistoricalRange
) => {
  const today = new Date();

  switch (range) {
    case "1D":
      // Frankfurter provides daily reference rates,
      // not intraday prices. Fetch a short window
      // so we can compare the latest two available
      // business-day observations.
      return {
        from: subtractDays(today, 7),
        to: today,
        group: undefined,
      };

    case "7D":
      return {
        from: subtractDays(today, 10),
        to: today,
        group: undefined,
      };

    case "30D":
      return {
        from: subtractDays(today, 35),
        to: today,
        group: undefined,
      };

    case "90D":
      return {
        from: subtractDays(today, 100),
        to: today,
        group: "week" as const,
      };

    case "1Y":
      return {
        from: subtractYears(today, 1),
        to: today,
        group: "month" as const,
      };
  }
};

const normalizeCurrency = (
  currency: string
) =>
  currency
    .trim()
    .toUpperCase();

export async function fetchHistoricalRates({
  fromCurrency,
  toCurrency,
  range,
  signal,
}: {
  fromCurrency: string;
  toCurrency: string;
  range: HistoricalRange;
  signal?: AbortSignal;
}): Promise<
  HistoricalRatePoint[]
> {
  const base =
    normalizeCurrency(
      fromCurrency
    );

  const quote =
    normalizeCurrency(
      toCurrency
    );

  if (!base || !quote) {
    throw new Error(
      "Currency pair is required."
    );
  }

  if (base === quote) {
    return [
      {
        date: formatDate(
          new Date()
        ),
        rate: 1,
      },
    ];
  }

  const {
    from,
    to,
    group,
  } = getRangeConfig(range);

  const params =
    new URLSearchParams({
      base,
      quotes: quote,
      from: formatDate(from),
      to: formatDate(to),
    });

  if (group) {
    params.set(
      "group",
      group
    );
  }

  const response = await fetch(
    `${API_BASE}/rates?${params.toString()}`,
    {
      signal,
      headers: {
        Accept:
          "application/json",
      },
    }
  );

  if (!response.ok) {
    let message =
      "Unable to load historical rates.";

    try {
      const body =
        await response.json();

      if (
        body &&
        typeof body.message ===
          "string"
      ) {
        message =
          body.message;
      }
    } catch {
      // Keep the default message.
    }

    throw new Error(message);
  }

  const rows =
    (await response.json()) as
      FrankfurterRateRow[];

  const points = rows
    .filter(
      (row) =>
        row.quote === quote &&
        Number.isFinite(
          row.rate
        )
    )
    .map((row) => ({
      date: row.date,
      rate: row.rate,
    }))
    .sort((a, b) =>
      a.date.localeCompare(
        b.date
      )
    );

  if (range === "1D") {
    return points.slice(-2);
  }

  if (range === "7D") {
    return points.slice(-7);
  }

  if (range === "30D") {
    return points.slice(-30);
  }

  return points;
}