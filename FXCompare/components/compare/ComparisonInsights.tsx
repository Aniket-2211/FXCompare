import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  bestProviderName: string;
  lowestFeeProviderName: string;
  fastestProviderName: string;
  topRatedProviderName: string;
  bestVsWorstSavings: number;
  currency: string;
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

export default function ComparisonInsights({
  bestProviderName,
  lowestFeeProviderName,
  fastestProviderName,
  topRatedProviderName,
  bestVsWorstSavings,
  currency,
}: Props) {
  return (
    <View style={styles.insightsCard}>
      <View style={styles.insightsHeader}>
        <View style={styles.insightsIcon}>
          <Ionicons
            name="analytics"
            size={22}
            color="#64AFFF"
          />
        </View>

        <View
          style={styles.insightsHeaderText}
        >
          <Text style={styles.insightsTitle}>
            Comparison Insights
          </Text>

          <Text
            style={styles.insightsSubtitle}
          >
            Highlights from the current results
          </Text>
        </View>
      </View>

      <View style={styles.insightGrid}>
        <InsightItem
          icon="trophy-outline"
          label="Best Value"
          value={bestProviderName}
          color="#2FE58C"
        />

        <InsightItem
          icon="pricetag-outline"
          label="Lowest Fee"
          value={lowestFeeProviderName}
          color="#64AFFF"
        />

        <InsightItem
          icon="flash-outline"
          label="Fastest"
          value={fastestProviderName}
          color="#FFD65A"
        />

        <InsightItem
          icon="star-outline"
          label="Top Rated"
          value={topRatedProviderName}
          color="#FFB86B"
        />
      </View>

      <View style={styles.savingsHighlight}>
        <View style={styles.savingsIcon}>
          <Ionicons
            name="wallet-outline"
            size={22}
            color="#2FE58C"
          />
        </View>

        <View style={styles.savingsTextBox}>
          <Text style={styles.savingsLabel}>
            Best versus lowest payout
          </Text>

          <Text style={styles.savingsAmount}>
            {formatAmount(
              bestVsWorstSavings
            )}{" "}
            {currency} more
          </Text>
        </View>

        <Ionicons
          name="trending-up"
          size={24}
          color="#2FE58C"
        />
      </View>
    </View>
  );
}

type InsightItemProps = {
  icon:
    keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
};

function InsightItem({
  icon,
  label,
  value,
  color,
}: InsightItemProps) {
  return (
    <View style={styles.insightItem}>
      <View style={styles.insightIconBox}>
        <Ionicons
          name={icon}
          size={18}
          color={color}
        />
      </View>

      <Text style={styles.insightLabel}>
        {label}
      </Text>

      <Text
        style={styles.insightValue}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  insightsCard: {
    backgroundColor: "#0E2C43",
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 16,
    marginBottom: 22,
  },

  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  insightsIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(100,175,255,0.12)",
  },

  insightsHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  insightsTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  insightsSubtitle: {
    color: "#829CAF",
    fontSize: 11,
    marginTop: 4,
  },

  insightGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
    marginTop: 15,
  },

  insightItem: {
    width: "47%",
    minHeight: 105,
    backgroundColor: "#16344C",
    borderRadius: 17,
    padding: 13,
    marginHorizontal: 5,
    marginBottom: 10,
  },

  insightIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C435B",
  },

  insightLabel: {
    color: "#829CAF",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 9,
  },

  insightValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },

  savingsHighlight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(47,229,140,0.09)",
    borderRadius: 17,
    borderWidth: 1,
    borderColor:
      "rgba(47,229,140,0.23)",
    padding: 13,
    marginTop: 3,
  },

  savingsIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(47,229,140,0.12)",
  },

  savingsTextBox: {
    flex: 1,
    marginLeft: 11,
  },

  savingsLabel: {
    color: "#A5BEAF",
    fontSize: 10,
    fontWeight: "600",
  },

  savingsAmount: {
    color: "#2FE58C",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 4,
  },
});