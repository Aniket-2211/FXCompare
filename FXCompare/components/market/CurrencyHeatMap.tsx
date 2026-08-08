import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type {
  MarketPair,
} from "../../services/marketsApi";

type Props = {
  pairs: MarketPair[];
  onSelect: (
    item: MarketPair
  ) => void;
};

const getIntensity = (
  change: number
) => {
  const value =
    Math.min(
      Math.abs(change),
      1
    );

  const alpha =
    0.08 +
    value * 0.22;

  return change >= 0
    ? `rgba(47,229,140,${alpha})`
    : `rgba(255,122,122,${alpha})`;
};

export default function CurrencyHeatMap({
  pairs,
  onSelect,
}: Props) {
  if (
    pairs.length === 0
  ) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>
        Currency Heat Map
      </Text>

      <Text style={styles.subtitle}>
        Visual strength across tracked currencies
      </Text>

      <View style={styles.grid}>
        {pairs.map(
          (item) => (
            <TouchableOpacity
              key={
                item.code
              }
              activeOpacity={
                0.84
              }
              style={[
                styles.tile,
                {
                  backgroundColor:
                    getIntensity(
                      item.change
                    ),
                  borderColor:
                    item.change >=
                    0
                      ? "rgba(47,229,140,0.25)"
                      : "rgba(255,122,122,0.25)",
                },
              ]}
              onPress={() =>
                onSelect(
                  item
                )
              }
            >
              <Text
                style={
                  styles.flag
                }
              >
                {
                  item.flag
                }
              </Text>

              <Text
                style={
                  styles.code
                }
              >
                {
                  item.code
                }
              </Text>

              <Text
                style={[
                  styles.change,
                  {
                    color:
                      item.change >=
                      0
                        ? "#2FE58C"
                        : "#FF7A7A",
                  },
                ]}
              >
                {item.change >=
                0
                  ? "+"
                  : ""}
                {item.change.toFixed(
                  2
                )}
                %
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    wrapper: {
      marginBottom: 22,
    },

    title: {
      color: "#FFFFFF",
      fontSize: 21,
      fontWeight: "900",
    },

    subtitle: {
      color: "#829CAF",
      fontSize: 11,
      marginTop: 4,
      marginBottom: 12,
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -5,
    },

    tile: {
      width: "47%",
      minHeight: 92,
      borderRadius: 18,
      borderWidth: 1,
      padding: 13,
      marginHorizontal: 5,
      marginBottom: 10,
    },

    flag: {
      fontSize: 22,
    },

    code: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
      marginTop: 8,
    },

    change: {
      fontSize: 11,
      fontWeight: "900",
      marginTop: 5,
    },
  });