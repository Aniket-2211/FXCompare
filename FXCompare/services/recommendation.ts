import { ProviderResult } from "./providerEngine";

export type Recommendation = {
  provider: ProviderResult;
  savings: number;
  message: string;
};

export function getRecommendation(
  providers: ProviderResult[]
): Recommendation | null {

  if (providers.length === 0) {
    return null;
  }

  const best = providers[0];
  const second = providers[1];

  const savings = second
    ? best.receivedAmount - second.receivedAmount
    : 0;

  return {
    provider: best,
    savings,

    message: second
      ? `${best.name} is currently estimated to deliver approximately ₹${savings.toFixed(
          2
        )} more than ${second.name} after estimated fees.`
      : `${best.name} is currently the only available provider.`,
  };
}