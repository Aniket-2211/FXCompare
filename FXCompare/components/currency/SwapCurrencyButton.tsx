import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  Text,
} from "react-native";

export default function SwapCurrencyButton() {
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const onSwap = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(rotation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotation.setValue(0);
    });
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.shadow,
          {
            transform: [
              { scale },
              { rotate },
            ],
          },
        ]}
      >
        <Pressable
          style={styles.button}
          onPress={onSwap}
        >
          <Text style={styles.icon}>⇅</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginVertical: 22,
    zIndex: 50,
  },

  shadow: {
    shadowColor: "#2E79FF",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 14,
  },

  button: {
    width: 72,
    height: 72,
    borderRadius: 36,

    backgroundColor: "#1C4E80",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  icon: {
    fontSize: 30,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});