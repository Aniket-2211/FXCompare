// components/HistoricalChart.tsx

import React, {
  useMemo,
  useState,
} from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Circle,
  Defs,
  LinearGradient,
  Line,
  Path,
  Stop,
  Svg,
} from "react-native-svg";

import AnimatedCard from "../AnimatedCard";
import AnimatedNumber from "../AnimatedNumber";
import SkeletonLoader from "../SkeletonLoader";

export type HistoricalRange =
  | "1D"
  | "7D"
  | "1M"
  | "3M"
  | "1Y";

export type HistoricalRatePoint = {
  date: string;
  rate: number;
};

type Props = {
  fromCurrency: string;
  toCurrency: string;
  data: HistoricalRatePoint[];
  selectedRange: HistoricalRange;
  loading?: boolean;
  error?: string | null;
  onRangeChange: (
    range: HistoricalRange
  ) => void;
  onRetry?: () => void;
};

const RANGES: HistoricalRange[] = [
  "1D",
  "7D",
  "1M",
  "3M",
  "1Y",
];

const CHART_HEIGHT = 190;

const screenWidth =
  Dimensions.get("window").width;

const chartWidth = Math.max(
  screenWidth - 72,
  250
);

const formatRate = (
  value: number
) => {
  if (!Number.isFinite(value)) {
    return "--";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }
  ).format(value);
};

const buildSmoothPath = (
  points: {
    x: number;
    y: number;
  }[]
) => {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path =
    `M ${points[0].x} ${points[0].y}`;

  for (
    let index = 1;
    index < points.length;
    index += 1
  ) {
    const previous =
      points[index - 1];

    const current =
      points[index];

    const controlX =
      (previous.x + current.x) / 2;

    path +=
      ` C ${controlX} ${previous.y},` +
      ` ${controlX} ${current.y},` +
      ` ${current.x} ${current.y}`;
  }

  return path;
};

export default function HistoricalChart({
  fromCurrency,
  toCurrency,
  data,
  selectedRange,
  loading = false,
  error = null,
  onRangeChange,
  onRetry,
}: Props) {
  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState<number | null>(
    null
  );

  const analytics = useMemo(() => {
    const validData = data.filter(
      (item) =>
        Number.isFinite(item.rate) &&
        item.rate > 0
    );

    if (validData.length === 0) {
      return {
        validData: [],
        currentRate: 0,
        firstRate: 0,
        highestRate: 0,
        lowestRate: 0,
        averageRate: 0,
        percentageChange: 0,
        trend: "neutral" as const,
      };
    }

    const rates = validData.map(
      (item) => item.rate
    );

    const currentRate =
      rates[rates.length - 1];

    const firstRate = rates[0];

    const highestRate = Math.max(
      ...rates
    );

    const lowestRate = Math.min(
      ...rates
    );

    const averageRate =
      rates.reduce(
        (total, rate) =>
          total + rate,
        0
      ) / rates.length;

    const percentageChange =
      firstRate > 0
        ? ((currentRate -
            firstRate) /
            firstRate) *
          100
        : 0;

    const trend =
      percentageChange > 0.05
        ? "up"
        : percentageChange <
            -0.05
          ? "down"
          : "neutral";

    return {
      validData,
      currentRate,
      firstRate,
      highestRate,
      lowestRate,
      averageRate,
      percentageChange,
      trend,
    };
  }, [data]);

  const chartPoints =
    useMemo(() => {
      if (
        analytics.validData.length ===
        0
      ) {
        return [];
      }

      const rates =
        analytics.validData.map(
          (item) => item.rate
        );

      const minimum =
        Math.min(...rates);

      const maximum =
        Math.max(...rates);

      const spread =
        maximum - minimum || 1;

      const horizontalPadding = 14;
      const verticalPadding = 18;

      const usableWidth =
        chartWidth -
        horizontalPadding * 2;

      const usableHeight =
        CHART_HEIGHT -
        verticalPadding * 2;

      return analytics.validData.map(
        (item, index) => {
          const x =
            analytics.validData
              .length === 1
              ? chartWidth / 2
              : horizontalPadding +
                (index /
                  (analytics.validData
                    .length -
                    1)) *
                  usableWidth;

          const y =
            verticalPadding +
            ((maximum - item.rate) /
              spread) *
              usableHeight;

          return {
            x,
            y,
            item,
          };
        }
      );
    }, [
      analytics.validData,
    ]);

  const linePath = useMemo(
    () =>
      buildSmoothPath(
        chartPoints
      ),
    [chartPoints]
  );

  const areaPath = useMemo(() => {
    if (
      chartPoints.length === 0
    ) {
      return "";
    }

    const first =
      chartPoints[0];

    const last =
      chartPoints[
        chartPoints.length - 1
      ];

    return (
      `${linePath}` +
      ` L ${last.x} ${CHART_HEIGHT}` +
      ` L ${first.x} ${CHART_HEIGHT}` +
      " Z"
    );
  }, [
    chartPoints,
    linePath,
  ]);

  const selectedPoint =
    selectedIndex !== null
      ? chartPoints[
          selectedIndex
        ]
      : chartPoints[
          chartPoints.length - 1
        ];

  const trendColor =
    analytics.trend === "down"
      ? "#FF8296"
      : analytics.trend ===
          "neutral"
        ? "#FFD65A"
        : "#2FE58C";

  const trendIcon =
    analytics.trend === "down"
      ? "trending-down"
      : analytics.trend ===
          "neutral"
        ? "remove"
        : "trending-up";

  return (
    <AnimatedCard
      style={styles.card}
      delay={120}
      duration={500}
    >
      <View style={styles.glow} />

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            HISTORICAL ANALYTICS
          </Text>

          <Text style={styles.title}>
            Exchange Rate Trend
          </Text>

          <Text style={styles.subtitle}>
            {fromCurrency} /{" "}
            {toCurrency}
          </Text>
        </View>

        <View
          style={[
            styles.trendBadge,
            {
              backgroundColor:
                `${trendColor}18`,
              borderColor:
                `${trendColor}44`,
            },
          ]}
        >
          <Ionicons
            name={trendIcon}
            size={16}
            color={trendColor}
          />

          <Text
            style={[
              styles.trendText,
              {
                color:
                  trendColor,
              },
            ]}
          >
            {analytics.trend ===
            "up"
              ? "RISING"
              : analytics.trend ===
                  "down"
                ? "FALLING"
                : "STABLE"}
          </Text>
        </View>
      </View>

      <View style={styles.rangeRow}>
        {RANGES.map((range) => {
          const active =
            selectedRange === range;

          return (
            <TouchableOpacity
              key={range}
              activeOpacity={0.85}
              style={[
                styles.rangeButton,
                active &&
                  styles.activeRangeButton,
              ]}
              onPress={() => {
                setSelectedIndex(
                  null
                );

                onRangeChange(
                  range
                );
              }}
            >
              <Text
                style={[
                  styles.rangeText,
                  active &&
                    styles.activeRangeText,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <SkeletonLoader
            width="45%"
            height={25}
            borderRadius={9}
          />

          <SkeletonLoader
            width="100%"
            height={CHART_HEIGHT}
            borderRadius={18}
            style={
              styles.chartSkeleton
            }
          />
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="cloud-offline-outline"
              size={31}
              color="#FF9C70"
            />
          </View>

          <Text style={styles.errorTitle}>
            Historical data unavailable
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          {onRetry ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.retryButton}
              onPress={onRetry}
            >
              <Ionicons
                name="refresh"
                size={17}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.retryText
                }
              >
                Try Again
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : chartPoints.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons
            name="analytics-outline"
            size={37}
            color="#67869C"
          />

          <Text style={styles.emptyTitle}>
            No historical rates
          </Text>

          <Text style={styles.emptyText}>
            Historical exchange-rate
            data will appear here.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.valueHeader}>
            <View>
              <Text
                style={
                  styles.selectedLabel
                }
              >
                {selectedPoint
                  ? new Date(
                      selectedPoint.item
                        .date
                    ).toLocaleDateString(
                      [],
                      {
                        day: "2-digit",
                        month: "short",
                        year:
                          selectedRange ===
                          "1Y"
                            ? "numeric"
                            : undefined,
                      }
                    )
                  : "Current Rate"}
              </Text>

              <View
                style={
                  styles.currentRateRow
                }
              >
                <AnimatedNumber
                  value={
                    selectedPoint
                      ?.item.rate ??
                    analytics.currentRate
                  }
                  duration={650}
                  minimumFractionDigits={
                    2
                  }
                  maximumFractionDigits={
                    4
                  }
                  style={
                    styles.currentRate
                  }
                />

                <Text
                  style={
                    styles.currentCurrency
                  }
                >
                  {toCurrency}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.changeBox
              }
            >
              <Ionicons
                name={trendIcon}
                size={16}
                color={trendColor}
              />

              <Text
                style={[
                  styles.changeValue,
                  {
                    color:
                      trendColor,
                  },
                ]}
              >
                {analytics.percentageChange >=
                0
                  ? "+"
                  : ""}
                {analytics.percentageChange.toFixed(
                  2
                )}
                %
              </Text>
            </View>
          </View>

          <View style={styles.chartBox}>
            <Svg
              width={chartWidth}
              height={CHART_HEIGHT}
            >
              <Defs>
                <LinearGradient
                  id="chartArea"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <Stop
                    offset="0"
                    stopColor="#2FE58C"
                    stopOpacity="0.30"
                  />

                  <Stop
                    offset="1"
                    stopColor="#2FE58C"
                    stopOpacity="0"
                  />
                </LinearGradient>

                <LinearGradient
                  id="chartLine"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <Stop
                    offset="0"
                    stopColor="#1687E8"
                  />

                  <Stop
                    offset="1"
                    stopColor="#2FE58C"
                  />
                </LinearGradient>
              </Defs>

              {[0.25, 0.5, 0.75].map(
                (position) => (
                  <Line
                    key={position}
                    x1={0}
                    x2={chartWidth}
                    y1={
                      CHART_HEIGHT *
                      position
                    }
                    y2={
                      CHART_HEIGHT *
                      position
                    }
                    stroke="#21465E"
                    strokeWidth={1}
                    strokeDasharray="5 6"
                  />
                )
              )}

              <Path
                d={areaPath}
                fill="url(#chartArea)"
              />

              <Path
                d={linePath}
                fill="none"
                stroke="url(#chartLine)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {chartPoints.map(
                (point, index) => {
                  const isSelected =
                    selectedPoint ===
                    point;

                  return (
                    <Circle
                      key={`${point.item.date}-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r={
                        isSelected
                          ? 7
                          : 5
                      }
                      fill={
                        isSelected
                          ? "#2FE58C"
                          : "#1687E8"
                      }
                      stroke="#071521"
                      strokeWidth={3}
                      onPress={() =>
                        setSelectedIndex(
                          index
                        )
                      }
                    />
                  );
                }
              )}

              {selectedPoint ? (
                <Line
                  x1={
                    selectedPoint.x
                  }
                  x2={
                    selectedPoint.x
                  }
                  y1={12}
                  y2={
                    CHART_HEIGHT -
                    8
                  }
                  stroke="#64AFFF"
                  strokeWidth={1}
                  strokeDasharray="4 5"
                  opacity={0.55}
                />
              ) : null}
            </Svg>
          </View>

          <Text style={styles.chartHint}>
            Tap a chart point to inspect
            its exact rate.
          </Text>

          <View style={styles.statsGrid}>
            <StatItem
              icon="arrow-up-outline"
              label="Period High"
              value={formatRate(
                analytics.highestRate
              )}
              color="#2FE58C"
            />

            <StatItem
              icon="arrow-down-outline"
              label="Period Low"
              value={formatRate(
                analytics.lowestRate
              )}
              color="#FF8296"
            />

            <StatItem
              icon="analytics-outline"
              label="Average"
              value={formatRate(
                analytics.averageRate
              )}
              color="#64AFFF"
            />
          </View>

          <View style={styles.insightBox}>
            <View style={styles.insightIcon}>
              <Ionicons
                name="bulb-outline"
                size={21}
                color="#FFD65A"
              />
            </View>

            <View style={styles.insightTextBox}>
              <Text style={styles.insightTitle}>
                Market Insight
              </Text>

              <Text style={styles.insightText}>
                {analytics.currentRate >
                analytics.averageRate
                  ? `The current rate is ${Math.abs(
                      ((analytics.currentRate -
                        analytics.averageRate) /
                        analytics.averageRate) *
                        100
                    ).toFixed(
                      2
                    )}% above the ${selectedRange} average.`
                  : analytics.currentRate <
                      analytics.averageRate
                    ? `The current rate is ${Math.abs(
                        ((analytics.currentRate -
                          analytics.averageRate) /
                          analytics.averageRate) *
                          100
                      ).toFixed(
                        2
                      )}% below the ${selectedRange} average.`
                    : `The current rate is close to the ${selectedRange} average.`}
              </Text>
            </View>
          </View>
        </>
      )}
    </AnimatedCard>
  );
}

type StatItemProps = {
  icon:
    keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
};

function StatItem({
  icon,
  label,
  value,
  color,
}: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor:
              `${color}18`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={17}
          color={color}
        />
      </View>

      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text style={styles.statValue}>
        {value}
      </Text>
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
    padding: 17,
    marginBottom: 20,
    overflow: "hidden",
  },

  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -110,
    top: -125,
    backgroundColor:
      "rgba(47,229,140,0.055)",
  },

  header: {
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
    letterSpacing: 0.9,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 5,
  },

  subtitle: {
    color: "#829CAF",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },

  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  trendText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginLeft: 5,
  },

  rangeRow: {
    flexDirection: "row",
    backgroundColor: "#16344C",
    borderRadius: 15,
    padding: 4,
    marginTop: 17,
  },

  rangeButton: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },

  activeRangeButton: {
    backgroundColor: "#1687E8",
  },

  rangeText: {
    color: "#829CAF",
    fontSize: 10,
    fontWeight: "800",
  },

  activeRangeText: {
    color: "#FFFFFF",
  },

  loadingBox: {
    marginTop: 18,
  },

  chartSkeleton: {
    marginTop: 14,
  },

  errorBox: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingHorizontal: 24,
  },

  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,156,112,0.10)",
  },

  errorTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 12,
  },

  errorText: {
    color: "#829CAF",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 6,
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1687E8",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 15,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 6,
  },

  emptyBox: {
    minHeight: 230,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
    borderRadius: 18,
    marginTop: 16,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 10,
  },

  emptyText: {
    color: "#829CAF",
    fontSize: 10,
    textAlign: "center",
    marginTop: 5,
  },

  valueHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 18,
  },

  selectedLabel: {
    color: "#829CAF",
    fontSize: 10,
    fontWeight: "600",
  },

  currentRateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },

  currentRate: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
  },

  currentCurrency: {
    color: "#2FE58C",
    fontSize: 11,
    fontWeight: "900",
    marginLeft: 6,
  },

  changeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 13,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  changeValue: {
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 5,
  },

  chartBox: {
    width: chartWidth,
    alignSelf: "center",
    backgroundColor: "#102A3D",
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 14,
  },

  chartHint: {
    color: "#6F8DA2",
    fontSize: 9,
    textAlign: "center",
    marginTop: 8,
  },

  statsGrid: {
    flexDirection: "row",
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 6,
    marginTop: 15,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statIcon: {
    width: 33,
    height: 33,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  statLabel: {
    color: "#829CAF",
    fontSize: 8,
    fontWeight: "600",
    marginTop: 7,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 4,
  },

  insightBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor:
      "rgba(255,214,90,0.06)",
    borderRadius: 17,
    borderWidth: 1,
    borderColor:
      "rgba(255,214,90,0.18)",
    padding: 13,
    marginTop: 13,
  },

  insightIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,214,90,0.10)",
  },

  insightTextBox: {
    flex: 1,
    marginLeft: 10,
  },

  insightTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  insightText: {
    color: "#9FB6C9",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },
});