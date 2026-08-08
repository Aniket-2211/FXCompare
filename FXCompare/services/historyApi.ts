
export type HistoricalRange =
  | "1D"
  | "7D"
  | "1M"
  | "3M"
  | "1Y";

export type HistoricalRatePoint = {
  date: string;
  rate: number;
};

type FrankfurterRateRow = {
  date?: string;
  base?: string;
  quote?: string;
  rate?: number;
};

type RangeConfig = {
  from: Date;
  to: Date;
  group?: "week" | "month";
};

const API_BASE =
  "https://api.frankfurter.dev/v2";

const formatDate = (
  date: Date
) =>
  date
    .toISOString()
    .slice(0, 10);

const subtractDays = (
  date: Date,
  days: number
) => {
  const copy =
    new Date(date);

  copy.setDate(
    copy.getDate() -
      days
  );

  return copy;
};

const subtractYears = (
  date: Date,
  years: number
) => {
  const copy =
    new Date(date);

  copy.setFullYear(
    copy.getFullYear() -
      years
  );

  return copy;
};

const getRangeConfig = (
  range: HistoricalRange
): RangeConfig => {
  const today =
    new Date();

  switch (range) {
    case "1D":
      return {
        from: subtractDays(
          today,
          7
        ),
        to: today,
      };

    case "7D":
      return {
        from: subtractDays(
          today,
          10
        ),
        to: today,
      };

    case "1M":
      return {
        from: subtractDays(
          today,
          35
        ),
        to: today,
      };

    case "3M":
      return {
        from: subtractDays(
          today,
          100
        ),
        to: today,
        group: "week",
      };

    case "1Y":
      return {
        from: subtractYears(
          today,
          1
        ),
        to: today,
        group: "month",
      };

    default:
      return {
        from: subtractDays(
          today,
          10
        ),
        to: today,
      };
  }
};

const normalizeCurrency = (
  currency: string
) =>
  currency
    .trim()
    .toUpperCase();

const isValidRow = (
  row: FrankfurterRateRow,
  quote: string
): row is Required<
  Pick<
    FrankfurterRateRow,
    "date" | "quote" | "rate"
  >
> &
  FrankfurterRateRow => {
  return (
    typeof row.date ===
      "string" &&
    row.quote ===
      quote &&
    typeof row.rate ===
      "number" &&
    Number.isFinite(
      row.rate
    ) &&
    row.rate > 0
  );
};

export async function fetchHistoricalRates({
  fromCurrency,
  toCurrency,
  range = "7D",
  signal,
}: {
  fromCurrency: string;
  toCurrency: string;
  range?: HistoricalRange;
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

  const config =
    getRangeConfig(
      range
    );

  const params =
    new URLSearchParams({
      base,
      quotes: quote,
      from: formatDate(
        config.from
      ),
      to: formatDate(
        config.to
      ),
    });

  if (config.group) {
    params.set(
      "group",
      config.group
    );
  }

  const response =
    await fetch(
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
      // Keep fallback message.
    }

    throw new Error(
      message
    );
  }

  const result =
    await response.json();

  if (
    !Array.isArray(result)
  ) {
    throw new Error(
      "Invalid historical rate data received."
    );
  }

  const points =
    (
      result as FrankfurterRateRow[]
    )
      .filter(
        (row) =>
          isValidRow(
            row,
            quote
          )
      )
      .map(
        (row) => ({
          date: row.date,
          rate: row.rate,
        })
      )
      .sort(
        (first, second) =>
          first.date.localeCompare(
            second.date
          )
      );

  if (
    points.length === 0
  ) {
    throw new Error(
      `No historical data is currently available for ${base}/${quote}.`
    );
  }

  switch (range) {
    case "1D":
      return points.slice(
        -2
      );

    case "7D":
      return points.slice(
        -7
      );

    case "1M":
      return points.slice(
        -30
      );

    case "3M":
    case "1Y":
    default:
      return points;
  }
}