import AsyncStorage from "@react-native-async-storage/async-storage";

export type WatchlistItem = {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  targetRate?: number | null;
  note?: string;
  createdAt: number;
};

const STORAGE_KEY =
  "fxcompare_watchlist_v1";

const normalizeCode = (
  value: string
) =>
  value
    .trim()
    .toUpperCase();

const normalizeItem = (
  item: WatchlistItem
): WatchlistItem => ({
  ...item,
  fromCurrency:
    normalizeCode(
      item.fromCurrency
    ),
  toCurrency:
    normalizeCode(
      item.toCurrency
    ),
  note:
    item.note?.trim() ??
    "",
  targetRate:
    item.targetRate &&
    Number.isFinite(
      item.targetRate
    )
      ? item.targetRate
      : null,
});

export async function getWatchlist(): Promise<
  WatchlistItem[]
> {
  try {
    const raw =
      await AsyncStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw);

    if (
      !Array.isArray(parsed)
    ) {
      return [];
    }

    return parsed
      .filter(
        (
          item
        ): item is WatchlistItem =>
          !!item &&
          typeof item.id ===
            "string" &&
          typeof item.fromCurrency ===
            "string" &&
          typeof item.toCurrency ===
            "string" &&
          typeof item.createdAt ===
            "number"
      )
      .map(
        normalizeItem
      );
  } catch (error) {
    console.log(
      "Watchlist load error:",
      error
    );

    return [];
  }
}

export async function saveWatchlist(
  items: WatchlistItem[]
) {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      items.map(
        normalizeItem
      )
    )
  );
}

export async function addWatchlistItem(
  item: WatchlistItem
) {
  const current =
    await getWatchlist();

  const normalized =
    normalizeItem(item);

  const duplicate =
    current.find(
      (existing) =>
        existing.fromCurrency ===
          normalized.fromCurrency &&
        existing.toCurrency ===
          normalized.toCurrency
    );

  if (duplicate) {
    const updated =
      current.map(
        (existing) =>
          existing.id ===
          duplicate.id
            ? {
                ...existing,
                targetRate:
                  normalized.targetRate ??
                  existing.targetRate,
                note:
                  normalized.note ||
                  existing.note,
              }
            : existing
      );

    await saveWatchlist(
      updated
    );

    return updated;
  }

  const updated = [
    normalized,
    ...current,
  ];

  await saveWatchlist(
    updated
  );

  return updated;
}

export async function updateWatchlistItem(
  item: WatchlistItem
) {
  const current =
    await getWatchlist();

  const updated =
    current.map(
      (existing) =>
        existing.id ===
        item.id
          ? normalizeItem(
              item
            )
          : existing
    );

  await saveWatchlist(
    updated
  );

  return updated;
}

export async function removeWatchlistItem(
  id: string
) {
  const current =
    await getWatchlist();

  const updated =
    current.filter(
      (item) =>
        item.id !== id
    );

  await saveWatchlist(
    updated
  );

  return updated;
}

export async function clearWatchlist() {
  await AsyncStorage.removeItem(
    STORAGE_KEY
  );
}