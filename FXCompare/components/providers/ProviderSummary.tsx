import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Ionicons,
} from "@expo/vector-icons";

const formatNumber = (
  value: number,
  maximumFractionDigits = 2
) => {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits,
    }
  ).format(value);
};

type Props = {
  rate: number;
  fee: number;
  finalAmount: number;
};

export default function ProviderSummary({
  rate,
  fee,
  finalAmount,
}: Props) {
  return (
    <>
      <View style={styles.summaryCard}>
        <View
          style={styles.summaryItem}
        >
          <Text
            style={styles.summaryLabel}
          >
            Exchange Rate
          </Text>

          <Text
            style={styles.summaryValue}
          >
            {formatNumber(rate, 4)}
          </Text>
        </View>

        <View
          style={
            styles.verticalDivider
          }
        />

        <View
          style={styles.summaryItem}
        >
          <Text
            style={styles.summaryLabel}
          >
            Estimated Fee
          </Text>

          <Text
            style={styles.summaryValue}
          >
            {formatNumber(fee)}
          </Text>
        </View>
      </View>

      <View style={styles.receiveCard}>
        <View>
          <Text
            style={styles.receiveLabel}
          >
            Estimated Amount Received
          </Text>

          <Text
            style={
              styles.receiveAmount
            }
          >
            {formatNumber(
              finalAmount
            )}
          </Text>
        </View>

        <View style={styles.checkIcon}>
          <Ionicons
            name="checkmark"
            size={24}
            color="#071521"
          />
        </View>
      </View>
    </>
  );
}

const styles =
  StyleSheet.create({
    summaryCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#0E2C43",
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "#194661",
      padding: 16,
      marginTop: 16,
    },

    summaryItem: {
      flex: 1,
      alignItems: "center",
    },

    summaryLabel: {
      color: "#829CAF",
      fontSize: 11,
    },

    summaryValue: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "900",
      marginTop: 6,
    },

    verticalDivider: {
      width: 1,
      height: 42,
      backgroundColor:
        "#295069",
    },

    receiveCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "rgba(47,229,140,0.10)",
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "rgba(47,229,140,0.35)",
      padding: 17,
      marginTop: 14,
      marginBottom: 24,
    },

    receiveLabel: {
      color: "#A5BEAF",
      fontSize: 12,
    },

    receiveAmount: {
      color: "#2FE58C",
      fontSize: 28,
      fontWeight: "900",
      marginTop: 5,
    },

    checkIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#2FE58C",
    },
  });