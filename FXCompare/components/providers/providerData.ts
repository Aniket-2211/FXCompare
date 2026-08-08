export type ProviderInformation = {
  description: string;
  trustScore: string;
  supportedCountries: string;
  minimumTransfer: string;
  maximumTransfer: string;
  pros: string[];
  cons: string[];
};

export const providerInformation: Record<
  string,
  ProviderInformation
> = {
  Wise: {
    description:
      "Wise is known for transparent fees and exchange rates that closely follow the market reference rate.",
    trustScore: "Excellent",
    supportedCountries: "160+ countries",
    minimumTransfer: "Varies by currency",
    maximumTransfer:
      "Varies by payment method",
    pros: [
      "Transparent fee structure",
      "Competitive exchange rates",
      "Clear transfer tracking",
    ],
    cons: [
      "Delivery speed can vary",
      "Some payment methods cost more",
    ],
  },

  Remitly: {
    description:
      "Remitly provides international transfers with express and economy delivery options.",
    trustScore: "Very Good",
    supportedCountries: "170+ countries",
    minimumTransfer: "Varies by route",
    maximumTransfer:
      "Depends on verification",
    pros: [
      "Express delivery available",
      "Cash pickup supported",
      "Easy transfer tracking",
    ],
    cons: [
      "Promotional rates may expire",
      "Fees vary by delivery method",
    ],
  },

  PayPal: {
    description:
      "PayPal supports wallet-based international payments and transfers across a large global network.",
    trustScore: "Very Good",
    supportedCountries: "200+ markets",
    minimumTransfer: "Varies by country",
    maximumTransfer:
      "Depends on account status",
    pros: [
      "Familiar digital wallet",
      "Fast wallet transfers",
      "Broad global availability",
    ],
    cons: [
      "Currency conversion markup",
      "Fees can be higher",
    ],
  },

  Revolut: {
    description:
      "Revolut offers app-based international transfers, multi-currency balances and digital payment services.",
    trustScore: "Very Good",
    supportedCountries:
      "Available markets vary",
    minimumTransfer:
      "Varies by currency",
    maximumTransfer:
      "Depends on account verification",
    pros: [
      "Multi-currency account",
      "Fast app experience",
      "Competitive weekday rates",
    ],
    cons: [
      "Weekend markups may apply",
      "Availability varies by country",
    ],
  },

  OFX: {
    description:
      "OFX focuses on international bank transfers and larger-value currency transactions.",
    trustScore: "Very Good",
    supportedCountries: "190+ countries",
    minimumTransfer:
      "Minimum may apply by route",
    maximumTransfer:
      "Large transfers supported",
    pros: [
      "Suitable for larger transfers",
      "Specialist currency service",
      "Phone support available",
    ],
    cons: [
      "Not designed for instant payments",
      "Minimum transfer may apply",
    ],
  },
};

export const fallbackInformation:
  ProviderInformation = {
    description:
      "Review the estimated rate, fee and transfer details before continuing with this provider.",
    trustScore: "Verified",
    supportedCountries: "Varies",
    minimumTransfer: "Varies",
    maximumTransfer: "Varies",
    pros: [
      "International transfer service",
      "Multiple payment options",
    ],
    cons: [
      "Final quote may differ",
    ],
  };