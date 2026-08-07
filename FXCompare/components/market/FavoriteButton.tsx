import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  active: boolean;
  onPress: () => void;
};

export default function FavoriteButton({
  active,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.button,
        active &&
          styles.activeButton,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={
          active
            ? "heart"
            : "heart-outline"
        }
        size={18}
        color={
          active
            ? "#FF7A9A"
            : "#829CAF"
        }
      />
    </TouchableOpacity>
  );
}

const styles =
  StyleSheet.create({
    button: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#16344C",
      borderWidth: 1,
      borderColor:
        "#21516E",
    },

    activeButton: {
      backgroundColor:
        "rgba(255,122,154,0.12)",
      borderColor:
        "rgba(255,122,154,0.30)",
    },
  });