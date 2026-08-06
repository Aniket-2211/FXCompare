import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";

export default function TrendGraph() {
  return (
    <View style={styles.container}>
      <Svg width="100%" height="170" viewBox="0 0 340 170">
        <Defs>
          <LinearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#2E79FF" />
            <Stop offset="100%" stopColor="#00E676" />
          </LinearGradient>
        </Defs>

        {/* Trend Line */}
        <Path
          d="
            M10 135
            C40 120,60 110,90 95
            C120 82,150 78,180 70
            C210 60,240 52,270 42
            C300 35,320 28,330 22
          "
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current Point */}
        <Circle
          cx="330"
          cy="22"
          r="7"
          fill="#00E676"
        />

        {/* Glow */}
        <Circle
          cx="330"
          cy="22"
          r="12"
          fill="rgba(0,230,118,0.18)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
    height: 170,
    justifyContent: "center",
    alignItems: "center",
  },
});