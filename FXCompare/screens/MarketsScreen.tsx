import React, {
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import ScreenHeader from "../components/ScreenHeader";
import HistoricalChart from "../components/historical/HistoricalChart";

import { MarketPair } from "../services/marketsApi";
import useMarkets from "../hooks/useMarkets";
import useHistoricalRates from "../hooks/useHistoricalRates";

type MarketFilter =
  | "all"
  | "gainers"
  | "losers";

const formatRate = (
  value: number
) => {
  if (!Number.isFinite(value)) {
    return "--";
  }

  if (Math.abs(value) < 1) {
    return value.toFixed(4);
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }
  ).format(value);
};

const formatChange = (
  value: number
) => {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return Math.abs(value).toFixed(2);
};

const formatUpdatedTime = (
  date: Date | null
) => {
  if (!date) {
    return "Not updated";
  }

  return date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const matchesSearch = (
  item: MarketPair,
  searchText: string
) => {
  const search =
    searchText
      .trim()
      .toLowerCase();

  if (!search) {
    return true;
  }

  return (
    item.code
      .toLowerCase()
      .includes(search) ||
    item.pair
      .toLowerCase()
      .includes(search) ||
    item.name
      .toLowerCase()
      .includes(search)
  );
};

export default function MarketsScreen() {
  const {
    marketPairs,
    loading,
    refreshing,
    error,
    lastUpdated,
    topGainer,
    topLoser,
    fetchMarkets,
  } = useMarkets();

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<MarketFilter>(
    "all"
  );

  const [
    chartFromCurrency,
    setChartFromCurrency,
  ] = useState("USD");

  const [
    chartToCurrency,
    setChartToCurrency,
  ] = useState("INR");

  const {
    data: historicalData,
    loading: historicalLoading,
    error: historicalError,
    selectedRange,
    setSelectedRange,
    retry: retryHistoricalRates,
  } = useHistoricalRates({
    fromCurrency:
      chartFromCurrency,
    toCurrency:
      chartToCurrency,
  });

  const gainersCount =
    useMemo(() => {
      return marketPairs.filter(
        (item) =>
          item.change > 0
      ).length;
    }, [marketPairs]);

  const losersCount =
    useMemo(() => {
      return marketPairs.filter(
        (item) =>
          item.change < 0
      ).length;
    }, [marketPairs]);

  const unchangedCount =
    marketPairs.length -
    gainersCount -
    losersCount;

  const averageChange =
    useMemo(() => {
      if (
        marketPairs.length ===
        0
      ) {
        return 0;
      }

      const total =
        marketPairs.reduce(
          (
            sum,
            item
          ) =>
            sum +
            item.change,
          0
        );

      return (
        total /
        marketPairs.length
      );
    }, [marketPairs]);

  const filteredPairs =
    useMemo(() => {
      return marketPairs
        .filter((item) =>
          matchesSearch(
            item,
            searchText
          )
        )
        .filter((item) => {
          switch (
            selectedFilter
          ) {
            case "gainers":
              return (
                item.change > 0
              );

            case "losers":
              return (
                item.change < 0
              );

            case "all":
            default:
              return true;
          }
        });
    }, [
      marketPairs,
      searchText,
      selectedFilter,
    ]);

  const clearSearch = () => {
    setSearchText("");
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        backgroundColor="#071521"
        barStyle="light-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.container
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() => {
              void fetchMarkets(
                true
              );
            }}
            tintColor="#2FE58C"
            colors={[
              "#2FE58C",
            ]}
            progressBackgroundColor="#0E2C43"
          />
        }
      >
        <ScreenHeader
          title="Markets"
          subtitle="Track live currency movements and major pairs"
          showAction
          actionIcon="refresh"
          onActionPress={() => {
            void fetchMarkets(
              true
            );
          }}
        />

        <View
          style={
            styles.overviewCard
          }
        >
          <View
            style={
              styles.overviewTop
            }
          >
            <View>
              <Text
                style={
                  styles.overviewLabel
                }
              >
                Market Overview
              </Text>

              <Text
                style={
                  styles.overviewValue
                }
              >
                {
                  marketPairs.length
                }{" "}
                Live Pairs
              </Text>

              <Text
                style={
                  styles.updatedText
                }
              >
                Updated{" "}
                {formatUpdatedTime(
                  lastUpdated
                )}
              </Text>
            </View>

            <View
              style={
                styles.liveBadge
              }
            >
              {refreshing ? (
                <ActivityIndicator
                  size="small"
                  color="#2FE58C"
                />
              ) : (
                <View
                  style={
                    styles.liveDot
                  }
                />
              )}

              <Text
                style={
                  styles.liveText
                }
              >
                {refreshing
                  ? "UPDATING"
                  : "LIVE"}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.overviewStats
            }
          >
            <View
              style={
                styles.overviewStat
              }
            >
              <View
                style={
                  styles.statLabelRow
                }
              >
                <Ionicons
                  name="trending-up"
                  size={14}
                  color="#2FE58C"
                />

                <Text
                  style={
                    styles.overviewStatLabel
                  }
                >
                  Gainers
                </Text>
              </View>

              <Text
                style={
                  styles.positiveStatValue
                }
              >
                {gainersCount}
              </Text>
            </View>

            <View
              style={
                styles.overviewDivider
              }
            />

            <View
              style={
                styles.overviewStat
              }
            >
              <View
                style={
                  styles.statLabelRow
                }
              >
                <Ionicons
                  name="trending-down"
                  size={14}
                  color="#FF7A7A"
                />

                <Text
                  style={
                    styles.overviewStatLabel
                  }
                >
                  Losers
                </Text>
              </View>

              <Text
                style={
                  styles.negativeStatValue
                }
              >
                {losersCount}
              </Text>
            </View>

            <View
              style={
                styles.overviewDivider
              }
            />

            <View
              style={
                styles.overviewStat
              }
            >
              <View
                style={
                  styles.statLabelRow
                }
              >
                <Ionicons
                  name="analytics-outline"
                  size={14}
                  color="#64AFFF"
                />

                <Text
                  style={
                    styles.overviewStatLabel
                  }
                >
                  Average
                </Text>
              </View>

              <Text
                style={[
                  styles.averageStatValue,
                  averageChange <
                    0 &&
                    styles.averageNegative,
                ]}
              >
                {averageChange >=
                0
                  ? "+"
                  : ""}
                {averageChange.toFixed(
                  2
                )}
                %
              </Text>
            </View>
          </View>
        </View>

        <HistoricalChart
          fromCurrency={
            chartFromCurrency
          }
          toCurrency={
            chartToCurrency
          }
          data={
            historicalData
          }
          loading={
            historicalLoading
          }
          error={
            historicalError
          }
          selectedRange={
            selectedRange
          }
          onRangeChange={
            setSelectedRange
          }
          onRetry={
            retryHistoricalRates
          }
        />

        {error ? (
          <View
            style={
              styles.errorCard
            }
          >
            <Ionicons
              name="warning-outline"
              size={21}
              color="#FF9C70"
            />

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.retryButton
              }
              onPress={() => {
                void fetchMarkets();
              }}
            >
              <Text
                style={
                  styles.retryText
                }
              >
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {topGainer &&
        topLoser ? (
          <>
            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Market Movers
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Strongest daily movements
                </Text>
              </View>

              <View
                style={
                  styles.moversBadge
                }
              >
                <Ionicons
                  name="pulse"
                  size={15}
                  color="#64AFFF"
                />

                <Text
                  style={
                    styles.moversBadgeText
                  }
                >
                  TODAY
                </Text>
              </View>
            </View>

            <View
              style={
                styles.moversRow
              }
            >
              <View
                style={[
                  styles.moverCard,
                  styles.gainerCard,
                ]}
              >
                <View
                  style={
                    styles.moverCardHeader
                  }
                >
                  <View
                    style={
                      styles.gainerIcon
                    }
                  >
                    <Ionicons
                      name="rocket-outline"
                      size={21}
                      color="#2FE58C"
                    />
                  </View>

                  <Text
                    style={
                      styles.gainerLabel
                    }
                  >
                    TOP GAINER
                  </Text>
                </View>

                <Text
                  style={
                    styles.moverPair
                  }
                >
                  {
                    topGainer.pair
                  }
                </Text>

                <Text
                  style={
                    styles.moverRate
                  }
                >
                  {formatRate(
                    topGainer.rate
                  )}
                </Text>

                <View
                  style={
                    styles.moverChangeRow
                  }
                >
                  <Ionicons
                    name="arrow-up"
                    size={16}
                    color="#2FE58C"
                  />

                  <Text
                    style={
                      styles.gainText
                    }
                  >
                    +
                    {formatChange(
                      topGainer.change
                    )}
                    %
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.moverCard,
                  styles.loserCard,
                ]}
              >
                <View
                  style={
                    styles.moverCardHeader
                  }
                >
                  <View
                    style={
                      styles.loserIcon
                    }
                  >
                    <Ionicons
                      name="trending-down-outline"
                      size={21}
                      color="#FF7A7A"
                    />
                  </View>

                  <Text
                    style={
                      styles.loserLabel
                    }
                  >
                    TOP LOSER
                  </Text>
                </View>

                <Text
                  style={
                    styles.moverPair
                  }
                >
                  {
                    topLoser.pair
                  }
                </Text>

                <Text
                  style={
                    styles.moverRate
                  }
                >
                  {formatRate(
                    topLoser.rate
                  )}
                </Text>

                <View
                  style={
                    styles.moverChangeRow
                  }
                >
                  <Ionicons
                    name="arrow-down"
                    size={16}
                    color="#FF7A7A"
                  />

                  <Text
                    style={
                      styles.lossText
                    }
                  >
                    -
                    {formatChange(
                      topLoser.change
                    )}
                    %
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : null}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Currency Pairs
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Search and filter market rates
            </Text>
          </View>

          <View
            style={
              styles.resultBadge
            }
          >
            <Text
              style={
                styles.resultBadgeText
              }
            >
              {
                filteredPairs.length
              }
            </Text>
          </View>
        </View>

        <View
          style={
            styles.searchBox
          }
        >
          <Ionicons
            name="search"
            size={20}
            color="#7892A5"
          />

          <TextInput
            value={searchText}
            onChangeText={
              setSearchText
            }
            placeholder="Search USD, Euro or currency pair"
            placeholderTextColor="#6F8799"
            style={
              styles.searchInput
            }
            selectionColor="#2FE58C"
            autoCapitalize="characters"
            autoCorrect={false}
          />

          {searchText.length >
          0 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.clearButton
              }
              onPress={
                clearSearch
              }
            >
              <Ionicons
                name="close"
                size={17}
                color="#A8BDCC"
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View
          style={
            styles.filterRow
          }
        >
          <FilterButton
            label="All"
            count={
              marketPairs.length
            }
            icon="grid-outline"
            active={
              selectedFilter ===
              "all"
            }
            onPress={() =>
              setSelectedFilter(
                "all"
              )
            }
          />

          <FilterButton
            label="Gainers"
            count={gainersCount}
            icon="trending-up"
            active={
              selectedFilter ===
              "gainers"
            }
            onPress={() =>
              setSelectedFilter(
                "gainers"
              )
            }
          />

          <FilterButton
            label="Losers"
            count={losersCount}
            icon="trending-down"
            active={
              selectedFilter ===
              "losers"
            }
            onPress={() =>
              setSelectedFilter(
                "losers"
              )
            }
          />
        </View>

        {loading &&
        marketPairs.length ===
          0 ? (
          <View
            style={
              styles.loadingCard
            }
          >
            <ActivityIndicator
              size="large"
              color="#2FE58C"
            />

            <Text
              style={
                styles.loadingTitle
              }
            >
              Loading markets
            </Text>

            <Text
              style={
                styles.loadingText
              }
            >
              Fetching the latest
              currency reference
              rates.
            </Text>
          </View>
        ) : filteredPairs.length ===
          0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="search-outline"
                size={34}
                color="#67869C"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              No markets found
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Try another search
              term or change the
              selected filter.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={
                styles.resetFilterButton
              }
              onPress={() => {
                setSearchText("");
                setSelectedFilter(
                  "all"
                );
              }}
            >
              <Text
                style={
                  styles.resetFilterText
                }
              >
                Clear Filters
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredPairs.map(
            (item) => (
              <MarketCard
                key={
                  item.code
                }
                item={item}
                onPress={() => {
                  const parts = item.pair.split("/");
                  if (parts.length === 2) {
                    setChartFromCurrency(parts[0]);
                    setChartToCurrency(parts[1]);
                  }
                }}
              />
            )
          )
        )}

        {unchangedCount >
        0 ? (
          <View
            style={
              styles.neutralCard
            }
          >
            <Ionicons
              name="remove-circle-outline"
              size={18}
              color="#829CAF"
            />

            <Text
              style={
                styles.neutralText
              }
            >
              {unchangedCount}{" "}
              {unchangedCount ===
              1
                ? "pair is"
                : "pairs are"}{" "}
              currently unchanged.
            </Text>
          </View>
        ) : null}

        <View
          style={
            styles.infoCard
          }
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#64AFFF"
          />

          <Text
            style={
              styles.infoText
            }
          >
            Rates are market
            reference values. Actual
            provider rates and fees
            may differ when completing
            a transfer.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type FilterButtonProps = {
  label: string;
  count: number;
  icon:
    keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
};

function FilterButton({
  label,
  count,
  icon,
  active,
  onPress,
}: FilterButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.filterButton,
        active &&
          styles.activeFilterButton,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={15}
        color={
          active
            ? "#FFFFFF"
            : "#829CAF"
        }
      />

      <Text
        style={[
          styles.filterText,
          active &&
            styles.activeFilterText,
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.filterCount,
          active &&
            styles.activeFilterCount,
        ]}
      >
        <Text
          style={[
            styles.filterCountText,
            active &&
              styles.activeFilterCountText,
          ]}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function MarketCard({
  item,
  onPress,
}: {
  item: MarketPair;
  onPress: () => void;
}) {
  const positive =
    item.change >= 0;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={
        styles.marketCard
      }
      onPress={onPress}
    >
      <View
        style={
          styles.leftSection
        }
      >
        <View
          style={
            styles.flagBox
          }
        >
          <Text
            style={styles.flag}
          >
            {item.flag}
          </Text>
        </View>

        <View
          style={
            styles.pairInfo
          }
        >
          <Text
            style={
              styles.pair
            }
          >
            {item.pair}
          </Text>

          <Text
            style={
              styles.currencyName
            }
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <View
            style={
              styles.referenceRow
            }
          >
            <View
              style={
                styles.referenceDot
              }
            />

            <Text
              style={
                styles.referenceText
              }
            >
              Reference rate
            </Text>
          </View>
        </View>
      </View>

      <View
        style={
          styles.rightSection
        }
      >
        <Text
          style={
            styles.rate
          }
        >
          {formatRate(
            item.rate
          )}
        </Text>

        <View
          style={[
            styles.changeBadge,
            positive
              ? styles.positiveBadge
              : styles.negativeBadge,
          ]}
        >
          <Ionicons
            name={
              positive
                ? "trending-up"
                : "trending-down"
            }
            size={14}
            color={
              positive
                ? "#2FE58C"
                : "#FF7A7A"
            }
          />

          <Text
            style={[
              styles.changeText,
              positive
                ? styles.positiveText
                : styles.negativeText,
            ]}
          >
            {positive
              ? "+"
              : "-"}
            {formatChange(
              item.change
            )}
            %
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        "#071521",
    },

    container: {
      paddingHorizontal: 18,
      paddingTop: 8,
      paddingBottom: 130,
    },

    overviewCard: {
      backgroundColor:
        "#0E2C43",
      borderRadius: 24,
      borderWidth: 1,
      borderColor: "#194661",
      padding: 18,
      marginBottom: 22,
    },

    overviewTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    overviewLabel: {
      color: "#829CAF",
      fontSize: 12,
      fontWeight: "600",
    },

    overviewValue: {
      color: "#FFFFFF",
      fontSize: 23,
      fontWeight: "900",
      marginTop: 5,
    },

    updatedText: {
      color: "#6F8DA2",
      fontSize: 11,
      marginTop: 5,
    },

    liveBadge: {
      minWidth: 78,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(47,229,140,0.12)",
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },

    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        "#2FE58C",
    },

    liveText: {
      color: "#2FE58C",
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.7,
      marginLeft: 6,
    },

    overviewStats: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#16344C",
      borderRadius: 18,
      paddingVertical: 14,
      marginTop: 18,
    },

    overviewStat: {
      flex: 1,
      alignItems: "center",
    },

    statLabelRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    overviewStatLabel: {
      color: "#829CAF",
      fontSize: 10,
      fontWeight: "700",
      marginLeft: 4,
    },

    positiveStatValue: {
      color: "#2FE58C",
      fontSize: 18,
      fontWeight: "900",
      marginTop: 6,
    },

    negativeStatValue: {
      color: "#FF7A7A",
      fontSize: 18,
      fontWeight: "900",
      marginTop: 6,
    },

    averageStatValue: {
      color: "#2FE58C",
      fontSize: 16,
      fontWeight: "900",
      marginTop: 7,
    },

    averageNegative: {
      color: "#FF7A7A",
    },

    overviewDivider: {
      width: 1,
      height: 40,
      backgroundColor:
        "#295069",
    },

    errorCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "rgba(255,156,112,0.1)",
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "rgba(255,156,112,0.35)",
      padding: 13,
      marginBottom: 20,
    },

    errorText: {
      flex: 1,
      color: "#FFB08B",
      fontSize: 12,
      lineHeight: 17,
      marginHorizontal: 9,
    },

    retryButton: {
      backgroundColor:
        "#28465B",
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },

    retryText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "800",
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 13,
    },

    sectionTitle: {
      color: "#FFFFFF",
      fontSize: 21,
      fontWeight: "900",
    },

    sectionSubtitle: {
      color: "#829CAF",
      fontSize: 11,
      marginTop: 4,
    },

    moversBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "rgba(100,175,255,0.12)",
      borderRadius: 14,
      paddingHorizontal: 9,
      paddingVertical: 7,
    },

    moversBadgeText: {
      color: "#64AFFF",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.6,
      marginLeft: 5,
    },

    moversRow: {
      flexDirection: "row",
      marginHorizontal: -5,
      marginBottom: 24,
    },

    moverCard: {
      flex: 1,
      borderRadius: 21,
      borderWidth: 1,
      padding: 15,
      marginHorizontal: 5,
    },

    gainerCard: {
      backgroundColor:
        "rgba(47,229,140,0.07)",
      borderColor:
        "rgba(47,229,140,0.25)",
    },

    loserCard: {
      backgroundColor:
        "rgba(255,122,122,0.07)",
      borderColor:
        "rgba(255,122,122,0.25)",
    },

    moverCardHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    gainerIcon: {
      width: 39,
      height: 39,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(47,229,140,0.12)",
    },

    loserIcon: {
      width: 39,
      height: 39,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(255,122,122,0.12)",
    },

    gainerLabel: {
      color: "#2FE58C",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.5,
      marginLeft: 8,
    },

    loserLabel: {
      color: "#FF7A7A",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.5,
      marginLeft: 8,
    },

    moverPair: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
      marginTop: 15,
    },

    moverRate: {
      color: "#AFC4D2",
      fontSize: 13,
      fontWeight: "700",
      marginTop: 6,
    },

    moverChangeRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 9,
    },

    gainText: {
      color: "#2FE58C",
      fontSize: 19,
      fontWeight: "900",
      marginLeft: 4,
    },

    lossText: {
      color: "#FF7A7A",
      fontSize: 19,
      fontWeight: "900",
      marginLeft: 4,
    },

    resultBadge: {
      minWidth: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#16344C",
      borderWidth: 1,
      borderColor: "#21516E",
    },

    resultBadgeText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "900",
    },

    searchBox: {
      height: 58,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#0E2C43",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#194661",
      paddingHorizontal: 15,
      marginBottom: 12,
    },

    searchInput: {
      flex: 1,
      color: "#FFFFFF",
      fontSize: 15,
      marginLeft: 10,
    },

    clearButton: {
      width: 32,
      height: 32,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#16344C",
    },

    filterRow: {
      flexDirection: "row",
      marginHorizontal: -4,
      marginBottom: 18,
    },

    filterButton: {
      flex: 1,
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#0E2C43",
      borderRadius: 15,
      borderWidth: 1,
      borderColor: "#194661",
      marginHorizontal: 4,
      paddingHorizontal: 6,
    },

    activeFilterButton: {
      backgroundColor:
        "#1687E8",
      borderColor: "#1687E8",
    },

    filterText: {
      color: "#829CAF",
      fontSize: 11,
      fontWeight: "800",
      marginLeft: 5,
    },

    activeFilterText: {
      color: "#FFFFFF",
    },

    filterCount: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#16344C",
      marginLeft: 5,
      paddingHorizontal: 4,
    },

    activeFilterCount: {
      backgroundColor:
        "rgba(255,255,255,0.18)",
    },

    filterCountText: {
      color: "#8EA7BA",
      fontSize: 9,
      fontWeight: "900",
    },

    activeFilterCountText: {
      color: "#FFFFFF",
    },

    loadingCard: {
      minHeight: 220,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#0E2C43",
      borderRadius: 22,
      borderWidth: 1,
      borderColor: "#194661",
      marginBottom: 22,
      paddingHorizontal: 25,
    },

    loadingTitle: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "800",
      marginTop: 15,
    },

    loadingText: {
      color: "#829CAF",
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      marginTop: 7,
    },

    emptyCard: {
      minHeight: 220,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#0E2C43",
      borderRadius: 22,
      borderWidth: 1,
      borderColor: "#194661",
      paddingHorizontal: 28,
      marginBottom: 20,
    },

    emptyIcon: {
      width: 66,
      height: 66,
      borderRadius: 33,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#16344C",
    },

    emptyTitle: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "800",
      marginTop: 14,
    },

    emptyText: {
      color: "#829CAF",
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      marginTop: 7,
    },

    resetFilterButton: {
      backgroundColor:
        "#1687E8",
      borderRadius: 13,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginTop: 15,
    },

    resetFilterText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "800",
    },

    marketCard: {
      minHeight: 94,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#0E2C43",
      borderRadius: 21,
      borderWidth: 1,
      borderColor: "#194661",
      paddingHorizontal: 14,
      paddingVertical: 13,
      marginBottom: 12,
    },

    leftSection: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 12,
    },

    flagBox: {
      width: 52,
      height: 52,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#16344C",
      borderWidth: 1,
      borderColor: "#21516E",
    },

    flag: {
      fontSize: 27,
    },

    pairInfo: {
      flex: 1,
      marginLeft: 12,
    },

    pair: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
    },

    currencyName: {
      color: "#829CAF",
      fontSize: 11,
      marginTop: 4,
    },

    referenceRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
    },

    referenceDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor:
        "#64AFFF",
    },

    referenceText: {
      color: "#6F8DA2",
      fontSize: 9,
      fontWeight: "600",
      marginLeft: 5,
    },

    rightSection: {
      alignItems: "flex-end",
    },

    rate: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "900",
    },

    changeBadge: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 5,
      marginTop: 7,
    },

    positiveBadge: {
      backgroundColor:
        "rgba(47,229,140,0.12)",
    },

    negativeBadge: {
      backgroundColor:
        "rgba(255,122,122,0.12)",
    },

    changeText: {
      fontSize: 11,
      fontWeight: "900",
      marginLeft: 4,
    },

    positiveText: {
      color: "#2FE58C",
    },

    negativeText: {
      color: "#FF7A7A",
    },

    neutralCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#0E2C43",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#194661",
      padding: 13,
      marginBottom: 14,
    },

    neutralText: {
      flex: 1,
      color: "#829CAF",
      fontSize: 11,
      marginLeft: 8,
    },

    infoCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor:
        "#0E2C43",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#194661",
      padding: 15,
    },

    infoText: {
      flex: 1,
      color: "#8EA7BA",
      fontSize: 12,
      lineHeight: 18,
      marginLeft: 10,
    },
  });