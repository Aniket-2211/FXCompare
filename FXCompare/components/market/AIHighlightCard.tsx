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

type Props = {
  pairs: MarketPair[];
};

export default function AIHighlightCard({
  pairs,
}: Props) {
  const strongest =
    useMemo(
      () =>
        pairs.length > 0
          ? [
              ...pairs,
            ].sort(
              (
                first,
                second
              ) =>
                second.change -
                first.change
            )[0]
          : null,
      [pairs]
    );

  if (!strongest) {
    return null;
  }

  const confidence =
    Math.min(
      96,
      Math.max(
        70,
        Math.round(
          74 +
            Math.abs(
              strongest.change
            ) *
              18
        )
      )
    );

  const positive =
    strongest.change >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View
          style={styles.icon}
        >
          <Ionicons
            name="sparkles"
            size={21}
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
            Market Highlight
          </Text>
        </View>

        <View
          style={
            styles.confidenceBadge
          }
        >
          <Text
            style={
              styles.confidenceValue
            }
          >
            {confidence}%
          </Text>

          <Text
            style={
              styles.confidenceLabel
            }
          >
            confidence
          </Text>
        </View>
      </View>

      <View
        style={
          styles.highlightBox
        }
      >
        <Text
          style={styles.flag}
        >
          {strongest.flag}
        </Text>

        <View
          style={
            styles.highlightText
          }
        >
          <Text
            style={
              styles.highlightLabel
            }
          >
            Strongest tracked currency
          </Text>

          <Text
            style={
              styles.currency
            }
          >
            {strongest.code}
          </Text>
        </View>

        <Text
          style={[
            styles.change,
            {
              color:
                positive
                  ? "#2FE58C"
                  : "#FF7A7A",
            },
          ]}
        >
          {positive
            ? "+"
            : ""}
          {strongest.change.toFixed(
            2
          )}
          %
        </Text>
      </View>

      <View
        style={
          styles.reasonBox
        }
      >
        <Ionicons
          name="bulb-outline"
          size={18}
          color="#FFD65A"
        />

        <Text
          style={styles.reason}
        >
          {positive
            ? `${strongest.code} currently has the strongest positive movement among the currencies tracked in FXCompare.`
            : `${strongest.code} is currently the least negative mover among the tracked currencies.`}
        </Text>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#0E2C43",
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        "rgba(47,229,140,0.26)",
      padding: 15,
      marginBottom: 22,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
    },

    icon: {
      width: 43,
      height: 43,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(47,229,140,0.10)",
    },

    headerText: {
      flex: 1,
      marginLeft: 10,
    },

    eyebrow: {
      color: "#2FE58C",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.7,
    },

    title: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
      marginTop: 3,
    },

    confidenceBadge: {
      alignItems: "flex-end",
    },

    confidenceValue: {
      color: "#64AFFF",
      fontSize: 16,
      fontWeight: "900",
    },

    confidenceLabel: {
      color: "#6F8DA2",
      fontSize: 7,
      marginTop: 1,
    },

    highlightBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#16344C",
      borderRadius: 17,
      padding: 13,
      marginTop: 13,
    },

    flag: {
      fontSize: 28,
    },

    highlightText: {
      flex: 1,
      marginLeft: 10,
    },

    highlightLabel: {
      color: "#829CAF",
      fontSize: 9,
    },

    currency: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "900",
      marginTop: 3,
    },

    change: {
      fontSize: 15,
      fontWeight: "900",
    },

    reasonBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 12,
    },

    reason: {
      flex: 1,
      color: "#AFC1CD",
      fontSize: 10,
      lineHeight: 16,
      marginLeft: 8,
    },
  });