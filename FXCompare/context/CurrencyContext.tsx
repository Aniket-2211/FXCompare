// context/CurrencyContext.tsx

import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

type CurrencyContextValue = {
  amount: string;
  fromCurrency: string;
  toCurrency: string;

  setAmount: (
    value: string
  ) => void;

  setFromCurrency: (
    value: string
  ) => void;

  setToCurrency: (
    value: string
  ) => void;

  swapCurrencies: () => void;

  resetCurrencySelection: () => void;
};

type CurrencyProviderProps = {
  children: ReactNode;
};

const CurrencyContext =
  createContext<
    CurrencyContextValue | undefined
  >(undefined);

const DEFAULT_AMOUNT = "1000";
const DEFAULT_FROM_CURRENCY = "USD";
const DEFAULT_TO_CURRENCY = "INR";

export function CurrencyProvider({
  children,
}: CurrencyProviderProps) {
  const [
    amount,
    setAmount,
  ] = useState(
    DEFAULT_AMOUNT
  );

  const [
    fromCurrency,
    setFromCurrency,
  ] = useState(
    DEFAULT_FROM_CURRENCY
  );

  const [
    toCurrency,
    setToCurrency,
  ] = useState(
    DEFAULT_TO_CURRENCY
  );

  const swapCurrencies = () => {
    setFromCurrency(
      toCurrency
    );

    setToCurrency(
      fromCurrency
    );
  };

  const resetCurrencySelection =
    () => {
      setAmount(
        DEFAULT_AMOUNT
      );

      setFromCurrency(
        DEFAULT_FROM_CURRENCY
      );

      setToCurrency(
        DEFAULT_TO_CURRENCY
      );
    };

  const value = useMemo(
    () => ({
      amount,
      fromCurrency,
      toCurrency,

      setAmount,
      setFromCurrency,
      setToCurrency,

      swapCurrencies,
      resetCurrencySelection,
    }),
    [
      amount,
      fromCurrency,
      toCurrency,
    ]
  );

  return (
    <CurrencyContext.Provider
      value={value}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context =
    useContext(
      CurrencyContext
    );

  if (!context) {
    throw new Error(
      "useCurrency must be used inside CurrencyProvider."
    );
  }

  return context;
}