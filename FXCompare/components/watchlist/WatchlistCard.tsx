import React from "react";
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
  WatchlistItem,
} from "../../services/watchlistStorage";

type Status =
  | "reached"
  | "near"
  | "tracking"
  | "unavailable";

type Props = {
  item: WatchlistItem;
  currentRate?: number;
  status: Status;
  onEdit: () => void;
  onDelete: () => void;
};

const formatRate = (
  value?: number
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

const statusConfig = {
  reached: {
    label: "TARGET REACHED",
    icon:
      "checkmark-circle" as const,
    color: "#2FE58C",
    background:
      "rgba(47,229,140,0.10)",
  },

  near: {
    label: "NEAR TARGET",
    icon:
      "navigate-circle" as const,
    color: "#FFD65A",
    background:
      "rgba(255,214,90,0.10)",
  },

  tracking: {
    label: "TRACKING",
    icon:
      "pulse" as const,
    color: "#64AFFF",
    background:
      "rgba(100,175,255,0.10)",
  },

  unavailable: {
    label: "UNAVAILABLE",
    icon:
      "cloud-offline-outline" as const,
    color: "#FF9C70",
    background:
      "rgba(255,156,112,0.10)",
  },
};

export default function WatchlistCard({
  item,
  currentRate,
  status,
  onEdit,
  onDelete,
}: Props) {
  const config =
    statusConfig[status];

  const distance =
    item.targetRate &&
    currentRate
      ? Math.abs(
          item.targetRate -
            currentRate
        )
      : null;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.pair}>
            {item.fromCurrency} / {item.toCurrency}
          </Text>

          <Text style={styles.rateLabel}>
            Current reference rate
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                config.background,
            },
          ]}
        >
          <Ionicons
            name={config.icon}
            size={14}
            color={config.color}
          />

          <Text
            style={[
              styles.statusText,
              {
                color:
                  config.color,
              },
            ]}
          >
            {config.label}
          </Text>
        </View>
      </View>

      <Text style={styles.rate}>
        {formatRate(
          currentRate
        )}
      </Text>

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>
            Target
          </Text>

          <Text style={styles.detailValue}>
            {item.targetRate
              ? formatRate(
                  item.targetRate
                )
              : "Not set"}
          </Text>
        </View>

        <View style={styles.detail}>
          <Text style={styles.detailLabel}>
            Distance
          </Text>

          <Text style={styles.detailValue}>
            {distance !== null
              ? formatRate(
                  distance
                )
              : "--"}
          </Text>
        </View>
      </View>

      {item.note ? (
        <View style={styles.noteBox}>
          <Ionicons
            name="document-text-outline"
            size={16}
            color="#829CAF"
          />

          <Text
            style={styles.note}
            numberOfLines={2}
          >
            {item.note}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.editButton}
          onPress={onEdit}
        >
          <Ionicons
            name="create-outline"
            size={17}
            color="#64AFFF"
          />

          <Text style={styles.editText}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.deleteButton}
          onPress={onDelete}
        >
          <Ionicons
            name="trash-outline"
            size={17}
            color="#FF7A7A"
          />

          <Text style={styles.deleteText}>
            Remove
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0E2C43",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 15,
    marginBottom: 12,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  pair: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  rateLabel: {
    color: "#829CAF",
    fontSize: 9,
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 8,
    fontWeight: "900",
    marginLeft: 4,
  },

  rate: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 14,
  },

  detailsRow: {
    flexDirection: "row",
    marginTop: 14,
  },

  detail: {
    flex: 1,
    backgroundColor: "#16344C",
    borderRadius: 14,
    padding: 11,
    marginRight: 8,
  },

  detailLabel: {
    color: "#829CAF",
    fontSize: 8,
  },

  detailValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },

  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor:
      "rgba(130,156,175,0.07)",
    borderRadius: 14,
    padding: 10,
    marginTop: 10,
  },

  note: {
    flex: 1,
    color: "#AFC1CD",
    fontSize: 9,
    lineHeight: 14,
    marginLeft: 7,
  },

  actions: {
    flexDirection: "row",
    marginTop: 12,
  },

  editButton: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(100,175,255,0.08)",
    marginRight: 6,
  },

  editText: {
    color: "#64AFFF",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 5,
  },

  deleteButton: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,122,122,0.08)",
    marginLeft: 6,
  },

  deleteText: {
    color: "#FF7A7A",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 5,
  },
});