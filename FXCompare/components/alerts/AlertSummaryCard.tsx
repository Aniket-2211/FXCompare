import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  enabledAlerts: number;
  refreshingRates: boolean;
  reachedAlerts: number;
  notificationsEnabled: boolean;
  lastChecked: Date | null;
};

const formatCheckedTime = (
  date: Date | null
) => {
  if (!date) {
    return "Not checked";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AlertSummaryCard({
  enabledAlerts,
  refreshingRates,
  reachedAlerts,
  notificationsEnabled,
  lastChecked,
}: Props) {
  const iconName =
    reachedAlerts > 0
      ? "checkmark-circle"
      : notificationsEnabled
        ? "notifications"
        : "notifications-off";

  const iconColor =
    reachedAlerts > 0
      ? "#2FE58C"
      : notificationsEnabled
        ? "#64AFFF"
        : "#FF9C70";

  const statusText =
    reachedAlerts > 0
      ? `${reachedAlerts} REACHED`
      : refreshingRates
        ? "CHECKING"
        : "MONITORING";

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        {refreshingRates ? (
          <ActivityIndicator
            size="small"
            color="#2FE58C"
          />
        ) : (
          <Ionicons
            name={iconName}
            size={25}
            color={iconColor}
          />
        )}
      </View>

      <View style={styles.summaryText}>
        <Text style={styles.summaryLabel}>
          Active Alerts
        </Text>

        <Text style={styles.summaryValue}>
          {enabledAlerts}
        </Text>

        <Text style={styles.checkedText}>
          Checked{" "}
          {formatCheckedTime(lastChecked)}
        </Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          reachedAlerts > 0 &&
            styles.reachedSummaryBadge,
        ]}
      >
        <View
          style={[
            styles.statusDot,
            reachedAlerts > 0 &&
              styles.reachedSummaryDot,
          ]}
        />

        <Text
          style={[
            styles.statusText,
            reachedAlerts > 0 &&
              styles.reachedSummaryText,
          ]}
        >
          {statusText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0E2C43",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#194661",
    paddingHorizontal: 17,
    marginBottom: 18,
  },

  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(47,229,140,0.12)",
  },

  summaryText: {
    flex: 1,
    marginLeft: 14,
  },

  summaryLabel: {
    color: "#829CAF",
    fontSize: 12,
    fontWeight: "600",
  },

  summaryValue: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 2,
  },

  checkedText: {
    color: "#6F8DA2",
    fontSize: 10,
    marginTop: 3,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(100,175,255,0.12)",
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#64AFFF",
    marginRight: 6,
  },

  statusText: {
    color: "#64AFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  reachedSummaryBadge: {
    backgroundColor:
      "rgba(47,229,140,0.12)",
  },

  reachedSummaryDot: {
    backgroundColor: "#2FE58C",
  },

  reachedSummaryText: {
    color: "#2FE58C",
  },
});