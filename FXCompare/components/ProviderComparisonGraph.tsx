// components/ProviderComparisonGraph.tsx

import React, {
  useMemo,
} from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ComparisonGraphProvider = {
  name: string;
  finalAmount: number;
  fee: number;
  rate: number;
  recommended?: boolean;
};

type Props = {
  providers?: ComparisonGraphProvider[];
  currency: string;
};

const providerIcons: Record<
  string,
  keyof typeof Ionicons.glyphMap
> = {
  Wise: "flash-outline",
  Remitly: "send-outline",
  PayPal: "wallet-outline",
  Revolut: "card-outline",
  OFX: "business-outline",
};

const formatAmount = (
  value: number
) => {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
};

export default function ProviderComparisonGraph({
  providers = [],
  currency,
}: Props) {
  const rankedProviders =
    useMemo(() => {
      return [...providers]
        .filter(
          (provider) =>
            Number.isFinite(
              provider.finalAmount
            )
        )
        .sort(
          (
            first,
            second
          ) =>
            second.finalAmount -
            first.finalAmount
        );
    }, [providers]);

  const highestPayout =
    rankedProviders[0]
      ?.finalAmount ?? 0;

  const lowestPayout =
    rankedProviders.length > 0
      ? rankedProviders[
          rankedProviders.length - 1
        ].finalAmount
      : 0;

  const payoutRange =
    Math.max(
      highestPayout -
        lowestPayout,
      1
    );

  const bestVsWorst =
    Math.max(
      highestPayout -
        lowestPayout,
      0
    );

  const averagePayout =
    rankedProviders.length > 0
      ? rankedProviders.reduce(
          (
            total,
            provider
          ) =>
            total +
            provider.finalAmount,
          0
        ) /
        rankedProviders.length
      : 0;

  if (
    rankedProviders.length === 0
  ) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              Provider Payout Comparison
            </Text>

            <Text style={styles.subtitle}>
              Visualise estimated provider
              payouts
            </Text>
          </View>

          <View
            style={
              styles.headerIcon
            }
          >
            <Ionicons
              name="bar-chart-outline"
              size={22}
              color="#64AFFF"
            />
          </View>
        </View>

        <View style={styles.emptyCard}>
          <View
            style={
              styles.emptyIconBox
            }
          >
            <Ionicons
              name="analytics-outline"
              size={37}
              color="#67869C"
            />
          </View>

          <Text
            style={
              styles.emptyTitle
            }
          >
            No payout data
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            Refresh the provider comparison
            to generate the payout graph.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            PAYOUT ANALYSIS
          </Text>

          <Text style={styles.title}>
            Provider Comparison
          </Text>

          <Text style={styles.subtitle}>
            Compare estimated recipient
            amounts visually
          </Text>
        </View>

        <View
          style={
            styles.headerIcon
          }
        >
          <Ionicons
            name="bar-chart-outline"
            size={22}
            color="#64AFFF"
          />
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text
            style={
              styles.summaryLabel
            }
          >
            Providers
          </Text>

          <Text
            style={
              styles.summaryValue
            }
          >
            {
              rankedProviders.length
            }
          </Text>
        </View>

        <View
          style={
            styles.summaryDivider
          }
        />

        <View style={styles.summaryItem}>
          <Text
            style={
              styles.summaryLabel
            }
          >
            Average Payout
          </Text>

          <Text
            style={
              styles.summaryValueSmall
            }
          >
            {formatAmount(
              averagePayout
            )}
          </Text>

          <Text
            style={
              styles.summaryCurrency
            }
          >
            {currency}
          </Text>
        </View>

        <View
          style={
            styles.summaryDivider
          }
        />

        <View style={styles.summaryItem}>
          <Text
            style={
              styles.summaryLabel
            }
          >
            Best Difference
          </Text>

          <Text
            style={
              styles.summarySaving
            }
          >
            +
            {formatAmount(
              bestVsWorst
            )}
          </Text>

          <Text
            style={
              styles.summaryCurrency
            }
          >
            {currency}
          </Text>
        </View>
      </View>

      <View style={styles.graphCard}>
        {rankedProviders.map(
          (
            provider,
            index
          ) => {
            const isBest =
              index === 0;

            const icon =
              providerIcons[
                provider.name
              ] ??
              "business-outline";

            const relativeValue =
              rankedProviders.length ===
              1
                ? 100
                : 58 +
                  ((provider.finalAmount -
                    lowestPayout) /
                    payoutRange) *
                    42;

            const differenceFromBest =
              Math.max(
                highestPayout -
                  provider.finalAmount,
                0
              );

            return (
              <View
                key={provider.name}
                style={[
                  styles.providerItem,
                  index !==
                    rankedProviders.length -
                      1 &&
                    styles.providerDivider,
                ]}
              >
                <View
                  style={
                    styles.providerHeader
                  }
                >
                  <View
                    style={
                      styles.providerIdentity
                    }
                  >
                    <View
                      style={[
                        styles.rankBox,
                        isBest &&
                          styles.bestRankBox,
                      ]}
                    >
                      <Text
                        style={[
                          styles.rankText,
                          isBest &&
                            styles.bestRankText,
                        ]}
                      >
                        #{index + 1}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.providerIcon,
                        isBest &&
                          styles.bestProviderIcon,
                      ]}
                    >
                      <Ionicons
                        name={icon}
                        size={19}
                        color={
                          isBest
                            ? "#2FE58C"
                            : "#64AFFF"
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.providerText
                      }
                    >
                      <View
                        style={
                          styles.providerNameRow
                        }
                      >
                        <Text
                          style={
                            styles.providerName
                          }
                        >
                          {
                            provider.name
                          }
                        </Text>

                        {isBest ? (
                          <View
                            style={
                              styles.bestBadge
                            }
                          >
                            <Ionicons
                              name="trophy"
                              size={10}
                              color="#062014"
                            />

                            <Text
                              style={
                                styles.bestBadgeText
                              }
                            >
                              BEST
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Text
                        style={
                          styles.providerCaption
                        }
                      >
                        {isBest
                          ? "Highest estimated payout"
                          : `${formatAmount(
                              differenceFromBest
                            )} ${currency} below best`}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.amountBox
                    }
                  >
                    <Text
                      style={[
                        styles.amount,
                        isBest &&
                          styles.bestAmount,
                      ]}
                    >
                      {formatAmount(
                        provider.finalAmount
                      )}
                    </Text>

                    <Text
                      style={
                        styles.amountCurrency
                      }
                    >
                      {currency}
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.barTrack
                  }
                >
                  <View
                    style={[
                      styles.barFill,
                      isBest &&
                        styles.bestBarFill,
                      {
                        width: `${Math.min(
                          Math.max(
                            relativeValue,
                            12
                          ),
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>

                <View
                  style={
                    styles.metricsRow
                  }
                >
                  <View
                    style={
                      styles.metricItem
                    }
                  >
                    <Ionicons
                      name="trending-up-outline"
                      size={13}
                      color="#64AFFF"
                    />

                    <Text
                      style={
                        styles.metricLabel
                      }
                    >
                      Rate
                    </Text>

                    <Text
                      style={
                        styles.metricValue
                      }
                    >
                      {provider.rate.toFixed(
                        4
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.metricItem
                    }
                  >
                    <Ionicons
                      name="pricetag-outline"
                      size={13}
                      color="#FFD65A"
                    />

                    <Text
                      style={
                        styles.metricLabel
                      }
                    >
                      Fee
                    </Text>

                    <Text
                      style={
                        styles.metricValue
                      }
                    >
                      {formatAmount(
                        provider.fee
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.metricItem
                    }
                  >
                    <Ionicons
                      name={
                        isBest
                          ? "checkmark-circle"
                          : "remove-circle-outline"
                      }
                      size={13}
                      color={
                        isBest
                          ? "#2FE58C"
                          : "#829CAF"
                      }
                    />

                    <Text
                      style={
                        styles.metricLabel
                      }
                    >
                      Position
                    </Text>

                    <Text
                      style={[
                        styles.metricValue,
                        isBest &&
                          styles.bestMetricValue,
                      ]}
                    >
                      {isBest
                        ? "Best"
                        : `#${index + 1}`}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }
        )}
      </View>

      <View style={styles.insightCard}>
        <View
          style={
            styles.insightIcon
          }
        >
          <Ionicons
            name="bulb-outline"
            size={21}
            color="#FFD65A"
          />
        </View>

        <View
          style={
            styles.insightContent
          }
        >
          <Text
            style={
              styles.insightTitle
            }
          >
            Payout Insight
          </Text>

          <Text
            style={
              styles.insightText
            }
          >
            {
              rankedProviders[0]
                .name
            }{" "}
            currently delivers the highest
            estimated payout, offering{" "}
            {formatAmount(
              bestVsWorst
            )}{" "}
            {currency} more than{" "}
            {
              rankedProviders[
                rankedProviders.length -
                  1
              ].name
            }
            .
          </Text>
        </View>
      </View>

      <View style={styles.notice}>
        <Ionicons
          name="information-circle-outline"
          size={17}
          color="#64AFFF"
        />

        <Text style={styles.noticeText}>
          Bar lengths are scaled to highlight
          provider payout differences. Values
          remain estimated until confirmed
          directly with each provider.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0E2C43",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 17,
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    color: "#64AFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 5,
  },

  subtitle: {
    color: "#829CAF",
    fontSize: 10,
    marginTop: 4,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(100,175,255,0.11)",
    borderWidth: 1,
    borderColor:
      "rgba(100,175,255,0.22)",
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#16344C",
    borderRadius: 17,
    paddingVertical: 13,
    marginBottom: 13,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 5,
  },

  summaryDivider: {
    width: 1,
    backgroundColor: "#295069",
  },

  summaryLabel: {
    color: "#829CAF",
    fontSize: 8,
    textAlign: "center",
  },

  summaryValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 5,
  },

  summaryValueSmall: {
    color: "#64AFFF",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 5,
    textAlign: "center",
  },

  summarySaving: {
    color: "#2FE58C",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 5,
    textAlign: "center",
  },

  summaryCurrency: {
    color: "#728DA1",
    fontSize: 7,
    fontWeight: "700",
    marginTop: 2,
  },

  graphCard: {
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingHorizontal: 13,
  },

  providerItem: {
    paddingVertical: 14,
  },

  providerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#295069",
  },

  providerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  providerIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  rankBox: {
    minWidth: 34,
    height: 29,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#29495E",
    marginRight: 8,
  },

  bestRankBox: {
    backgroundColor: "#2FE58C",
  },

  rankText: {
    color: "#A8BDCC",
    fontSize: 9,
    fontWeight: "900",
  },

  bestRankText: {
    color: "#062014",
  },

  providerIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B425A",
    marginRight: 9,
  },

  bestProviderIcon: {
    backgroundColor:
      "rgba(47,229,140,0.12)",
    borderWidth: 1,
    borderColor:
      "rgba(47,229,140,0.28)",
  },

  providerText: {
    flex: 1,
  },

  providerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  providerName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    marginRight: 6,
  },

  bestBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2FE58C",
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  bestBadgeText: {
    color: "#062014",
    fontSize: 7,
    fontWeight: "900",
    marginLeft: 3,
  },

  providerCaption: {
    color: "#728DA1",
    fontSize: 8,
    marginTop: 4,
  },

  amountBox: {
    alignItems: "flex-end",
  },

  amount: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  bestAmount: {
    color: "#2FE58C",
  },

  amountCurrency: {
    color: "#829CAF",
    fontSize: 8,
    marginTop: 2,
  },

  barTrack: {
    height: 9,
    borderRadius: 5,
    backgroundColor: "#29495E",
    overflow: "hidden",
    marginTop: 11,
  },

  barFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#64AFFF",
  },

  bestBarFill: {
    backgroundColor: "#2FE58C",
  },

  metricsRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  metricItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 5,
  },

  metricLabel: {
    color: "#728DA1",
    fontSize: 7,
    marginLeft: 4,
  },

  metricValue: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
    marginLeft: 3,
  },

  bestMetricValue: {
    color: "#2FE58C",
  },

  insightCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor:
      "rgba(255,214,90,0.06)",
    borderRadius: 17,
    borderWidth: 1,
    borderColor:
      "rgba(255,214,90,0.18)",
    padding: 13,
    marginTop: 13,
  },

  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,214,90,0.1)",
  },

  insightContent: {
    flex: 1,
    marginLeft: 10,
  },

  insightTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  insightText: {
    color: "#9FB6C9",
    fontSize: 9,
    lineHeight: 15,
    marginTop: 4,
  },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor:
      "rgba(100,175,255,0.06)",
    borderRadius: 15,
    padding: 12,
    marginTop: 12,
  },

  noticeText: {
    flex: 1,
    color: "#829CAF",
    fontSize: 9,
    lineHeight: 15,
    marginLeft: 7,
  },

  emptyCard: {
    minHeight: 175,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingHorizontal: 25,
  },

  emptyIconBox: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B425A",
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12,
  },

  emptyText: {
    color: "#829CAF",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 6,
  },
});