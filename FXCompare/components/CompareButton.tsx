import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export default function CompareButton({
  title = "Compare All Providers",
  loading = false,
  disabled = false,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={loading || disabled}
      onPress={onPress}
      style={[
        styles.button,
        (loading || disabled) &&
          styles.disabled,
      ]}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            color="#FFFFFF"
            size="small"
          />

          <Text style={styles.loadingText}>
            Fetching Live Rates...
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Ionicons
            name="analytics"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.text}>
            {title}
          </Text>

          <Ionicons
            name="arrow-forward-circle"
            size={22}
            color="#FFFFFF"
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 62,
    borderRadius: 20,
    backgroundColor: "#1687E8",

    justifyContent: "center",
    alignItems: "center",

    marginTop: 18,

    shadowColor: "#1687E8",
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 10,
  },

  disabled: {
    opacity: 0.6,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "88%",
  },

  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  loadingText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 12,
    fontSize: 16,
  },
});