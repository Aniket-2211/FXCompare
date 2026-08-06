import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from "react-native";

import TrendChart from "./TrendChart";

type Props = {
  rate?: number | null;
  from?: string;
  to?: string;
};

export default function HeroCard({
  rate,
  from = "USD",
  to = "INR",
}: Props) {

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

      <View style={styles.header}>

        <Text style={styles.title}>
          Live Exchange Rate
        </Text>

        <Animated.View
          style={[
            styles.liveBadge,
            {
              transform: [{ scale: pulse }],
            },
          ]}
        >
          <View style={styles.dot} />

          <Text style={styles.liveText}>
            LIVE
          </Text>
        </Animated.View>

      </View>

      <Text style={styles.rate}>
        {rate ? rate.toFixed(4) : "--"}
      </Text>

      <Text style={styles.pair}>
        {from} → {to}
      </Text>

      <View style={styles.changeBox}>
        <Text style={styles.change}>
          Auto refresh every 15s
        </Text>
      </View>

      <TrendChart />

    </View>
  );
}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "#102842",
    borderRadius: 30,
    padding: 22,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#9CB3D1",
    fontSize: 15,
    fontWeight: "600",
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,255,120,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
    fontSize: 12,
    fontWeight: "800",
  },

  rate: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    marginTop: 20,
  },

  pair: {
    color: "#8DA8C3",
    marginTop: 8,
    fontSize: 16,
  },

  changeBox: {
    marginTop: 14,
  },

  change: {
    color: "#00E676",
    fontSize: 14,
    fontWeight: "700",
  },

});