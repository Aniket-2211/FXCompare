// components/AnimatedNumber.tsx

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleProp,
  TextStyle,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  style?: StyleProp<TextStyle>;
};

const formatValue = (
  value: number,
  minimumFractionDigits: number,
  maximumFractionDigits: number
) => {
  if (!Number.isFinite(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

export default function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 700,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
  style,
}: Props) {
  const safeValue = Number.isFinite(value)
    ? value
    : 0;

  const animatedValue =
    useSharedValue(safeValue);

  const previousValue =
    useRef(safeValue);

  const [
    displayValue,
    setDisplayValue,
  ] = useState(safeValue);

  const formattedValue = useMemo(
    () =>
      formatValue(
        displayValue,
        minimumFractionDigits,
        maximumFractionDigits
      ),
    [
      displayValue,
      minimumFractionDigits,
      maximumFractionDigits,
    ]
  );

  useEffect(() => {
    animatedValue.value =
      previousValue.current;

    animatedValue.value =
      withTiming(safeValue, {
        duration,
        easing: Easing.out(
          Easing.cubic
        ),
      });

    previousValue.current =
      safeValue;
  }, [
    animatedValue,
    duration,
    safeValue,
  ]);

  useAnimatedReaction(
    () => animatedValue.value,
    (
      currentValue,
      previousAnimatedValue
    ) => {
      if (
        currentValue !==
        previousAnimatedValue
      ) {
        runOnJS(
          setDisplayValue
        )(currentValue);
      }
    }
  );

  return (
    <Animated.Text style={style}>
      {prefix}
      {formattedValue}
      {suffix}
    </Animated.Text>
  );
}