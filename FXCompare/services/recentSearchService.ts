// services/recentSearchService.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

export type RecentSearch = {
  id: string;
  amount: string;
  fromCurrency: string;
  toCurrency: string;
  createdAt: string;
};

const STORAGE_KEY =
  "@fxcompare_recent_searches";

const MAX_RECENT_SEARCHES = 10;

const buildSearchId = (
  fromCurrency: string,
  toCurrency: string
) =>
  `${fromCurrency.trim().toUpperCase()}-${toCurrency
    .trim()
    .toUpperCase()}`;

const isRecentSearch = (
  value: unknown
): value is RecentSearch => {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const item =
    value as Partial<RecentSearch>;

  return (
    typeof item.id === "string" &&
    typeof item.amount === "string" &&
    typeof item.fromCurrency ===
      "string" &&
    typeof item.toCurrency ===
      "string" &&
    typeof item.createdAt === "string"
  );
};

export async function getRecentSearches(): Promise<
  RecentSearch[]
> {
  try {
    const storedValue =
      await AsyncStorage.getItem(
        STORAGE_KEY
      );

    if (!storedValue) {
      return [];
    }

    const parsedValue =
      JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter(isRecentSearch)
      .slice(
        0,
        MAX_RECENT_SEARCHES
      );
  } catch (error) {
    console.log(
      "Get recent searches error:",
      error
    );

    return [];
  }
}

export async function saveRecentSearch(
  amount: string,
  fromCurrency: string,
  toCurrency: string
): Promise<RecentSearch[]> {
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
    !normalizedTo ||
    normalizedFrom ===
      normalizedTo
  ) {
    return getRecentSearches();
  }

  const currentSearches =
    await getRecentSearches();

  const searchId =
    buildSearchId(
      normalizedFrom,
      normalizedTo
    );

  const newSearch: RecentSearch = {
    id: searchId,
    amount:
      amount.trim() || "0",
    fromCurrency:
      normalizedFrom,
    toCurrency:
      normalizedTo,
    createdAt:
      new Date().toISOString(),
  };

  const updatedSearches = [
    newSearch,
    ...currentSearches.filter(
      (item) =>
        item.id !== searchId
    ),
  ].slice(
    0,
    MAX_RECENT_SEARCHES
  );

  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        updatedSearches
      )
    );
  } catch (error) {
    console.log(
      "Save recent search error:",
      error
    );
  }

  return updatedSearches;
}

export async function removeRecentSearch(
  id: string
): Promise<RecentSearch[]> {
  const currentSearches =
    await getRecentSearches();

  const updatedSearches =
    currentSearches.filter(
      (item) => item.id !== id
    );

  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        updatedSearches
      )
    );
  } catch (error) {
    console.log(
      "Remove recent search error:",
      error
    );
  }

  return updatedSearches;
}

export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(
      STORAGE_KEY
    );
  } catch (error) {
    console.log(
      "Clear recent searches error:",
      error
    );
  }
}