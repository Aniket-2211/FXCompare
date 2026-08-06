import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";

type Props = {
  title: string;
  currency: string;
  currencyName: string;
  flag: string;
  amount: string;
  convertedAmount: string;
  onPress?: () => void;
};

export default function CurrencyInputCard({
  title,
  currency,
  currencyName,
  flag,
  amount,
  convertedAmount,
  onPress,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Pressable
        style={styles.card}
        onPress={onPress}
      >
        {/* Currency Selector */}

        <View style={styles.topRow}>
          <View style={styles.currencyContainer}>
            <View style={styles.flagContainer}>
              <Text style={styles.flag}>{flag}</Text>
            </View>

            <View style={styles.currencyInfo}>
              <Text style={styles.currency}>
                {currency}
              </Text>

              <Text style={styles.currencyName}>
                {currencyName}
              </Text>
            </View>
          </View>

          <Text style={styles.arrow}>⌄</Text>
        </View>

        {/* Amount */}

        <Text style={styles.amount}>
          {amount}
        </Text>

        {/* Estimate */}

        <View style={styles.footer}>
          <Text style={styles.estimateLabel}>
            Estimated Value
          </Text>

          <Text style={styles.estimate}>
            ≈ {convertedAmount}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

  title: {
    color: "#8FA7C5",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 6,
  },

  card: {
    backgroundColor: "#102842",

    borderRadius: 30,

    padding: 22,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",

    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 20,

    elevation: 10,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  currencyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  flagContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,

    backgroundColor: "#183A5A",

    justifyContent: "center",
    alignItems: "center",
  },

  flag: {
    fontSize: 28,
  },

  currencyInfo: {
    marginLeft: 14,
  },

  currency: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },

  currencyName: {
    marginTop: 2,
    color: "#8FA7C5",
    fontSize: 14,
  },

  arrow: {
    color: "#8FA7C5",
    fontSize: 24,
  },

  amount: {
    marginTop: 28,
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -1,
  },

  footer: {
    marginTop: 22,

    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",

    paddingTop: 16,
  },

  estimateLabel: {
    color: "#8FA7C5",
    fontSize: 13,
  },

  estimate: {
    marginTop: 4,
    color: "#00E676",
    fontSize: 20,
    fontWeight: "700",
  },
});