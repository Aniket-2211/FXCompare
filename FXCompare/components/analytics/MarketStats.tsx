import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  high: number;
  current: number;
  low: number;
};

export default function MarketStats({
  high,
  current,
  low,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.label}>High</Text>
        <Text style={styles.value}>{high.toFixed(2)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.item}>
        <Text style={styles.label}>Current</Text>
        <Text style={styles.current}>{current.toFixed(2)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.item}>
        <Text style={styles.label}>Low</Text>
        <Text style={styles.value}>{low.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },

  item: {
    flex: 1,
    alignItems: "center",
  },

  divider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  label: {
    color: "#8FA7C5",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },

  value: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  current: {
    color: "#00E676",
    fontSize: 22,
    fontWeight: "800",
  },
});