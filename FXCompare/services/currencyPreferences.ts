// services/currencyPreferences.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENT_KEY = "fxcompare_recent_currencies";
const FAVOURITE_KEY = "fxcompare_favourite_currencies";

const MAX_RECENT = 8;

export const POPULAR_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "AED",
  "JPY",
  "CAD",
  "AUD",
  "SGD",
  "CHF",
];

export async function getRecentCurrencies() {
  try {
    const data = await AsyncStorage.getItem(RECENT_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data) as string[];
  } catch {
    return [];
  }
}

export async function saveRecentCurrency(
  currency: string
) {
  const current =
    await getRecentCurrencies();

  const updated = [
    currency,
    ...current.filter(
      (item) => item !== currency
    ),
  ].slice(0, MAX_RECENT);

  await AsyncStorage.setItem(
    RECENT_KEY,
    JSON.stringify(updated)
  );

  return updated;
}

export async function clearRecentCurrencies() {
  await AsyncStorage.removeItem(
    RECENT_KEY
  );
}

export async function getFavouriteCurrencies() {
  try {
    const data =
      await AsyncStorage.getItem(
        FAVOURITE_KEY
      );

    if (!data) {
      return [];
    }

    return JSON.parse(data) as string[];
  } catch {
    return [];
  }
}

export async function addFavouriteCurrency(
  currency: string
) {
  const current =
    await getFavouriteCurrencies();

  if (current.includes(currency)) {
    return current;
  }

  const updated = [
    currency,
    ...current,
  ];

  await AsyncStorage.setItem(
    FAVOURITE_KEY,
    JSON.stringify(updated)
  );

  return updated;
}

export async function removeFavouriteCurrency(
  currency: string
) {
  const current =
    await getFavouriteCurrencies();

  const updated =
    current.filter(
      (item) => item !== currency
    );

  await AsyncStorage.setItem(
    FAVOURITE_KEY,
    JSON.stringify(updated)
  );

  return updated;
}

export async function toggleFavouriteCurrency(
  currency: string
) {
  const current =
    await getFavouriteCurrencies();

  if (current.includes(currency)) {
    return removeFavouriteCurrency(
      currency
    );
  }

  return addFavouriteCurrency(
    currency
  );
}

export async function isFavouriteCurrency(
  currency: string
) {
  const favourites =
    await getFavouriteCurrencies();

  return favourites.includes(currency);
}