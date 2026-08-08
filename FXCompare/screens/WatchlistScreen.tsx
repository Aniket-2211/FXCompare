import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
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

import ScreenHeader from "../components/ScreenHeader";
import CurrencyPickerModal, {
  CurrencyOption,
  currencyOptions,
} from "../components/CurrencyPickerModal";

import AddWatchlistPair from "../components/watchlist/AddWatchlistPair";
import WatchlistCard from "../components/watchlist/WatchlistCard";
import WatchlistSummaryCard from "../components/watchlist/WatchlistSummaryCard";

import {
  addWatchlistItem,
  getWatchlist,
  removeWatchlistItem,
  updateWatchlistItem,
  WatchlistItem,
} from "../services/watchlistStorage";

import {
  getAlertRates,
  getPairKey,
} from "../services/exchangeApi";

type PickerType =
  | "from"
  | "to"
  | null;

const getCurrencyDetails = (
  code: string
): CurrencyOption =>
  currencyOptions.find(
    (item) =>
      item.code === code
  ) ?? {
    code,
    name: code,
    flag: "🌐",
    symbol: "",
  };

export default function WatchlistScreen() {
  const [
    items,
    setItems,
  ] = useState<
    WatchlistItem[]
  >([]);

  const [
    liveRates,
    setLiveRates,
  ] = useState<
    Record<string, number>
  >({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    fromCurrency,
    setFromCurrency,
  ] = useState("USD");

  const [
    toCurrency,
    setToCurrency,
  ] = useState("INR");

  const [
    targetRate,
    setTargetRate,
  ] = useState("");

  const [
    note,
    setNote,
  ] = useState("");

  const [
    pickerType,
    setPickerType,
  ] =
    useState<PickerType>(
      null
    );

  useEffect(() => {
    const load =
      async () => {
        const stored =
          await getWatchlist();

        setItems(stored);
        setLoading(false);
      };

    void load();
  }, []);

  const refreshRates =
    useCallback(
      async (
        showIndicator =
          true
      ) => {
        if (
          items.length ===
          0
        ) {
          setLiveRates({});
          return;
        }

        try {
          if (
            showIndicator
          ) {
            setRefreshing(
              true
            );
          }

          const result =
            await getAlertRates(
              items.map(
                (item) => ({
                  fromCurrency:
                    item.fromCurrency,
                  toCurrency:
                    item.toCurrency,
                })
              )
            );

          setLiveRates(
            result.rates
          );
        } catch (error) {
          console.log(
            "Watchlist rate error:",
            error
          );

          Alert.alert(
            "Unable to refresh watchlist",
            "Check your internet connection and try again."
          );
        } finally {
          if (
            showIndicator
          ) {
            setRefreshing(
              false
            );
          }
        }
      },
      [items]
    );

  useEffect(() => {
    if (
      loading ||
      items.length ===
        0
    ) {
      return;
    }

    void refreshRates(false);

    const timer =
      setInterval(() => {
        void refreshRates(
          false
        );
      }, 30000);

    return () => {
      clearInterval(timer);
    };
  }, [
    loading,
    items.length,
    refreshRates,
  ]);

  const getStatus = (
    item: WatchlistItem
  ):
    | "reached"
    | "near"
    | "tracking"
    | "unavailable" => {
    const rate =
      liveRates[
        getPairKey(
          item.fromCurrency,
          item.toCurrency
        )
      ];

    if (
      !Number.isFinite(
        rate
      )
    ) {
      return "unavailable";
    }

    if (
      !item.targetRate
    ) {
      return "tracking";
    }

    const distance =
      Math.abs(
        rate -
          item.targetRate
      );

    const percentage =
      distance /
      item.targetRate;

    if (
      percentage <=
      0.001
    ) {
      return "reached";
    }

    if (
      percentage <=
      0.01
    ) {
      return "near";
    }

    return "tracking";
  };

  const reachedTarget =
    useMemo(
      () =>
        items.filter(
          (item) =>
            getStatus(
              item
            ) ===
            "reached"
        ).length,
      [
        items,
        liveRates,
      ]
    );

  const nearTarget =
    useMemo(
      () =>
        items.filter(
          (item) =>
            getStatus(
              item
            ) ===
            "near"
        ).length,
      [
        items,
        liveRates,
      ]
    );

  const handleTargetRateChange =
    (value: string) => {
      const cleaned =
        value.replace(
          /[^0-9.]/g,
          ""
        );

      const parts =
        cleaned.split(".");

      if (
        parts.length <= 1
      ) {
        setTargetRate(
          cleaned
        );
        return;
      }

      setTargetRate(
        `${parts[0]}.${parts
          .slice(1)
          .join("")}`
      );
    };

  const addPair =
    async () => {
      if (
        fromCurrency ===
        toCurrency
      ) {
        Alert.alert(
          "Choose different currencies",
          "The base and target currencies must be different."
        );
        return;
      }

      const parsedTarget =
        targetRate.trim()
          ? Number(
              targetRate
            )
          : null;

      if (
        parsedTarget !==
          null &&
        (!Number.isFinite(
          parsedTarget
        ) ||
          parsedTarget <=
            0)
      ) {
        Alert.alert(
          "Invalid target rate",
          "Enter a valid target rate or leave it blank."
        );
        return;
      }

      try {
        setSaving(true);

        const updated =
          await addWatchlistItem(
            {
              id:
                `${Date.now()}`,
              fromCurrency,
              toCurrency,
              targetRate:
                parsedTarget,
              note,
              createdAt:
                Date.now(),
            }
          );

        setItems(updated);
        setTargetRate("");
        setNote("");

        Alert.alert(
          "Added to watchlist",
          `${fromCurrency}/${toCurrency} is now being tracked.`
        );
      } catch (error) {
        console.log(
          "Add watchlist error:",
          error
        );

        Alert.alert(
          "Unable to save pair",
          "Please try again."
        );
      } finally {
        setSaving(false);
      }
    };

  const editPair = (
    item: WatchlistItem
  ) => {
    Alert.prompt?.(
      "Update target rate",
      "Enter a new target rate.",
      async (
        value
      ) => {
        const parsed =
          Number(value);

        if (
          !Number.isFinite(
            parsed
          ) ||
          parsed <= 0
        ) {
          return;
        }

        const updated =
          await updateWatchlistItem(
            {
              ...item,
              targetRate:
                parsed,
            }
          );

        setItems(updated);
      },
      "plain-text",
      item.targetRate
        ? `${item.targetRate}`
        : ""
    );
  };

  const deletePair = (
    item: WatchlistItem
  ) => {
    Alert.alert(
      "Remove pair?",
      `${item.fromCurrency}/${item.toCurrency} will be removed from your watchlist.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style:
            "destructive",
          onPress:
            async () => {
              const updated =
                await removeWatchlistItem(
                  item.id
                );

              setItems(
                updated
              );
            },
        },
      ]
    );
  };

  const swap = () => {
    const previous =
      fromCurrency;

    setFromCurrency(
      toCurrency
    );
    setToCurrency(
      previous
    );
  };

  const handleCurrencySelect =
    (
      currency:
        CurrencyOption
    ) => {
      if (
        pickerType ===
        "from"
      ) {
        setFromCurrency(
          currency.code
        );
      }

      if (
        pickerType ===
        "to"
      ) {
        setToCurrency(
          currency.code
        );
      }

      setPickerType(
        null
      );
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
        contentContainerStyle={
          styles.container
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              refreshRates(
                true
              )
            }
            tintColor="#2FE58C"
            colors={[
              "#2FE58C",
            ]}
            progressBackgroundColor="#0E2C43"
          />
        }
      >
        <ScreenHeader
          title="Watchlist"
          subtitle="Track currency pairs and personal target rates"
          showAction
          actionIcon="refresh"
          onActionPress={() =>
            refreshRates(
              true
            )
          }
        />

        <WatchlistSummaryCard
          total={
            items.length
          }
          nearTarget={
            nearTarget
          }
          reachedTarget={
            reachedTarget
          }
          refreshing={
            refreshing
          }
        />

        <AddWatchlistPair
          fromCurrency={
            fromCurrency
          }
          toCurrency={
            toCurrency
          }
          fromDetails={
            getCurrencyDetails(
              fromCurrency
            )
          }
          toDetails={
            getCurrencyDetails(
              toCurrency
            )
          }
          targetRate={
            targetRate
          }
          note={note}
          saving={saving}
          onOpenFrom={() =>
            setPickerType(
              "from"
            )
          }
          onOpenTo={() =>
            setPickerType(
              "to"
            )
          }
          onSwap={swap}
          onTargetRateChange={
            handleTargetRateChange
          }
          onNoteChange={
            setNote
          }
          onSave={() => {
            void addPair();
          }}
        />

        <Text style={styles.sectionTitle}>
          Saved Pairs
        </Text>

        {loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              Loading watchlist
            </Text>

            <Text style={styles.emptyText}>
              Restoring your saved currency pairs.
            </Text>
          </View>
        ) : items.length ===
          0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              Your watchlist is empty
            </Text>

            <Text style={styles.emptyText}>
              Add a currency pair above to start tracking its live reference rate.
            </Text>
          </View>
        ) : (
          items.map(
            (item) => {
              const pairKey =
                getPairKey(
                  item.fromCurrency,
                  item.toCurrency
                );

              return (
                <WatchlistCard
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                  currentRate={
                    liveRates[
                      pairKey
                    ]
                  }
                  status={
                    getStatus(
                      item
                    )
                  }
                  onEdit={() =>
                    editPair(
                      item
                    )
                  }
                  onDelete={() =>
                    deletePair(
                      item
                    )
                  }
                />
              );
            }
          )
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Watchlist rates refresh every 30 seconds while FXCompare is open. Target tracking is informational and does not execute or schedule transfers.
          </Text>
        </View>
      </ScrollView>

      <CurrencyPickerModal
        visible={
          pickerType !==
          null
        }
        title={
          pickerType ===
          "from"
            ? "Select Base Currency"
            : "Select Target Currency"
        }
        selectedCurrency={
          pickerType ===
          "from"
            ? fromCurrency
            : toCurrency
        }
        onClose={() =>
          setPickerType(
            null
          )
        }
        onSelect={
          handleCurrencySelect
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#071521",
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 130,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },

  emptyCard: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E2C43",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#194661",
    paddingHorizontal: 24,
    marginBottom: 14,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  emptyText: {
    color: "#829CAF",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 6,
  },

  infoCard: {
    backgroundColor: "#0E2C43",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 14,
    marginTop: 4,
  },

  infoText: {
    color: "#8EA7BA",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
  },
});