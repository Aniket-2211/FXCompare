import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import ProviderCard from "./ProviderCard";

export default function ProviderComparisonSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Compare Providers
      </Text>

      <Text style={styles.subHeading}>
        Providers are ranked using the latest
        exchange rates, estimated transfer fees,
        transfer speed and overall value.
      </Text>

      <ProviderCard
        rank={1}
        provider="Wise"
        rate="1 USD = 86.42 INR"
        fee="₹0"
        recipientGets="₹86,420"
        transferTime="Within minutes"
        rating={4.9}
        recommended
      />

      <ProviderCard
        rank={2}
        provider="Revolut"
        rate="1 USD = 86.28 INR"
        fee="₹85"
        recipientGets="₹86,195"
        transferTime="Same day"
        rating={4.8}
      />

      <ProviderCard
        rank={3}
        provider="OFX"
        rate="1 USD = 86.11 INR"
        fee="₹120"
        recipientGets="₹86,000"
        transferTime="1–2 business days"
        rating={4.7}
      />

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>
          Comparison Method
        </Text>

        <Text style={styles.footerText}>
          Rankings are generated automatically
          using publicly available exchange
          rates together with estimated provider
          fees and transfer speed.
        </Text>

        <Text style={styles.footerText}>
          Actual rates and fees may vary at the
          time of your transfer.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },

  heading: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },

  subHeading: {
    color: "#8FA7C5",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    marginBottom: 10,
  },

  footer: {
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 22,
    padding: 18,
  },

  footerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },

  footerText: {
    color: "#8FA7C5",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
});