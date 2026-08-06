// components/ScreenHeader.tsx

import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  subtitle?: string;
  showAction?: boolean;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onActionPress?: () => void;
};

export default function ScreenHeader({
  title,
  subtitle,
  showAction = false,
  actionIcon = "settings-outline",
  onActionPress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {showAction ? (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.actionButton}
          onPress={onActionPress}
        >
          <Ionicons
            name={actionIcon}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  textContainer: {
    flex: 1,
    paddingRight: 14,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#9FB3C8",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },

  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#153147",
    borderWidth: 1,
    borderColor: "#21465E",
  },
});