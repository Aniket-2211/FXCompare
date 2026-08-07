import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY =
  "@fxcompare/favorite-market-pairs";

export async function loadFavoriteMarketPairs(): Promise<string[]> {
  try {
    const stored =
      await AsyncStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is string =>
        typeof item === "string"
    );
  } catch (error) {
    console.log(
      "Load market favorites error:",
      error
    );

    return [];
  }
}

export async function saveFavoriteMarketPairs(
  codes: string[]
) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(codes)
    );
  } catch (error) {
    console.log(
      "Save market favorites error:",
      error
    );

    throw error;
  }
}