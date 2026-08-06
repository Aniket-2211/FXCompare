import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

type Props = {
  provider: string;
  savings: string;
  confidence: number;
};

export default function RecommendationCard({
  provider,
  savings,
  confidence,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          FXCompare Recommendation
        </Text>

        <View style={styles.liveBadge}>
          <View style={styles.dot} />
          <Text style={styles.liveText}>
            LIVE
          </Text>
        </View>
      </View>

      <View style={styles.providerContainer}>
        <Text style={styles.crown}>
          🏆
        </Text>

        <View style={styles.providerInfo}>
          <Text style={styles.provider}>
            {provider}
          </Text>

          <Text style={styles.reason}>
            Best overall value today
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.label}>
            Estimated Savings
          </Text>

          <Text style={styles.green}>
            ₹{savings}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={styles.label}>
            Confidence
          </Text>

          <Text style={styles.blue}>
            {confidence}%
          </Text>
        </View>
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.message}>
          Based on the latest exchange rates and
          estimated transfer fees,{" "}
          <Text style={styles.bold}>
            {provider}
          </Text>{" "}
          is currently expected to provide the
          highest recipient amount for this
          transfer.
        </Text>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>
          Please Note
        </Text>

        <Text style={styles.noticeText}>
          Exchange rates, provider fees and
          promotions may change at any time.
          Rankings are calculated automatically
          using publicly available market data
          and estimated costs.
        </Text>

        <Text style={styles.noticeText}>
          This recommendation is provided to help
          you compare available options.
          The final provider you choose is
          completely your decision.
        </Text>

        <Text style={styles.noticeText}>
          FXCompare does not guarantee savings or
          financial outcomes. Please verify all
          details with your selected provider
          before completing a transfer.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    backgroundColor: "#102842",
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,230,118,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00E676",
    marginRight: 6,
  },

  liveText: {
    color: "#00E676",
    fontWeight: "700",
    fontSize: 12,
  },

  providerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },

  crown: {
    fontSize: 34,
  },

  providerInfo: {
    marginLeft: 16,
  },

  provider: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },

  reason: {
    marginTop: 3,
    color: "#8FA7C5",
    fontSize: 15,
  },

  stats: {
    flexDirection: "row",
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    paddingVertical: 18,
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  divider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  label: {
    color: "#8FA7C5",
    fontSize: 13,
    marginBottom: 6,
  },

  green: {
    color: "#00E676",
    fontSize: 24,
    fontWeight: "800",
  },

  blue: {
    color: "#2E79FF",
    fontSize: 24,
    fontWeight: "800",
  },

  messageBox: {
    marginTop: 22,
    backgroundColor: "rgba(46,121,255,0.08)",
    borderRadius: 18,
    padding: 16,
  },

  message: {
    color: "#D7E4F7",
    fontSize: 15,
    lineHeight: 24,
  },

  bold: {
    fontWeight: "800",
    color: "#FFFFFF",
  },

  notice: {
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 18,
  },

  noticeTitle: {
    color: "#FFD166",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },

  noticeText: {
    color: "#8FA7C5",
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 10,
  },
});