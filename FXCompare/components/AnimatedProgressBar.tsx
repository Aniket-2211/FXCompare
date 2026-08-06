// components/AnimatedProgressBar.tsx

import React, {
  useEffect,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  progress: number;
  height?: number;
};

export default function AnimatedProgressBar({
  progress,
  height = 8,
}: Props) {
  const width =
    useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(
      Math.max(
        0,
        Math.min(progress, 100)
      ),
      {
        duration: 700,
      }
    );
  }, [progress]);

  const animatedStyle =
    useAnimatedStyle(() => ({
      width: `${width.value}%`,
    }));

  return (
    <View
      style={[
        styles.track,
        {
          height,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    track: {
      width: "100%",
      backgroundColor:
        "#18364C",
      borderRadius: 100,
      overflow: "hidden",
    },

    fill: {
      height: "100%",
      backgroundColor:
        "#2FE58C",
      borderRadius: 100,
    },
  });