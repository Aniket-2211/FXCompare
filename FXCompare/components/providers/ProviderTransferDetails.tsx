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
  deliveryTime: string;
  supportedCountries: string;
  minimumTransfer: string;
  maximumTransfer: string;
};

export default function ProviderTransferDetails({
  deliveryTime,
  supportedCountries,
  minimumTransfer,
  maximumTransfer,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>
        Transfer Details
      </Text>

      <View style={styles.card}>
        <DetailRow
          icon="time-outline"
          label="Estimated Arrival"
          value={deliveryTime}
        />

        <DetailRow
          icon="globe-outline"
          label="Supported Countries"
          value={supportedCountries}
        />

        <DetailRow
          icon="arrow-down-circle-outline"
          label="Minimum Transfer"
          value={minimumTransfer}
        />

        <DetailRow
          icon="arrow-up-circle-outline"
          label="Maximum Transfer"
          value={maximumTransfer}
          showDivider={false}
        />
      </View>
    </>
  );
}

type DetailRowProps = {
  icon:
    keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  showDivider?: boolean;
};

function DetailRow({
  icon,
  label,
  value,
  showDivider = true,
}: DetailRowProps) {
  return (
    <View
      style={[
        styles.detailRow,
        showDivider &&
          styles.detailRowDivider,
      ]}
    >
      <View
        style={styles.detailLeft}
      >
        <View
          style={styles.detailIcon}
        >
          <Ionicons
            name={icon}
            size={19}
            color="#64AFFF"
          />
        </View>

        <Text
          style={styles.detailLabel}
        >
          {label}
        </Text>
      </View>

      <Text
        style={styles.detailValue}
      >
        {value}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    sectionTitle: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 12,
    },

    card: {
      backgroundColor:
        "#0E2C43",
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "#194661",
      paddingHorizontal: 15,
      marginBottom: 22,
    },

    detailRow: {
      minHeight: 65,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    detailRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor:
        "#20465E",
    },

    detailLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },

    detailIcon: {
      width: 38,
      height: 38,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#16344C",
    },

    detailLabel: {
      color: "#A9BECC",
      fontSize: 12,
      marginLeft: 11,
    },

    detailValue: {
      maxWidth: "47%",
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "800",
      textAlign: "right",
    },
  });