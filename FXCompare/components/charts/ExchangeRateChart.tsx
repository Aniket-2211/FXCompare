// components/charts/ExchangeRateChart.tsx

import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

type ChartRange = "1D" | "7D" | "30D" | "90D" | "1Y";

type Props = {
  fromCurrency: string;
  toCurrency: string;
  currentRate: number;
};

const ranges: ChartRange[] = ["1D", "7D", "30D", "90D", "1Y"];

const sampleSeries: Record<ChartRange, number[]> = {
  "1D": [87.92, 87.98, 88.04, 88.01, 88.12, 88.2, 88.17, 88.26, 88.31, 88.28, 88.36, 88.42],
  "7D": [87.35, 87.48, 87.61, 87.56, 87.78, 87.93, 88.08, 88.02, 88.18, 88.29, 88.37, 88.42],
  "30D": [86.72, 86.95, 87.14, 87.02, 87.31, 87.58, 87.76, 87.69, 87.94, 88.13, 88.27, 88.42],
  "90D": [85.94, 86.22, 86.08, 86.54, 86.89, 87.17, 87.06, 87.44, 87.71, 87.95, 88.19, 88.42],
  "1Y": [83.96, 84.58, 84.21, 85.06, 85.74, 86.18, 86.91, 86.55, 87.28, 87.81, 88.04, 88.42],
};

const CHART_WIDTH = 320;
const CHART_HEIGHT = 150;
const TOP_PADDING = 12;
const BOTTOM_PADDING = 16;

const formatRate = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);

const buildPath = (values: number[]) => {
  if (values.length === 0) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 0.0001);
  const usableHeight = CHART_HEIGHT - TOP_PADDING - BOTTOM_PADDING;
  const stepX = CHART_WIDTH / Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = index * stepX;
      const normalized = (value - min) / range;
      const y = TOP_PADDING + usableHeight * (1 - normalized);

      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

export default function ExchangeRateChart({
  fromCurrency,
  toCurrency,
  currentRate,
}: Props) {
  const [selectedRange, setSelectedRange] =
    useState<ChartRange>("30D");

  const values = sampleSeries[selectedRange];

  const path = useMemo(
    () => buildPath(values),
    [values]
  );

  const firstValue = values[0] ?? 0;
  const previewLast = values[values.length - 1] ?? 0;
  const lastValue = currentRate > 0 ? currentRate : previewLast;

  const change =
    firstValue > 0
      ? ((lastValue - firstValue) / firstValue) * 100
      : 0;

  const isPositive = change >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>MARKET TREND</Text>
          <Text style={styles.title}>
            {fromCurrency} → {toCurrency}
          </Text>
        </View>

        <View
          style={[
            styles.changeBadge,
            isPositive
              ? styles.positiveBadge
              : styles.negativeBadge,
          ]}
        >
          <Ionicons
            name={isPositive ? "trending-up" : "trending-down"}
            size={16}
            color={isPositive ? "#2FE58C" : "#FF7A7A"}
          />
          <Text
            style={[
              styles.changeText,
              { color: isPositive ? "#2FE58C" : "#FF7A7A" },
            ]}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(2)}%
          </Text>
        </View>
      </View>

      <View style={styles.rateRow}>
        <Text style={styles.rateValue}>
          {formatRate(lastValue)}
        </Text>
        <Text style={styles.rateCurrency}>
          {toCurrency}
        </Text>
      </View>

      <Text style={styles.caption}>
        Sample historical preview
      </Text>

      <View style={styles.chartWrap}>
        <Svg
          width="100%"
          height={CHART_HEIGHT}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        >
          <Defs>
            <LinearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#64AFFF" stopOpacity="0.9" />
              <Stop offset="1" stopColor="#2FE58C" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          <Path
            d={path}
            fill="none"
            stroke="url(#chartLine)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      <View style={styles.rangeRow}>
        {ranges.map((rangeOption) => {
          const active = selectedRange === rangeOption;

          return (
            <Pressable
              key={rangeOption}
              onPress={() => setSelectedRange(rangeOption)}
              style={[
                styles.rangeButton,
                active && styles.activeRangeButton,
              ]}
            >
              <Text
                style={[
                  styles.rangeText,
                  active && styles.activeRangeText,
                ]}
              >
                {rangeOption}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0E2C43",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 16,
    marginBottom: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: "#6F8DA2",
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
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  positiveBadge: {
    backgroundColor: "rgba(47,229,140,0.11)",
  },
  negativeBadge: {
    backgroundColor: "rgba(255,122,122,0.11)",
  },
  changeText: {
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 5,
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 17,
  },
  rateValue: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },
  rateCurrency: {
    color: "#2FE58C",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
    marginBottom: 5,
  },
  caption: {
    color: "#6F8DA2",
    fontSize: 10,
    marginTop: 4,
  },
  chartWrap: {
    marginTop: 8,
    marginHorizontal: -3,
  },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#16344C",
    borderRadius: 16,
    padding: 4,
    marginTop: 4,
  },
  rangeButton: {
    minWidth: 50,
    paddingHorizontal: 9,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center",
  },
  activeRangeButton: {
    backgroundColor: "#1687E8",
  },
  rangeText: {
    color: "#829CAF",
    fontSize: 11,
    fontWeight: "800",
  },
  activeRangeText: {
    color: "#FFFFFF",
  },
});