import { providerConfig } from "../data/providers";
import { Provider } from "../types/Provider";

export function calculateProviders(
  amount: number,
  liveRate: number
): Provider[] {

  const providers: Provider[] = providerConfig.map((provider) => {

    const providerRate =
      liveRate * (1 - provider.margin);

    const receive =
      amount * providerRate - provider.fee;

    return {
      id: provider.id,

      name: provider.name,

      exchangeRate: Number(providerRate.toFixed(4)),

      transferFee: provider.fee,

      receiveAmount: Number(receive.toFixed(2)),

      deliveryTime: provider.delivery,

      rating: provider.rating,

      recommended: false,
    };

  });

  providers.sort(
    (a, b) => b.receiveAmount - a.receiveAmount
  );

  if (providers.length > 0) {
    providers[0].recommended = true;
  }

  return providers;
}