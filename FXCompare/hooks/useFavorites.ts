// hooks/useFavorites.ts

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FavouritePair,
  FavouriteProvider,
  getFavouritePairs,
  getFavouriteProviders,
  saveFavouritePair,
  saveFavouriteProvider,
  removeFavouritePair,
  removeFavouriteProvider,
  clearFavouritePairs,
  clearFavouriteProviders,
} from "../services/favoriteService";

export default function useFavorites() {
  const [pairs, setPairs] =
    useState<FavouritePair[]>([]);

  const [providers, setProviders] =
    useState<FavouriteProvider[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadFavorites =
    useCallback(async () => {
      setLoading(true);

      try {
        const [
          savedPairs,
          savedProviders,
        ] = await Promise.all([
          getFavouritePairs(),
          getFavouriteProviders(),
        ]);

        setPairs(savedPairs);
        setProviders(savedProviders);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const addPair =
    useCallback(
      async (
        fromCurrency: string,
        toCurrency: string
      ) => {
        const updated =
          await saveFavouritePair(
            fromCurrency,
            toCurrency
          );

        setPairs(updated);
      },
      []
    );

  const removePair =
    useCallback(
      async (id: string) => {
        const updated =
          await removeFavouritePair(
            id
          );

        setPairs(updated);
      },
      []
    );

  const addProvider =
    useCallback(
      async (
        providerName: string
      ) => {
        const updated =
          await saveFavouriteProvider(
            providerName
          );

        setProviders(updated);
      },
      []
    );

  const removeProvider =
    useCallback(
      async (id: string) => {
        const updated =
          await removeFavouriteProvider(
            id
          );

        setProviders(updated);
      },
      []
    );

  return {
    loading,

    favouritePairs: pairs,

    favouriteProviders:
      providers,

    loadFavorites,

    addPair,

    removePair,

    addProvider,

    removeProvider,

    clearPairs:
      clearFavouritePairs,

    clearProviders:
      clearFavouriteProviders,
  };
}