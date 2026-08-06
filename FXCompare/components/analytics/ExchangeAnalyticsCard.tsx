import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from "react-native";

import TrendGraph from "./TrendGraph";
import MarketStats from "./MarketStats";
import TimeRangeSelector from "./TimeRangeSelector";

export default function ExchangeAnalyticsCard() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.smallTitle}>Exchange Analytics</Text>
          <Text style={styles.pair}>USD → INR</Text>
        </View>

        <Animated.View
          style={[
            styles.liveBadge,
            {
              transform: [{ scale: pulse }],
            },
          ]}
        >
          <View style={styles.dot} />
          <Text style={styles.liveText}>LIVE</Text>
        </Animated.View>
      </View>

      {/* Current Rate */}
      <Text style={styles.rate}>86.4205</Text>

      <View style={styles.changeRow}>
        <Text style={styles.positive}>▲ +0.42%</Text>
        <Text style={styles.changeLabel}>Today</Text>
      </View>

      {/* Graph */}
      <TrendGraph />

      {/* Stats */}
      <MarketStats
        high={86.61}
        current={86.42}
        low={85.98}
      />

      {/* Time Selector */}
      <TimeRangeSelector />

      {/* Footer */}
      <Text style={styles.updated}>
        Updated 12 seconds ago
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#102842",
    borderRadius: 30,
    padding: 22,
    marginTop: 18,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  smallTitle: {
    color: "#8FA7C5",
    fontSize: 14,
    fontWeight: "600",
  },

  pair: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,230,118,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00E676",
    marginRight: 6,
  },

  liveText: {
    color: "#00E676",
    fontWeight: "700",
    fontSize: 12,
  },

  rate: {
    marginTop: 20,
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1,
  },

  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  positive: {
    color: "#00E676",
    fontSize: 16,
    fontWeight: "700",
  },

  changeLabel: {
    color: "#8FA7C5",
    marginLeft: 8,
    fontSize: 14,
  },

  updated: {
    marginTop: 18,
    color: "#6F87A9",
    textAlign: "center",
    fontSize: 13,
  },
});