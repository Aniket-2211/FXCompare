import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  name: string;
  rate: number;
  fee: number;
  finalAmount: number;
  recommended?: boolean;
  deliveryTime?: string;
  rating?: number;
  paymentMethods?: string[];
  onPress?: () => void;
};

const formatNumber = (
  value: number,
  maximumFractionDigits = 2
) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value);

const providerIcons: Record<
  string,
  keyof typeof Ionicons.glyphMap
> = {
  Wise: "flash-outline",
  Remitly: "send-outline",
  PayPal: "wallet-outline",
  Revolut: "card-outline",
  OFX: "business-outline",
};

export default function ProviderComparisonCard({
  name,
  rate,
  fee,
  finalAmount,
  recommended = false,
  deliveryTime = "Varies",
  rating = 4.5,
  paymentMethods = [
    "Bank Transfer",
    "Debit Card",
  ],
  onPress,
}: Props) {
  const [expanded, setExpanded] =
    useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut
    );

    setExpanded((current) => !current);
  };

  const providerIcon =
    providerIcons[name] ??
    "business-outline";

  return (
    <View
      style={[
        styles.card,
        recommended &&
          styles.recommendedCard,
      ]}
    >
      {recommended ? (
        <View style={styles.bestRibbon}>
          <Ionicons
            name="trophy"
            size={13}
            color="#062014"
          />

          <Text style={styles.bestRibbonText}>
            BEST VALUE
          </Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <View style={styles.providerRow}>
          <View style={styles.logoBox}>
            <Ionicons
              name={providerIcon}
              size={24}
              color={
                recommended
                  ? "#2FE58C"
                  : "#64AFFF"
              }
            />
          </View>

          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>
              {name}
            </Text>

            <View style={styles.ratingRow}>
              <Ionicons
                name="star"
                size={14}
                color="#FFD65A"
              />

              <Text style={styles.ratingText}>
                {rating.toFixed(1)}
              </Text>

              <Text style={styles.ratingLabel}>
                Provider rating
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.deliveryBadge}>
          <Ionicons
            name="time-outline"
            size={14}
            color="#9FB6C9"
          />

          <Text style={styles.deliveryText}>
            {deliveryTime}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>
            Rate
          </Text>

          <Text style={styles.statValue}>
            {formatNumber(rate, 4)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={styles.statLabel}>
            Fee
          </Text>

          <Text style={styles.statValue}>
            ₹{formatNumber(fee)}
          </Text>
        </View>
      </View>

      <View style={styles.receiveBox}>
        <View>
          <Text style={styles.receiveLabel}>
            You’ll Receive
          </Text>

          <Text style={styles.receiveAmount}>
            ₹{formatNumber(finalAmount)}
          </Text>
        </View>

        <Ionicons
          name="checkmark-circle"
          size={30}
          color={
            recommended
              ? "#2FE58C"
              : "#64AFFF"
          }
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.expandButton}
        onPress={toggleExpanded}
      >
        <Text style={styles.expandText}>
          {expanded
            ? "Hide Details"
            : "View Details"}
        </Text>

        <Ionicons
          name={
            expanded
              ? "chevron-up"
              : "chevron-down"
          }
          size={18}
          color="#64AFFF"
        />
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.details}>
          <Text style={styles.detailsTitle}>
            Payment Methods
          </Text>

          <View style={styles.methodsWrap}>
            {paymentMethods.map((method) => (
              <View
                key={method}
                style={styles.methodChip}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={15}
                  color="#2FE58C"
                />

                <Text style={styles.methodText}>
                  {method}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Transfer Speed
            </Text>

            <Text style={styles.detailValue}>
              {deliveryTime}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Security
            </Text>

            <Text style={styles.detailValue}>
              Verified provider
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.continueButton,
              recommended &&
                styles.recommendedButton,
            ]}
            onPress={onPress}
          >
            <Text style={styles.continueText}>
              Continue with {name}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    backgroundColor: "#0E2C43",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 18,
    marginBottom: 14,
    overflow: "hidden",
  },

  recommendedCard: {
    borderColor: "#2FE58C",
    backgroundColor: "#0E3045",
  },

  bestRibbon: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2FE58C",
    borderBottomLeftRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  bestRibbonText: {
    color: "#062014",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginLeft: 5,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },

  providerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  logoBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#173A51",
    borderWidth: 1,
    borderColor: "#23526C",
  },

  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  providerName: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  ratingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 4,
  },

  ratingLabel: {
    color: "#829CAF",
    fontSize: 10,
    marginLeft: 6,
  },

  deliveryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  deliveryText: {
    color: "#B0C2D0",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 17,
    padding: 14,
    marginTop: 18,
  },

  stat: {
    flex: 1,
  },

  statLabel: {
    color: "#829CAF",
    fontSize: 11,
    marginBottom: 6,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  divider: {
    width: 1,
    height: 36,
    backgroundColor: "#295069",
    marginHorizontal: 14,
  },

  receiveBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#20465E",
  },

  receiveLabel: {
    color: "#8EA7BA",
    fontSize: 12,
  },

  receiveAmount: {
    color: "#2FE58C",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 5,
  },

  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 15,
  },

  expandText: {
    color: "#64AFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  details: {
    marginTop: 16,
  },

  detailsTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },

  methodsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },

  methodChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 7,
    margin: 4,
  },

  methodText: {
    color: "#B7C9D6",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 5,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  detailLabel: {
    color: "#829CAF",
    fontSize: 12,
  },

  detailValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  continueButton: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#21628D",
    borderRadius: 16,
    marginTop: 18,
  },

  recommendedButton: {
    backgroundColor: "#1687E8",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginRight: 8,
  },
});