// components/SkeletonLoader.tsx

import React, {
  useEffect,
} from "react";
import {
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Props = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export default function SkeletonLoader({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}: Props) {
  const progress =
    useSharedValue(0);

  useEffect(() => {
    progress.value =
      withRepeat(
        withTiming(1, {
          duration: 1100,
        }),
        -1,
        true
      );
  }, [progress]);

  const animatedStyle =
    useAnimatedStyle(() => {
      const opacity =
        interpolate(
          progress.value,
          [0, 1],
          [0.35, 0.75]
        );

      return {
        opacity,
      };
    });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles =
  StyleSheet.create({
    skeleton: {
      backgroundColor:
        "#24465D",
      overflow: "hidden",
    },
  });