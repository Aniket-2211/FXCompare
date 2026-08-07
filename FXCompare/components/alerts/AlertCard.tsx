import React from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  SavedRateAlert,
} from "../../context/AppSettingsContext";

type AlertStatus =
  | "reached"
  | "close"
  | "waiting"
  | "unavailable";

type CurrencyDisplay = {
  flag: string;
};

type StatusConfig = {
  title: string;
  icon:
    keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
};

type Props = {
  item: SavedRateAlert;
  from: CurrencyDisplay;
  to: CurrencyDisplay;
  currentRate: number | undefined;
  distance: number | null;
  status: AlertStatus;
  statusConfig: StatusConfig;
  lastChecked: Date | null;
  loadingSettings: boolean;
  onToggle: (
    item: SavedRateAlert
  ) => void;
  onDelete: (
    alertId: string
  ) => void;
};

const formatRate = (
  value: number | undefined
) => {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "--";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }
  ).format(value);
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

export default function AlertCard({
  item,
  from,
  to,
  currentRate,
  distance,
  status,
  statusConfig,
  lastChecked,
  loadingSettings,
  onToggle,
  onDelete,
}: Props) {
  return (
    <View
      style={[
        styles.alertCard,
        status === "reached" &&
          styles.reachedAlertCard,
        !item.enabled &&
          styles.disabledAlertCard,
      ]}
    >
      <View style={styles.alertHeader}>
        <View
          style={styles.alertPairRow}
        >
          <View style={styles.alertIcon}>
            <Text
              style={styles.alertFlag}
            >
              {from.flag}
            </Text>
          </View>

          <View
            style={styles.savedPairText}
          >
            <Text style={styles.alertPair}>
              {item.fromCurrency}
              {" / "}
              {item.toCurrency}
            </Text>

            <Text
              style={
                styles.alertCondition
              }
            >
              Notify when rate is{" "}
              {item.condition}
            </Text>
          </View>
        </View>

        <Switch
          disabled={loadingSettings}
          value={item.enabled}
          onValueChange={() =>
            onToggle(item)
          }
          trackColor={{
            false: "#294558",
            true: "#1B8C63",
          }}
          thumbColor={
            item.enabled
              ? "#2FE58C"
              : "#829CAF"
          }
        />
      </View>

      <View
        style={[
          styles.liveStatusBadge,
          {
            backgroundColor:
              statusConfig.background,
          },
        ]}
      >
        <Ionicons
          name={statusConfig.icon}
          size={16}
          color={statusConfig.color}
        />

        <Text
          style={[
            styles.liveStatusText,
            {
              color:
                statusConfig.color,
            },
          ]}
        >
          {statusConfig.title}
        </Text>
      </View>

      <View style={styles.ratesGrid}>
        <View style={styles.rateStat}>
          <Text
            style={styles.rateStatLabel}
          >
            Current Rate
          </Text>

          <Text
            style={
              styles.currentRateValue
            }
          >
            {formatRate(currentRate)}
          </Text>

          <Text
            style={styles.rateCurrency}
          >
            {to.flag}{" "}
            {item.toCurrency}
          </Text>
        </View>

        <View
          style={styles.rateDivider}
        />

        <View style={styles.rateStat}>
          <Text
            style={styles.rateStatLabel}
          >
            Target Rate
          </Text>

          <Text
            style={
              styles.targetRateValue
            }
          >
            {formatRate(
              item.targetRate
            )}
          </Text>

          <Text
            style={styles.rateCurrency}
          >
            {item.condition ===
            "above"
              ? "Above"
              : "Below"}
          </Text>
        </View>
      </View>

      <View style={styles.distanceBox}>
        <View>
          <Text
            style={styles.distanceLabel}
          >
            {status === "reached"
              ? "Target condition"
              : "Distance to target"}
          </Text>

          <Text
            style={styles.distanceValue}
          >
            {status === "reached"
              ? "Condition met"
              : distance !== null
                ? formatRate(distance)
                : "--"}
          </Text>
        </View>

        <Ionicons
          name={
            item.condition === "above"
              ? "arrow-up-circle-outline"
              : "arrow-down-circle-outline"
          }
          size={27}
          color={statusConfig.color}
        />
      </View>

      <View style={styles.alertFooter}>
        <View
          style={
            styles.notificationState
          }
        >
          <Ionicons
            name={
              item.enabled
                ? "radio-outline"
                : "pause-circle-outline"
            }
            size={17}
            color={
              item.enabled
                ? "#2FE58C"
                : "#829CAF"
            }
          />

          <Text
            style={
              styles.notificationStateText
            }
          >
            {item.enabled
              ? `Checked ${formatCheckedTime(
                  lastChecked
                )}`
              : "Monitoring paused"}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.deleteButton}
          onPress={() =>
            onDelete(item.id)
          }
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color="#FF7A7A"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    alertCard: {
      backgroundColor:
        "#0E2C43",
      borderRadius: 22,
      borderWidth: 1,
      borderColor: "#194661",
      padding: 16,
      marginBottom: 13,
    },

    reachedAlertCard: {
      borderColor:
        "rgba(47,229,140,0.65)",
    },

    disabledAlertCard: {
      opacity: 0.62,
    },

    alertHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    alertPairRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 10,
    },

    alertIcon: {
      width: 45,
      height: 45,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#16344C",
      marginRight: 12,
    },

    alertFlag: {
      fontSize: 23,
    },

    savedPairText: {
      flex: 1,
    },

    alertPair: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "800",
    },

    alertCondition: {
      color: "#829CAF",
      fontSize: 11,
      marginTop: 4,
    },

    liveStatusBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 13,
      paddingHorizontal: 10,
      paddingVertical: 7,
      marginTop: 15,
    },

    liveStatusText: {
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.6,
      marginLeft: 5,
    },

    ratesGrid: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#16344C",
      borderRadius: 17,
      padding: 14,
      marginTop: 13,
    },

    rateStat: {
      flex: 1,
    },

    rateStatLabel: {
      color: "#829CAF",
      fontSize: 10,
    },

    currentRateValue: {
      color: "#FFFFFF",
      fontSize: 21,
      fontWeight: "900",
      marginTop: 5,
    },

    targetRateValue: {
      color: "#2FE58C",
      fontSize: 21,
      fontWeight: "900",
      marginTop: 5,
    },

    rateCurrency: {
      color: "#829CAF",
      fontSize: 10,
      marginTop: 4,
    },

    rateDivider: {
      width: 1,
      height: 52,
      backgroundColor:
        "#295069",
      marginHorizontal: 14,
    },

    distanceBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#102A3D",
      borderRadius: 15,
      padding: 13,
      marginTop: 12,
    },

    distanceLabel: {
      color: "#829CAF",
      fontSize: 10,
    },

    distanceValue: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
      marginTop: 4,
    },

    alertFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginTop: 15,
    },

    notificationState: {
      flexDirection: "row",
      alignItems: "center",
    },

    notificationStateText: {
      color: "#9CB1C1",
      fontSize: 11,
      fontWeight: "700",
      marginLeft: 6,
    },

    deleteButton: {
      width: 38,
      height: 38,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(255,122,122,0.1)",
    },
  });