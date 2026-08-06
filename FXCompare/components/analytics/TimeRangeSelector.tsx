import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

const ranges = ["1D", "7D", "30D", "90D", "1Y"];

export default function TimeRangeSelector() {
  const [selected, setSelected] = useState("1D");

  return (
    <View style={styles.container}>
      {ranges.map((range) => {
        const active = selected === range;

        return (
          <Pressable
            key={range}
            onPress={() => setSelected(range)}
            style={[
              styles.button,
              active && styles.activeButton,
            ]}
          >
            <Text
              style={[
                styles.text,
                active && styles.activeText,
              ]}
            >
              {range}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },

  activeButton: {
    backgroundColor: "#2E79FF",
  },

  text: {
    color: "#8FA7C5",
    fontSize: 14,
    fontWeight: "700",
  },

  activeText: {
    color: "#FFFFFF",
  },
});