import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

export default function SwapButton() {
  const rotate = useRef(new Animated.Value(0)).current;

  const press = () => {
    Animated.sequence([
      Animated.timing(rotate, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <Pressable onPress={press} style={styles.wrapper}>
      <Animated.View
        style={[
          styles.button,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <Text style={styles.icon}>⇅</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginVertical: 18,
    zIndex: 10,
  },

  button: {
    width: 62,
    height: 62,
    borderRadius: 31,

    backgroundColor: "#183B61",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    shadowColor: "#000",
    shadowOpacity: 0.30,
    shadowRadius: 18,
    elevation: 10,
  },

  icon: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
});