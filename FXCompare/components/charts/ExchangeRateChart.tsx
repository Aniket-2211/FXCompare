import React, {
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import {
  Ionicons,
} from "@expo/vector-icons";

import useHistoricalRates from "../../hooks/useHistoricalRates";
import {
  HistoricalRange,
} from "../../services/historyApi";

type Props = {
  fromCurrency: string;
  toCurrency: string;
  currentRate: number;
};

const ranges: HistoricalRange[] = [
  "1D",
  "7D",
  "30D",
  "90D",
  "1Y",
];

const CHART_WIDTH = 320;
const CHART_HEIGHT = 150;
const TOP_PADDING = 12;
const BOTTOM_PADDING = 16;

type ChartPoint = {
  x: number;
  y: number;
  rate: number;
  date: string;
};

const formatTooltipDate = (
  date: string
) => {
  const parsed = new Date(
    `${date}T00:00:00`
  );

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const buildChartPoints = (
  data: {
    date: string;
    rate: number;
  }[]
): ChartPoint[] => {
  if (data.length === 0) {
    return [];
  }

  const values = data.map(
    (point) => point.rate
  );

  const min =
    Math.min(...values);

  const max =
    Math.max(...values);

  const range =
    Math.max(
      max - min,
      0.0001
    );

  const usableHeight =
    CHART_HEIGHT -
    TOP_PADDING -
    BOTTOM_PADDING;

  if (data.length === 1) {
    return [
      {
        x: CHART_WIDTH / 2,
        y: CHART_HEIGHT / 2,
        rate: data[0].rate,
        date: data[0].date,
      },
    ];
  }

  const stepX =
    CHART_WIDTH /
    (data.length - 1);

  return data.map(
    (point, index) => {
      const normalized =
        (point.rate - min) /
        range;

      const y =
        TOP_PADDING +
        usableHeight *
          (1 - normalized);

      return {
        x: index * stepX,
        y,
        rate: point.rate,
        date: point.date,
      };
    }
  );
};

const buildPathFromPoints = (
  points: ChartPoint[]
) => {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M 0 ${points[0].y} L ${CHART_WIDTH} ${points[0].y}`;
  }

  return points
    .map(
      (point, index) =>
        `${
          index === 0
            ? "M"
            : "L"
        } ${point.x.toFixed(
          2
        )} ${point.y.toFixed(
          2
        )}`
    )
    .join(" ");
};

const formatRate = (
  value: number
) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }
  ).format(value);

export default function ExchangeRateChart({
  fromCurrency,
  toCurrency,
  currentRate,
}: Props) {
  const [
    selectedRange,
    setSelectedRange,
  ] =
    useState<HistoricalRange>(
      "30D"
    );

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState<number | null>(
    null
  );

  const [
    chartWidth,
    setChartWidth,
  ] = useState(
    CHART_WIDTH
  );

  const {
    data,
    loading,
    error,
    refresh,
  } =
    useHistoricalRates({
      fromCurrency,
      toCurrency,
      range:
        selectedRange,
    });

  const values =
    useMemo(
      () =>
        data.map(
          (point) =>
            point.rate
        ),
      [data]
    );

  const chartPoints =
    useMemo(
      () =>
        buildChartPoints(
          data
        ),
      [data]
    );

  const path =
    useMemo(
      () =>
        buildPathFromPoints(
          chartPoints
        ),
      [chartPoints]
    );

  const selectedPoint =
    selectedIndex !== null
      ? chartPoints[
          selectedIndex
        ] ?? null
      : null;

  const highestPoint =
    useMemo(() => {
      if (
        chartPoints.length === 0
      ) {
        return null;
      }

      return chartPoints.reduce(
        (highest, point) =>
          point.rate >
          highest.rate
            ? point
            : highest
      );
    }, [chartPoints]);

  const lowestPoint =
    useMemo(() => {
      if (
        chartPoints.length === 0
      ) {
        return null;
      }

      return chartPoints.reduce(
        (lowest, point) =>
          point.rate <
          lowest.rate
            ? point
            : lowest
      );
    }, [chartPoints]);

  const averageRate =
    useMemo(() => {
      if (values.length === 0) {
        return 0;
      }

      return (
        values.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / values.length
      );
    }, [values]);

  const highestRate =
    highestPoint?.rate ?? 0;

  const lowestRate =
    lowestPoint?.rate ?? 0;

  const insight =
    useMemo(() => {
      if (
        !hasData ||
        averageRate <= 0
      ) {
        return null;
      }

      let trendLabel =
        "Neutral";
      let trendIcon:
        keyof typeof Ionicons.glyphMap =
        "remove-outline";
      let trendColor =
        "#FFD65A";

      if (change >= 3) {
        trendLabel =
          "Strong Bullish";
        trendIcon =
          "trending-up";
        trendColor =
          "#2FE58C";
      } else if (change >= 1) {
        trendLabel =
          "Bullish";
        trendIcon =
          "trending-up";
        trendColor =
          "#2FE58C";
      } else if (change <= -3) {
        trendLabel =
          "Strong Bearish";
        trendIcon =
          "trending-down";
        trendColor =
          "#FF7A7A";
      } else if (change <= -1) {
        trendLabel =
          "Bearish";
        trendIcon =
          "trending-down";
        trendColor =
          "#FF7A7A";
      }

      const rateForComparison =
        displayedRate > 0
          ? displayedRate
          : historyLast;

      let averageMessage =
        "The latest rate is close to the recent average.";

      if (
        rateForComparison >
        averageRate * 1.002
      ) {
        averageMessage =
          "The latest rate is above the recent average.";
      } else if (
        rateForComparison <
        averageRate * 0.998
      ) {
        averageMessage =
          "The latest rate is below the recent average.";
      }

      let recommendation =
        "Market conditions are relatively stable. Keep monitoring before making a large transfer.";

      if (change >= 1) {
        recommendation =
          "Recent momentum is positive for this currency pair. Compare provider payouts before transferring.";
      } else if (
        change <= -1
      ) {
        recommendation =
          "Recent momentum is weaker. You may want to monitor the rate before transferring.";
      }

      const direction =
        change > 0
          ? "strengthened"
          : change < 0
            ? "weakened"
            : "was broadly unchanged";

      const summary =
        `${fromCurrency} ${direction} ${
          change === 0
            ? ""
            : `by ${Math.abs(
                change
              ).toFixed(2)}% `
        }over the selected ${selectedRange} period.`;

      return {
        trendLabel,
        trendIcon,
        trendColor,
        averageMessage,
        recommendation,
        summary,
      };
    }, [
      hasData,
      averageRate,
      change,
      displayedRate,
      historyLast,
      fromCurrency,
      selectedRange,
    ]);

  const handleChartPress = (
    locationX: number,
    measuredWidth: number
  ) => {
    if (
      chartPoints.length === 0 ||
      measuredWidth <= 0
    ) {
      return;
    }

    const chartX =
      Math.max(
        0,
        Math.min(
          CHART_WIDTH,
          (locationX /
            measuredWidth) *
            CHART_WIDTH
        )
      );

    let nearestIndex = 0;
    let nearestDistance =
      Number.POSITIVE_INFINITY;

    chartPoints.forEach(
      (point, index) => {
        const distance =
          Math.abs(
            point.x - chartX
          );

        if (
          distance <
          nearestDistance
        ) {
          nearestDistance =
            distance;
          nearestIndex =
            index;
        }
      }
    );

    setSelectedIndex(
      nearestIndex
    );
  };

  const firstValue =
    values[0] ?? 0;

  const historyLast =
    values[
      values.length - 1
    ] ?? 0;

  const displayedRate =
    currentRate > 0
      ? currentRate
      : historyLast;

  const change =
    firstValue > 0 &&
    displayedRate > 0
      ? ((displayedRate -
          firstValue) /
          firstValue) *
        100
      : 0;

  const isPositive =
    change >= 0;

  const hasData =
    values.length > 0;

  return (
    <View
      style={styles.card}
    >
      <View
        style={styles.header}
      >
        <View>
          <Text
            style={
              styles.eyebrow
            }
          >
            MARKET TREND
          </Text>

          <Text
            style={styles.title}
          >
            {fromCurrency} →{" "}
            {toCurrency}
          </Text>
        </View>

        {hasData ? (
          <View
            style={[
              styles.changeBadge,
              isPositive
                ? styles.positiveBadge
                : styles.negativeBadge,
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
                {
                  color:
                    isPositive
                      ? "#2FE58C"
                      : "#FF7A7A",
                },
              ]}
            >
              {isPositive
                ? "+"
                : ""}
              {change.toFixed(
                2
              )}
              %
            </Text>
          </View>
        ) : null}
      </View>

      <View
        style={styles.rateRow}
      >
        <Text
          style={
            styles.rateValue
          }
        >
          {displayedRate > 0
            ? formatRate(
                displayedRate
              )
            : "--"}
        </Text>

        <Text
          style={
            styles.rateCurrency
          }
        >
          {toCurrency}
        </Text>
      </View>

      <Text
        style={styles.caption}
      >
        {selectedRange ===
        "1D"
          ? "Latest daily reference-rate move"
          : "Historical reference rates"}
      </Text>

      <View
        style={
          styles.chartWrap
        }
      >
        {loading ? (
          <View
            style={
              styles.stateBox
            }
          >
            <ActivityIndicator
              size="small"
              color="#2FE58C"
            />

            <Text
              style={
                styles.stateText
              }
            >
              Loading historical
              rates...
            </Text>
          </View>
        ) : error ? (
          <Pressable
            onPress={refresh}
            style={
              styles.stateBox
            }
          >
            <Ionicons
              name="cloud-offline-outline"
              size={22}
              color="#FF9C70"
            />

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>

            <Text
              style={
                styles.retryText
              }
            >
              Tap to retry
            </Text>
          </Pressable>
        ) : hasData ? (
          <View
            style={
              styles.interactiveChart
            }
            onLayout={(event) => {
              setChartWidth(
                event.nativeEvent
                  .layout.width
              );
            }}
          >
            <Pressable
              style={styles.chartPressable}
              onPress={(event) => {
                const locationX =
                  event.nativeEvent
                    .locationX;

                handleChartPress(
                  locationX,
                  chartWidth
                );
              }}
            >
              <Svg
                width="100%"
                height={
                  CHART_HEIGHT
                }
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              >
                <Defs>
                  <LinearGradient
                    id="chartLine"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <Stop
                      offset="0"
                      stopColor="#64AFFF"
                      stopOpacity="0.9"
                    />
                    <Stop
                      offset="1"
                      stopColor="#2FE58C"
                      stopOpacity="1"
                    />
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

                {highestPoint ? (
                  <>
                    <Circle
                      cx={
                        highestPoint.x
                      }
                      cy={
                        highestPoint.y
                      }
                      r={6}
                      fill="#071521"
                      stroke="#2FE58C"
                      strokeWidth={3}
                    />
                  </>
                ) : null}

                {lowestPoint ? (
                  <>
                    <Circle
                      cx={
                        lowestPoint.x
                      }
                      cy={
                        lowestPoint.y
                      }
                      r={6}
                      fill="#071521"
                      stroke="#FF9C70"
                      strokeWidth={3}
                    />
                  </>
                ) : null}

                {selectedPoint ? (
                  <>
                    <Line
                      x1={
                        selectedPoint.x
                      }
                      y1={0}
                      x2={
                        selectedPoint.x
                      }
                      y2={
                        CHART_HEIGHT
                      }
                      stroke="#6F8DA2"
                      strokeWidth={1}
                      strokeDasharray="4 5"
                    />

                    <Circle
                      cx={
                        selectedPoint.x
                      }
                      cy={
                        selectedPoint.y
                      }
                      r={7}
                      fill="#071521"
                      stroke="#2FE58C"
                      strokeWidth={4}
                    />
                  </>
                ) : null}
              </Svg>
            </Pressable>

            {highestPoint ? (
              <View
                pointerEvents="none"
                style={[
                  styles.extremeLabel,
                  styles.highLabel,
                  {
                    left: Math.max(
                      6,
                      Math.min(
                        chartWidth - 76,
                        (highestPoint.x /
                          CHART_WIDTH) *
                          chartWidth -
                          34
                      )
                    ),
                    top: Math.max(
                      2,
                      highestPoint.y -
                        30
                    ),
                  },
                ]}
              >
                <Text
                  style={
                    styles.extremeLabelText
                  }
                >
                  HIGH
                </Text>
              </View>
            ) : null}

            {lowestPoint ? (
              <View
                pointerEvents="none"
                style={[
                  styles.extremeLabel,
                  styles.lowLabel,
                  {
                    left: Math.max(
                      6,
                      Math.min(
                        chartWidth - 76,
                        (lowestPoint.x /
                          CHART_WIDTH) *
                          chartWidth -
                          34
                      )
                    ),
                    top: Math.min(
                      CHART_HEIGHT -
                        24,
                      lowestPoint.y +
                        10
                    ),
                  },
                ]}
              >
                <Text
                  style={
                    styles.extremeLabelText
                  }
                >
                  LOW
                </Text>
              </View>
            ) : null}

            {selectedPoint ? (
              <View
                pointerEvents="none"
                style={[
                  styles.tooltip,
                  {
                    left: Math.max(
                      8,
                      Math.min(
                        CHART_WIDTH -
                          126,
                        (selectedPoint.x /
                          CHART_WIDTH) *
                          chartWidth -
                          55
                      )
                    ),
                    top: Math.max(
                      4,
                      selectedPoint.y -
                        64
                    ),
                  },
                ]}
              >
                <Text
                  style={
                    styles.tooltipDate
                  }
                >
                  {formatTooltipDate(
                    selectedPoint.date
                  )}
                </Text>

                <Text
                  style={
                    styles.tooltipRate
                  }
                >
                  {formatRate(
                    selectedPoint.rate
                  )}{" "}
                  {toCurrency}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View
            style={
              styles.stateBox
            }
          >
            <Ionicons
              name="analytics-outline"
              size={22}
              color="#829CAF"
            />

            <Text
              style={
                styles.stateText
              }
            >
              No historical data
              available.
            </Text>
          </View>
        )}
      </View>

      <View
        style={styles.rangeRow}
      >
        {ranges.map(
          (rangeOption) => {
            const active =
              selectedRange ===
              rangeOption;

            return (
              <Pressable
                key={
                  rangeOption
                }
                onPress={() => {
                  setSelectedIndex(
                    null
                  );
                  setSelectedRange(
                    rangeOption
                  );
                }}
                style={[
                  styles.rangeButton,
                  active &&
                    styles.activeRangeButton,
                ]}
              >
                <Text
                  style={[
                    styles.rangeText,
                    active &&
                      styles.activeRangeText,
                  ]}
                >
                  {rangeOption}
                </Text>
              </Pressable>
            );
          }
        )}
      </View>

      {hasData ? (
        <View
          style={
            styles.statisticsCard
          }
        >
          <View
            style={
              styles.statisticsHeader
            }
          >
            <View
              style={
                styles.statisticsIcon
              }
            >
              <Ionicons
                name="analytics-outline"
                size={17}
                color="#64AFFF"
              />
            </View>

            <View>
              <Text
                style={
                  styles.statisticsEyebrow
                }
              >
                SELECTED PERIOD
              </Text>

              <Text
                style={
                  styles.statisticsTitle
                }
              >
                Exchange Statistics
              </Text>
            </View>
          </View>

          <View
            style={
              styles.statisticsGrid
            }
          >
            <View
              style={
                styles.statItem
              }
            >
              <Text
                style={
                  styles.statLabel
                }
              >
                Highest
              </Text>

              <Text
                style={
                  styles.statValue
                }
              >
                {formatRate(
                  highestRate
                )}
              </Text>

              <Text
                style={
                  styles.statCurrency
                }
              >
                {toCurrency}
              </Text>
            </View>

            <View
              style={
                styles.statDivider
              }
            />

            <View
              style={
                styles.statItem
              }
            >
              <Text
                style={
                  styles.statLabel
                }
              >
                Lowest
              </Text>

              <Text
                style={
                  styles.statValue
                }
              >
                {formatRate(
                  lowestRate
                )}
              </Text>

              <Text
                style={
                  styles.statCurrency
                }
              >
                {toCurrency}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.statisticsGrid
            }
          >
            <View
              style={
                styles.statItem
              }
            >
              <Text
                style={
                  styles.statLabel
                }
              >
                Average
              </Text>

              <Text
                style={
                  styles.statValue
                }
              >
                {formatRate(
                  averageRate
                )}
              </Text>

              <Text
                style={
                  styles.statCurrency
                }
              >
                {toCurrency}
              </Text>
            </View>

            <View
              style={
                styles.statDivider
              }
            />

            <View
              style={
                styles.statItem
              }
            >
              <Text
                style={
                  styles.statLabel
                }
              >
                Change
              </Text>

              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      isPositive
                        ? "#2FE58C"
                        : "#FF7A7A",
                  },
                ]}
              >
                {isPositive
                  ? "+"
                  : ""}
                {change.toFixed(
                  2
                )}
                %
              </Text>

              <Text
                style={
                  styles.statCurrency
                }
              >
                {selectedRange}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {insight ? (
        <View
          style={
            styles.insightCard
          }
        >
          <View
            style={
              styles.insightHeader
            }
          >
            <View
              style={
                styles.insightIcon
              }
            >
              <Ionicons
                name="bulb-outline"
                size={18}
                color="#FFD65A"
              />
            </View>

            <View
              style={
                styles.insightHeaderText
              }
            >
              <Text
                style={
                  styles.insightEyebrow
                }
              >
                SMART ANALYSIS
              </Text>

              <Text
                style={
                  styles.insightTitle
                }
              >
                FXCompare Insight
              </Text>
            </View>

            <View
              style={[
                styles.trendBadge,
                {
                  borderColor:
                    insight.trendColor,
                },
              ]}
            >
              <Ionicons
                name={
                  insight.trendIcon
                }
                size={14}
                color={
                  insight.trendColor
                }
              />

              <Text
                style={[
                  styles.trendBadgeText,
                  {
                    color:
                      insight.trendColor,
                  },
                ]}
              >
                {
                  insight.trendLabel
                }
              </Text>
            </View>
          </View>

          <Text
            style={
              styles.insightSummary
            }
          >
            {insight.summary}
          </Text>

          <View
            style={
              styles.insightDivider
            }
          />

          <View
            style={
              styles.insightRow
            }
          >
            <Ionicons
              name="analytics-outline"
              size={16}
              color="#64AFFF"
            />

            <Text
              style={
                styles.insightBody
              }
            >
              {
                insight.averageMessage
              }
            </Text>
          </View>

          <View
            style={
              styles.insightRow
            }
          >
            <Ionicons
              name="navigate-outline"
              size={16}
              color="#2FE58C"
            />

            <Text
              style={
                styles.insightBody
              }
            >
              {
                insight.recommendation
              }
            </Text>
          </View>

          <Text
            style={
              styles.insightDisclaimer
            }
          >
            Insight is based on recent historical rates and is not financial advice.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#0E2C43",
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        "#194661",
      padding: 16,
      marginBottom: 20,
      overflow:
        "hidden",
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
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
      flexDirection:
        "row",
      alignItems:
        "center",
      borderRadius: 14,
      paddingHorizontal:
        10,
      paddingVertical: 7,
    },

    positiveBadge: {
      backgroundColor:
        "rgba(47,229,140,0.11)",
    },

    negativeBadge: {
      backgroundColor:
        "rgba(255,122,122,0.11)",
    },

    changeText: {
      fontSize: 11,
      fontWeight: "900",
      marginLeft: 5,
    },

    rateRow: {
      flexDirection:
        "row",
      alignItems:
        "flex-end",
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
      minHeight:
        CHART_HEIGHT,
      justifyContent:
        "center",
      marginTop: 8,
      marginHorizontal:
        -3,
    },

    stateBox: {
      minHeight:
        CHART_HEIGHT,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal:
        24,
    },

    stateText: {
      color: "#829CAF",
      fontSize: 11,
      textAlign:
        "center",
      marginTop: 9,
    },

    errorText: {
      color: "#FFB08B",
      fontSize: 11,
      lineHeight: 17,
      textAlign:
        "center",
      marginTop: 8,
    },

    retryText: {
      color: "#64AFFF",
      fontSize: 10,
      fontWeight: "800",
      marginTop: 7,
    },

    interactiveChart: {
      position: "relative",
      width: "100%",
      minHeight: CHART_HEIGHT,
    },

    chartPressable: {
      width: "100%",
      minHeight: CHART_HEIGHT,
    },

    extremeLabel: {
      position: "absolute",
      minWidth: 54,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 5,
      alignItems: "center",
      zIndex: 4,
    },

    highLabel: {
      backgroundColor:
        "rgba(47,229,140,0.14)",
      borderWidth: 1,
      borderColor:
        "rgba(47,229,140,0.32)",
    },

    lowLabel: {
      backgroundColor:
        "rgba(255,156,112,0.14)",
      borderWidth: 1,
      borderColor:
        "rgba(255,156,112,0.32)",
    },

    extremeLabelText: {
      color: "#FFFFFF",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.7,
    },

    tooltip: {
      position: "absolute",
      minWidth: 118,
      backgroundColor:
        "#071521",
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        "#21516E",
      paddingHorizontal: 10,
      paddingVertical: 8,
      zIndex: 5,
    },

    tooltipDate: {
      color: "#829CAF",
      fontSize: 9,
      fontWeight: "700",
    },

    tooltipRate: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "900",
      marginTop: 3,
    },

    rangeRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      backgroundColor:
        "#16344C",
      borderRadius: 16,
      padding: 4,
      marginTop: 4,
    },

    rangeButton: {
      minWidth: 50,
      paddingHorizontal: 9,
      paddingVertical: 9,
      borderRadius: 12,
      alignItems:
        "center",
    },

    activeRangeButton: {
      backgroundColor:
        "#1687E8",
    },

    rangeText: {
      color: "#829CAF",
      fontSize: 11,
      fontWeight: "800",
    },

    activeRangeText: {
      color: "#FFFFFF",
    },

    insightCard: {
      backgroundColor:
        "rgba(255,214,90,0.06)",
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        "rgba(255,214,90,0.18)",
      padding: 14,
      marginTop: 14,
    },

    insightHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    insightIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "rgba(255,214,90,0.11)",
      marginRight: 10,
    },

    insightHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    insightEyebrow: {
      color: "#8D8461",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.7,
    },

    insightTitle: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "900",
      marginTop: 3,
    },

    trendBadge: {
      flexDirection:
        "row",
      alignItems:
        "center",
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 6,
      marginLeft: 8,
    },

    trendBadgeText: {
      fontSize: 8,
      fontWeight: "900",
      marginLeft: 4,
    },

    insightSummary: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "800",
      lineHeight: 19,
      marginTop: 14,
    },

    insightDivider: {
      height: 1,
      backgroundColor:
        "rgba(255,255,255,0.07)",
      marginVertical: 12,
    },

    insightRow: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      marginTop: 9,
    },

    insightBody: {
      flex: 1,
      color: "#A9BECC",
      fontSize: 11,
      lineHeight: 17,
      marginLeft: 8,
    },

    insightDisclaimer: {
      color: "#657F91",
      fontSize: 8,
      lineHeight: 12,
      marginTop: 13,
    },


    statisticsCard: {
      backgroundColor:
        "#102A3D",
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        "#194661",
      padding: 14,
      marginTop: 14,
    },

    statisticsHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 14,
    },

    statisticsIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "rgba(100,175,255,0.12)",
      marginRight: 10,
    },

    statisticsEyebrow: {
      color: "#6F8DA2",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.7,
    },

    statisticsTitle: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "900",
      marginTop: 3,
    },

    statisticsGrid: {
      flexDirection:
        "row",
      alignItems:
        "stretch",
      backgroundColor:
        "#16344C",
      borderRadius: 15,
      paddingVertical: 12,
      paddingHorizontal: 10,
      marginTop: 8,
    },

    statItem: {
      flex: 1,
      minWidth: 0,
    },

    statDivider: {
      width: 1,
      backgroundColor:
        "#295069",
      marginHorizontal: 10,
    },

    statLabel: {
      color: "#829CAF",
      fontSize: 9,
      fontWeight: "700",
    },

    statValue: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "900",
      marginTop: 5,
    },

    statCurrency: {
      color: "#6F8DA2",
      fontSize: 8,
      fontWeight: "700",
      marginTop: 3,
    },

  });