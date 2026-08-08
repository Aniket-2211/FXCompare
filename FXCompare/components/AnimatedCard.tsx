import React, {
  ReactNode,
} from "react";

import {
  StyleProp,
  ViewStyle,
} from "react-native";

import Animated, {
  LinearTransition,
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
  return (
    <Animated.View
      entering={SlideInUp
        .delay(delay)
        .duration(duration)}
      exiting={SlideOutDown.duration(
        250
      )}
      layout={LinearTransition.duration(
        250
      )}
      style={style}
    >
      {children}
    </Animated.View>
  );
}