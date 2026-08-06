// components/CompareSummaryCard.tsx

import React, {
  useMemo,
} from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type SummaryProvider = {
  name: string;
  finalAmount: number;
  recommended?: boolean;
};

type Props = {
  amount: string;
  fromCurrency: string;
  toCurrency: string;
  bestProvider: string;
  savings: number;
  deliveryTime: string;
  providers?: SummaryProvider[];
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

const parseAmount = (
  value: string
) => {
  const parsedValue = Number(
    value.replace(/,/g, "")
  );

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : 0;
};

export default function CompareSummaryCard({
  amount,
  fromCurrency,
  toCurrency,
  bestProvider,
  savings,
  deliveryTime,
  providers = [],
}: Props) {
  const parsedAmount =
    parseAmount(amount);

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

  const bestVsWorstSavings =
    rankedProviders.length > 1
      ? Math.max(
          highestPayout -
            lowestPayout,
          0
        )
      : savings;

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

  return (
    <View style={styles.card}>
      <View
        style={
          styles.backgroundGlow
        }
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            COMPARISON OVERVIEW
          </Text>

          <Text style={styles.title}>
            Transfer Summary
          </Text>

          <Text style={styles.subtitle}>
            Estimated provider results for
            your transfer
          </Text>
        </View>

        <View style={styles.badge}>
          <Ionicons
            name="trophy"
            size={14}
            color="#062014"
          />

          <Text style={styles.badgeText}>
            BEST
          </Text>
        </View>
      </View>

      <View
        style={
          styles.transferRouteCard
        }
      >
        <View style={styles.routeItem}>
          <Text
            style={
              styles.routeLabel
            }
          >
            You Send
          </Text>

          <Text
            style={
              styles.routeAmount
            }
          >
            {formatAmount(
              parsedAmount
            )}
          </Text>

          <Text
            style={
              styles.routeCurrency
            }
          >
            {fromCurrency}
          </Text>
        </View>

        <View
          style={
            styles.routeArrow
          }
        >
          <Ionicons
            name="arrow-forward"
            size={20}
            color="#64AFFF"
          />
        </View>

        <View
          style={[
            styles.routeItem,
            styles.receivingRouteItem,
          ]}
        >
          <Text
            style={
              styles.routeLabel
            }
          >
            Recipient Currency
          </Text>

          <View
            style={
              styles.receivingCurrencyBox
            }
          >
            <Ionicons
              name="cash-outline"
              size={18}
              color="#2FE58C"
            />

            <Text
              style={
                styles.receivingCurrency
              }
            >
              {toCurrency}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={
          styles.recommendedCard
        }
      >
        <View
          style={
            styles.recommendedIcon
          }
        >
          <Ionicons
            name="trophy"
            size={24}
            color="#2FE58C"
          />
        </View>

        <View
          style={
            styles.recommendedContent
          }
        >
          <Text
            style={
              styles.recommendedLabel
            }
          >
            Recommended Provider
          </Text>

          <Text
            style={
              styles.recommendedProvider
            }
          >
            {bestProvider}
          </Text>

          <View
            style={
              styles.deliveryRow
            }
          >
            <Ionicons
              name="time-outline"
              size={14}
              color="#829CAF"
            />

            <Text
              style={
                styles.deliveryText
              }
            >
              Estimated arrival{" "}
              {deliveryTime}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.verifiedIcon
          }
        >
          <Ionicons
            name="checkmark"
            size={21}
            color="#071521"
          />
        </View>
      </View>

      {rankedProviders.length > 0 ? (
        <>
          <View
            style={
              styles.chartHeader
            }
          >
            <View>
              <Text
                style={
                  styles.chartTitle
                }
              >
                Provider Payouts
              </Text>

              <Text
                style={
                  styles.chartSubtitle
                }
              >
                Estimated amount received
              </Text>
            </View>

            <View
              style={
                styles.providerCount
              }
            >
              <Text
                style={
                  styles.providerCountText
                }
              >
                {
                  rankedProviders.length
                }
              </Text>
            </View>
          </View>

          <View
            style={styles.chartCard}
          >
            {rankedProviders.map(
              (
                provider,
                index
              ) => {
                const payoutPercentage =
                  highestPayout > 0
                    ? Math.max(
                        (
                          provider.finalAmount /
                          highestPayout
                        ) * 100,
                        8
                      )
                    : 0;

                const isBest =
                  index === 0;

                const differenceFromBest =
                  Math.max(
                    highestPayout -
                      provider.finalAmount,
                    0
                  );

                return (
                  <View
                    key={
                      provider.name
                    }
                    style={[
                      styles.providerRow,
                      index !==
                        rankedProviders.length -
                          1 &&
                        styles.providerRowDivider,
                    ]}
                  >
                    <View
                      style={
                        styles.providerRowHeader
                      }
                    >
                      <View
                        style={
                          styles.providerIdentity
                        }
                      >
                        <View
                          style={[
                            styles.rankBadge,
                            isBest &&
                              styles.bestRankBadge,
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

                        <View>
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
                                  styles.bestValueBadge
                                }
                              >
                                <Ionicons
                                  name="trophy"
                                  size={10}
                                  color="#2FE58C"
                                />

                                <Text
                                  style={
                                    styles.bestValueText
                                  }
                                >
                                  BEST
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          <Text
                            style={
                              styles.payoutDifference
                            }
                          >
                            {isBest
                              ? "Highest estimated payout"
                              : `${formatAmount(
                                  differenceFromBest
                                )} ${toCurrency} below best`}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.payoutValueBox
                        }
                      >
                        <Text
                          style={[
                            styles.payoutValue,
                            isBest &&
                              styles.bestPayoutValue,
                          ]}
                        >
                          {formatAmount(
                            provider.finalAmount
                          )}
                        </Text>

                        <Text
                          style={
                            styles.payoutCurrency
                          }
                        >
                          {toCurrency}
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
                          styles.barProgress,
                          isBest &&
                            styles.bestBarProgress,
                          {
                            width: `${payoutPercentage}%`,
                          },
                        ]}
                      />
                    </View>

                    <View
                      style={
                        styles.percentageRow
                      }
                    >
                      <Text
                        style={
                          styles.percentageLabel
                        }
                      >
                        Relative payout
                      </Text>

                      <Text
                        style={[
                          styles.percentageValue,
                          isBest &&
                            styles.bestPercentageValue,
                        ]}
                      >
                        {payoutPercentage.toFixed(
                          1
                        )}
                        %
                      </Text>
                    </View>
                  </View>
                );
              }
            )}
          </View>
        </>
      ) : (
        <View
          style={
            styles.noChartCard
          }
        >
          <Ionicons
            name="bar-chart-outline"
            size={31}
            color="#67869C"
          />

          <Text
            style={
              styles.noChartTitle
            }
          >
            Payout chart unavailable
          </Text>

          <Text
            style={
              styles.noChartText
            }
          >
            Refresh the comparison to
            generate provider payout data.
          </Text>
        </View>
      )}

      <View
        style={
          styles.insightsRow
        }
      >
        <View
          style={
            styles.insightCard
          }
        >
          <View
            style={[
              styles.insightIcon,
              styles.savingsIcon,
            ]}
          >
            <Ionicons
              name="wallet-outline"
              size={19}
              color="#2FE58C"
            />
          </View>

          <Text
            style={
              styles.insightLabel
            }
          >
            Best vs Worst
          </Text>

          <Text
            style={
              styles.savingsValue
            }
          >
            {formatAmount(
              bestVsWorstSavings
            )}
          </Text>

          <Text
            style={
              styles.insightCurrency
            }
          >
            {toCurrency} more
          </Text>
        </View>

        <View
          style={
            styles.insightCard
          }
        >
          <View
            style={[
              styles.insightIcon,
              styles.averageIcon,
            ]}
          >
            <Ionicons
              name="analytics-outline"
              size={19}
              color="#64AFFF"
            />
          </View>

          <Text
            style={
              styles.insightLabel
            }
          >
            Average Payout
          </Text>

          <Text
            style={
              styles.averageValue
            }
          >
            {averagePayout > 0
              ? formatAmount(
                  averagePayout
                )
              : "--"}
          </Text>

          <Text
            style={
              styles.insightCurrency
            }
          >
            {toCurrency}
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
          Payout bars compare estimated
          provider results. The highest
          payout is displayed as 100%.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    backgroundColor: "#0E2C43",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 17,
    marginBottom: 20,
    overflow: "hidden",
  },

  backgroundGlow: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    top: -120,
    right: -95,
    backgroundColor:
      "rgba(47,229,140,0.06)",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  eyebrow: {
    color: "#2FE58C",
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

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2FE58C",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  badgeText: {
    color: "#062014",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginLeft: 5,
  },

  transferRouteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 18,
    padding: 14,
  },

  routeItem: {
    flex: 1,
  },

  receivingRouteItem: {
    alignItems: "flex-end",
  },

  routeLabel: {
    color: "#829CAF",
    fontSize: 9,
    fontWeight: "600",
  },

  routeAmount: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 5,
  },

  routeCurrency: {
    color: "#64AFFF",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },

  routeArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C435B",
    marginHorizontal: 8,
  },

  receivingCurrencyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(47,229,140,0.1)",
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginTop: 6,
  },

  receivingCurrency: {
    color: "#2FE58C",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 6,
  },

  recommendedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(47,229,140,0.08)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      "rgba(47,229,140,0.23)",
    padding: 14,
    marginTop: 12,
  },

  recommendedIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(47,229,140,0.12)",
  },

  recommendedContent: {
    flex: 1,
    marginLeft: 11,
  },

  recommendedLabel: {
    color: "#A5BEAF",
    fontSize: 9,
    fontWeight: "600",
  },

  recommendedProvider: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },

  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  deliveryText: {
    color: "#829CAF",
    fontSize: 9,
    marginLeft: 5,
  },

  verifiedIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2FE58C",
  },

  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 12,
  },

  chartTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  chartSubtitle: {
    color: "#829CAF",
    fontSize: 10,
    marginTop: 3,
  },

  providerCount: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
    borderWidth: 1,
    borderColor: "#21516E",
  },

  providerCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  chartCard: {
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingHorizontal: 13,
  },

  providerRow: {
    paddingVertical: 14,
  },

  providerRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#295069",
  },

  providerRowHeader: {
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

  rankBadge: {
    minWidth: 34,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#29495E",
    marginRight: 9,
  },

  bestRankBadge: {
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

  providerNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  providerName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  bestValueBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(47,229,140,0.1)",
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginLeft: 7,
  },

  bestValueText: {
    color: "#2FE58C",
    fontSize: 7,
    fontWeight: "900",
    marginLeft: 3,
  },

  payoutDifference: {
    color: "#728DA1",
    fontSize: 8,
    marginTop: 3,
  },

  payoutValueBox: {
    alignItems: "flex-end",
  },

  payoutValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  bestPayoutValue: {
    color: "#2FE58C",
  },

  payoutCurrency: {
    color: "#829CAF",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 2,
  },

  barTrack: {
    height: 8,
    backgroundColor: "#29495E",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 11,
  },

  barProgress: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#64AFFF",
  },

  bestBarProgress: {
    backgroundColor: "#2FE58C",
  },

  percentageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },

  percentageLabel: {
    color: "#6F8DA2",
    fontSize: 8,
  },

  percentageValue: {
    color: "#64AFFF",
    fontSize: 9,
    fontWeight: "900",
  },

  bestPercentageValue: {
    color: "#2FE58C",
  },

  noChartCard: {
    minHeight: 145,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingHorizontal: 24,
    marginTop: 20,
  },

  noChartTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10,
  },

  noChartText: {
    color: "#829CAF",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 5,
  },

  insightsRow: {
    flexDirection: "row",
    marginHorizontal: -5,
    marginTop: 13,
  },

  insightCard: {
    flex: 1,
    backgroundColor: "#16344C",
    borderRadius: 17,
    padding: 13,
    marginHorizontal: 5,
  },

  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  savingsIcon: {
    backgroundColor:
      "rgba(47,229,140,0.11)",
  },

  averageIcon: {
    backgroundColor:
      "rgba(100,175,255,0.11)",
  },

  insightLabel: {
    color: "#829CAF",
    fontSize: 8,
    fontWeight: "600",
    marginTop: 9,
  },

  savingsValue: {
    color: "#2FE58C",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },

  averageValue: {
    color: "#64AFFF",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },

  insightCurrency: {
    color: "#728DA1",
    fontSize: 8,
    marginTop: 3,
  },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor:
      "rgba(100,175,255,0.07)",
    borderRadius: 15,
    padding: 12,
    marginTop: 13,
  },

  noticeText: {
    flex: 1,
    color: "#829CAF",
    fontSize: 9,
    lineHeight: 15,
    marginLeft: 7,
  },
});