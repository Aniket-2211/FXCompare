import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AnimatedCard from "./AnimatedCard";
import AnimatedNumber from "./AnimatedNumber";
import AnimatedProgressBar from "./AnimatedProgressBar";
import ProviderLogo from "./ProviderLogo";

export type RecommendationReason = {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

type Props = {
  providerName?: string;
  score?: number;
  rating?: number;
  finalAmount?: number;
  fee?: number;
  deliveryTime?: string;
  savings?: number;
  currency?: string;
  reasons?: RecommendationReason[];
  loading?: boolean;
  onPress?: () => void;
};

const safeNumber = (
  value: number | undefined,
  fallback = 0
) => {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : fallback;
};

const clampScore = (value: number) =>
  Math.max(0, Math.min(value, 100));

const getScoreLabel = (score: number) => {
  if (score >= 90) return "Outstanding";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  return "Fair";
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "#2FE58C";
  if (score >= 65) return "#64AFFF";
  return "#FFD65A";
};

export default function RecommendationCard({
  providerName = "Provider",
  score = 0,
  rating = 0,
  finalAmount = 0,
  fee = 0,
  deliveryTime = "--",
  savings = 0,
  currency = "",
  reasons = [],
  loading = false,
  onPress,
}: Props) {
  const safeScore = clampScore(
    safeNumber(score)
  );
  const safeRating = safeNumber(rating);
  const safeFinalAmount =
    safeNumber(finalAmount);
  const safeFee = safeNumber(fee);
  const safeSavings = Math.max(
    safeNumber(savings),
    0
  );
  const safeReasons = Array.isArray(reasons)
    ? reasons
    : [];

  const scoreLabel =
    getScoreLabel(safeScore);
  const scoreColor =
    getScoreColor(safeScore);

  return (
    <AnimatedCard
      style={styles.card}
      delay={100}
      duration={520}
    >
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.topRow}>
        <View style={styles.bestBadge}>
          <Ionicons
            name="trophy"
            size={15}
            color="#062014"
          />
          <Text style={styles.bestBadgeText}>
            BEST OVERALL
          </Text>
        </View>

        <View style={styles.verifiedBadge}>
          <Ionicons
            name="shield-checkmark"
            size={14}
            color="#64AFFF"
          />
          <Text style={styles.verifiedText}>
            VERIFIED
          </Text>
        </View>
      </View>

      <View style={styles.providerSection}>
        <View style={styles.logoOuter}>
          <ProviderLogo
            provider={providerName}
            size={62}
          />
        </View>

        <View style={styles.providerInfo}>
          <Text
            style={styles.providerName}
            numberOfLines={1}
          >
            {providerName}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons
              name="star"
              size={16}
              color="#FFD65A"
            />
            <Text style={styles.ratingText}>
              {safeRating.toFixed(1)}
            </Text>
            <View style={styles.ratingDivider} />
            <Text style={styles.recommendedText}>
              Recommended Provider
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.scoreCard}>
        <View style={styles.scoreCircle}>
          <AnimatedNumber
            value={safeScore}
            duration={750}
            minimumFractionDigits={0}
            maximumFractionDigits={0}
            style={[
              styles.scoreNumber,
              { color: scoreColor },
            ]}
          />
          <Text style={styles.scoreMaximum}>
            /100
          </Text>
        </View>

        <View style={styles.scoreContent}>
          <View style={styles.scoreHeader}>
            <View>
              <Text style={styles.scoreTitle}>
                FXCompare Score
              </Text>
              <Text
                style={[
                  styles.scoreLabel,
                  { color: scoreColor },
                ]}
              >
                {scoreLabel}
              </Text>
            </View>
            <Ionicons
              name="analytics-outline"
              size={22}
              color={scoreColor}
            />
          </View>

          <AnimatedProgressBar
            progress={safeScore}
            height={7}
          />

          <Text style={styles.scoreDescription}>
            Based on payout, fees, delivery speed and provider reliability.
          </Text>
        </View>
      </View>

      <View style={styles.receiveCard}>
        <View style={styles.receiveLeft}>
          <Text style={styles.receiveLabel}>
            Estimated Amount Received
          </Text>
          <View style={styles.amountRow}>
            <AnimatedNumber
              value={safeFinalAmount}
              duration={850}
              minimumFractionDigits={2}
              maximumFractionDigits={2}
              style={styles.receiveAmount}
            />
            <Text style={styles.receiveCurrency}>
              {currency}
            </Text>
          </View>
          <Text style={styles.receiveCaption}>
            After estimated provider fee
          </Text>
        </View>

        <View style={styles.receiveIcon}>
          <Ionicons
            name="arrow-down"
            size={25}
            color="#062014"
          />
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <MetricItem
          icon="pricetag-outline"
          label="Estimated Fee"
          value={safeFee}
          suffix={` ${currency}`}
          color="#FFD65A"
        />
        <View style={styles.metricDivider} />
        <MetricItem
          icon="time-outline"
          label="Transfer Time"
          textValue={deliveryTime}
          color="#64AFFF"
        />
        <View style={styles.metricDivider} />
        <MetricItem
          icon="wallet-outline"
          label="Estimated Savings"
          value={safeSavings}
          suffix={` ${currency}`}
          color="#2FE58C"
        />
      </View>

      <View style={styles.savingsCard}>
        <View style={styles.savingsIcon}>
          <Ionicons
            name="trending-up"
            size={21}
            color="#2FE58C"
          />
        </View>
        <View style={styles.savingsContent}>
          <Text style={styles.savingsLabel}>
            You could receive
          </Text>
          <View style={styles.savingsAmountRow}>
            <AnimatedNumber
              value={safeSavings}
              duration={750}
              minimumFractionDigits={2}
              maximumFractionDigits={2}
              style={styles.savingsAmount}
            />
            <Text style={styles.savingsCurrency}>
              {currency} more
            </Text>
          </View>
        </View>
        <Ionicons
          name="sparkles"
          size={23}
          color="#2FE58C"
        />
      </View>

      <View style={styles.reasonsSection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Why we recommend it
            </Text>
            <Text style={styles.sectionSubtitle}>
              Key advantages for this transfer
            </Text>
          </View>

          <View style={styles.reasonCountBadge}>
            <Text style={styles.reasonCountText}>
              {safeReasons.length}
            </Text>
          </View>
        </View>

        <View style={styles.reasonsList}>
          {safeReasons.length > 0 ? (
            safeReasons.map((reason, index) => (
              <View
                key={reason.id}
                style={[
                  styles.reasonRow,
                  index < safeReasons.length - 1 &&
                    styles.reasonDivider,
                ]}
              >
                <View style={styles.reasonIcon}>
                  <Ionicons
                    name={
                      reason.icon ??
                      "checkmark-circle"
                    }
                    size={18}
                    color="#2FE58C"
                  />
                </View>
                <Text style={styles.reasonText}>
                  {reason.label}
                </Text>
                <Ionicons
                  name="checkmark"
                  size={17}
                  color="#2FE58C"
                />
              </View>
            ))
          ) : (
            <View style={styles.emptyReasons}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color="#64AFFF"
              />
              <Text style={styles.emptyReasonsText}>
                Recommendation details will appear after provider results are calculated.
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        disabled={loading || !onPress}
        style={[
          styles.chooseButton,
          (loading || !onPress) &&
            styles.disabledButton,
        ]}
        onPress={onPress}
      >
        <View style={styles.buttonIconBox}>
          <Ionicons
            name={
              loading
                ? "hourglass-outline"
                : "arrow-forward"
            }
            size={19}
            color="#FFFFFF"
          />
        </View>
        <Text style={styles.chooseButtonText}>
          {loading
            ? "Loading Recommendation..."
            : `View ${providerName} Details`}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={19}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <View style={styles.noticeRow}>
        <Ionicons
          name="information-circle-outline"
          size={15}
          color="#7894A7"
        />
        <Text style={styles.noticeText}>
          Provider estimates may change before the transfer is completed.
        </Text>
      </View>
    </AnimatedCard>
  );
}

type MetricItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: number;
  textValue?: string;
  suffix?: string;
  color: string;
};

function MetricItem({
  icon,
  label,
  value,
  textValue,
  suffix = "",
  color,
}: MetricItemProps) {
  const numericValue = safeNumber(value);

  return (
    <View style={styles.metricItem}>
      <View
        style={[
          styles.metricIcon,
          {
            backgroundColor:
              `${color}18`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={color}
        />
      </View>
      <Text style={styles.metricLabel}>
        {label}
      </Text>

      {typeof value === "number" ? (
        <View style={styles.metricValueRow}>
          <AnimatedNumber
            value={numericValue}
            duration={700}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
            style={[
              styles.metricValue,
              { color },
            ]}
          />
          <Text
            style={[
              styles.metricSuffix,
              { color },
            ]}
          >
            {suffix}
          </Text>
        </View>
      ) : (
        <Text
          style={[
            styles.metricTextValue,
            { color },
          ]}
          numberOfLines={1}
        >
          {textValue ?? "--"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    backgroundColor: "#0E2C43",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(47,229,140,0.45)",
    padding: 18,
    marginBottom: 22,
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    top: -130,
    right: -105,
    backgroundColor: "rgba(47,229,140,0.08)",
  },
  glowBottom: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    bottom: -120,
    left: -100,
    backgroundColor: "rgba(22,135,232,0.06)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bestBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2FE58C",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  bestBadgeText: {
    color: "#062014",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginLeft: 6,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(100,175,255,0.12)",
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  verifiedText: {
    color: "#64AFFF",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginLeft: 5,
  },
  providerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 19,
  },
  logoOuter: {
    width: 74,
    height: 74,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#173A51",
    borderWidth: 1,
    borderColor: "rgba(47,229,140,0.35)",
  },
  providerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  providerName: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },
  ratingDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#31526A",
    marginHorizontal: 8,
  },
  recommendedText: {
    flex: 1,
    color: "#2FE58C",
    fontSize: 10,
    fontWeight: "700",
  },
  scoreCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 19,
    padding: 14,
    marginTop: 18,
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    backgroundColor: "rgba(47,229,140,0.10)",
    borderWidth: 2,
    borderColor: "rgba(47,229,140,0.30)",
    paddingTop: 20,
  },
  scoreNumber: {
    fontSize: 23,
    fontWeight: "900",
  },
  scoreMaximum: {
    color: "#819B8F",
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 1,
  },
  scoreContent: {
    flex: 1,
    marginLeft: 14,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  scoreTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
  },
  scoreDescription: {
    color: "#7894A7",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 7,
  },
  receiveCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(47,229,140,0.08)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(47,229,140,0.25)",
    padding: 16,
    marginTop: 13,
  },
  receiveLeft: {
    flex: 1,
    paddingRight: 12,
  },
  receiveLabel: {
    color: "#A5BEAF",
    fontSize: 10,
    fontWeight: "600",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    marginTop: 5,
  },
  receiveAmount: {
    color: "#2FE58C",
    fontSize: 27,
    fontWeight: "900",
  },
  receiveCurrency: {
    color: "#2FE58C",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },
  receiveCaption: {
    color: "#779386",
    fontSize: 9,
    marginTop: 4,
  },
  receiveIcon: {
    width: 47,
    height: 47,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2FE58C",
  },
  metricsGrid: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#16344C",
    borderRadius: 19,
    paddingVertical: 14,
    paddingHorizontal: 7,
    marginTop: 13,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    color: "#829CAF",
    fontSize: 8,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 7,
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  metricSuffix: {
    fontSize: 7,
    fontWeight: "800",
    marginLeft: 2,
  },
  metricTextValue: {
    maxWidth: "100%",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 5,
  },
  metricDivider: {
    width: 1,
    backgroundColor: "#295069",
    marginVertical: 4,
  },
  savingsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(47,229,140,0.07)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(47,229,140,0.20)",
    padding: 13,
    marginTop: 13,
  },
  savingsIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(47,229,140,0.12)",
  },
  savingsContent: {
    flex: 1,
    marginLeft: 11,
  },
  savingsLabel: {
    color: "#A5BEAF",
    fontSize: 9,
    fontWeight: "600",
  },
  savingsAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    marginTop: 3,
  },
  savingsAmount: {
    color: "#2FE58C",
    fontSize: 18,
    fontWeight: "900",
  },
  savingsCurrency: {
    color: "#2FE58C",
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 4,
  },
  reasonsSection: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: "#829CAF",
    fontSize: 9,
    marginTop: 4,
  },
  reasonCountBadge: {
    minWidth: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
    borderWidth: 1,
    borderColor: "#21516E",
  },
  reasonCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  reasonsList: {
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingHorizontal: 13,
    marginTop: 12,
  },
  reasonRow: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
  },
  reasonDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#295069",
  },
  reasonIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(47,229,140,0.10)",
  },
  reasonText: {
    flex: 1,
    color: "#C0D0DB",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 15,
    marginHorizontal: 10,
  },
  emptyReasons: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
  },
  emptyReasonsText: {
    flex: 1,
    color: "#829CAF",
    fontSize: 10,
    lineHeight: 15,
    marginLeft: 9,
  },
  chooseButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1687E8",
    borderRadius: 18,
    paddingHorizontal: 13,
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.55,
  },
  buttonIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  chooseButtonText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    marginHorizontal: 10,
  },
  noticeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 12,
  },
  noticeText: {
    flex: 1,
    color: "#7894A7",
    fontSize: 9,
    lineHeight: 14,
    marginLeft: 6,
  },
});