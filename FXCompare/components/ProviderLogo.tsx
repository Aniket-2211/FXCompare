import React from "react";
import {
  Image,
  StyleSheet,
  View,
} from "react-native";

const providerLogos = {
  Wise: require("../assets/providers/wise.png"),
  Revolut: require("../assets/providers/revolut.png"),
  PayPal: require("../assets/providers/paypal.png"),
  Remitly: require("../assets/providers/remitly.png"),
  OFX: require("../assets/providers/ofx.png"),
};

type Props = {
  provider: string;
  size?: number;
};

export default function ProviderLogo({
  provider,
  size = 46,
}: Props) {
  const logo =
    providerLogos[
      provider as keyof typeof providerLogos
    ];

  if (!logo) {
    return (
      <View
        style={[
          styles.placeholder,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Image
        source={logo}
        style={{
          width: size * 0.72,
          height: size * 0.72,
        }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9E6F2",
  },

  placeholder: {
    backgroundColor: "#16344C",
  },
});