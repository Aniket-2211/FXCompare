// components/TrendChart.tsx

import React, {
  useMemo,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

export type TrendRange =
  | "7D"
  | "30D"
  | "90D"
  | "1Y";

export type TrendItem = {
  day: string;
  value: number;
};

type Props = {
  data?: TrendItem[];
  loading?: boolean;
  error?: string | null;

  selectedRange: TrendRange;

  onChangeRange: (
    range: TrendRange
  ) => void;

  onRetry?: () => void;
};

type RangeOption = {
  key: TrendRange;
  label: string;
  description: string;
};

const rangeOptions: RangeOption[] = [
  {
    key: "7D",
    label: "7D",
    description:
      "Last 7 market days",
  },
  {
    key: "30D",
    label: "1M",
    description:
      "Last 30 calendar days",
  },
  {
    key: "90D",
    label: "3M",
    description:
      "Last 90 calendar days",
  },
  {
    key: "1Y",
    label: "1Y",
    description:
      "Last 12 months",
  },
];

const formatRate = (
  value: number
) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }
  ).format(value);
};

const getRangeDescription = (
  range: TrendRange
) => {
  return (
    rangeOptions.find(
      (option) =>
        option.key === range
    )?.description ??
    "Historical exchange-rate trend"
  );
};

export default function TrendChart({
  data = [],
  loading = false,
  error = null,
  selectedRange,
  onChangeRange,
  onRetry,
}: Props) {
  const {
    width: screenWidth,
  } = useWindowDimensions();

  const chartWidth = Math.max(
    screenWidth - 68,
    280
  );

  const validData = useMemo(() => {
    return data.filter(
      (item) =>
        typeof item.value ===
          "number" &&
        Number.isFinite(
          item.value
        ) &&
        item.value > 0
    );
  }, [data]);

  const values = useMemo(
    () =>
      validData.map(
        (item) => item.value
      ),
    [validData]
  );

  const labels = useMemo(() => {
    if (
      validData.length <= 7
    ) {
      return validData.map(
        (item) => item.day
      );
    }

    const maximumLabels = 6;

    const interval = Math.max(
      Math.floor(
        validData.length /
          maximumLabels
      ),
      1
    );

    return validData.map(
      (item, index) => {
        const lastIndex =
          validData.length - 1;

        if (
          index === 0 ||
          index === lastIndex ||
          index % interval === 0
        ) {
          return item.day;
        }

        return "";
      }
    );
  }, [validData]);

  const latestRate =
    values.length > 0
      ? values[
          values.length - 1
        ]
      : 0;

  const firstRate =
    values.length > 0
      ? values[0]
      : 0;

  const highestRate =
    values.length > 0
      ? Math.max(...values)
      : 0;

  const lowestRate =
    values.length > 0
      ? Math.min(...values)
      : 0;

  const absoluteChange =
    latestRate - firstRate;

  const percentageChange =
    firstRate > 0
      ? (absoluteChange /
          firstRate) *
        100
      : 0;

  const isPositive =
    percentageChange >= 0;

  const chartLineColor =
    isPositive
      ? "#2FE58C"
      : "#FF7A7A";

  const chartLineRgb =
    isPositive
      ? "47, 229, 140"
      : "255, 122, 122";

  const hasChartData =
    validData.length >= 2;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            Exchange Rate Trend
          </Text>

          <Text style={styles.subtitle}>
            {getRangeDescription(
              selectedRange
            )}
          </Text>
        </View>

        {hasChartData ? (
          <View
            style={[
              styles.changeBadge,
              !isPositive &&
                styles.negativeBadge,
            ]}
          >
            <Ionicons
              name={
                isPositive
                  ? "trending-up"
                  : "trending-down"
              }
              size={16}
              color={
                isPositive
                  ? "#2FE58C"
                  : "#FF7A7A"
              }
            />

            <Text
              style={[
                styles.changeText,
                !isPositive &&
                  styles.negativeText,
              ]}
            >
              {isPositive
                ? "+"
                : ""}
              {percentageChange.toFixed(
                2
              )}
              %
            </Text>
          </View>
        ) : (
          <View style={styles.neutralBadge}>
            <Text
              style={
                styles.neutralBadgeText
              }
            >
              {selectedRange}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.rateRow}>
        <View>
          <Text style={styles.rateLabel}>
            Current Rate
          </Text>

          <Text style={styles.currentRate}>
            {latestRate > 0
              ? formatRate(
                  latestRate
                )
              : "--"}
          </Text>

          {hasChartData ? (
            <Text
              style={[
                styles.absoluteChange,
                !isPositive &&
                  styles.negativeChange,
              ]}
            >
              {isPositive
                ? "+"
                : ""}
              {formatRate(
                absoluteChange
              )}{" "}
              during this period
            </Text>
          ) : null}
        </View>

        <View style={styles.liveContainer}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#2FE58C"
            />
          ) : (
            <View style={styles.liveDot} />
          )}

          <Text style={styles.liveText}>
            {loading
              ? "LOADING"
              : "HISTORY"}
          </Text>
        </View>
      </View>

      <View style={styles.chartBox}>
        {loading &&
        !hasChartData ? (
          <View style={styles.stateBox}>
            <ActivityIndicator
              size="large"
              color="#2FE58C"
            />

            <Text style={styles.stateTitle}>
              Loading trend
            </Text>

            <Text style={styles.stateText}>
              Fetching historical
              exchange-rate data for{" "}
              {selectedRange}.
            </Text>
          </View>
        ) : error &&
          !hasChartData ? (
          <View style={styles.stateBox}>
            <View
              style={
                styles.errorIconBox
              }
            >
              <Ionicons
                name="cloud-offline-outline"
                size={34}
                color="#FF9C70"
              />
            </View>

            <Text style={styles.stateTitle}>
              Trend unavailable
            </Text>

            <Text style={styles.stateText}>
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

                <Text style={styles.retryText}>
                  Try Again
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : hasChartData ? (
          <LineChart
            data={{
              labels,
              datasets: [
                {
                  data: values,
                  strokeWidth: 3,
                },
              ],
            }}
            width={chartWidth}
            height={230}
            fromZero={false}
            withInnerLines
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLabels
            withVerticalLabels
            yAxisInterval={1}
            segments={4}
            bezier
            chartConfig={{
              backgroundColor:
                "#0E2C43",

              backgroundGradientFrom:
                "#0E2C43",

              backgroundGradientTo:
                "#0E2C43",

              decimalPlaces: 2,

              color: (
                opacity = 1
              ) =>
                `rgba(${chartLineRgb}, ${opacity})`,

              labelColor: (
                opacity = 1
              ) =>
                `rgba(142, 167, 186, ${opacity})`,

              fillShadowGradient:
                chartLineColor,

              fillShadowGradientOpacity:
                0.14,

              propsForBackgroundLines:
                {
                  stroke:
                    "#24465D",

                  strokeDasharray:
                    "4 7",

                  strokeWidth: 1,
                },

              propsForDots: {
                r: "3.5",
                strokeWidth: "2",
                stroke: "#071521",
              },

              propsForLabels: {
                fontSize: 9,
              },
            }}
            style={styles.chart}
          />
        ) : (
          <View style={styles.stateBox}>
            <View
              style={
                styles.emptyIconBox
              }
            >
              <Ionicons
                name="analytics-outline"
                size={36}
                color="#67869C"
              />
            </View>

            <Text style={styles.stateTitle}>
              Trend unavailable
            </Text>

            <Text style={styles.stateText}>
              Refresh the rate to
              load historical market
              data.
            </Text>
          </View>
        )}
      </View>

      {hasChartData ? (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Ionicons
                name="arrow-up"
                size={14}
                color="#2FE58C"
              />

              <Text style={styles.statLabel}>
                Highest
              </Text>
            </View>

            <Text style={styles.statValue}>
              {formatRate(
                highestRate
              )}
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Ionicons
                name="arrow-down"
                size={14}
                color="#FF7A7A"
              />

              <Text style={styles.statLabel}>
                Lowest
              </Text>
            </View>

            <Text style={styles.statValue}>
              {formatRate(
                lowestRate
              )}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.rangeRow}>
        {rangeOptions.map(
          (option) => {
            const active =
              selectedRange ===
              option.key;

            return (
              <TouchableOpacity
                key={option.key}
                activeOpacity={0.85}
                disabled={loading}
                style={[
                  styles.rangeButton,
                  active &&
                    styles.activeRange,
                ]}
                onPress={() =>
                  onChangeRange(
                    option.key
                  )
                }
              >
                <Text
                  style={[
                    styles.rangeText,
                    active &&
                      styles.activeRangeText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          }
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0E2C43",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#194661",
    paddingTop: 20,
    paddingHorizontal: 14,
    paddingBottom: 16,
    marginBottom: 18,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent:
      "space-between",
    paddingHorizontal: 6,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  subtitle: {
    color: "#829CAF",
    fontSize: 12,
    marginTop: 4,
  },

  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(47,229,140,0.12)",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  negativeBadge: {
    backgroundColor:
      "rgba(255,122,122,0.12)",
  },

  changeText: {
    color: "#2FE58C",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },

  negativeText: {
    color: "#FF7A7A",
  },

  neutralBadge: {
    minWidth: 45,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(100,175,255,0.12)",
    borderRadius: 15,
    paddingHorizontal: 9,
  },

  neutralBadgeText: {
    color: "#64AFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  rateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent:
      "space-between",
    paddingHorizontal: 6,
    marginTop: 20,
    marginBottom: 8,
  },

  rateLabel: {
    color: "#829CAF",
    fontSize: 12,
    fontWeight: "600",
  },

  currentRate: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },

  absoluteChange: {
    color: "#2FE58C",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 5,
  },

  negativeChange: {
    color: "#FF7A7A",
  },

  liveContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#2FE58C",
  },

  liveText: {
    color: "#2FE58C",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginLeft: 6,
  },

  chartBox: {
    minHeight: 230,
    overflow: "hidden",
    alignItems: "center",
  },

  chart: {
    marginLeft: -8,
    borderRadius: 20,
  },

  stateBox: {
    minHeight: 230,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
  },

  errorIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,156,112,0.1)",
  },

  stateTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 13,
  },

  stateText: {
    color: "#829CAF",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
  },

  retryButton: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1687E8",
    borderRadius: 14,
    paddingHorizontal: 15,
    marginTop: 15,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 7,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    marginTop: 5,
  },

  statBox: {
    flex: 1,
  },

  statHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  statLabel: {
    color: "#829CAF",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 5,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 5,
  },

  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#295069",
    marginHorizontal: 14,
  },

  rangeRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    backgroundColor: "#16344C",
    borderRadius: 15,
    padding: 4,
    marginHorizontal: 6,
    marginTop: 13,
  },

  rangeButton: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },

  activeRange: {
    backgroundColor: "#1687E8",
  },

  rangeText: {
    color: "#829CAF",
    fontSize: 12,
    fontWeight: "700",
  },

  activeRangeText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});