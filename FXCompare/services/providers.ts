export type Provider = {
  id: string;
  name: string;
  logo?: string;

  transferFee: number;
  exchangeRate: number;

  deliveryTime: string;

  rating: number;

  recommended?: boolean;
};

export const providers: Provider[] = [
  {
    id: "wise",
    name: "Wise",
    transferFee: 3.99,
    exchangeRate: 87.42,
    deliveryTime: "Within minutes",
    rating: 4.9,
    recommended: true,
  },

  {
    id: "remitly",
    name: "Remitly",
    transferFee: 4.99,
    exchangeRate: 87.00,
    deliveryTime: "1–2 Hours",
    rating: 4.8,
  },

  {
    id: "western-union",
    name: "Western Union",
    transferFee: 6.49,
    exchangeRate: 86.84,
    deliveryTime: "Same Day",
    rating: 4.5,
  },

  {
    id: "ofx",
    name: "OFX",
    transferFee: 5.25,
    exchangeRate: 87.18,
    deliveryTime: "Same Day",
    rating: 4.7,
  },

  {
    id: "xe",
    name: "Xe",
    transferFee: 5.10,
    exchangeRate: 87.15,
    deliveryTime: "Within Hours",
    rating: 4.6,
  },

  {
    id: "revolut",
    name: "Revolut",
    transferFee: 2.99,
    exchangeRate: 87.30,
    deliveryTime: "Instant",
    rating: 4.8,
  },
];

export function calculateReceivedAmount(
  amount: number,
  rate: number,
  fee: number
) {
  return (amount - fee) * rate;
}

export function rankProviders(amount: number) {
  return providers
    .map((provider) => ({
      ...provider,
      receivedAmount: calculateReceivedAmount(
        amount,
        provider.exchangeRate,
        provider.transferFee
      ),
    }))
    .sort((a, b) => b.receivedAmount - a.receivedAmount);
}