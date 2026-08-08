import React from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Ionicons,
} from "@expo/vector-icons";

export type SettingsSectionItem = {
  id: string;
  title: string;
  subtitle: string;
  icon:
    keyof typeof Ionicons.glyphMap;
  type:
    | "arrow"
    | "switch";
  value?: boolean;
  destructive?: boolean;
};

type Props = {
  title: string;
  items: SettingsSectionItem[];
  disabled?: boolean;
  onPress: (
    item: SettingsSectionItem
  ) => void;
  onToggle?: (
    item: SettingsSectionItem,
    value: boolean
  ) => void;
};

export default function SettingsSection({
  title,
  items,
  disabled = false,
  onPress,
  onToggle,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.card}>
        {items.map(
          (item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={
                item.type ===
                "switch"
                  ? 1
                  : 0.84
              }
              disabled={
                disabled ||
                item.type ===
                  "switch"
              }
              style={[
                styles.row,
                index <
                  items.length -
                    1 &&
                  styles.divider,
              ]}
              onPress={() =>
                onPress(item)
              }
            >
              <View
                style={[
                  styles.iconBox,
                  item.destructive &&
                    styles.destructiveIcon,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={
                    item.destructive
                      ? "#FF7A7A"
                      : "#64AFFF"
                  }
                />
              </View>

              <View style={styles.textBox}>
                <Text
                  style={[
                    styles.title,
                    item.destructive &&
                      styles.destructiveTitle,
                  ]}
                >
                  {item.title}
                </Text>

                <Text style={styles.subtitle}>
                  {item.subtitle}
                </Text>
              </View>

              {item.type ===
              "switch" ? (
                <Switch
                  disabled={disabled}
                  value={
                    item.value ??
                    false
                  }
                  onValueChange={(
                    value
                  ) =>
                    onToggle?.(
                      item,
                      value
                    )
                  }
                  trackColor={{
                    false:
                      "#2B475C",
                    true:
                      "#1B8C63",
                  }}
                  thumbColor={
                    item.value
                      ? "#2FE58C"
                      : "#829CAF"
                  }
                />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#6F8DA2"
                />
              )}
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 22,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 11,
  },

  card: {
    backgroundColor: "#0E2C43",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#194661",
    paddingHorizontal: 14,
  },

  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#20465E",
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
  },

  destructiveIcon: {
    backgroundColor:
      "rgba(255,122,122,0.10)",
  },

  textBox: {
    flex: 1,
    marginHorizontal: 11,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  destructiveTitle: {
    color: "#FF8B8B",
  },

  subtitle: {
    color: "#829CAF",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
});