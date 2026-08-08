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
  totalAlerts: number;
  enabledAlerts: number;
  reachedAlerts: number;
  closeAlerts: number;
  notificationsReady: boolean;
};

export default function SmartAlertInsightCard({
  totalAlerts,
  enabledAlerts,
  reachedAlerts,
  closeAlerts,
  notificationsReady,
}: Props) {
  const getMessage = () => {
    if (totalAlerts === 0) {
      return "Create a target-rate alert and FXCompare will track how close the live rate is to your target.";
    }

    if (reachedAlerts > 0) {
      return `${reachedAlerts} alert${
        reachedAlerts === 1 ? "" : "s"
      } reached the target. Review the live rate before making a transfer decision.`;
    }

    if (closeAlerts > 0) {
      return `${closeAlerts} alert${
        closeAlerts === 1 ? " is" : "s are"
      } within 1% of the target. These are the rates worth watching most closely right now.`;
    }

    if (enabledAlerts > 0) {
      return `${enabledAlerts} active alert${
        enabledAlerts === 1 ? " is" : "s are"
      } monitoring live rates. FXCompare will highlight when a target gets close or is reached.`;
    }

    return "Your saved alerts are currently paused. Enable an alert to resume live target monitoring.";
  };

  const getSignal = () => {
    if (reachedAlerts > 0) {
      return {
        label: "TARGET HIT",
        icon: "checkmark-circle" as const,
        color: "#2FE58C",
        background:
          "rgba(47,229,140,0.12)",
      };
    }

    if (closeAlerts > 0) {
      return {
        label: "NEAR TARGET",
        icon: "navigate-circle" as const,
        color: "#FFD65A",
        background:
          "rgba(255,214,90,0.12)",
      };
    }

    return {
      label:
        enabledAlerts > 0
          ? "MONITORING"
          : "PAUSED",
      icon:
        enabledAlerts > 0
          ? ("pulse" as const)
          : ("pause-circle" as const),
      color:
        enabledAlerts > 0
          ? "#64AFFF"
          : "#829CAF",
      background:
        enabledAlerts > 0
          ? "rgba(100,175,255,0.12)"
          : "rgba(130,156,175,0.12)",
    };
  };

  const signal = getSignal();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.aiIcon}>
          <Ionicons
            name="sparkles"
            size={21}
            color="#2FE58C"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            FXCOMPARE INTELLIGENCE
          </Text>

          <Text style={styles.title}>
            Smart Alert Insight
          </Text>
        </View>

        <View
          style={[
            styles.signalBadge,
            {
              backgroundColor:
                signal.background,
            },
          ]}
        >
          <Ionicons
            name={signal.icon}
            size={14}
            color={signal.color}
          />

          <Text
            style={[
              styles.signalText,
              {
                color: signal.color,
              },
            ]}
          >
            {signal.label}
          </Text>
        </View>
      </View>

      <Text style={styles.message}>
        {getMessage()}
      </Text>

      <View style={styles.metrics}>
        <Metric
          label="Active"
          value={enabledAlerts}
          color="#64AFFF"
        />

        <View style={styles.divider} />

        <Metric
          label="Near"
          value={closeAlerts}
          color="#FFD65A"
        />

        <View style={styles.divider} />

        <Metric
          label="Reached"
          value={reachedAlerts}
          color="#2FE58C"
        />
      </View>

      <View style={styles.notificationRow}>
        <Ionicons
          name={
            notificationsReady
              ? "notifications"
              : "notifications-off"
          }
          size={16}
          color={
            notificationsReady
              ? "#2FE58C"
              : "#FF9C70"
          }
        />

        <Text style={styles.notificationText}>
          {notificationsReady
            ? "Device notifications are ready."
            : "Device notifications are not ready. Live monitoring still works while the app is open."}
        </Text>
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
      <Text style={styles.metricLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.metricValue,
          { color },
        ]}
      >
        {value}
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
      "rgba(47,229,140,0.25)",
    padding: 15,
    marginBottom: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  aiIcon: {
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

  signalBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 13,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  signalText: {
    fontSize: 8,
    fontWeight: "900",
    marginLeft: 4,
  },

  message: {
    color: "#AFC1CD",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
  },

  metrics: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 13,
  },

  metric: {
    flex: 1,
    alignItems: "center",
  },

  metricLabel: {
    color: "#829CAF",
    fontSize: 8,
  },

  metricValue: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },

  divider: {
    width: 1,
    height: 31,
    backgroundColor: "#295069",
  },

  notificationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },

  notificationText: {
    flex: 1,
    color: "#7894A7",
    fontSize: 9,
    lineHeight: 14,
    marginLeft: 7,
  },
});