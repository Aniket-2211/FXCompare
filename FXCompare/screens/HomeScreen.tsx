import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import {
  Ionicons,
} from "@expo/vector-icons";

import Header from "../components/Header";
import AmountInput from "../components/AmountInput";
import CurrencySelector from "../components/CurrencySelector";
import CompareButton from "../components/CompareButton";
import TrendChart from "../components/TrendChart";
import RecommendationCard from "../components/RecommendationCard";
import FavoritePairsCard, {
  FavouriteCurrencyPair,
} from "../components/FavoritePairsCard";
import RecentSearchesCard from "../components/RecentSearchesCard";
import FXCompareAISheet from "../components/ai/FXCompareAISheet";

import useComparison from "../hooks/useComparison";
import useRecentSearches from "../hooks/useRecentSearches";
import {
  fetchAllMarkets,
  MarketPair,
} from "../services/marketsApi";
import { RecentSearch } from "../services/recentSearchService";

type QuickAction = {
  id:
    | "compare"
    | "markets"
    | "alerts"
    | "profile";
  title: string;
  subtitle: string;
  icon:
    keyof typeof Ionicons.glyphMap;
  screen:
    | "Compare"
    | "Markets"
    | "Alerts"
    | "Profile";
  color: string;
};

const quickActions: QuickAction[] = [
  {
    id: "compare",
    title: "Compare",
    subtitle: "Provider rankings",
    icon: "git-compare-outline",
    screen: "Compare",
    color: "#64AFFF",
  },
  {
    id: "markets",
    title: "Markets",
    subtitle: "Currency movements",
    icon: "stats-chart-outline",
    screen: "Markets",
    color: "#2FE58C",
  },
  {
    id: "alerts",
    title: "Alerts",
    subtitle: "Target rates",
    icon: "notifications-outline",
    screen: "Alerts",
    color: "#FFD65A",
  },
  {
    id: "profile",
    title: "Favourites",
    subtitle: "Saved providers",
    icon: "heart-outline",
    screen: "Profile",
    color: "#FF8296",
  },
];

const providerMeta: Record<
  string,
  {
    icon:
      keyof typeof Ionicons.glyphMap;
    deliveryTime: string;
    rating: number;
    paymentMethods: string[];
  }
> = {
  Wise: {
    icon: "flash-outline",
    deliveryTime: "8–12 mins",
    rating: 4.7,
    paymentMethods: [
      "Bank Transfer",
      "Debit Card",
      "Credit Card",
    ],
  },

  Remitly: {
    icon: "send-outline",
    deliveryTime: "10–20 mins",
    rating: 4.5,
    paymentMethods: [
      "Bank Transfer",
      "Debit Card",
      "Cash Pickup",
    ],
  },

  PayPal: {
    icon: "wallet-outline",
    deliveryTime: "Instant–1 day",
    rating: 4.2,
    paymentMethods: [
      "PayPal Balance",
      "Debit Card",
      "Credit Card",
    ],
  },

  Revolut: {
    icon: "card-outline",
    deliveryTime: "Instant",
    rating: 4.4,
    paymentMethods: [
      "Bank Transfer",
      "Debit Card",
      "Wallet",
    ],
  },

  OFX: {
    icon: "business-outline",
    deliveryTime: "1–2 days",
    rating: 4.3,
    paymentMethods: [
      "Bank Transfer",
    ],
  },
};

const fallbackProviderMeta = {
  icon:
    "business-outline" as
      keyof typeof Ionicons.glyphMap,
  deliveryTime: "Varies",
  rating: 4,
  paymentMethods: [
    "Bank Transfer",
  ],
};

const formatAmount = (
  value: number
) => {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
};

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

const formatUpdatedTime = (
  value: Date | null
) => {
  if (!value) {
    return "Waiting for live rate";
  }

  return `Updated ${value.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  )}`;
};

export default function HomeScreen() {
  const navigation =
    useNavigation<any>();

  const [
    aiVisible,
    setAiVisible,
  ] = useState(false);

  const {
    recentSearches,
    loading: recentSearchesLoading,
    saving: recentSearchesSaving,
    loadRecentSearches,
    deleteRecentSearch,
    clearAllRecentSearches,
  } = useRecentSearches();

  const {
    amount,
    setAmount,

    fromCurrency,
    toCurrency,

    rate,
    convertedAmount,

    loading,
    error,
    lastUpdated,

    providers,
    recommendation,

    trendData,
    trendLoading,
    trendError,
    selectedRange,
    setSelectedRange,
    fetchTrendData,

    fetchRate,
    swapCurrencies,

    selectFromCurrency,
    selectToCurrency,
  } = useComparison();

  const numericAmount =
    Number(
      amount.replace(/,/g, "")
    ) || 0;

  const [marketPairs, setMarketPairs] =
    useState<MarketPair[]>([]);

  const [marketLoading, setMarketLoading] =
    useState(true);

  const [marketRefreshing, setMarketRefreshing] =
    useState(false);

  const refreshing =
    loading ||
    trendLoading ||
    marketRefreshing;

  const loadFavouritePairs = useCallback(
    async (refreshRequest = false) => {
      try {
        if (refreshRequest) {
          setMarketRefreshing(true);
        } else {
          setMarketLoading(true);
        }

        const { pairs } =
          await fetchAllMarkets();

        setMarketPairs(pairs);
      } catch (marketError) {
        console.log(
          "Home favourite markets error:",
          marketError
        );
      } finally {
        setMarketLoading(false);
        setMarketRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadFavouritePairs();

    const timer = setInterval(() => {
      void loadFavouritePairs(true);
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, [loadFavouritePairs]);

  useFocusEffect(
    useCallback(() => {
      void loadRecentSearches();
    }, [loadRecentSearches])
  );

  const favouritePairs =
    useMemo<FavouriteCurrencyPair[]>(
      () =>
        marketPairs.map((pair) => ({
          id: `${pair.code.toLowerCase()}-inr`,
          fromCurrency: pair.code,
          toCurrency: "INR",
          rate: pair.rate,
          change: pair.change,
          fromFlag: pair.flag,
          toFlag: "🇮🇳",
        })),
      [marketPairs]
    );

  const rankedProviders =
    useMemo(() => {
      return [
        ...providers,
      ].sort(
        (
          first,
          second
        ) =>
          second.finalAmount -
          first.finalAmount
      );
    }, [providers]);

  const bestProvider =
    rankedProviders[0] ??
    null;

  const secondBestProvider =
    rankedProviders[1] ??
    null;

  const bestProviderMeta =
    bestProvider
      ? providerMeta[
          bestProvider.name
        ] ??
        fallbackProviderMeta
      : fallbackProviderMeta;

  const estimatedSavings =
    bestProvider &&
    secondBestProvider
      ? Math.max(
          bestProvider.finalAmount -
            secondBestProvider.finalAmount,
          0
        )
      : 0;

  const aiBestProvider =
    bestProvider
      ? {
          name:
            bestProvider.name,
          rate:
            bestProvider.rate,
          fee:
            bestProvider.fee,
          finalAmount:
            bestProvider.finalAmount,
          deliveryTime:
            bestProviderMeta.deliveryTime,
          rating:
            bestProviderMeta.rating,
        }
      : null;

  const aiSecondBestProvider =
    secondBestProvider
      ? {
          name:
            secondBestProvider.name,
          rate:
            secondBestProvider.rate,
          fee:
            secondBestProvider.fee,
          finalAmount:
            secondBestProvider.finalAmount,
          deliveryTime:
            (
              providerMeta[
                secondBestProvider.name
              ] ??
              fallbackProviderMeta
            ).deliveryTime,
          rating:
            (
              providerMeta[
                secondBestProvider.name
              ] ??
              fallbackProviderMeta
            ).rating,
        }
      : null;

  const openProviderDetails = () => {
    if (!bestProvider) {
      return;
    }

    navigation.navigate(
      "ProviderDetails",
      {
        name:
          bestProvider.name,

        rate:
          bestProvider.rate,

        fee:
          bestProvider.fee,

        finalAmount:
          bestProvider.finalAmount,

        recommended:
          bestProvider.recommended ??
          false,

        deliveryTime:
          bestProviderMeta.deliveryTime,

        rating:
          bestProviderMeta.rating,

        paymentMethods:
          bestProviderMeta.paymentMethods,
      }
    );
  };

  const openScreen = (
    screen:
      | "Compare"
      | "Markets"
      | "Alerts"
      | "Profile"
  ) => {
    navigation.navigate(screen);
  };

  const openFavouritePair = (
    pair: FavouriteCurrencyPair
  ) => {
    navigation.navigate("Compare", {
      fromCurrency: pair.fromCurrency,
      toCurrency: pair.toCurrency,
    });
  };

  const openRecentSearch = (
    search: RecentSearch
  ) => {
    navigation.navigate("Compare", {
      amount: search.amount,
      fromCurrency: search.fromCurrency,
      toCurrency: search.toCurrency,
    });
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
            refreshing={refreshing}
            onRefresh={() => {
              void Promise.all([
                fetchRate(),
                loadFavouritePairs(true),
              ]);
            }}
            tintColor="#2FE58C"
            colors={["#2FE58C"]}
            progressBackgroundColor="#0E2C43"
          />
        }
      >
        <Header />

        <View
          style={[
            styles.heroCard,
            bestProvider &&
              styles.activeHeroCard,
          ]}
        >
          <View
            style={
              styles.heroGlow
            }
          />

          <View
            style={
              styles.heroHeader
            }
          >
            <View>
              <Text
                style={
                  styles.heroEyebrow
                }
              >
                TODAY’S BEST TRANSFER
              </Text>

              <Text
                style={
                  styles.heroTitle
                }
              >
                {bestProvider
                  ? bestProvider.name
                  : "Find your best provider"}
              </Text>
            </View>

            <View
              style={
                styles.heroIconBox
              }
            >
              <Ionicons
                name={
                  bestProvider
                    ? bestProviderMeta.icon
                    : "trophy-outline"
                }
                size={27}
                color="#2FE58C"
              />
            </View>
          </View>

          {bestProvider ? (
            <>
              <View
                style={
                  styles.heroAmounts
                }
              >
                <View
                  style={
                    styles.heroAmountItem
                  }
                >
                  <Text
                    style={
                      styles.heroAmountLabel
                    }
                  >
                    You Send
                  </Text>

                  <Text
                    style={
                      styles.heroSendAmount
                    }
                  >
                    {formatAmount(
                      numericAmount
                    )}{" "}
                    {fromCurrency}
                  </Text>
                </View>

                <View
                  style={
                    styles.heroArrow
                  }
                >
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#64AFFF"
                  />
                </View>

                <View
                  style={[
                    styles.heroAmountItem,
                    styles.heroReceiveItem,
                  ]}
                >
                  <Text
                    style={
                      styles.heroAmountLabel
                    }
                  >
                    Recipient Gets
                  </Text>

                  <Text
                    style={
                      styles.heroReceiveAmount
                    }
                  >
                    {formatAmount(
                      bestProvider.finalAmount
                    )}{" "}
                    {toCurrency}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.heroStats
                }
              >
                <HeroStat
                  icon="wallet-outline"
                  label="Estimated saving"
                  value={`${formatAmount(
                    estimatedSavings
                  )} ${toCurrency}`}
                />

                <View
                  style={
                    styles.heroStatDivider
                  }
                />

                <HeroStat
                  icon="time-outline"
                  label="Arrival"
                  value={
                    bestProviderMeta.deliveryTime
                  }
                />

                <View
                  style={
                    styles.heroStatDivider
                  }
                />

                <HeroStat
                  icon="star"
                  label="Rating"
                  value={bestProviderMeta.rating.toFixed(
                    1
                  )}
                />
              </View>

              <View
                style={
                  styles.heroActions
                }
              >
                <TouchableOpacity
                  activeOpacity={
                    0.86
                  }
                  style={
                    styles.heroPrimaryButton
                  }
                  onPress={() =>
                    openScreen(
                      "Compare"
                    )
                  }
                >
                  <Text
                    style={
                      styles.heroPrimaryText
                    }
                  >
                    Compare Providers
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={
                    0.82
                  }
                  style={
                    styles.heroSecondaryButton
                  }
                  onPress={
                    openProviderDetails
                  }
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#64AFFF"
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View
              style={
                styles.heroEmptyState
              }
            >
              <Text
                style={
                  styles.heroEmptyText
                }
              >
                Enter an amount and refresh
                the live rate to calculate
                your best transfer option.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.aiLauncherCard}>
          <View style={styles.aiLauncherTop}>
            <View style={styles.aiLauncherIcon}>
              <Ionicons
                name="sparkles"
                size={22}
                color="#2FE58C"
              />
            </View>

            <View style={styles.aiLauncherTextBox}>
              <Text style={styles.aiLauncherEyebrow}>
                FXCOMPARE AI
              </Text>

              <Text style={styles.aiLauncherTitle}>
                Ask about this transfer
              </Text>

              <Text style={styles.aiLauncherSubtitle}>
                Understand the best provider, fees, speed, savings and current rate.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.aiLauncherButton}
            onPress={() =>
              setAiVisible(true)
            }
          >
            <Text style={styles.aiLauncherButtonText}>
              Ask FXCompare AI
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#071521"
            />
          </TouchableOpacity>
        </View>

        <View
          style={
            styles.liveRateCard
          }
        >
          <View
            style={
              styles.liveRateLeft
            }
          >
            <View
              style={
                styles.liveRateIcon
              }
            >
              <Ionicons
                name="pulse-outline"
                size={22}
                color="#64AFFF"
              />
            </View>

            <View>
              <Text
                style={
                  styles.liveRateLabel
                }
              >
                Live Reference Rate
              </Text>

              <Text
                style={
                  styles.liveRateValue
                }
              >
                1 {fromCurrency} ={" "}
                {rate > 0
                  ? formatRate(
                      rate
                    )
                  : "--"}{" "}
                {toCurrency}
              </Text>

              <Text
                style={
                  styles.updatedText
                }
              >
                {formatUpdatedTime(
                  lastUpdated
                )}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.liveStatus,
              error &&
                styles.errorStatus,
            ]}
          >
            <View
              style={[
                styles.liveDot,
                error &&
                  styles.errorDot,
              ]}
            />

            <Text
              style={[
                styles.liveStatusText,
                error &&
                  styles.errorStatusText,
              ]}
            >
              {loading
                ? "UPDATING"
                : error
                ? "ISSUE"
                : "LIVE"}
            </Text>
          </View>
        </View>

        {error ? (
          <View
            style={
              styles.errorCard
            }
          >
            <Ionicons
              name="warning-outline"
              size={20}
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
              onPress={() => {
                void fetchRate();
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

        <Text
          style={
            styles.sectionTitle
          }
        >
          Quick Converter
        </Text>

        <Text
          style={
            styles.sectionSubtitle
          }
        >
          Update the amount or currency pair
        </Text>

        <View
          style={
            styles.converterCard
          }
        >
          <AmountInput
            value={amount}
            onChangeText={
              setAmount
            }
          />

          <CurrencySelector
            fromCurrency={
              fromCurrency
            }
            toCurrency={
              toCurrency
            }
            onFromPress={
              selectFromCurrency
            }
            onToPress={
              selectToCurrency
            }
            onSwapPress={
              swapCurrencies
            }
          />

          <View
            style={
              styles.conversionPreview
            }
          >
            <Text
              style={
                styles.conversionPreviewLabel
              }
            >
              Market conversion
            </Text>

            <Text
              style={
                styles.conversionPreviewValue
              }
            >
              {formatAmount(
                convertedAmount
              )}{" "}
              {toCurrency}
            </Text>
          </View>

          <CompareButton
            title="Refresh Dashboard"
            loading={loading}
            disabled={
              numericAmount <= 0
            }
            onPress={() => {
              void fetchRate();
            }}
          />
        </View>

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
              Quick Actions
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Jump directly to key tools
            </Text>
          </View>
        </View>

        <View
          style={
            styles.quickActionsGrid
          }
        >
          {quickActions.map(
            (action) => (
              <TouchableOpacity
                key={action.id}
                activeOpacity={0.84}
                style={
                  styles.quickActionCard
                }
                onPress={() =>
                  openScreen(
                    action.screen
                  )
                }
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    {
                      backgroundColor:
                        `${action.color}18`,
                      borderColor:
                        `${action.color}45`,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      action.icon
                    }
                    size={23}
                    color={
                      action.color
                    }
                  />
                </View>

                <Text
                  style={
                    styles.quickActionTitle
                  }
                >
                  {action.title}
                </Text>

                <Text
                  style={
                    styles.quickActionSubtitle
                  }
                >
                  {action.subtitle}
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#6F8DA2"
                  style={
                    styles.quickActionArrow
                  }
                />
              </TouchableOpacity>
            )
          )}
        </View>

        <FavoritePairsCard
          pairs={favouritePairs}
          loading={marketLoading}
          onPairPress={openFavouritePair}
          onViewAllPress={() =>
            openScreen("Markets")
          }
        />

        <RecentSearchesCard
          searches={recentSearches}
          loading={recentSearchesLoading}
          saving={recentSearchesSaving}
          onSearchPress={openRecentSearch}
          onDeletePress={(id) => {
            void deleteRecentSearch(id);
          }}
          onClearAllPress={() => {
            void clearAllRecentSearches();
          }}
        />

        <View
          style={
            styles.marketSnapshotHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Market Snapshot
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Your selected currency pair
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              openScreen(
                "Markets"
              )
            }
          >
            <Text
              style={
                styles.viewAllText
              }
            >
              View Markets
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={
            styles.marketSnapshotCard
          }
        >
          <View
            style={
              styles.marketPairBox
            }
          >
            <View
              style={
                styles.marketPairIcon
              }
            >
              <Ionicons
                name="swap-horizontal"
                size={22}
                color="#64AFFF"
              />
            </View>

            <View>
              <Text
                style={
                  styles.marketPair
                }
              >
                {fromCurrency}/
                {toCurrency}
              </Text>

              <Text
                style={
                  styles.marketPairLabel
                }
              >
                Current reference pair
              </Text>
            </View>
          </View>

          <View
            style={
              styles.marketValueBox
            }
          >
            <Text
              style={
                styles.marketValue
              }
            >
              {rate > 0
                ? formatRate(rate)
                : "--"}
            </Text>

            <View
              style={
                styles.marketLatestBadge
              }
            >
              <Ionicons
                name="radio-button-on"
                size={11}
                color="#2FE58C"
              />

              <Text
                style={
                  styles.marketLatestText
                }
              >
                LATEST
              </Text>
            </View>
          </View>
        </View>

        <TrendChart
          data={trendData}
          loading={
            trendLoading
          }
          error={trendError}
          selectedRange={
            selectedRange
          }
          onChangeRange={
            setSelectedRange
          }
          onRetry={() => {
            void fetchTrendData();
          }}
        />

        <RecommendationCard
          recommendation={
            recommendation
          }
        />
      </ScrollView>

      <FXCompareAISheet
        visible={aiVisible}
        onClose={() =>
          setAiVisible(false)
        }
        amount={numericAmount}
        fromCurrency={
          fromCurrency
        }
        toCurrency={
          toCurrency
        }
        referenceRate={rate}
        bestProvider={
          aiBestProvider
        }
        secondBestProvider={
          aiSecondBestProvider
        }
        estimatedSavings={
          estimatedSavings
        }
      />
    </SafeAreaView>
  );
}

type HeroStatProps = {
  icon:
    keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function HeroStat({
  icon,
  label,
  value,
}: HeroStatProps) {
  return (
    <View
      style={
        styles.heroStat
      }
    >
      <Ionicons
        name={icon}
        size={17}
        color="#2FE58C"
      />

      <Text
        style={
          styles.heroStatLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.heroStatValue
        }
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
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
      paddingBottom: 135,
    },

    heroCard: {
      position: "relative",
      backgroundColor:
        "#0E2C43",
      borderRadius: 27,
      borderWidth: 1,
      borderColor:
        "#194661",
      padding: 19,
      marginBottom: 16,
      overflow: "hidden",
    },

    activeHeroCard: {
      backgroundColor:
        "#0E3045",
      borderColor:
        "rgba(47,229,140,0.55)",
    },

    heroGlow: {
      position: "absolute",
      width: 210,
      height: 210,
      borderRadius: 105,
      top: -125,
      right: -105,
      backgroundColor:
        "rgba(47,229,140,0.08)",
    },

    heroHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    heroEyebrow: {
      color: "#2FE58C",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1,
    },

    heroTitle: {
      color: "#FFFFFF",
      fontSize: 24,
      fontWeight: "900",
      marginTop: 6,
    },

    heroIconBox: {
      width: 56,
      height: 56,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(47,229,140,0.11)",
      borderWidth: 1,
      borderColor:
        "rgba(47,229,140,0.3)",
    },

    heroAmounts: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#163A50",
      borderRadius: 19,
      padding: 14,
      marginTop: 18,
    },

    heroAmountItem: {
      flex: 1,
    },

    heroReceiveItem: {
      alignItems: "flex-end",
    },

    heroAmountLabel: {
      color: "#829CAF",
      fontSize: 10,
      fontWeight: "600",
    },

    heroSendAmount: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
      marginTop: 6,
    },

    heroReceiveAmount: {
      color: "#2FE58C",
      fontSize: 16,
      fontWeight: "900",
      marginTop: 6,
      textAlign: "right",
    },

    heroArrow: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#1C435B",
      marginHorizontal: 8,
    },

    heroStats: {
      flexDirection: "row",
      backgroundColor:
        "rgba(47,229,140,0.07)",
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        "rgba(47,229,140,0.18)",
      paddingVertical: 13,
      marginTop: 12,
    },

    heroStat: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 5,
    },

    heroStatDivider: {
      width: 1,
      backgroundColor:
        "rgba(47,229,140,0.18)",
    },

    heroStatLabel: {
      color: "#829C90",
      fontSize: 8,
      marginTop: 5,
      textAlign: "center",
    },

    heroStatValue: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "900",
      marginTop: 4,
      textAlign: "center",
    },

    heroActions: {
      flexDirection: "row",
      marginTop: 15,
    },

    heroPrimaryButton: {
      flex: 1,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#1687E8",
      borderRadius: 17,
    },

    heroPrimaryText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "900",
      marginRight: 8,
    },

    heroSecondaryButton: {
      width: 52,
      height: 52,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#163A50",
      borderWidth: 1,
      borderColor:
        "#24536C",
      marginLeft: 10,
    },

    heroEmptyState: {
      minHeight: 100,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#16344C",
      borderRadius: 18,
      paddingHorizontal: 24,
      marginTop: 18,
    },

    heroEmptyText: {
      color: "#829CAF",
      fontSize: 12,
      lineHeight: 19,
      textAlign: "center",
    },

    aiLauncherCard: {
      backgroundColor:
        "#0E2C43",
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        "rgba(47,229,140,0.28)",
      padding: 15,
      marginBottom: 14,
    },

    aiLauncherTop: {
      flexDirection: "row",
      alignItems: "center",
    },

    aiLauncherIcon: {
      width: 47,
      height: 47,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(47,229,140,0.10)",
      borderWidth: 1,
      borderColor:
        "rgba(47,229,140,0.20)",
    },

    aiLauncherTextBox: {
      flex: 1,
      marginLeft: 11,
    },

    aiLauncherEyebrow: {
      color: "#2FE58C",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.8,
    },

    aiLauncherTitle: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
      marginTop: 3,
    },

    aiLauncherSubtitle: {
      color: "#829CAF",
      fontSize: 9,
      lineHeight: 14,
      marginTop: 4,
    },

    aiLauncherButton: {
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#2FE58C",
      borderRadius: 16,
      marginTop: 13,
    },

    aiLauncherButtonText: {
      color: "#071521",
      fontSize: 12,
      fontWeight: "900",
      marginRight: 7,
    },

    liveRateCard: {
      minHeight: 86,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#0E2C43",
      borderRadius: 21,
      borderWidth: 1,
      borderColor:
        "#194661",
      paddingHorizontal: 15,
      marginBottom: 14,
    },

    liveRateLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 10,
    },

    liveRateIcon: {
      width: 45,
      height: 45,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(100,175,255,0.11)",
      marginRight: 12,
    },

    liveRateLabel: {
      color: "#829CAF",
      fontSize: 10,
      fontWeight: "600",
    },

    liveRateValue: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
      marginTop: 4,
    },

    updatedText: {
      color: "#647F92",
      fontSize: 9,
      marginTop: 4,
    },

    liveStatus: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "rgba(47,229,140,0.11)",
      borderRadius: 13,
      paddingHorizontal: 9,
      paddingVertical: 7,
    },

    errorStatus: {
      backgroundColor:
        "rgba(255,156,112,0.11)",
    },

    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        "#2FE58C",
    },

    errorDot: {
      backgroundColor:
        "#FF9C70",
    },

    liveStatusText: {
      color: "#2FE58C",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.7,
      marginLeft: 5,
    },

    errorStatusText: {
      color: "#FF9C70",
    },

    errorCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "rgba(255,156,112,0.09)",
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "rgba(255,156,112,0.28)",
      padding: 13,
      marginBottom: 16,
    },

    errorText: {
      flex: 1,
      color: "#FFB08B",
      fontSize: 11,
      lineHeight: 16,
      marginHorizontal: 9,
    },

    retryText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "900",
    },

    sectionHeader: {
      marginTop: 3,
      marginBottom: 13,
    },

    sectionTitle: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "900",
    },

    sectionSubtitle: {
      color: "#829CAF",
      fontSize: 11,
      marginTop: 4,
      marginBottom: 13,
    },

    converterCard: {
      backgroundColor:
        "#0E2C43",
      borderRadius: 24,
      padding: 16,
      marginBottom: 22,
      borderWidth: 1,
      borderColor:
        "#194661",
    },

    conversionPreview: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#16344C",
      borderRadius: 15,
      paddingHorizontal: 13,
      paddingVertical: 12,
      marginBottom: 15,
    },

    conversionPreviewLabel: {
      color: "#829CAF",
      fontSize: 11,
    },

    conversionPreviewValue: {
      color: "#2FE58C",
      fontSize: 14,
      fontWeight: "900",
    },

    quickActionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -5,
      marginBottom: 20,
    },

    quickActionCard: {
      position: "relative",
      width: "47%",
      minHeight: 132,
      backgroundColor:
        "#0E2C43",
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "#194661",
      padding: 14,
      marginHorizontal: 5,
      marginBottom: 10,
    },

    quickActionIcon: {
      width: 43,
      height: 43,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },

    quickActionTitle: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "900",
      marginTop: 12,
    },

    quickActionSubtitle: {
      color: "#829CAF",
      fontSize: 9,
      marginTop: 4,
    },

    quickActionArrow: {
      position: "absolute",
      right: 13,
      bottom: 13,
    },

    marketSnapshotHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
      marginBottom: 13,
    },

    viewAllText: {
      color: "#64AFFF",
      fontSize: 11,
      fontWeight: "800",
      marginTop: 5,
    },

    marketSnapshotCard: {
      minHeight: 88,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#0E2C43",
      borderRadius: 21,
      borderWidth: 1,
      borderColor:
        "#194661",
      paddingHorizontal: 15,
      marginBottom: 18,
    },

    marketPairBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 12,
    },

    marketPairIcon: {
      width: 46,
      height: 46,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#16344C",
      marginRight: 12,
    },

    marketPair: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
    },

    marketPairLabel: {
      color: "#829CAF",
      fontSize: 10,
      marginTop: 4,
    },

    marketValueBox: {
      alignItems: "flex-end",
    },

    marketValue: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "900",
    },

    marketLatestBadge: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
    },

    marketLatestText: {
      color: "#2FE58C",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.6,
      marginLeft: 4,
    },
  });