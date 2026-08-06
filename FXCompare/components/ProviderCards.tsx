// components/ProviderCards.tsx

import React, {
  useMemo,
} from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type Provider = {
  name: string;
  rate: number;
  fee: number;
  finalAmount: number;
  recommended?: boolean;
};

export type ProviderDetails = Provider & {
  deliveryTime: string;
  rating: number;
  paymentMethods: string[];
};

type Props = {
  providers?: Provider[];

  onProviderPress?: (
    provider: ProviderDetails
  ) => void;

  onViewAllPress?: () => void;
};

type ProviderMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  eta: string;
  label: string;
  rating: number;
  paymentMethods: string[];
};

const providerMeta: Record<
  string,
  ProviderMeta
> = {
  Wise: {
    icon: "flash-outline",
    eta: "8–12 mins",
    label:
      "Transparent rates and fast international transfers",
    rating: 4.7,
    paymentMethods: [
      "Bank Transfer",
      "Debit Card",
      "Credit Card",
    ],
  },

  Remitly: {
    icon: "send-outline",
    eta: "10–20 mins",
    label:
      "Express transfers with multiple delivery options",
    rating: 4.5,
    paymentMethods: [
      "Bank Transfer",
      "Debit Card",
      "Cash Pickup",
    ],
  },

  PayPal: {
    icon: "wallet-outline",
    eta: "Instant–1 day",
    label:
      "Digital wallet and global payment transfers",
    rating: 4.2,
    paymentMethods: [
      "PayPal Balance",
      "Debit Card",
      "Credit Card",
    ],
  },

  Revolut: {
    icon: "card-outline",
    eta: "Instant",
    label:
      "Multi-currency account and digital transfers",
    rating: 4.4,
    paymentMethods: [
      "Bank Transfer",
      "Debit Card",
      "Wallet",
    ],
  },

  OFX: {
    icon: "business-outline",
    eta: "1–2 days",
    label:
      "International bank transfers for larger amounts",
    rating: 4.3,
    paymentMethods: [
      "Bank Transfer",
    ],
  },
};

const fallbackMeta: ProviderMeta = {
  icon: "business-outline",
  eta: "Varies",
  label:
    "International money transfer provider",
  rating: 4,
  paymentMethods: [
    "Bank Transfer",
  ],
};

const formatAmount = (
  value: number
) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
};

const formatRate = (
  value: number
) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }
  ).format(value);
};

export default function ProviderCards({
  providers = [],
  onProviderPress,
  onViewAllPress,
}: Props) {
  const sortedProviders =
    useMemo(() => {
      return [
        ...providers,
      ].sort(
        (
          first,
          second
        ) =>
          second.finalAmount -
          first.finalAmount
      );
    }, [providers]);

  const bestProvider =
    sortedProviders[0] ??
    null;

  const secondBestProvider =
    sortedProviders[1] ??
    null;

  const savingsAgainstNext =
    bestProvider &&
    secondBestProvider
      ? Math.max(
          bestProvider.finalAmount -
            secondBestProvider.finalAmount,
          0
        )
      : 0;

  if (!bestProvider) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.title}>
              Best Provider
            </Text>

            <Text style={styles.subtitle}>
              Your recommended transfer option
            </Text>
          </View>
        </View>

        <View style={styles.emptyCard}>
          <View style={styles.emptyIconBox}>
            <Ionicons
              name="trophy-outline"
              size={34}
              color="#6F8BA0"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No recommendation yet
          </Text>

          <Text style={styles.emptyText}>
            Enter an amount and refresh the
            exchange rate to calculate the
            best estimated provider.
          </Text>
        </View>
      </View>
    );
  }

  const meta =
    providerMeta[
      bestProvider.name
    ] ?? fallbackMeta;

  const providerDetails:
    ProviderDetails = {
    ...bestProvider,

    deliveryTime:
      meta.eta,

    rating:
      meta.rating,

    paymentMethods:
      meta.paymentMethods,
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleBox}>
          <Text style={styles.title}>
            Best Provider
          </Text>

          <Text style={styles.subtitle}>
            Recommended for this transfer
          </Text>
        </View>

        {onViewAllPress ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.compareAllButton}
            onPress={onViewAllPress}
          >
            <Text style={styles.compareAllText}>
              Compare All
            </Text>

            <Ionicons
              name="arrow-forward"
              size={15}
              color="#64AFFF"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.bestBadge}>
            <Ionicons
              name="trophy"
              size={13}
              color="#062014"
            />

            <Text style={styles.bestBadgeText}>
              BEST
            </Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.highlightGlow} />

        <View style={styles.cardHeader}>
          <View style={styles.providerIdentity}>
            <View style={styles.logoBox}>
              <Ionicons
                name={meta.icon}
                size={29}
                color="#2FE58C"
              />
            </View>

            <View style={styles.providerTextBox}>
              <View style={styles.providerNameRow}>
                <Text style={styles.providerName}>
                  {bestProvider.name}
                </Text>

                <View style={styles.recommendedChip}>
                  <Ionicons
                    name="sparkles"
                    size={11}
                    color="#2FE58C"
                  />

                  <Text
                    style={
                      styles.recommendedText
                    }
                  >
                    RECOMMENDED
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.providerDescription
                }
                numberOfLines={2}
              >
                {meta.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <View style={styles.statIconBox}>
              <Ionicons
                name="trending-up-outline"
                size={17}
                color="#64AFFF"
              />
            </View>

            <View>
              <Text style={styles.statLabel}>
                Exchange Rate
              </Text>

              <Text style={styles.statValue}>
                {formatRate(
                  bestProvider.rate
                )}
              </Text>
            </View>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.quickStat}>
            <View style={styles.statIconBox}>
              <Ionicons
                name="time-outline"
                size={17}
                color="#64AFFF"
              />
            </View>

            <View>
              <Text style={styles.statLabel}>
                Arrival
              </Text>

              <Text style={styles.statValue}>
                {meta.eta}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.receiveCard}>
          <View style={styles.receiveTextBox}>
            <Text style={styles.receiveLabel}>
              Estimated Amount Received
            </Text>

            <Text style={styles.receiveAmount}>
              ₹
              {formatAmount(
                bestProvider.finalAmount
              )}
            </Text>

            <Text style={styles.feeText}>
              Estimated fee ₹
              {formatAmount(
                bestProvider.fee
              )}
            </Text>
          </View>

          <View style={styles.receiveIcon}>
            <Ionicons
              name="checkmark"
              size={23}
              color="#071521"
            />
          </View>
        </View>

        {savingsAgainstNext > 0 ? (
          <View style={styles.savingsCard}>
            <View style={styles.savingsIcon}>
              <Ionicons
                name="wallet-outline"
                size={19}
                color="#2FE58C"
              />
            </View>

            <View style={styles.savingsContent}>
              <Text style={styles.savingsTitle}>
                Better estimated value
              </Text>

              <Text
                style={
                  styles.savingsDescription
                }
              >
                Estimated to deliver ₹
                {formatAmount(
                  savingsAgainstNext
                )}{" "}
                more than the next provider.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.secureRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#2FE58C"
            />

            <View>
              <Text style={styles.secureTitle}>
                Secure transfer
              </Text>

              <Text
                style={
                  styles.secureSubtitle
                }
              >
                Estimated comparison
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.detailsButton}
            onPress={() =>
              onProviderPress?.(
                providerDetails
              )
            }
          >
            <Text
              style={
                styles.detailsButtonText
              }
            >
              View Details
            </Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.disclaimerRow}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color="#728DA1"
        />

        <Text style={styles.disclaimerText}>
          This is a quick recommendation. Open
          Compare to review every provider,
          fee, rate and estimated payout.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 2,
  },

  sectionTitleBox: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },

  subtitle: {
    color: "#829CAF",
    fontSize: 12,
    marginTop: 4,
  },

  compareAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(100,175,255,0.10)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      "rgba(100,175,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  compareAllText: {
    color: "#64AFFF",
    fontSize: 11,
    fontWeight: "800",
    marginRight: 5,
  },

  bestBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2FE58C",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  bestBadgeText: {
    color: "#062014",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginLeft: 5,
  },

  card: {
    position: "relative",
    backgroundColor: "#0E3045",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#2A9D78",
    padding: 18,
    overflow: "hidden",
  },

  highlightGlow: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    top: -95,
    right: -70,
    backgroundColor:
      "rgba(47,229,140,0.07)",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  providerIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(47,229,140,0.10)",
    borderWidth: 1,
    borderColor:
      "rgba(47,229,140,0.30)",
  },

  providerTextBox: {
    flex: 1,
    marginLeft: 13,
  },

  providerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  providerName: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    marginRight: 8,
  },

  recommendedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(47,229,140,0.11)",
    borderRadius: 11,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  recommendedText: {
    color: "#2FE58C",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.4,
    marginLeft: 4,
  },

  providerDescription: {
    color: "#92ABBC",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },

  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#163A50",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 18,
  },

  quickStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A465F",
    marginRight: 8,
  },

  statLabel: {
    color: "#829CAF",
    fontSize: 9,
    fontWeight: "600",
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },

  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#2A526A",
    marginHorizontal: 10,
  },

  receiveCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor:
      "rgba(47,229,140,0.09)",
    borderRadius: 19,
    borderWidth: 1,
    borderColor:
      "rgba(47,229,140,0.24)",
    padding: 15,
    marginTop: 14,
  },

  receiveTextBox: {
    flex: 1,
    paddingRight: 12,
  },

  receiveLabel: {
    color: "#A5BEAF",
    fontSize: 11,
    fontWeight: "600",
  },

  receiveAmount: {
    color: "#2FE58C",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 5,
    letterSpacing: -0.4,
  },

  feeText: {
    color: "#819B8C",
    fontSize: 10,
    marginTop: 5,
  },

  receiveIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2FE58C",
  },

  savingsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#163A50",
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
  },

  savingsIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(47,229,140,0.10)",
  },

  savingsContent: {
    flex: 1,
    marginLeft: 10,
  },

  savingsTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  savingsDescription: {
    color: "#8EA7BA",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 17,
  },

  secureRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  secureTitle: {
    color: "#B4C8D4",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 7,
  },

  secureSubtitle: {
    color: "#6F8DA2",
    fontSize: 9,
    marginLeft: 7,
    marginTop: 2,
  },

  detailsButton: {
    minWidth: 118,
    height: 44,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1687E8",
    paddingHorizontal: 13,
  },

  detailsButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginRight: 7,
  },

  disclaimerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 4,
    marginTop: 10,
    marginBottom: 18,
  },

  disclaimerText: {
    flex: 1,
    color: "#728DA1",
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 7,
  },

  emptyCard: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E2C43",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#194661",
    paddingHorizontal: 28,
    marginBottom: 18,
  },

  emptyIconBox: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 14,
  },

  emptyText: {
    color: "#829CAF",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },
});