import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  selectedCode?: string;
  onSelect: (
    item: MarketPair
  ) => void;
};

const formatChange = (
  value: number
) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(
    2
  )}%`;

export default function TrendingCurrencies({
  pairs,
  selectedCode,
  onSelect,
}: Props) {
  const trending = [
    ...pairs,
  ]
    .sort(
      (first, second) =>
        Math.abs(
          second.change
        ) -
        Math.abs(
          first.change
        )
    )
    .slice(0, 8);

  if (
    trending.length === 0
  ) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View>
          <Text
            style={styles.title}
          >
            Trending Today
          </Text>

          <Text
            style={styles.subtitle}
          >
            Currencies with the strongest movement
          </Text>
        </View>

        <View
          style={styles.hotBadge}
        >
          <Ionicons
            name="flame"
            size={14}
            color="#FF9C70"
          />

          <Text
            style={styles.hotText}
          >
            LIVE
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {trending.map(
          (item) => {
            const positive =
              item.change >= 0;

            const active =
              selectedCode ===
              item.code;

            return (
              <TouchableOpacity
                key={
                  item.code
                }
                activeOpacity={
                  0.84
                }
                style={[
                  styles.card,
                  active &&
                    styles.activeCard,
                ]}
                onPress={() =>
                  onSelect(
                    item
                  )
                }
              >
                <View
                  style={
                    styles.flagBox
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
                </View>

                <Text
                  style={
                    styles.code
                  }
                >
                  {
                    item.code
                  }
                </Text>

                <View
                  style={[
                    styles.changeBadge,
                    positive
                      ? styles.positiveBadge
                      : styles.negativeBadge,
                  ]}
                >
                  <Ionicons
                    name={
                      positive
                        ? "trending-up"
                        : "trending-down"
                    }
                    size={
                      13
                    }
                    color={
                      positive
                        ? "#2FE58C"
                        : "#FF7A7A"
                    }
                  />

                  <Text
                    style={[
                      styles.changeText,
                      {
                        color:
                          positive
                            ? "#2FE58C"
                            : "#FF7A7A",
                      },
                    ]}
                  >
                    {formatChange(
                      item.change
                    )}
                  </Text>
                </View>

                <Text
                  style={
                    styles.rate
                  }
                >
                  {item.rate.toFixed(
                    item.rate <
                      1
                      ? 4
                      : 2
                  )}
                </Text>
              </TouchableOpacity>
            );
          }
        )}
      </ScrollView>
    </View>
  );
}

const styles =
  StyleSheet.create({
    wrapper: {
      marginBottom: 22,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 12,
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
    },

    hotBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "rgba(255,156,112,0.10)",
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "rgba(255,156,112,0.24)",
      paddingHorizontal: 8,
      paddingVertical: 6,
    },

    hotText: {
      color: "#FF9C70",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.6,
      marginLeft: 4,
    },

    scrollContent: {
      paddingRight: 6,
    },

    card: {
      width: 128,
      minHeight: 148,
      backgroundColor:
        "#0E2C43",
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "#194661",
      padding: 13,
      marginRight: 10,
    },

    activeCard: {
      borderColor:
        "#2FE58C",
      backgroundColor:
        "#0E3045",
    },

    flagBox: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#16344C",
    },

    flag: {
      fontSize: 24,
    },

    code: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "900",
      marginTop: 10,
    },

    changeBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 11,
      paddingHorizontal: 7,
      paddingVertical: 5,
      marginTop: 7,
    },

    positiveBadge: {
      backgroundColor:
        "rgba(47,229,140,0.11)",
    },

    negativeBadge: {
      backgroundColor:
        "rgba(255,122,122,0.11)",
    },

    changeText: {
      fontSize: 9,
      fontWeight: "900",
      marginLeft: 3,
    },

    rate: {
      color: "#7894A7",
      fontSize: 10,
      fontWeight: "700",
      marginTop: 8,
    },
  });