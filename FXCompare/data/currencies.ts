export interface Currency {
  code: string;
  name: string;
  flag: string;
}

export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
];