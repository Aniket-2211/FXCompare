import React, {
  useMemo,
} from "react";
import {
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
  onSelect: (
    item: MarketPair
  ) => void;
};

export default function BiggestMovers({
  pairs,
  onSelect,
}: Props) {
  const gainers =
    useMemo(
      () =>
        [
          ...pairs,
        ]
          .filter(
            (item) =>
              item.change >
              0
          )
          .sort(
            (
              first,
              second
            ) =>
              second.change -
              first.change
          )
          .slice(0, 3),
      [pairs]
    );

  const losers =
    useMemo(
      () =>
        [
          ...pairs,
        ]
          .filter(
            (item) =>
              item.change <
              0
          )
          .sort(
            (
              first,
              second
            ) =>
              first.change -
              second.change
          )
          .slice(0, 3),
      [pairs]
    );

  if (
    gainers.length ===
      0 &&
    losers.length ===
      0
  ) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>
        Biggest Movers
      </Text>

      <Text style={styles.subtitle}>
        Top gainers and losers across tracked pairs
      </Text>

      <View style={styles.columns}>
        <MoverColumn
          title="Top Gainers"
          icon="trending-up"
          color="#2FE58C"
          items={gainers}
          onSelect={
            onSelect
          }
        />

        <MoverColumn
          title="Top Losers"
          icon="trending-down"
          color="#FF7A7A"
          items={losers}
          onSelect={
            onSelect
          }
        />
      </View>
    </View>
  );
}

function MoverColumn({
  title,
  icon,
  color,
  items,
  onSelect,
}: {
  title: string;
  icon:
    keyof typeof Ionicons.glyphMap;
  color: string;
  items: MarketPair[];
  onSelect: (
    item: MarketPair
  ) => void;
}) {
  return (
    <View
      style={styles.columnCard}
    >
      <View
        style={
          styles.columnHeader
        }
      >
        <Ionicons
          name={icon}
          size={16}
          color={color}
        />

        <Text
          style={[
            styles.columnTitle,
            {
              color,
            },
          ]}
        >
          {title}
        </Text>
      </View>

      {items.length ===
      0 ? (
        <Text
          style={
            styles.emptyText
          }
        >
          No movement
        </Text>
      ) : (
        items.map(
          (
            item,
            index
          ) => (
            <TouchableOpacity
              key={
                item.code
              }
              activeOpacity={
                0.82
              }
              style={
                styles.row
              }
              onPress={() =>
                onSelect(
                  item
                )
              }
            >
              <View
                style={
                  styles.rankBox
                }
              >
                <Text
                  style={
                    styles.rankText
                  }
                >
                  {index +
                    1}
                </Text>
              </View>

              <Text
                style={
                  styles.flag
                }
              >
                {
                  item.flag
                }
              </Text>

              <View
                style={
                  styles.rowText
                }
              >
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
                  style={
                    styles.pair
                  }
                >
                  {
                    item.pair
                  }
                </Text>
              </View>

              <Text
                style={[
                  styles.change,
                  {
                    color,
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
        )
      )}
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

    columns: {
      flexDirection: "row",
      marginHorizontal: -5,
    },

    columnCard: {
      flex: 1,
      backgroundColor:
        "#0E2C43",
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "#194661",
      padding: 12,
      marginHorizontal: 5,
    },

    columnHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },

    columnTitle: {
      fontSize: 10,
      fontWeight: "900",
      marginLeft: 5,
    },

    row: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor:
        "#20465E",
    },

    rankBox: {
      width: 24,
      height: 24,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#16344C",
    },

    rankText: {
      color: "#FFFFFF",
      fontSize: 9,
      fontWeight: "900",
    },

    flag: {
      fontSize: 19,
      marginLeft: 6,
    },

    rowText: {
      flex: 1,
      marginLeft: 6,
    },

    code: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "900",
    },

    pair: {
      color: "#6F8DA2",
      fontSize: 7,
      marginTop: 2,
    },

    change: {
      fontSize: 9,
      fontWeight: "900",
      marginLeft: 4,
    },

    emptyText: {
      color: "#6F8DA2",
      fontSize: 9,
      paddingVertical: 16,
      textAlign: "center",
    },
  });