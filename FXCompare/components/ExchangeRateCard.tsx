// components/ExchangeRateCard.tsx

import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AnimatedCard from "./AnimatedCard";
import AnimatedNumber from "./AnimatedNumber";
import SkeletonLoader from "./SkeletonLoader";

type Props = {
  from: string;
  to: string;
  rate: number | null;
  convertedAmount?: number;
  enteredAmount?: string;
  loading?: boolean;
  error?: string | null;
  lastUpdated?: Date | null;
};

const parseAmount = (
  value: string
) => {
  const parsedValue = Number(
    value.replace(/,/g, "")
  );

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
};

export default function ExchangeRateCard({
  from,
  to,
  rate,
  convertedAmount = 0,
  enteredAmount = "0",
  loading = false,
  error = null,
  lastUpdated = null,
}: Props) {
  const validRate =
    typeof rate === "number" &&
    Number.isFinite(rate) &&
    rate > 0;

  const validConvertedAmount =
    Number.isFinite(convertedAmount) &&
    convertedAmount >= 0;

  const parsedEnteredAmount =
    parseAmount(enteredAmount);

  const formattedTime =
    lastUpdated
      ? lastUpdated.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : null;

  const statusText = error
    ? "ISSUE"
    : loading
      ? "UPDATING"
      : validRate
        ? "LIVE"
        : "CONNECTING";

  return (
    <AnimatedCard
      style={[
        styles.card,
        error && styles.errorCard,
      ]}
      duration={500}
    >
      <View style={styles.glow} />

      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            LIVE MARKET
          </Text>

          <Text style={styles.title}>
            Exchange Rate
          </Text>

          <Text style={styles.pair}>
            {from} to {to}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            error && styles.errorStatusBadge,
            loading && styles.loadingStatusBadge,
          ]}
        >
          {loading ? (
            <View style={styles.refreshIcon}>
              <Ionicons
                name="sync-outline"
                size={13}
                color="#64AFFF"
              />
            </View>
          ) : (
            <View
              style={[
                styles.statusDot,
                error && styles.errorDot,
              ]}
            />
          )}

          <Text
            style={[
              styles.statusText,
              error && styles.errorStatusText,
              loading &&
                styles.loadingStatusText,
            ]}
          >
            {statusText}
          </Text>
        </View>
      </View>

      <View style={styles.rateSection}>
        <Text style={styles.oneUnit}>
          1 {from} equals
        </Text>

        {loading && !validRate ? (
          <View style={styles.rateSkeleton}>
            <SkeletonLoader
              width="72%"
              height={40}
              borderRadius={12}
            />

            <SkeletonLoader
              width="31%"
              height={13}
              borderRadius={7}
              style={styles.secondarySkeleton}
            />
          </View>
        ) : validRate ? (
          <View style={styles.rateValueRow}>
            <AnimatedNumber
              value={rate}
              duration={750}
              minimumFractionDigits={2}
              maximumFractionDigits={4}
              style={styles.rate}
            />

            <Text style={styles.rateCurrency}>
              {to}
            </Text>
          </View>
        ) : (
          <View style={styles.rateValueRow}>
            <Text style={styles.unavailableRate}>
              --
            </Text>

            <Text style={styles.rateCurrency}>
              {to}
            </Text>
          </View>
        )}

        <View style={styles.referenceRow}>
          <Ionicons
            name="pulse-outline"
            size={14}
            color="#64AFFF"
          />

          <Text style={styles.referenceText}>
            Mid-market reference rate
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.conversionRow}>
        <View style={styles.conversionColumn}>
          <View style={styles.conversionIconBox}>
            <Ionicons
              name="arrow-up-outline"
              size={17}
              color="#64AFFF"
            />
          </View>

          <Text style={styles.conversionLabel}>
            You Send
          </Text>

          {loading &&
          parsedEnteredAmount <= 0 ? (
            <SkeletonLoader
              width="78%"
              height={20}
              borderRadius={8}
              style={styles.valueSkeleton}
            />
          ) : (
            <View style={styles.amountRow}>
              <AnimatedNumber
                value={parsedEnteredAmount}
                duration={600}
                minimumFractionDigits={0}
                maximumFractionDigits={2}
                style={styles.conversionValue}
              />

              <Text style={styles.currencyText}>
                {from}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons
            name="arrow-forward"
            size={19}
            color="#64AFFF"
          />
        </View>

        <View
          style={[
            styles.conversionColumn,
            styles.rightColumn,
          ]}
        >
          <View
            style={[
              styles.conversionIconBox,
              styles.receiveIconBox,
            ]}
          >
            <Ionicons
              name="arrow-down-outline"
              size={17}
              color="#2FE58C"
            />
          </View>

          <Text style={styles.conversionLabel}>
            Market Value
          </Text>

          {loading && !validRate ? (
            <SkeletonLoader
              width="82%"
              height={20}
              borderRadius={8}
              style={[
                styles.valueSkeleton,
                styles.rightSkeleton,
              ]}
            />
          ) : validRate &&
            validConvertedAmount ? (
            <View style={styles.amountRow}>
              <AnimatedNumber
                value={convertedAmount}
                duration={750}
                minimumFractionDigits={2}
                maximumFractionDigits={2}
                style={styles.convertedValue}
              />

              <Text
                style={[
                  styles.currencyText,
                  styles.convertedCurrency,
                ]}
              >
                {to}
              </Text>
            </View>
          ) : (
            <Text style={styles.unavailableValue}>
              -- {to}
            </Text>
          )}
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="warning-outline"
              size={18}
              color="#FF9C70"
            />
          </View>

          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : (
        <View style={styles.footerRow}>
          <View style={styles.secureRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color="#2FE58C"
            />

            <Text style={styles.footerText}>
              Secure reference data
            </Text>
          </View>

          <View style={styles.updatedRow}>
            <Ionicons
              name="time-outline"
              size={14}
              color="#7F9AAD"
            />

            <Text style={styles.updatedText}>
              {loading
                ? "Refreshing..."
                : formattedTime
                  ? `Updated ${formattedTime}`
                  : "Connecting..."}
            </Text>
          </View>
        </View>
      )}
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    backgroundColor: "#0E2C43",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 19,
    marginBottom: 16,
    overflow: "hidden",
  },

  errorCard: {
    borderColor:
      "rgba(255,156,112,0.35)",
  },

  glow: {
    position: "absolute",
    top: -100,
    right: -90,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor:
      "rgba(47,229,140,0.055)",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    color: "#64AFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
  },

  pair: {
    color: "#829CAF",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },

  statusBadge: {
    minWidth: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(47,229,140,0.12)",
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  loadingStatusBadge: {
    backgroundColor:
      "rgba(100,175,255,0.12)",
  },

  errorStatusBadge: {
    backgroundColor:
      "rgba(255,156,112,0.12)",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#2FE58C",
  },

  errorDot: {
    backgroundColor: "#FF9C70",
  },

  refreshIcon: {
    alignItems: "center",
    justifyContent: "center",
  },

  statusText: {
    color: "#2FE58C",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginLeft: 6,
  },

  loadingStatusText: {
    color: "#64AFFF",
  },

  errorStatusText: {
    color: "#FF9C70",
  },

  rateSection: {
    marginTop: 22,
  },

  oneUnit: {
    color: "#9FB6C9",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 7,
  },

  rateValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },

  rate: {
    color: "#2FE58C",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
  },

  unavailableRate: {
    color: "#6F899E",
    fontSize: 34,
    fontWeight: "900",
  },

  rateCurrency: {
    color: "#2FE58C",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
    marginBottom: 5,
  },

  rateSkeleton: {
    minHeight: 62,
    justifyContent: "center",
  },

  secondarySkeleton: {
    marginTop: 8,
  },

  referenceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  referenceText: {
    color: "#718DA1",
    fontSize: 9,
    fontWeight: "600",
    marginLeft: 6,
  },

  divider: {
    height: 1,
    backgroundColor: "#21465E",
    marginVertical: 18,
  },

  conversionRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  conversionColumn: {
    flex: 1,
    minWidth: 0,
  },

  rightColumn: {
    alignItems: "flex-end",
  },

  conversionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(100,175,255,0.11)",
    marginBottom: 9,
  },

  receiveIconBox: {
    backgroundColor:
      "rgba(47,229,140,0.11)",
  },

  conversionLabel: {
    color: "#829EB3",
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 5,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },

  conversionValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  convertedValue: {
    color: "#2FE58C",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
  },

  currencyText: {
    color: "#9FB6C9",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 5,
  },

  convertedCurrency: {
    color: "#2FE58C",
  },

  unavailableValue: {
    color: "#718DA1",
    fontSize: 15,
    fontWeight: "800",
  },

  valueSkeleton: {
    marginTop: 1,
  },

  rightSkeleton: {
    alignSelf: "flex-end",
  },

  arrowContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#163A50",
    borderWidth: 1,
    borderColor: "#21516E",
    marginHorizontal: 10,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 19,
  },

  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  footerText: {
    color: "#6F899E",
    fontSize: 9,
    marginLeft: 5,
  },

  updatedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },

  updatedText: {
    color: "#7F9AAD",
    fontSize: 9,
    marginLeft: 5,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor:
      "rgba(255,96,96,0.10)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      "rgba(255,156,112,0.24)",
    padding: 11,
    marginTop: 17,
  },

  errorIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,156,112,0.10)",
  },

  errorText: {
    flex: 1,
    color: "#FF9C70",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
    marginLeft: 8,
  },
});