import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Ionicons,
} from "@expo/vector-icons";

type Props = {
  total: number;
  nearTarget: number;
  reachedTarget: number;
  refreshing: boolean;
};

export default function WatchlistSummaryCard({
  total,
  nearTarget,
  reachedTarget,
  refreshing,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons
            name="eye-outline"
            size={22}
            color="#64AFFF"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            WATCHLIST
          </Text>

          <Text style={styles.title}>
            Currency Tracker
          </Text>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />

          <Text style={styles.liveText}>
            {refreshing
              ? "UPDATING"
              : "LIVE"}
          </Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric
          label="Pairs"
          value={total}
          color="#FFFFFF"
        />

        <View style={styles.divider} />

        <Metric
          label="Near Target"
          value={nearTarget}
          color="#FFD65A"
        />

        <View style={styles.divider} />

        <Metric
          label="Reached"
          value={reachedTarget}
          color="#2FE58C"
        />
      </View>
    </View>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.metric}>
      <Text
        style={[
          styles.metricValue,
          { color },
        ]}
      >
        {value}
      </Text>

      <Text style={styles.metricLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0E2C43",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 16,
    marginBottom: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(100,175,255,0.10)",
  },

  headerText: {
    flex: 1,
    marginLeft: 10,
  },

  eyebrow: {
    color: "#64AFFF",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor:
      "rgba(47,229,140,0.10)",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2FE58C",
  },

  liveText: {
    color: "#2FE58C",
    fontSize: 8,
    fontWeight: "900",
    marginLeft: 5,
  },

  metrics: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 16,
    paddingVertical: 13,
    marginTop: 14,
  },

  metric: {
    flex: 1,
    alignItems: "center",
  },

  metricValue: {
    fontSize: 17,
    fontWeight: "900",
  },

  metricLabel: {
    color: "#829CAF",
    fontSize: 8,
    marginTop: 4,
  },

  divider: {
    width: 1,
    height: 32,
    backgroundColor: "#295069",
  },
});