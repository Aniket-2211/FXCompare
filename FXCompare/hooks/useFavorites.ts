import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loadFavoriteMarketPairs,
  saveFavoriteMarketPairs,
} from "../services/favoritesStorage";

export default function useFavorites() {
  const [
    favoriteCodes,
    setFavoriteCodes,
  ] = useState<string[]>([]);

  const [
    loadingFavorites,
    setLoadingFavorites,
  ] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const saved =
          await loadFavoriteMarketPairs();

        if (mounted) {
          setFavoriteCodes(saved);
        }
      } finally {
        if (mounted) {
          setLoadingFavorites(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const favoriteSet =
    useMemo(
      () =>
        new Set(
          favoriteCodes
        ),
      [favoriteCodes]
    );

  const isFavorite =
    useCallback(
      (code: string) =>
        favoriteSet.has(code),
      [favoriteSet]
    );

  const toggleFavorite =
    useCallback(
      async (code: string) => {
        let nextCodes:
          | string[]
          | null = null;

        setFavoriteCodes(
          (current) => {
            nextCodes =
              current.includes(code)
                ? current.filter(
                    (item) =>
                      item !== code
                  )
                : [
                    ...current,
                    code,
                  ];

            return nextCodes;
          }
        );

        if (nextCodes) {
          await saveFavoriteMarketPairs(
            nextCodes
          );
        }
      },
      []
    );

  return {
    favoriteCodes,
    loadingFavorites,
    isFavorite,
    toggleFavorite,
  };
}