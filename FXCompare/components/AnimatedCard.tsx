// components/AnimatedCard.tsx

import React, {
  ReactNode,
  useEffect,
} from "react";

import {
  StyleProp,
  ViewStyle,
} from "react-native";

import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from "react-native-reanimated";

type Props = {
  children: ReactNode;

  style?: StyleProp<ViewStyle>;

  delay?: number;

  duration?: number;
};

export default function AnimatedCard({
  children,

  style,

  delay = 0,

  duration = 450,
}: Props) {
  useEffect(() => {}, []);

  return (
    <Animated.View
      entering={SlideInUp
        .delay(delay)
        .duration(duration)}
      exiting={SlideOutDown.duration(
        250
      )}
      layout={FadeIn.duration(250)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}