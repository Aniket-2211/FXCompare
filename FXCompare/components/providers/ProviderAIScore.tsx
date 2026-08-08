import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Ionicons,
} from "@expo/vector-icons";

import AnimatedProgressBar from "../AnimatedProgressBar";

type Reason = {
  id: string;
  label: string;
  icon?: string;
};

type Breakdown = {
  payout: number;
  fee: number;
  speed: number;
  rating: number;
  reliability: number;
};

type Props = {
  score: number;
  confidence: number;
  reasons: Reason[];
  breakdown: Breakdown;
  savings: number;
};

const clamp = (value: number) =>
  Math.max(
    0,
    Math.min(
      Number.isFinite(value) ? value : 0,
      100
    )
  );

export default function ProviderAIScore({
  score,
  confidence,
  reasons,
  breakdown,
  savings,
}: Props) {
  const safeScore = clamp(score);
  const safeConfidence = clamp(confidence);
  const safeReasons = Array.isArray(reasons)
    ? reasons
    : [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.aiIcon}>
          <Ionicons
            name="sparkles"
            size={22}
            color="#2FE58C"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            FXCOMPARE INTELLIGENCE
          </Text>
          <Text style={styles.title}>
            Provider Analysis
          </Text>
        </View>

        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>
            {Math.round(safeScore)}
          </Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
      </View>

      <View style={styles.confidenceBox}>
        <View style={styles.confidenceHeader}>
          <Text style={styles.confidenceLabel}>
            Recommendation Confidence
          </Text>
          <Text style={styles.confidenceValue}>
            {Math.round(safeConfidence)}%
          </Text>
        </View>
        <AnimatedProgressBar
          progress={safeConfidence}
          height={7}
        />
      </View>

      <Text style={styles.sectionTitle}>
        Score Breakdown
      </Text>

      <View style={styles.breakdownCard}>
        <BreakdownRow icon="wallet-outline" label="Payout" value={breakdown?.payout ?? 0} weight="40%" />
        <BreakdownRow icon="pricetag-outline" label="Fees" value={breakdown?.fee ?? 0} weight="20%" />
        <BreakdownRow icon="flash-outline" label="Speed" value={breakdown?.speed ?? 0} weight="15%" />
        <BreakdownRow icon="star-outline" label="Rating" value={breakdown?.rating ?? 0} weight="15%" />
        <BreakdownRow icon="shield-checkmark-outline" label="Reliability" value={breakdown?.reliability ?? 0} weight="10%" last />
      </View>

      {safeReasons.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>
            Why FXCompare Recommends It
          </Text>
          <View style={styles.reasonsCard}>
            {safeReasons.map((reason, index) => (
              <View
                key={reason.id ?? `${reason.label}-${index}`}
                style={[
                  styles.reasonRow,
                  index < safeReasons.length - 1 && styles.reasonDivider,
                ]}
              >
                <Ionicons
                  name={(reason.icon as keyof typeof Ionicons.glyphMap) ?? "checkmark-circle-outline"}
                  size={18}
                  color="#2FE58C"
                />
                <Text style={styles.reasonText}>
                  {reason.label}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {savings > 0 ? (
        <View style={styles.savingsCard}>
          <Ionicons
            name="trending-up"
            size={21}
            color="#2FE58C"
          />
          <Text style={styles.savingsText}>
            Estimated advantage: {savings.toFixed(2)} more than the lowest payout
          </Text>
        </View>
      ) : null}
    </View>
  );
}

type BreakdownRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  weight: string;
  last?: boolean;
};

function BreakdownRow({
  icon,
  label,
  value,
  weight,
  last = false,
}: BreakdownRowProps) {
  const safeValue = clamp(value);

  return (
    <View style={[styles.breakdownRow, !last && styles.breakdownDivider]}>
      <View style={styles.breakdownLeft}>
        <Ionicons
          name={icon}
          size={17}
          color="#64AFFF"
        />
        <View style={{ marginLeft: 8 }}>
          <Text style={styles.breakdownLabel}>{label}</Text>
          <Text style={styles.breakdownWeight}>Weight {weight}</Text>
        </View>
      </View>
      <View style={styles.progressArea}>
        <AnimatedProgressBar progress={safeValue} height={6} />
      </View>
      <Text style={styles.breakdownValue}>
        {Math.round(safeValue)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0E2C43",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(47,229,140,0.32)",
    padding: 16,
    marginTop: 16,
    marginBottom: 22,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  aiIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(47,229,140,0.10)",
  },
  headerText: {
    flex: 1,
    marginLeft: 11,
  },
  eyebrow: {
    color: "#2FE58C",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },
  scoreBadge: {
    minWidth: 68,
    height: 50,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    backgroundColor: "rgba(47,229,140,0.10)",
    paddingTop: 13,
  },
  scoreValue: {
    color: "#2FE58C",
    fontSize: 20,
    fontWeight: "900",
  },
  scoreMax: {
    color: "#799488",
    fontSize: 8,
    fontWeight: "700",
    marginLeft: 1,
  },
  confidenceBox: {
    backgroundColor: "#16344C",
    borderRadius: 18,
    padding: 13,
    marginTop: 15,
  },
  confidenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  confidenceLabel: {
    color: "#D5E2EA",
    fontSize: 11,
    fontWeight: "800",
  },
  confidenceValue: {
    color: "#64AFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 17,
    marginBottom: 10,
  },
  breakdownCard: {
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingHorizontal: 12,
  },
  breakdownRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
  },
  breakdownDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#295069",
  },
  breakdownLeft: {
    width: 110,
    flexDirection: "row",
    alignItems: "center",
  },
  breakdownLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  breakdownWeight: {
    color: "#6F8DA2",
    fontSize: 7,
    marginTop: 2,
  },
  progressArea: {
    flex: 1,
    marginHorizontal: 8,
  },
  breakdownValue: {
    width: 30,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
  },
  reasonsCard: {
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingHorizontal: 12,
  },
  reasonRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
  },
  reasonDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#295069",
  },
  reasonText: {
    flex: 1,
    color: "#C0D0DB",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 9,
  },
  savingsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(47,229,140,0.07)",
    borderRadius: 17,
    padding: 12,
    marginTop: 14,
  },
  savingsText: {
    flex: 1,
    color: "#2FE58C",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 9,
  },
});