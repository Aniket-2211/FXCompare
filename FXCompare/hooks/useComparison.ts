// hooks/useComparison.ts

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAppSettings,
} from "../context/AppSettingsContext";

import {
  useCurrency,
} from "../context/CurrencyContext";

import useExchangeRate from "./useExchangeRate";
import useTrendData from "./useTrendData";

type Provider = {
  name: string;
  rate: number;
  fee: number;
  finalAmount: number;
  recommended?: boolean;
};

type Recommendation = {
  title: string;
  message: string;
  provider: string;
  advantage: number;
};

const round = (
  value: number,
  decimalPlaces = 2
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

const normalizeAmount = (
  value: string
) => {
  const cleaned = value
    .replace(/,/g, "")
    .replace(/[^0-9.]/g, "");

  const decimalParts =
    cleaned.split(".");

  if (decimalParts.length <= 1) {
    return cleaned;
  }

  return `${decimalParts[0]}.${decimalParts
    .slice(1)
    .join("")}`;
};

const normalizeCurrency = (
  value: string
) => {
  return value
    .trim()
    .toUpperCase();
};

export default function useComparison() {
  const {
    loadingSettings,

    defaultFromCurrency,
    defaultToCurrency,
    defaultAmount,

    setDefaultFromCurrency,
    setDefaultToCurrency,
    setDefaultAmount,
  } = useAppSettings();

  const {
    amount,
    fromCurrency,
    toCurrency,

    setAmount:
      setSharedAmount,

    setFromCurrency:
      setSharedFromCurrency,

    setToCurrency:
      setSharedToCurrency,

    swapCurrencies:
      swapSharedCurrencies,
  } = useCurrency();

  const [
    settingsReady,
    setSettingsReady,
  ] = useState(false);

  useEffect(() => {
    if (
      loadingSettings ||
      settingsReady
    ) {
      return;
    }

    const normalizedDefaultFrom =
      normalizeCurrency(
        defaultFromCurrency
      ) || "USD";

    const normalizedDefaultTo =
      normalizeCurrency(
        defaultToCurrency
      ) || "INR";

    const normalizedDefaultAmount =
      normalizeAmount(
        defaultAmount
      ) || "1000";

    setSharedAmount(
      normalizedDefaultAmount
    );

    setSharedFromCurrency(
      normalizedDefaultFrom
    );

    setSharedToCurrency(
      normalizedDefaultTo
    );

    setSettingsReady(true);
  }, [
    loadingSettings,
    settingsReady,
    defaultAmount,
    defaultFromCurrency,
    defaultToCurrency,
    setSharedAmount,
    setSharedFromCurrency,
    setSharedToCurrency,
  ]);

  const dataFetchingEnabled =
    settingsReady &&
    !loadingSettings;

  const {
    rate,

    loading: rateLoading,
    error,
    lastUpdated,

    fetchRate: fetchLiveRate,
    resetRate,
  } = useExchangeRate({
    fromCurrency,
    toCurrency,
    enabled: dataFetchingEnabled,
  });

  const {
    trendData,
    trendLoading,
    trendError,

    selectedRange,
    setSelectedRange,

    fetchTrendData,
    resetTrend,
  } = useTrendData({
    fromCurrency,
    toCurrency,
    enabled: dataFetchingEnabled,
  });

  const numericAmount =
    useMemo(() => {
      const parsedAmount =
        Number(
          amount.replace(
            /,/g,
            ""
          )
        );

      if (
        !Number.isFinite(
          parsedAmount
        ) ||
        parsedAmount < 0
      ) {
        return 0;
      }

      return parsedAmount;
    }, [amount]);

  const convertedAmount =
    useMemo(() => {
      return round(
        numericAmount * rate,
        2
      );
    }, [
      numericAmount,
      rate,
    ]);

  const providers =
    useMemo<Provider[]>(() => {
      if (
        !rate ||
        numericAmount <= 0
      ) {
        return [];
      }

      const providerSettings = [
        {
          name: "Wise",
          rateAdjustment: 0.9985,
          feePercentage: 0.0045,
        },

        {
          name: "Remitly",
          rateAdjustment: 0.996,
          feePercentage: 0.0062,
        },

        {
          name: "PayPal",
          rateAdjustment: 0.985,
          feePercentage: 0.0125,
        },

        {
          name: "Revolut",
          rateAdjustment: 0.9978,
          feePercentage: 0.005,
        },

        {
          name: "OFX",
          rateAdjustment: 0.9955,
          feePercentage: 0.004,
        },
      ];

      const calculatedProviders =
        providerSettings.map(
          (provider) => {
            const providerRate =
              rate *
              provider.rateAdjustment;

            const sourceCurrencyFee =
              numericAmount *
              provider.feePercentage;

            const transferableAmount =
              Math.max(
                numericAmount -
                  sourceCurrencyFee,
                0
              );

            const finalAmount =
              transferableAmount *
              providerRate;

            return {
              name: provider.name,

              rate: round(
                providerRate,
                4
              ),

              fee: round(
                sourceCurrencyFee,
                2
              ),

              finalAmount: round(
                finalAmount,
                2
              ),
            };
          }
        );

      const bestProvider =
        calculatedProviders.reduce(
          (best, current) =>
            current.finalAmount >
            best.finalAmount
              ? current
              : best
        );

      return calculatedProviders.map(
        (provider) => ({
          ...provider,

          recommended:
            provider.name ===
            bestProvider.name,
        })
      );
    }, [
      numericAmount,
      rate,
    ]);

  const recommendation =
    useMemo<Recommendation>(() => {
      if (
        providers.length === 0
      ) {
        return {
          title:
            "Enter an amount to compare",

          message:
            "Enter an amount to calculate estimated provider results.",

          provider: "",

          advantage: 0,
        };
      }

      const sortedProviders = [
        ...providers,
      ].sort(
        (first, second) =>
          second.finalAmount -
          first.finalAmount
      );

      const bestProvider =
        sortedProviders[0];

      const secondBestProvider =
        sortedProviders[1];

      const advantage =
        secondBestProvider
          ? round(
              bestProvider.finalAmount -
                secondBestProvider.finalAmount,
              2
            )
          : 0;

      return {
        title: "Best Value",

        provider:
          bestProvider.name,

        advantage,

        message:
          `${bestProvider.name} is estimated to deliver ` +
          `${advantage.toFixed(2)} ${toCurrency} more than ` +
          "the next available provider after estimated fees.",
      };
    }, [
      providers,
      toCurrency,
    ]);

  const refreshAllData =
    useCallback(async () => {
      if (!dataFetchingEnabled) {
        return;
      }

      await Promise.all([
        fetchLiveRate(),
        fetchTrendData(),
      ]);
    }, [
      dataFetchingEnabled,
      fetchLiveRate,
      fetchTrendData,
    ]);

  const setAmount = useCallback(
    (
      value: string
    ) => {
      const normalized =
        normalizeAmount(value);

      setSharedAmount(
        normalized
      );

      void setDefaultAmount(
        normalized
      );
    },
    [
      setSharedAmount,
      setDefaultAmount,
    ]
  );

  const swapCurrencies =
    useCallback(() => {
      const nextFrom =
        toCurrency;

      const nextTo =
        fromCurrency;

      resetRate();
      resetTrend();

      swapSharedCurrencies();

      void Promise.all([
        setDefaultFromCurrency(
          nextFrom
        ),

        setDefaultToCurrency(
          nextTo
        ),
      ]);
    }, [
      fromCurrency,
      toCurrency,
      resetRate,
      resetTrend,
      swapSharedCurrencies,
      setDefaultFromCurrency,
      setDefaultToCurrency,
    ]);

  const selectFromCurrency =
    useCallback(
      (
        currency: string
      ) => {
        const normalizedCurrency =
          normalizeCurrency(
            currency
          );

        if (
          !normalizedCurrency ||
          normalizedCurrency ===
            fromCurrency
        ) {
          return;
        }

        resetRate();
        resetTrend();

        setSharedFromCurrency(
          normalizedCurrency
        );

        void setDefaultFromCurrency(
          normalizedCurrency
        );
      },
      [
        fromCurrency,
        resetRate,
        resetTrend,
        setSharedFromCurrency,
        setDefaultFromCurrency,
      ]
    );

  const selectToCurrency =
    useCallback(
      (
        currency: string
      ) => {
        const normalizedCurrency =
          normalizeCurrency(
            currency
          );

        if (
          !normalizedCurrency ||
          normalizedCurrency ===
            toCurrency
        ) {
          return;
        }

        resetRate();
        resetTrend();

        setSharedToCurrency(
          normalizedCurrency
        );

        void setDefaultToCurrency(
          normalizedCurrency
        );
      },
      [
        toCurrency,
        resetRate,
        resetTrend,
        setSharedToCurrency,
        setDefaultToCurrency,
      ]
    );

  return {
    amount,
    setAmount,

    fromCurrency,
    toCurrency,

    rate,
    convertedAmount,

    loading:
      rateLoading ||
      loadingSettings ||
      !settingsReady,

    error,
    lastUpdated,

    providers,
    recommendation,

    trendData,
    trendLoading,
    trendError,

    selectedRange,
    setSelectedRange,

    fetchTrendData,

    fetchRate:
      refreshAllData,

    swapCurrencies,

    selectFromCurrency,
    selectToCurrency,
  };
}