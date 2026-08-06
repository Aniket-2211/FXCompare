// services/recommendationEngine.ts

import {
  RecommendationReason,
} from "../components/RecommendationCard";

export type RecommendationProvider = {
  name: string;
  rate: number;
  fee: number;
  finalAmount: number;
  deliveryTime: string;
  rating: number;
  reliabilityScore?: number;
};

export type RankedProvider = RecommendationProvider & {
  score: number;
  savings: number;
  reasons: RecommendationReason[];
  rank: number;
};

const clamp = (
  value: number,
  minimum: number,
  maximum: number
) => {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
};

const normalizeHigherIsBetter = (
  value: number,
  minimum: number,
  maximum: number
) => {
  if (maximum === minimum) {
    return 1;
  }

  return clamp(
    (value - minimum) /
      (maximum - minimum),
    0,
    1
  );
};

const normalizeLowerIsBetter = (
  value: number,
  minimum: number,
  maximum: number
) => {
  if (maximum === minimum) {
    return 1;
  }

  return 1 -
    normalizeHigherIsBetter(
      value,
      minimum,
      maximum
    );
};

const parseDeliveryMinutes = (
  deliveryTime: string
) => {
  const normalized =
    deliveryTime
      .trim()
      .toLowerCase();

  const numberMatch =
    normalized.match(
      /(\d+(?:\.\d+)?)/
    );

  const numericValue =
    numberMatch
      ? Number(numberMatch[1])
      : 24;

  if (
    normalized.includes("minute")
  ) {
    return numericValue;
  }

  if (
    normalized.includes("hour")
  ) {
    return numericValue * 60;
  }

  if (
    normalized.includes("day")
  ) {
    return numericValue * 1440;
  }

  if (
    normalized.includes("instant")
  ) {
    return 5;
  }

  if (
    normalized.includes("same day")
  ) {
    return 720;
  }

  return 1440;
};

const buildReasons = (
  provider: RecommendationProvider,
  context: {
    highestFinalAmount: number;
    lowestFee: number;
    fastestMinutes: number;
    highestRating: number;
  }
): RecommendationReason[] => {
  const reasons:
    RecommendationReason[] = [];

  if (
    provider.finalAmount ===
    context.highestFinalAmount
  ) {
    reasons.push({
      id: "highest-payout",
      label:
        "Highest estimated amount received",
      icon: "wallet-outline",
    });
  }

  if (
    provider.fee ===
    context.lowestFee
  ) {
    reasons.push({
      id: "lowest-fee",
      label:
        "Lowest estimated provider fee",
      icon: "pricetag-outline",
    });
  }

  if (
    parseDeliveryMinutes(
      provider.deliveryTime
    ) === context.fastestMinutes
  ) {
    reasons.push({
      id: "fastest-transfer",
      label:
        "Fastest estimated transfer time",
      icon: "flash-outline",
    });
  }

  if (
    provider.rating ===
    context.highestRating
  ) {
    reasons.push({
      id: "highest-rating",
      label:
        "Highest provider rating",
      icon: "star-outline",
    });
  }

  if (reasons.length === 0) {
    reasons.push({
      id: "balanced-value",
      label:
        "Strong balance of payout, fees, speed and reliability",
      icon: "analytics-outline",
    });
  }

  return reasons.slice(0, 4);
};

export function rankProviders(
  providers: RecommendationProvider[]
): RankedProvider[] {
  const validProviders =
    providers.filter(
      (provider) =>
        provider.name.trim().length >
          0 &&
        Number.isFinite(
          provider.rate
        ) &&
        Number.isFinite(
          provider.fee
        ) &&
        Number.isFinite(
          provider.finalAmount
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
        provider.fee
    );

  const ratings =
    validProviders.map(
      (provider) =>
        provider.rating
    );

  const reliabilityScores =
    validProviders.map(
      (provider) =>
        provider
          .reliabilityScore ??
        provider.rating * 20
    );

  const deliveryMinutes =
    validProviders.map(
      (provider) =>
        parseDeliveryMinutes(
          provider.deliveryTime
        )
    );

  const minimumFinalAmount =
    Math.min(...finalAmounts);

  const maximumFinalAmount =
    Math.max(...finalAmounts);

  const minimumFee =
    Math.min(...fees);

  const maximumFee =
    Math.max(...fees);

  const minimumRating =
    Math.min(...ratings);

  const maximumRating =
    Math.max(...ratings);

  const minimumReliability =
    Math.min(
      ...reliabilityScores
    );

  const maximumReliability =
    Math.max(
      ...reliabilityScores
    );

  const fastestMinutes =
    Math.min(...deliveryMinutes);

  const slowestMinutes =
    Math.max(...deliveryMinutes);

  const sortedFinalAmounts = [
    ...finalAmounts,
  ].sort(
    (first, second) =>
      second - first
  );

  const secondBestAmount =
    sortedFinalAmounts[1] ??
    sortedFinalAmounts[0];

  const ranked =
    validProviders.map(
      (provider) => {
        const delivery =
          parseDeliveryMinutes(
            provider.deliveryTime
          );

        const reliability =
          provider
            .reliabilityScore ??
          provider.rating * 20;

        const payoutScore =
          normalizeHigherIsBetter(
            provider.finalAmount,
            minimumFinalAmount,
            maximumFinalAmount
          );

        const feeScore =
          normalizeLowerIsBetter(
            provider.fee,
            minimumFee,
            maximumFee
          );

        const speedScore =
          normalizeLowerIsBetter(
            delivery,
            fastestMinutes,
            slowestMinutes
          );

        const ratingScore =
          normalizeHigherIsBetter(
            provider.rating,
            minimumRating,
            maximumRating
          );

        const reliabilityScore =
          normalizeHigherIsBetter(
            reliability,
            minimumReliability,
            maximumReliability
          );

        const finalScore =
          payoutScore * 40 +
          feeScore * 25 +
          speedScore * 15 +
          ratingScore * 10 +
          reliabilityScore * 10;

        const reasons =
          buildReasons(provider, {
            highestFinalAmount:
              maximumFinalAmount,
            lowestFee:
              minimumFee,
            fastestMinutes,
            highestRating:
              maximumRating,
          });

        return {
          ...provider,
          score: Math.round(
            clamp(
              finalScore,
              0,
              100
            )
          ),
          savings:
            provider.finalAmount ===
            maximumFinalAmount
              ? Math.max(
                  provider.finalAmount -
                    secondBestAmount,
                  0
                )
              : 0,
          reasons,
          rank: 0,
        };
      }
    );

  return ranked
    .sort(
      (first, second) =>
        second.score -
          first.score ||
        second.finalAmount -
          first.finalAmount ||
        first.fee -
          second.fee
    )
    .map(
      (
        provider,
        index
      ) => ({
        ...provider,
        rank: index + 1,
      })
    );
}

export function getBestProvider(
  providers: RecommendationProvider[]
): RankedProvider | null {
  const ranked =
    rankProviders(providers);

  return ranked[0] ?? null;
}