import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>
          Good Evening 👋
        </Text>

        <Text style={styles.logo}>
          FXCompare Pro
        </Text>
      </View>

      <Pressable style={styles.settingsButton}>
        <Ionicons
          name="settings"
          size={30}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  greeting: {
    color: "#AFC2D4",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },

  settingsButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#344A5C",
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.08)",
  },
});