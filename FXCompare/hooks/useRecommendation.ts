// hooks/useRecommendation.ts

import { useMemo } from "react";

import {
  getBestProvider,
  rankProviders,
  RecommendationProvider,
} from "../services/recommendationEngine";

type Props = {
  providers: RecommendationProvider[];
};

export default function useRecommendation({
  providers,
}: Props) {
  const rankedProviders = useMemo(() => {
    return rankProviders(providers);
  }, [providers]);

  const bestProvider = useMemo(() => {
    return getBestProvider(providers);
  }, [providers]);

  return {
    bestProvider,
    rankedProviders,
    hasRecommendation:
      bestProvider !== null,
  };
}