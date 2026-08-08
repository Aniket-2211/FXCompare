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
  email: string;
  favouritesCount: number;
  alertsCount: number;
  notificationsEnabled: boolean;
};

export default function AccountStatusCard({
  email,
  favouritesCount,
  alertsCount,
  notificationsEnabled,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons
            name="cloud-done-outline"
            size={21}
            color="#2FE58C"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            ACCOUNT STATUS
          </Text>

          <Text style={styles.title}>
            Cloud connected
          </Text>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />

          <Text style={styles.liveText}>
            SYNCED
          </Text>
        </View>
      </View>

      <Text
        style={styles.email}
        numberOfLines={1}
      >
        {email}
      </Text>

      <View style={styles.metrics}>
        <Metric
          label="Favourites"
          value={`${favouritesCount}`}
        />

        <View style={styles.divider} />

        <Metric
          label="Alerts"
          value={`${alertsCount}`}
        />

        <View style={styles.divider} />

        <Metric
          label="Notifications"
          value={
            notificationsEnabled
              ? "ON"
              : "OFF"
          }
        />
      </View>

      <View style={styles.notice}>
        <Ionicons
          name="shield-checkmark-outline"
          size={16}
          color="#64AFFF"
        />

        <Text style={styles.noticeText}>
          Your saved settings, alerts and favourite providers are linked to your signed-in FXCompare account where cloud sync is enabled.
        </Text>
      </View>
    </View>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>
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
    borderColor:
      "rgba(47,229,140,0.24)",
    padding: 15,
    marginBottom: 22,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
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

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(47,229,140,0.10)",
    borderRadius: 12,
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

  email: {
    color: "#829CAF",
    fontSize: 10,
    marginTop: 12,
  },

  metrics: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 12,
  },

  metric: {
    flex: 1,
    alignItems: "center",
  },

  metricValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  metricLabel: {
    color: "#829CAF",
    fontSize: 8,
    marginTop: 4,
  },

  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#295069",
  },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },

  noticeText: {
    flex: 1,
    color: "#7894A7",
    fontSize: 9,
    lineHeight: 14,
    marginLeft: 7,
  },
});