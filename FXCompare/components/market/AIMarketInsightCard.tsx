import React, {
  useMemo,
} from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import type {
  MarketPair,
} from "../../services/marketsApi";

type Sentiment =
  | "Bullish"
  | "Neutral"
  | "Bearish";

type Props = {
  marketPairs: MarketPair[];
  topGainer: MarketPair | null;
  topLoser: MarketPair | null;
  averageChange: number;
  selectedPair: string;
};

const formatChange = (
  value: number
) => {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return Math.abs(value).toFixed(2);
};

const getSentiment = (
  averageChange: number,
  gainers: number,
  losers: number
): Sentiment => {
  if (
    averageChange > 0.08 ||
    gainers >= losers + 2
  ) {
    return "Bullish";
  }

  if (
    averageChange < -0.08 ||
    losers >= gainers + 2
  ) {
    return "Bearish";
  }

  return "Neutral";
};

const getSentimentIcon = (
  sentiment: Sentiment
): keyof typeof Ionicons.glyphMap => {
  switch (sentiment) {
    case "Bullish":
      return "trending-up";

    case "Bearish":
      return "trending-down";

    case "Neutral":
    default:
      return "remove";
  }
};

const getSentimentColor = (
  sentiment: Sentiment
) => {
  switch (sentiment) {
    case "Bullish":
      return "#2FE58C";

    case "Bearish":
      return "#FF7A7A";

    case "Neutral":
    default:
      return "#FFD65A";
  }
};

export default function AIMarketInsightCard({
  marketPairs,
  topGainer,
  topLoser,
  averageChange,
  selectedPair,
}: Props) {
  const gainersCount =
    useMemo(
      () =>
        marketPairs.filter(
          (item) =>
            item.change > 0
        ).length,
      [marketPairs]
    );

  const losersCount =
    useMemo(
      () =>
        marketPairs.filter(
          (item) =>
            item.change < 0
        ).length,
      [marketPairs]
    );

  const sentiment =
    getSentiment(
      averageChange,
      gainersCount,
      losersCount
    );

  const sentimentColor =
    getSentimentColor(
      sentiment
    );

  const insight =
    useMemo(() => {
      if (
        marketPairs.length === 0
      ) {
        return (
          "Market insight will appear once live currency data is available."
        );
      }

      if (
        sentiment ===
        "Bullish"
      ) {
        return (
          `The current market set is leaning positive, with ${gainersCount} gaining pair${gainersCount === 1 ? "" : "s"} versus ${losersCount} declining. ` +
          `Average movement is +${formatChange(
            averageChange
          )}%.`
        );
      }

      if (
        sentiment ===
        "Bearish"
      ) {
        return (
          `The current market set is leaning negative, with ${losersCount} declining pair${losersCount === 1 ? "" : "s"} versus ${gainersCount} gaining. ` +
          `Average movement is -${formatChange(
            averageChange
          )}%.`
        );
      }

      return (
        `The market is mixed right now. ${gainersCount} pair${gainersCount === 1 ? " is" : "s are"} higher and ${losersCount} pair${losersCount === 1 ? " is" : "s are"} lower, with limited directional bias overall.`
      );
    }, [
      marketPairs.length,
      sentiment,
      gainersCount,
      losersCount,
      averageChange,
    ]);

  const transferSignal =
    useMemo(() => {
      if (
        marketPairs.length === 0
      ) {
        return (
          "Waiting for live data."
        );
      }

      if (
        sentiment ===
        "Bullish"
      ) {
        return (
          `For ${selectedPair}, conditions are currently stronger across the tracked market set. Compare provider payouts before transferring.`
        );
      }

      if (
        sentiment ===
        "Bearish"
      ) {
        return (
          `For ${selectedPair}, the broader tracked market set is softer. If timing is flexible, a rate alert may be useful.`
        );
      }

      return (
        `For ${selectedPair}, conditions are mixed. Provider fees and payout differences may matter more than short-term market direction.`
      );
    }, [
      marketPairs.length,
      sentiment,
      selectedPair,
    ]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View
          style={
            styles.aiIcon
          }
        >
          <Ionicons
            name="sparkles"
            size={22}
            color="#2FE58C"
          />
        </View>

        <View
          style={
            styles.headerText
          }
        >
          <Text
            style={
              styles.eyebrow
            }
          >
            FXCOMPARE AI
          </Text>

          <Text
            style={styles.title}
          >
            Market Insight
          </Text>
        </View>

        <View
          style={[
            styles.sentimentBadge,
            {
              borderColor:
                `${sentimentColor}55`,
              backgroundColor:
                `${sentimentColor}14`,
            },
          ]}
        >
          <Ionicons
            name={
              getSentimentIcon(
                sentiment
              )
            }
            size={14}
            color={
              sentimentColor
            }
          />

          <Text
            style={[
              styles.sentimentText,
              {
                color:
                  sentimentColor,
              },
            ]}
          >
            {sentiment}
          </Text>
        </View>
      </View>

      <Text
        style={styles.insightText}
      >
        {insight}
      </Text>

      <View
        style={
          styles.metricsRow
        }
      >
        <Metric
          icon="trending-up"
          label="Gainers"
          value={`${gainersCount}`}
          color="#2FE58C"
        />

        <View
          style={
            styles.metricDivider
          }
        />

        <Metric
          icon="trending-down"
          label="Losers"
          value={`${losersCount}`}
          color="#FF7A7A"
        />

        <View
          style={
            styles.metricDivider
          }
        />

        <Metric
          icon="analytics-outline"
          label="Average"
          value={`${
            averageChange >= 0
              ? "+"
              : "-"
          }${formatChange(
            averageChange
          )}%`}
          color={
            averageChange >= 0
              ? "#2FE58C"
              : "#FF7A7A"
          }
        />
      </View>

      {topGainer &&
      topLoser ? (
        <View
          style={
            styles.moversBox
          }
        >
          <View
            style={
              styles.moverLine
            }
          >
            <Text
              style={
                styles.moverLabel
              }
            >
              Strongest
            </Text>

            <Text
              style={
                styles.gainerText
              }
            >
              {topGainer.pair} +
              {formatChange(
                topGainer.change
              )}
              %
            </Text>
          </View>

          <View
            style={
              styles.moverLine
            }
          >
            <Text
              style={
                styles.moverLabel
              }
            >
              Weakest
            </Text>

            <Text
              style={
                styles.loserText
              }
            >
              {topLoser.pair} -
              {formatChange(
                topLoser.change
              )}
              %
            </Text>
          </View>
        </View>
      ) : null}

      <View
        style={
          styles.recommendationBox
        }
      >
        <View
          style={
            styles.recommendationIcon
          }
        >
          <Ionicons
            name="navigate-outline"
            size={19}
            color="#64AFFF"
          />
        </View>

        <View
          style={
            styles.recommendationContent
          }
        >
          <Text
            style={
              styles.recommendationLabel
            }
          >
            Transfer signal
          </Text>

          <Text
            style={
              styles.recommendationText
            }
          >
            {transferSignal}
          </Text>
        </View>
      </View>

      <View
        style={styles.notice}
      >
        <Ionicons
          name="information-circle-outline"
          size={15}
          color="#6F8DA2"
        />

        <Text
          style={
            styles.noticeText
          }
        >
          Insight is generated from the live market data currently loaded in FXCompare. It is not a forecast or financial advice.
        </Text>
      </View>
    </View>
  );
}

function Metric({
  icon,
  label,
  value,
  color,
}: {
  icon:
    keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View
      style={styles.metric}
    >
      <Ionicons
        name={icon}
        size={16}
        color={color}
      />

      <Text
        style={
          styles.metricLabel
        }
      >
        {label}
      </Text>

      <Text
        style={[
          styles.metricValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#0E2C43",
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        "rgba(47,229,140,0.28)",
      padding: 16,
      marginBottom: 22,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
    },

    aiIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(47,229,140,0.10)",
      borderWidth: 1,
      borderColor:
        "rgba(47,229,140,0.20)",
    },

    headerText: {
      flex: 1,
      marginLeft: 11,
    },

    eyebrow: {
      color: "#2FE58C",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.8,
    },

    title: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "900",
      marginTop: 3,
    },

    sentimentBadge: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 9,
      paddingVertical: 7,
    },

    sentimentText: {
      fontSize: 9,
      fontWeight: "900",
      marginLeft: 5,
    },

    insightText: {
      color: "#B7C8D4",
      fontSize: 11,
      lineHeight: 18,
      marginTop: 14,
    },

    metricsRow: {
      flexDirection: "row",
      backgroundColor:
        "#16344C",
      borderRadius: 18,
      paddingVertical: 13,
      marginTop: 14,
    },

    metric: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 5,
    },

    metricDivider: {
      width: 1,
      backgroundColor:
        "#295069",
    },

    metricLabel: {
      color: "#829CAF",
      fontSize: 8,
      marginTop: 5,
    },

    metricValue: {
      fontSize: 11,
      fontWeight: "900",
      marginTop: 4,
    },

    moversBox: {
      backgroundColor:
        "#16344C",
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginTop: 12,
    },

    moverLine: {
      minHeight: 34,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    moverLabel: {
      color: "#829CAF",
      fontSize: 9,
      fontWeight: "700",
    },

    gainerText: {
      color: "#2FE58C",
      fontSize: 10,
      fontWeight: "900",
    },

    loserText: {
      color: "#FF7A7A",
      fontSize: 10,
      fontWeight: "900",
    },

    recommendationBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor:
        "rgba(100,175,255,0.07)",
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        "rgba(100,175,255,0.20)",
      padding: 12,
      marginTop: 12,
    },

    recommendationIcon: {
      width: 38,
      height: 38,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(100,175,255,0.10)",
    },

    recommendationContent: {
      flex: 1,
      marginLeft: 10,
    },

    recommendationLabel: {
      color: "#64AFFF",
      fontSize: 9,
      fontWeight: "900",
      textTransform:
        "uppercase",
      letterSpacing: 0.5,
    },

    recommendationText: {
      color: "#AFC1CD",
      fontSize: 10,
      lineHeight: 16,
      marginTop: 4,
    },

    notice: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 11,
    },

    noticeText: {
      flex: 1,
      color: "#6F8DA2",
      fontSize: 8,
      lineHeight: 13,
      marginLeft: 6,
    },
  });