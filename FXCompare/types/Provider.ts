export interface Provider {
  id: string;
  name: string;
  logo?: string;

  exchangeRate: number;

  transferFee: number;

  receiveAmount: number;

  deliveryTime: string;

  rating: number;

  recommended: boolean;
}