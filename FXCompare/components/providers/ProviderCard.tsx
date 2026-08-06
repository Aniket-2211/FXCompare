import React from "react";
import {
  View,
 Text,
  StyleSheet,
  Pressable,
} from "react-native";

type Props = {
  rank: number;
  provider: string;
  rate: string;
  fee: string;
  recipientGets: string;
  transferTime: string;
  rating: number;
  recommended?: boolean;
  onPress?: () => void;
};

export default function ProviderCard({
  rank,
  provider,
  rate,
  fee,
  recipientGets,
  transferTime,
  rating,
  recommended = false,
  onPress,
}: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {recommended && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BEST VALUE</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.rankCircle}>
          <Text style={styles.rank}>{rank}</Text>
        </View>

        <View style={styles.providerInfo}>
          <Text style={styles.provider}>{provider}</Text>
          <Text style={styles.time}>{transferTime}</Text>
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.star}>⭐</Text>
          <Text style={styles.rating}>{rating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Exchange Rate</Text>
        <Text style={styles.value}>{rate}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Transfer Fee</Text>
        <Text style={styles.value}>{fee}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Recipient Gets</Text>
        <Text style={styles.recipient}>{recipientGets}</Text>
      </View>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Compare Details</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#102842",
    borderRadius: 26,
    padding: 20,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#00C853",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 16,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 11,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  rankCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1B436A",
    justifyContent: "center",
    alignItems: "center",
  },

  rank: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  providerInfo: {
    flex: 1,
    marginLeft: 14,
  },

  provider: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  time: {
    marginTop: 3,
    color: "#8FA7C5",
    fontSize: 13,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  star: {
    fontSize: 16,
  },

  rating: {
    color: "#FFFFFF",
    marginLeft: 4,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 18,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  label: {
    color: "#8FA7C5",
    fontSize: 14,
  },

  value: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  recipient: {
    color: "#00E676",
    fontSize: 18,
    fontWeight: "800",
  },

  button: {
    marginTop: 18,
    backgroundColor: "#2E79FF",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});