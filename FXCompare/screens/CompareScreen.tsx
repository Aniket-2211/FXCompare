import React, {
  useMemo,
  useState,
} from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import {
  Ionicons,
} from "@expo/vector-icons";
import {
  useNavigation,
} from "@react-navigation/native";
import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import ScreenHeader from "../components/ScreenHeader";
import AmountInput from "../components/AmountInput";
import CurrencySelector from "../components/CurrencySelector";
import CompareButton from "../components/CompareButton";
import CompareSummaryCard from "../components/CompareSummaryCard";
import RecommendationCard from "../components/RecommendationCard";
import {
  SortOption,
} from "../components/compare/SortToolbar";
import ComparisonInsights from "../components/compare/ComparisonInsights";
import ProviderResults, {
  ProviderDetails,
  ProviderResult,
} from "../components/compare/ProviderResults";
import ExchangeRateChart from "../components/charts/ExchangeRateChart";

import useComparison from "../hooks/useComparison";
import useRecentSearches from "../hooks/useRecentSearches";
import useRecommendation from "../hooks/useRecommendation";
import {
  useAppSettings,
} from "../context/AppSettingsContext";

import {
  RootStackParamList,
} from "../navigation/RootNavigator";

type CompareNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

const providerDetails: Record<
  string,
  ProviderDetails
> = {
  Wise: {
    deliveryTime: "8–12 mins",
    deliveryMinutes: 10,
    rating: 4.7,
    paymentMethods: [
      "Bank Transfer",
      "Debit Card",
      "Credit Card",
    ],
    description:
      "Transparent pricing and competitive international transfer rates.",
  },

  Remitly: {
    deliveryTime: "10–20 mins",
    deliveryMinutes: 15,
    rating: 4.5,
    paymentMethods: [
      "Bank Transfer",
      "Debit Card",
      "Cash Pickup",
    ],
    description:
      "Express transfers with flexible delivery and payout methods.",
  },

  PayPal: {
    deliveryTime: "Instant–1 day",
    deliveryMinutes: 30,
    rating: 4.2,
    paymentMethods: [
      "PayPal Balance",
      "Debit Card",
      "Credit Card",
    ],
    description:
      "Digital-wallet transfers supported across a broad global network.",
  },

  Revolut: {
    deliveryTime: "Instant",
    deliveryMinutes: 1,
    rating: 4.4,
    paymentMethods: [
      "Bank Transfer",
      "Debit Card",
      "Wallet",
    ],
    description:
      "Fast app-based transfers with multi-currency account features.",
  },

  OFX: {
    deliveryTime: "1–2 days",
    deliveryMinutes: 1440,
    rating: 4.3,
    paymentMethods: [
      "Bank Transfer",
    ],
    description:
      "International bank transfers designed for larger transaction values.",
  },
};

const fallbackProviderDetails:
  ProviderDetails = {
  deliveryTime: "Varies",
  deliveryMinutes: 9999,
  rating: 4,
  paymentMethods: [
    "Bank Transfer",
  ],
  description:
    "International money-transfer provider.",
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

export default function CompareScreen() {
  const navigation =
    useNavigation<CompareNavigationProp>();

  const {
    favouriteProviders,
  } = useAppSettings();

  const {
    addRecentSearch,
  } = useRecentSearches();

  const {
    amount,
    setAmount,

    fromCurrency,
    toCurrency,

    rate,
    loading,
    error,
    lastUpdated,

    providers,

    fetchRate,
    swapCurrencies,
    selectFromCurrency,
    selectToCurrency,
  } = useComparison();

  const [
    sortBy,
    setSortBy,
  ] = useState<SortOption>(
    "best"
  );

  const parsedAmount =
    Number(
      amount.replace(
        /,/g,
        ""
      )
    ) || 0;

  const recommendationProviders =
    useMemo(() => {
      return providers.map(
        (provider) => {
          const details =
            providerDetails[
              provider.name
            ] ??
            fallbackProviderDetails;

          return {
            name: provider.name,
            rate: provider.rate,
            fee: provider.fee,
            finalAmount:
              provider.finalAmount,
            deliveryTime:
              details.deliveryTime,
            rating:
              details.rating,
            reliabilityScore:
              details.rating * 20,
          };
        }
      );
    }, [providers]);

  const {
    bestProvider:
      recommendedProvider,
    rankedProviders:
      recommendationRankings,
    hasRecommendation,
  } = useRecommendation({
    providers:
      recommendationProviders,
  });

  const rankedByPayout =
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
    rankedByPayout[0] ??
    null;

  const secondBestProvider =
    rankedByPayout[1] ??
    null;

  const worstProvider =
    rankedByPayout.length > 0
      ? rankedByPayout[
          rankedByPayout.length -
            1
        ]
      : null;

  const highestRateProvider =
    useMemo(() => {
      if (
        providers.length === 0
      ) {
        return null;
      }

      return [
        ...providers,
      ].sort(
        (
          first,
          second
        ) =>
          second.rate -
          first.rate
      )[0];
    }, [providers]);

  const lowestFeeProvider =
    useMemo(() => {
      if (
        providers.length === 0
      ) {
        return null;
      }

      return [
        ...providers,
      ].sort(
        (
          first,
          second
        ) =>
          first.fee -
          second.fee
      )[0];
    }, [providers]);

  const fastestProvider =
    useMemo(() => {
      if (
        providers.length === 0
      ) {
        return null;
      }

      return [
        ...providers,
      ].sort(
        (
          first,
          second
        ) => {
          const firstMeta =
            providerDetails[
              first.name
            ] ??
            fallbackProviderDetails;

          const secondMeta =
            providerDetails[
              second.name
            ] ??
            fallbackProviderDetails;

          return (
            firstMeta.deliveryMinutes -
            secondMeta.deliveryMinutes
          );
        }
      )[0];
    }, [providers]);

  const topRatedProvider =
    useMemo(() => {
      if (
        providers.length === 0
      ) {
        return null;
      }

      return [
        ...providers,
      ].sort(
        (
          first,
          second
        ) => {
          const firstMeta =
            providerDetails[
              first.name
            ] ??
            fallbackProviderDetails;

          const secondMeta =
            providerDetails[
              second.name
            ] ??
            fallbackProviderDetails;

          return (
            secondMeta.rating -
            firstMeta.rating
          );
        }
      )[0];
    }, [providers]);

  const sortedProviders =
    useMemo(() => {
      const list = [
        ...providers,
      ];

      switch (sortBy) {
        case "payout":
          return list.sort(
            (
              first,
              second
            ) =>
              second.finalAmount -
              first.finalAmount
          );

        case "fee":
          return list.sort(
            (
              first,
              second
            ) =>
              first.fee -
              second.fee
          );

        case "speed":
          return list.sort(
            (
              first,
              second
            ) => {
              const firstMeta =
                providerDetails[
                  first.name
                ] ??
                fallbackProviderDetails;

              const secondMeta =
                providerDetails[
                  second.name
                ] ??
                fallbackProviderDetails;

              return (
                firstMeta.deliveryMinutes -
                secondMeta.deliveryMinutes
              );
            }
          );

        case "rating":
          return list.sort(
            (
              first,
              second
            ) => {
              const firstMeta =
                providerDetails[
                  first.name
                ] ??
                fallbackProviderDetails;

              const secondMeta =
                providerDetails[
                  second.name
                ] ??
                fallbackProviderDetails;

              return (
                secondMeta.rating -
                firstMeta.rating
              );
            }
          );

        case "favourites":
          return list.sort(
            (
              first,
              second
            ) => {
              const firstFavourite =
                favouriteProviders.some(
                  (providerName) =>
                    providerNamesMatch(
                      providerName,
                      first.name
                    )
                );

              const secondFavourite =
                favouriteProviders.some(
                  (providerName) =>
                    providerNamesMatch(
                      providerName,
                      second.name
                    )
                );

              if (
                firstFavourite &&
                !secondFavourite
              ) {
                return -1;
              }

              if (
                !firstFavourite &&
                secondFavourite
              ) {
                return 1;
              }

              return (
                second.finalAmount -
                first.finalAmount
              );
            }
          );

        case "best":
        default:
          return list.sort(
            (
              first,
              second
            ) => {
              const firstRank =
                recommendationRankings.find(
                  (item) =>
                    item.name ===
                    first.name
                )?.rank ??
                Number.MAX_SAFE_INTEGER;

              const secondRank =
                recommendationRankings.find(
                  (item) =>
                    item.name ===
                    second.name
                )?.rank ??
                Number.MAX_SAFE_INTEGER;

              return (
                firstRank -
                  secondRank ||
                second.finalAmount -
                  first.finalAmount
              );
            }
          );
      }
    }, [
      providers,
      sortBy,
      favouriteProviders,
      recommendationRankings,
    ]);

  const estimatedSavings =
    bestProvider &&
    secondBestProvider
      ? Math.max(
          bestProvider.finalAmount -
            secondBestProvider.finalAmount,
          0
        )
      : 0;

  const bestVsWorstSavings =
    bestProvider &&
    worstProvider
      ? Math.max(
          bestProvider.finalAmount -
            worstProvider.finalAmount,
          0
        )
      : 0;

  const bestProviderMeta =
    bestProvider
      ? providerDetails[
          bestProvider.name
        ] ??
        fallbackProviderDetails
      : null;

  const openProviderDetails = (
    provider: ProviderResult
  ) => {
    const details =
      providerDetails[
        provider.name
      ] ??
      fallbackProviderDetails;

    navigation.navigate(
      "ProviderDetails",
      {
        name:
          provider.name,

        rate:
          provider.rate,

        fee:
          provider.fee,

        finalAmount:
          provider.finalAmount,

        deliveryTime:
          details.deliveryTime,

        rating:
          details.rating,

        recommended:
          provider.recommended ??
          false,

        paymentMethods:
          details.paymentMethods,
      }
    );
  };

  const handleCompare = async () => {
    await fetchRate();

    await addRecentSearch({
      amount,
      fromCurrency,
      toCurrency,
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
            refreshing={loading}
            onRefresh={() => {
              void handleCompare();
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
          title="Provider Comparison"
          subtitle="Analyse payouts, fees, speed and ratings"
          showAction
          actionIcon="refresh"
          onActionPress={() => {
            void handleCompare();
          }}
        />

        <View
          style={
            styles.transferCard
          }
        >
          <View
            style={
              styles.transferHeader
            }
          >
            <View>
              <Text
                style={
                  styles.transferLabel
                }
              >
                Transfer Setup
              </Text>

              <Text
                style={
                  styles.transferTitle
                }
              >
                Build your comparison
              </Text>
            </View>

            <View
              style={[
                styles.liveBadge,
                error &&
                  styles.errorLiveBadge,
              ]}
            >
              <View
                style={[
                  styles.liveDot,
                  error &&
                    styles.errorLiveDot,
                ]}
              />

              <Text
                style={[
                  styles.liveText,
                  error &&
                    styles.errorLiveText,
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

          <View
            style={
              styles.referenceRateBox
            }
          >
            <View>
              <Text
                style={
                  styles.referenceLabel
                }
              >
                Market Reference Rate
              </Text>

              <Text
                style={
                  styles.referenceRate
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
            </View>

            <Ionicons
              name="pulse-outline"
              size={25}
              color="#64AFFF"
            />
          </View>

          {error ? (
            <View
              style={
                styles.inlineError
              }
            >
              <Ionicons
                name="warning-outline"
                size={18}
                color="#FF9C70"
              />

              <Text
                style={
                  styles.inlineErrorText
                }
              >
                {error}
              </Text>
            </View>
          ) : null}

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

          <CompareButton
            title="Compare Providers"
            loading={loading}
            disabled={
              parsedAmount <= 0
            }
            onPress={() => {
              void handleCompare();
            }}
          />

          <View
            style={
              styles.updatedRow
            }
          >
            <Ionicons
              name="time-outline"
              size={14}
              color="#6F8DA2"
            />

            <Text
              style={
                styles.updatedText
              }
            >
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString(
                    [],
                    {
                      hour:
                        "2-digit",
                      minute:
                        "2-digit",
                    }
                  )}`
                : "Waiting for live rate"}
            </Text>
          </View>
        </View>

        <ExchangeRateChart
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          currentRate={rate}
        />

        {hasRecommendation &&
        recommendedProvider ? (
          <RecommendationCard
            providerName={
              recommendedProvider.name
            }
            score={
              recommendedProvider.score
            }
            rating={
              recommendedProvider.rating
            }
            finalAmount={
              recommendedProvider.finalAmount
            }
            fee={
              recommendedProvider.fee
            }
            deliveryTime={
              recommendedProvider.deliveryTime
            }
            savings={
              recommendedProvider.savings
            }
            currency={
              toCurrency
            }
            reasons={
              recommendedProvider.reasons
            }
            loading={loading}
            onPress={() =>
              openProviderDetails({
                name:
                  recommendedProvider.name,
                rate:
                  recommendedProvider.rate,
                fee:
                  recommendedProvider.fee,
                finalAmount:
                  recommendedProvider.finalAmount,
                recommended: true,
              })
            }
          />
        ) : null}

        {bestProvider &&
        bestProviderMeta ? (
          <CompareSummaryCard
            amount={
              amount || "0"
            }
            fromCurrency={
              fromCurrency
            }
            toCurrency={
              toCurrency
            }
            bestProvider={
              bestProvider.name
            }
            savings={
              estimatedSavings
            }
            deliveryTime={
              bestProviderMeta.deliveryTime
            }
            providers={providers}
          />
        ) : null}

        {bestProvider ? (
          <ComparisonInsights
            bestProviderName={
              bestProvider.name
            }
            lowestFeeProviderName={
              lowestFeeProvider?.name ??
              "--"
            }
            fastestProviderName={
              fastestProvider?.name ??
              "--"
            }
            topRatedProviderName={
              topRatedProvider?.name ??
              "--"
            }
            bestVsWorstSavings={
              bestVsWorstSavings
            }
            currency={toCurrency}
          />
        ) : null}

        <ProviderResults
          providers={
            sortedProviders
          }
          rankedByPayout={
            rankedByPayout
          }
          sortBy={sortBy}
          favouriteProviders={
            favouriteProviders
          }
          loading={loading}
          providerDetails={
            providerDetails
          }
          fallbackProviderDetails={
            fallbackProviderDetails
          }
          onSortChange={
            setSortBy
          }
          onProviderPress={
            openProviderDetails
          }
        />

        <View
          style={
            styles.noticeCard
          }
        >
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#64AFFF"
          />

          <Text
            style={
              styles.noticeText
            }
          >
            Provider results are estimates
            calculated from the market
            reference rate and configured fee
            assumptions. Confirm the final
            rate, fee and delivery time
            directly with the provider.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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

    transferCard: {
      backgroundColor:
        "#0E2C43",
      borderRadius: 25,
      borderWidth: 1,
      borderColor:
        "#194661",
      padding: 17,
      marginBottom: 20,
    },

    transferHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 15,
    },

    transferLabel: {
      color: "#829CAF",
      fontSize: 11,
      fontWeight: "700",
    },

    transferTitle: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "900",
      marginTop: 4,
    },

    liveBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "rgba(47,229,140,0.12)",
      borderRadius: 14,
      paddingHorizontal: 9,
      paddingVertical: 7,
    },

    errorLiveBadge: {
      backgroundColor:
        "rgba(255,156,112,0.12)",
    },

    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        "#2FE58C",
    },

    errorLiveDot: {
      backgroundColor:
        "#FF9C70",
    },

    liveText: {
      color: "#2FE58C",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.7,
      marginLeft: 6,
    },

    errorLiveText: {
      color: "#FF9C70",
    },

    referenceRateBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#16344C",
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        "#21516E",
      padding: 14,
      marginBottom: 16,
    },

    referenceLabel: {
      color: "#829CAF",
      fontSize: 10,
      fontWeight: "600",
    },

    referenceRate: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
      marginTop: 5,
    },

    inlineError: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor:
        "rgba(255,156,112,0.09)",
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "rgba(255,156,112,0.25)",
      padding: 12,
      marginBottom: 14,
    },

    inlineErrorText: {
      flex: 1,
      color: "#FFB08B",
      fontSize: 11,
      lineHeight: 16,
      marginLeft: 8,
    },

    updatedRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 12,
    },

    updatedText: {
      color: "#6F8DA2",
      fontSize: 10,
      marginLeft: 5,
    },

    recommendationCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor:
        "rgba(255,214,90,0.06)",
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "rgba(255,214,90,0.20)",
      padding: 15,
      marginTop: 4,
      marginBottom: 14,
    },

    recommendationIcon: {
      width: 44,
      height: 44,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(255,214,90,0.11)",
    },

    recommendationTextBox: {
      flex: 1,
      marginLeft: 11,
    },

    recommendationTitle: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "900",
    },

    recommendationText: {
      color: "#9FB6C9",
      fontSize: 11,
      lineHeight: 17,
      marginTop: 5,
    },

    noticeCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor:
        "#0E2C43",
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        "#194661",
      padding: 15,
    },

    noticeText: {
      flex: 1,
      color: "#8EA7BA",
      fontSize: 12,
      lineHeight: 18,
      marginLeft: 10,
    },
  });