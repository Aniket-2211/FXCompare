// hooks/useRecentSearches.ts

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  clearRecentSearches,
  getRecentSearches,
  RecentSearch,
  removeRecentSearch,
  saveRecentSearch,
} from "../services/recentSearchService";

type AddRecentSearchParams = {
  amount: string;
  fromCurrency: string;
  toCurrency: string;
};

type UseRecentSearchesResult = {
  recentSearches: RecentSearch[];
  loading: boolean;
  saving: boolean;
  error: string | null;

  loadRecentSearches: () => Promise<void>;

  addRecentSearch: (
    search: AddRecentSearchParams
  ) => Promise<void>;

  deleteRecentSearch: (
    id: string
  ) => Promise<void>;

  clearAllRecentSearches: () => Promise<void>;
};

export default function useRecentSearches(): UseRecentSearchesResult {
  const [
    recentSearches,
    setRecentSearches,
  ] = useState<RecentSearch[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const loadRecentSearches =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const searches =
          await getRecentSearches();

        setRecentSearches(
          searches
        );
      } catch (loadError) {
        console.log(
          "Load recent searches error:",
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load recent searches."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadRecentSearches();
  }, [loadRecentSearches]);

  const addRecentSearch =
    useCallback(
      async ({
        amount,
        fromCurrency,
        toCurrency,
      }: AddRecentSearchParams) => {
        try {
          setSaving(true);
          setError(null);

          const updatedSearches =
            await saveRecentSearch(
              amount,
              fromCurrency,
              toCurrency
            );

          setRecentSearches(
            updatedSearches
          );
        } catch (saveError) {
          console.log(
            "Add recent search error:",
            saveError
          );

          setError(
            saveError instanceof Error
              ? saveError.message
              : "Unable to save recent search."
          );
        } finally {
          setSaving(false);
        }
      },
      []
    );

  const deleteRecentSearch =
    useCallback(
      async (id: string) => {
        try {
          setSaving(true);
          setError(null);

          const updatedSearches =
            await removeRecentSearch(
              id
            );

          setRecentSearches(
            updatedSearches
          );
        } catch (deleteError) {
          console.log(
            "Delete recent search error:",
            deleteError
          );

          setError(
            deleteError instanceof Error
              ? deleteError.message
              : "Unable to remove recent search."
          );
        } finally {
          setSaving(false);
        }
      },
      []
    );

  const clearAllRecentSearches =
    useCallback(async () => {
      try {
        setSaving(true);
        setError(null);

        await clearRecentSearches();

        setRecentSearches([]);
      } catch (clearError) {
        console.log(
          "Clear recent searches error:",
          clearError
        );

        setError(
          clearError instanceof Error
            ? clearError.message
            : "Unable to clear recent searches."
        );
      } finally {
        setSaving(false);
      }
    }, []);

  return {
    recentSearches,
    loading,
    saving,
    error,

    loadRecentSearches,
    addRecentSearch,
    deleteRecentSearch,
    clearAllRecentSearches,
  };
}