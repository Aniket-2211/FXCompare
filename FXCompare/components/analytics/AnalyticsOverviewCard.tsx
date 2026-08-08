import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import type {
  HistoricalAnalytics,
} from "../../services/analyticsService";

import {
  formatAnalyticsPercent,
  formatAnalyticsRate,
} from "../../services/analyticsService";

type Props = {
  fromCurrency: string;
  toCurrency: string;
  analytics: HistoricalAnalytics;
};

const getSentimentColor = (
  sentiment:
    HistoricalAnalytics["sentiment"]
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

const getSentimentIcon = (
  sentiment:
    HistoricalAnalytics["sentiment"]
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

const getVolatilityColor = (
  volatility:
    HistoricalAnalytics["volatility"]
) => {
  switch (volatility) {
    case "Low":
      return "#2FE58C";

    case "Moderate":
      return "#FFD65A";

    case "High":
    default:
      return "#FF7A7A";
  }
};

export default function AnalyticsOverviewCard({
  fromCurrency,
  toCurrency,
  analytics,
}: Props) {
  const sentimentColor =
    getSentimentColor(
      analytics.sentiment
    );

  const volatilityColor =
    getVolatilityColor(
      analytics.volatility
    );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons
            name="analytics-outline"
            size={22}
            color="#64AFFF"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            MARKET ANALYTICS
          </Text>

          <Text style={styles.title}>
            {fromCurrency} / {toCurrency}
          </Text>
        </View>

        <View
          style={[
            styles.sentimentBadge,
            {
              backgroundColor:
                `${sentimentColor}14`,
              borderColor:
                `${sentimentColor}44`,
            },
          ]}
        >
          <Ionicons
            name={
              getSentimentIcon(
                analytics.sentiment
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
            {analytics.sentiment}
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <Stat
          label="High"
          value={
            formatAnalyticsRate(
              analytics.high
            )
          }
          icon="arrow-up-outline"
          color="#2FE58C"
        />

        <Stat
          label="Low"
          value={
            formatAnalyticsRate(
              analytics.low
            )
          }
          icon="arrow-down-outline"
          color="#FF8296"
        />

        <Stat
          label="Average"
          value={
            formatAnalyticsRate(
              analytics.average
            )
          }
          icon="remove-outline"
          color="#64AFFF"
        />

        <Stat
          label="Change"
          value={
            formatAnalyticsPercent(
              analytics.changePercent
            )
          }
          icon={
            analytics.changePercent >= 0
              ? "trending-up"
              : "trending-down"
          }
          color={
            analytics.changePercent >= 0
              ? "#2FE58C"
              : "#FF7A7A"
          }
        />
      </View>

      <View style={styles.healthRow}>
        <View style={styles.healthItem}>
          <Text style={styles.healthLabel}>
            Volatility
          </Text>

          <Text
            style={[
              styles.healthValue,
              {
                color:
                  volatilityColor,
              },
            ]}
          >
            {analytics.volatility}
          </Text>
        </View>

        <View style={styles.healthDivider} />

        <View style={styles.healthItem}>
          <Text style={styles.healthLabel}>
            Volatility %
          </Text>

          <Text
            style={[
              styles.healthValue,
              {
                color:
                  volatilityColor,
              },
            ]}
          >
            {analytics.volatilityPercent.toFixed(
              2
            )}
            %
          </Text>
        </View>

        <View style={styles.healthDivider} />

        <View style={styles.healthItem}>
          <Text style={styles.healthLabel}>
            Data Points
          </Text>

          <Text style={styles.healthValue}>
            {analytics.dataPoints}
          </Text>
        </View>
      </View>

      <View style={styles.insightBox}>
        <View style={styles.insightIcon}>
          <Ionicons
            name="bulb-outline"
            size={19}
            color="#FFD65A"
          />
        </View>

        <Text style={styles.insightText}>
          {analytics.dataPoints === 0
            ? "Historical analytics will appear once rate data is available."
            : analytics.sentiment === "Bullish"
              ? `The pair is trading above its starting level for this range, with ${analytics.volatility.toLowerCase()} volatility.`
              : analytics.sentiment === "Bearish"
                ? `The pair is trading below its starting level for this range, with ${analytics.volatility.toLowerCase()} volatility.`
                : `The pair is relatively stable across this range, with ${analytics.volatility.toLowerCase()} volatility.`}
        </Text>
      </View>
    </View>
  );
}

function Stat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon:
    keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={styles.stat}>
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor:
              `${color}14`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={color}
        />
      </View>

      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.statValue,
          {
            color,
          },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0E2C43",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 16,
    marginBottom: 22,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(100,175,255,0.10)",
    borderWidth: 1,
    borderColor:
      "rgba(100,175,255,0.18)",
  },

  headerText: {
    flex: 1,
    marginLeft: 10,
  },

  eyebrow: {
    color: "#64AFFF",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 17,
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
    marginLeft: 4,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
    marginTop: 15,
  },

  stat: {
    width: "47%",
    minHeight: 94,
    backgroundColor: "#16344C",
    borderRadius: 17,
    padding: 12,
    marginHorizontal: 5,
    marginBottom: 10,
  },

  statIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  statLabel: {
    color: "#829CAF",
    fontSize: 9,
    marginTop: 8,
  },

  statValue: {
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },

  healthRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 17,
    paddingVertical: 12,
    marginTop: 3,
  },

  healthItem: {
    flex: 1,
    alignItems: "center",
  },

  healthDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#295069",
  },

  healthLabel: {
    color: "#829CAF",
    fontSize: 8,
  },

  healthValue: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 4,
  },

  insightBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor:
      "rgba(255,214,90,0.06)",
    borderRadius: 17,
    borderWidth: 1,
    borderColor:
      "rgba(255,214,90,0.18)",
    padding: 12,
    marginTop: 12,
  },

  insightIcon: {
    width: 37,
    height: 37,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,214,90,0.10)",
  },

  insightText: {
    flex: 1,
    color: "#AFC1CD",
    fontSize: 10,
    lineHeight: 16,
    marginLeft: 9,
  },
});