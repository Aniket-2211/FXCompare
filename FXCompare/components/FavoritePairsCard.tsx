// components/FavoritePairsCard.tsx

import React, {
  useMemo,
} from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type FavouriteCurrencyPair = {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  change: number;
  fromFlag?: string;
  toFlag?: string;
};

type Props = {
  pairs?: FavouriteCurrencyPair[];
  loading?: boolean;
  onPairPress?: (
    pair: FavouriteCurrencyPair
  ) => void;
  onViewAllPress?: () => void;
};

const formatRate = (
  value: number
) => {
  if (!Number.isFinite(value)) {
    return "--";
  }

  if (value >= 1000) {
    return new Intl.NumberFormat(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(value);
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }
  ).format(value);
};

export default function FavoritePairsCard({
  pairs = [],
  loading = false,
  onPairPress,
  onViewAllPress,
}: Props) {
  const visiblePairs = useMemo(
    () => pairs.slice(0, 4),
    [pairs]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            WATCHLIST
          </Text>

          <Text style={styles.title}>
            Favourite Pairs
          </Text>

          <Text style={styles.subtitle}>
            Track the currency pairs you use most
          </Text>
        </View>

        {onViewAllPress ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.viewAllButton}
            onPress={onViewAllPress}
          >
            <Text style={styles.viewAllText}>
              View All
            </Text>

            <Ionicons
              name="arrow-forward"
              size={15}
              color="#64AFFF"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerIcon}>
            <Ionicons
              name="star-outline"
              size={22}
              color="#FFD65A"
            />
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingCard}>
          <View style={styles.loadingIcon}>
            <Ionicons
              name="hourglass-outline"
              size={30}
              color="#67869C"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading favourite pairs
          </Text>

          <Text style={styles.loadingText}>
            Fetching your latest saved market rates.
          </Text>
        </View>
      ) : visiblePairs.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="star-outline"
              size={34}
              color="#67869C"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No favourite pairs yet
          </Text>

          <Text style={styles.emptyText}>
            Save currencies such as USD/INR or EUR/USD to monitor them here.
          </Text>
        </View>
      ) : (
        <View style={styles.listCard}>
          {visiblePairs.map(
            (pair, index) => {
              const positive =
                pair.change >= 0;

              return (
                <TouchableOpacity
                  key={pair.id}
                  activeOpacity={0.84}
                  style={[
                    styles.pairRow,
                    index !==
                      visiblePairs.length -
                        1 &&
                      styles.pairRowDivider,
                  ]}
                  onPress={() =>
                    onPairPress?.(pair)
                  }
                >
                  <View style={styles.pairLeft}>
                    <View style={styles.flagStack}>
                      <View style={styles.primaryFlag}>
                        <Text style={styles.flag}>
                          {pair.fromFlag ?? "🌐"}
                        </Text>
                      </View>

                      <View style={styles.secondaryFlag}>
                        <Text style={styles.smallFlag}>
                          {pair.toFlag ?? "🌐"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.pairTextBox}>
                      <View style={styles.pairNameRow}>
                        <Text style={styles.pairName}>
                          {pair.fromCurrency}
                        </Text>

                        <Text style={styles.slash}>
                          /
                        </Text>

                        <Text style={styles.pairName}>
                          {pair.toCurrency}
                        </Text>

                        <Ionicons
                          name="star"
                          size={13}
                          color="#FFD65A"
                          style={styles.starIcon}
                        />
                      </View>

                      <Text style={styles.pairSubtitle}>
                        Favourite currency pair
                      </Text>
                    </View>
                  </View>

                  <View style={styles.pairRight}>
                    <Text style={styles.rate}>
                      {formatRate(pair.rate)}
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
                        size={13}
                        color={
                          positive
                            ? "#2FE58C"
                            : "#FF7A7A"
                        }
                      />

                      <Text
                        style={[
                          styles.changeText,
                          positive
                            ? styles.positiveText
                            : styles.negativeText,
                        ]}
                      >
                        {positive ? "+" : ""}
                        {pair.change.toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color="#728DA1"
        />

        <Text style={styles.footerText}>
          Rates shown are current reference values. Provider quotes may differ.
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
    marginBottom: 15,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    color: "#FFD65A",
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
      "rgba(255,214,90,0.10)",
    borderWidth: 1,
    borderColor:
      "rgba(255,214,90,0.22)",
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(100,175,255,0.10)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      "rgba(100,175,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  viewAllText: {
    color: "#64AFFF",
    fontSize: 10,
    fontWeight: "800",
    marginRight: 5,
  },

  listCard: {
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingHorizontal: 13,
  },

  pairRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pairRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#295069",
  },

  pairLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  flagStack: {
    width: 49,
    height: 49,
    marginRight: 12,
  },

  primaryFlag: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B425A",
  },

  secondaryFlag: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E2C43",
    borderWidth: 2,
    borderColor: "#16344C",
  },

  flag: {
    fontSize: 23,
  },

  smallFlag: {
    fontSize: 13,
  },

  pairTextBox: {
    flex: 1,
  },

  pairNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  pairName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  slash: {
    color: "#647F92",
    fontSize: 14,
    fontWeight: "700",
    marginHorizontal: 4,
  },

  starIcon: {
    marginLeft: 7,
  },

  pairSubtitle: {
    color: "#829CAF",
    fontSize: 9,
    marginTop: 4,
  },

  pairRight: {
    alignItems: "flex-end",
  },

  rate: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 11,
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginTop: 5,
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
    marginLeft: 4,
  },

  positiveText: {
    color: "#2FE58C",
  },

  negativeText: {
    color: "#FF7A7A",
  },

  loadingCard: {
    minHeight: 170,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingHorizontal: 24,
  },

  loadingIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B425A",
  },

  loadingTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 12,
  },

  loadingText: {
    color: "#829CAF",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 6,
  },

  emptyCard: {
    minHeight: 170,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingHorizontal: 24,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B425A",
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 12,
  },

  emptyText: {
    color: "#829CAF",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 6,
  },

  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    paddingHorizontal: 2,
  },

  footerText: {
    flex: 1,
    color: "#728DA1",
    fontSize: 9,
    lineHeight: 15,
    marginLeft: 7,
  },
});