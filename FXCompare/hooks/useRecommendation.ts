import { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";

export type RecommendationProvider = {
  name: string;
  rate: number;
  fee: number;
  finalAmount: number;
  deliveryTime: string;
  rating: number;
  reliabilityScore?: number;
};

export type RecommendationReason = {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export type RankedRecommendationProvider =
  RecommendationProvider & {
    rank: number;
    score: number;
    confidence: number;
    savings: number;
    reasons: RecommendationReason[];
    breakdown: {
      payout: number;
      fee: number;
      speed: number;
      rating: number;
      reliability: number;
    };
  };

type UseRecommendationParams = {
  providers: RecommendationProvider[];
};

type UseRecommendationResult = {
  bestProvider:
    | RankedRecommendationProvider
    | null;
  rankedProviders:
    RankedRecommendationProvider[];
  hasRecommendation: boolean;
};

const clamp = (
  value: number,
  min = 0,
  max = 100
) =>
  Math.min(
    max,
    Math.max(min, value)
  );

const normalizeHigherIsBetter = (
  value: number,
  minimum: number,
  maximum: number
) => {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(minimum) ||
    !Number.isFinite(maximum)
  ) {
    return 0;
  }

  if (maximum === minimum) {
    return 100;
  }

  return clamp(
    ((value - minimum) /
      (maximum - minimum)) *
      100
  );
};

const normalizeLowerIsBetter = (
  value: number,
  minimum: number,
  maximum: number
) => {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(minimum) ||
    !Number.isFinite(maximum)
  ) {
    return 0;
  }

  if (maximum === minimum) {
    return 100;
  }

  return clamp(
    ((maximum - value) /
      (maximum - minimum)) *
      100
  );
};

const getDeliveryMinutes = (
  deliveryTime: string
) => {
  const value =
    deliveryTime
      .trim()
      .toLowerCase();

  if (!value) {
    return 9999;
  }

  if (
    value.includes("instant")
  ) {
    return 1;
  }

  const numbers =
    value.match(
      /\d+(?:\.\d+)?/g
    );

  if (
    !numbers ||
    numbers.length === 0
  ) {
    return 9999;
  }

  const numericValues =
    numbers
      .map(Number)
      .filter(
        Number.isFinite
      );

  if (
    numericValues.length === 0
  ) {
    return 9999;
  }

  // For a range such as
  // "10–20 mins", use the
  // midpoint.
  const average =
    numericValues.reduce(
      (sum, number) =>
        sum + number,
      0
    ) /
    numericValues.length;

  if (
    value.includes("day")
  ) {
    return average * 1440;
  }

  if (
    value.includes("hour") ||
    value.includes("hr")
  ) {
    return average * 60;
  }

  return average;
};

const getSafeReliability = (
  provider: RecommendationProvider
) => {
  if (
    typeof provider.reliabilityScore ===
      "number" &&
    Number.isFinite(
      provider.reliabilityScore
    )
  ) {
    return clamp(
      provider.reliabilityScore
    );
  }

  if (
    Number.isFinite(
      provider.rating
    )
  ) {
    return clamp(
      provider.rating * 20
    );
  }

  return 50;
};

const roundScore = (
  value: number
) =>
  Math.round(
    clamp(value)
  );

const getConfidence = (
  firstScore: number,
  secondScore: number | undefined,
  providerCount: number
) => {
  if (
    providerCount <= 1 ||
    secondScore === undefined
  ) {
    return 80;
  }

  const gap =
    Math.max(
      firstScore -
        secondScore,
      0
    );

  // A small gap means the result is
  // competitive, while a large gap
  // produces higher confidence.
  return roundScore(
    72 +
      Math.min(
        gap * 2.2,
        24
      )
  );
};

const buildReasons = ({
  provider,
  payoutScore,
  feeScore,
  speedScore,
  ratingScore,
  reliabilityScore,
  highestFinalAmount,
  lowestFee,
  fastestMinutes,
  highestRating,
}: {
  provider: RecommendationProvider;
  payoutScore: number;
  feeScore: number;
  speedScore: number;
  ratingScore: number;
  reliabilityScore: number;
  highestFinalAmount: number;
  lowestFee: number;
  fastestMinutes: number;
  highestRating: number;
}): RecommendationReason[] => {
  const reasons:
    RecommendationReason[] = [];

  const providerMinutes =
    getDeliveryMinutes(
      provider.deliveryTime
    );

  const nearlyEqual = (
    first: number,
    second: number
  ) =>
    Math.abs(
      first - second
    ) <=
    Math.max(
      Math.abs(second) *
        0.00001,
      0.00001
    );

  if (
    nearlyEqual(
      provider.finalAmount,
      highestFinalAmount
    )
  ) {
    reasons.push({
      id: "best-payout",
      label:
        "Highest estimated payout",
      icon: "wallet-outline",
    });
  }

  if (
    nearlyEqual(
      provider.fee,
      lowestFee
    )
  ) {
    reasons.push({
      id: "lowest-fee",
      label:
        "Lowest estimated fee",
      icon: "pricetag-outline",
    });
  }

  if (
    providerMinutes ===
      fastestMinutes
  ) {
    reasons.push({
      id: "fastest",
      label:
        "Fastest estimated delivery",
      icon: "flash-outline",
    });
  }

  if (
    nearlyEqual(
      provider.rating,
      highestRating
    )
  ) {
    reasons.push({
      id: "top-rated",
      label:
        "Highest provider rating",
      icon: "star-outline",
    });
  }

  if (
    reliabilityScore >= 90
  ) {
    reasons.push({
      id: "reliable",
      label:
        "Strong reliability score",
      icon:
        "shield-checkmark-outline",
    });
  }

  if (
    reasons.length === 0
  ) {
    const strengths = [
      {
        id: "payout",
        value: payoutScore,
        label:
          "Competitive estimated payout",
        icon:
          "wallet-outline" as const,
      },
      {
        id: "fee",
        value: feeScore,
        label:
          "Competitive fee",
        icon:
          "pricetag-outline" as const,
      },
      {
        id: "speed",
        value: speedScore,
        label:
          "Competitive delivery speed",
        icon:
          "flash-outline" as const,
      },
      {
        id: "rating",
        value: ratingScore,
        label:
          "Strong user rating",
        icon:
          "star-outline" as const,
      },
    ].sort(
      (first, second) =>
        second.value -
        first.value
    );

    reasons.push(
      strengths[0]
    );
  }

  return reasons.slice(0, 3);
};

export default function useRecommendation({
  providers,
}: UseRecommendationParams): UseRecommendationResult {
  const rankedProviders =
    useMemo<
      RankedRecommendationProvider[]
    >(() => {
      const validProviders =
        providers.filter(
          (provider) =>
            provider &&
            typeof provider.name ===
              "string" &&
            provider.name.trim()
              .length > 0 &&
            Number.isFinite(
              provider.finalAmount
            ) &&
            Number.isFinite(
              provider.fee
            ) &&
            Number.isFinite(
              provider.rating
            )
        );

      if (
        validProviders.length === 0
      ) {
        return [];
      }

      const finalAmounts =
        validProviders.map(
          (provider) =>
            provider.finalAmount
        );

      const fees =
        validProviders.map(
          (provider) =>
            Math.max(
              provider.fee,
              0
            )
        );

      const deliveryMinutes =
        validProviders.map(
          (provider) =>
            getDeliveryMinutes(
              provider.deliveryTime
            )
        );

      const ratings =
        validProviders.map(
          (provider) =>
            provider.rating
        );

      const reliabilityScores =
        validProviders.map(
          getSafeReliability
        );

      const minPayout =
        Math.min(
          ...finalAmounts
        );

      const maxPayout =
        Math.max(
          ...finalAmounts
        );

      const minFee =
        Math.min(...fees);

      const maxFee =
        Math.max(...fees);

      const minSpeed =
        Math.min(
          ...deliveryMinutes
        );

      const maxSpeed =
        Math.max(
          ...deliveryMinutes
        );

      const minRating =
        Math.min(
          ...ratings
        );

      const maxRating =
        Math.max(
          ...ratings
        );

      const minReliability =
        Math.min(
          ...reliabilityScores
        );

      const maxReliability =
        Math.max(
          ...reliabilityScores
        );

      /*
       * SMART RECOMMENDATION WEIGHTS
       *
       * Payout       40%
       * Fee          20%
       * Speed        15%
       * Rating       15%
       * Reliability  10%
       *
       * Payout receives the greatest
       * weight because the user's final
       * received amount is the core
       * outcome of a transfer.
       */
      const scored =
        validProviders.map(
          (provider) => {
            const payoutScore =
              normalizeHigherIsBetter(
                provider.finalAmount,
                minPayout,
                maxPayout
              );

            const feeScore =
              normalizeLowerIsBetter(
                Math.max(
                  provider.fee,
                  0
                ),
                minFee,
                maxFee
              );

            const speedScore =
              normalizeLowerIsBetter(
                getDeliveryMinutes(
                  provider.deliveryTime
                ),
                minSpeed,
                maxSpeed
              );

            const ratingScore =
              normalizeHigherIsBetter(
                provider.rating,
                minRating,
                maxRating
              );

            const reliabilityScore =
              normalizeHigherIsBetter(
                getSafeReliability(
                  provider
                ),
                minReliability,
                maxReliability
              );

            const score =
              payoutScore * 0.4 +
              feeScore * 0.2 +
              speedScore * 0.15 +
              ratingScore * 0.15 +
              reliabilityScore *
                0.1;

            return {
              ...provider,

              score:
                roundScore(score),

              savings:
                Math.max(
                  provider.finalAmount -
                    minPayout,
                  0
                ),

              reasons:
                buildReasons({
                  provider,
                  payoutScore,
                  feeScore,
                  speedScore,
                  ratingScore,
                  reliabilityScore:
                    getSafeReliability(
                      provider
                    ),
                  highestFinalAmount:
                    maxPayout,
                  lowestFee:
                    minFee,
                  fastestMinutes:
                    minSpeed,
                  highestRating:
                    maxRating,
                }),

              breakdown: {
                payout:
                  roundScore(
                    payoutScore
                  ),
                fee:
                  roundScore(
                    feeScore
                  ),
                speed:
                  roundScore(
                    speedScore
                  ),
                rating:
                  roundScore(
                    ratingScore
                  ),
                reliability:
                  roundScore(
                    reliabilityScore
                  ),
              },
            };
          }
        );

      scored.sort(
        (first, second) =>
          second.score -
            first.score ||
          second.finalAmount -
            first.finalAmount ||
          first.fee -
            second.fee
      );

      const confidence =
        getConfidence(
          scored[0]?.score ?? 0,
          scored[1]?.score,
          scored.length
        );

      return scored.map(
        (
          provider,
          index
        ) => ({
          ...provider,
          rank: index + 1,
          confidence:
            index === 0
              ? confidence
              : roundScore(
                  Math.max(
                    55,
                    confidence -
                      index * 7
                  )
                ),
        })
      );
    }, [providers]);

  return {
    bestProvider:
      rankedProviders[0] ??
      null,

    rankedProviders,

    hasRecommendation:
      rankedProviders.length > 0,
  };
}