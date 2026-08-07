import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import ScreenHeader from "../components/ScreenHeader";
import AlertSummaryCard from "../components/alerts/AlertSummaryCard";
import CreateAlertCard from "../components/alerts/CreateAlertCard";
import AlertCard from "../components/alerts/AlertCard";
import AlertList from "../components/alerts/AlertList";
import EmptyState from "../components/alerts/EmptyState";
import CurrencyPickerModal, {
  CurrencyOption,
  currencyOptions,
} from "../components/CurrencyPickerModal";

import {
  AlertCondition,
  SavedRateAlert,
  useAppSettings,
} from "../context/AppSettingsContext";

import {
  getAlertRates,
  getPairKey,
} from "../services/exchangeApi";

import {
  configureNotifications,
  sendRateAlertNotification,
} from "../services/notificationService";

type PickerType = "from" | "to" | null;

type AlertStatus =
  | "reached"
  | "close"
  | "waiting"
  | "unavailable";

const AUTO_REFRESH_INTERVAL = 30000;

const getCurrencyDetails = (
  currencyCode: string
): CurrencyOption => {
  return (
    currencyOptions.find(
      (currency) =>
        currency.code === currencyCode
    ) ?? {
      code: currencyCode,
      name: currencyCode,
      flag: "🌐",
      symbol: "",
    }
  );
};

const formatRate = (
  value: number | undefined
) => {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "--";
  }

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
};

const formatCheckedTime = (
  date: Date | null
) => {
  if (!date) {
    return "Not checked";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getAlertStatus = (
  item: SavedRateAlert,
  currentRate: number | undefined
): AlertStatus => {
  if (
    currentRate === undefined ||
    !Number.isFinite(currentRate)
  ) {
    return "unavailable";
  }

  const reached =
    item.condition === "above"
      ? currentRate >= item.targetRate
      : currentRate <= item.targetRate;

  if (reached) {
    return "reached";
  }

  const percentageDifference =
    Math.abs(
      currentRate - item.targetRate
    ) / item.targetRate;

  if (percentageDifference <= 0.01) {
    return "close";
  }

  return "waiting";
};

const getDistanceToTarget = (
  item: SavedRateAlert,
  currentRate: number | undefined
) => {
  if (
    currentRate === undefined ||
    !Number.isFinite(currentRate)
  ) {
    return null;
  }

  return Math.abs(
    item.targetRate - currentRate
  );
};

export default function AlertsScreen() {
  const {
    loadingSettings,
    notificationsEnabled,

    defaultFromCurrency,
    defaultToCurrency,

    savedAlerts,

    addSavedAlert,
    updateSavedAlert,
    deleteSavedAlert,
  } = useAppSettings();

  const [
    fromCurrency,
    setFromCurrency,
  ] = useState(defaultFromCurrency);

  const [
    toCurrency,
    setToCurrency,
  ] = useState(defaultToCurrency);

  const [
    targetRate,
    setTargetRate,
  ] = useState("90");

  const [
    condition,
    setCondition,
  ] = useState<AlertCondition>(
    "above"
  );

  const [
    pickerType,
    setPickerType,
  ] = useState<PickerType>(null);

  const [saving, setSaving] =
    useState(false);

  const [
    refreshingRates,
    setRefreshingRates,
  ] = useState(false);

  const [
    liveRates,
    setLiveRates,
  ] = useState<
    Record<string, number>
  >({});

  const [
    failedPairs,
    setFailedPairs,
  ] = useState<string[]>([]);

  const [
    lastChecked,
    setLastChecked,
  ] = useState<Date | null>(null);

  const [
    deviceNotificationsReady,
    setDeviceNotificationsReady,
  ] = useState(false);

  const notifiedAlertIds =
    useRef<Set<string>>(
      new Set()
    );

  useEffect(() => {
    let mounted = true;

    const prepareNotifications =
      async () => {
        if (
          loadingSettings ||
          !notificationsEnabled
        ) {
          if (mounted) {
            setDeviceNotificationsReady(
              false
            );
          }

          return;
        }

        const ready =
          await configureNotifications();

        if (mounted) {
          setDeviceNotificationsReady(
            ready
          );
        }
      };

    void prepareNotifications();

    return () => {
      mounted = false;
    };
  }, [
    loadingSettings,
    notificationsEnabled,
  ]);

  useEffect(() => {
    if (loadingSettings) {
      return;
    }

    setFromCurrency(
      defaultFromCurrency
    );

    setToCurrency(
      defaultToCurrency
    );
  }, [
    loadingSettings,
    defaultFromCurrency,
    defaultToCurrency,
  ]);

  const enabledAlerts = useMemo(
    () =>
      savedAlerts.filter(
        (item) => item.enabled
      ).length,
    [savedAlerts]
  );

  const reachedAlerts = useMemo(
    () =>
      savedAlerts.filter((item) => {
        const pairKey = getPairKey(
          item.fromCurrency,
          item.toCurrency
        );

        return (
          getAlertStatus(
            item,
            liveRates[pairKey]
          ) === "reached"
        );
      }).length,
    [savedAlerts, liveRates]
  );

  const fromDetails =
    getCurrencyDetails(
      fromCurrency
    );

  const toDetails =
    getCurrencyDetails(
      toCurrency
    );

  const selectedPickerCurrency =
    pickerType === "from"
      ? fromCurrency
      : toCurrency;

  const refreshLiveRates =
    useCallback(
      async (
        showRefreshIndicator = true
      ) => {
        if (
          loadingSettings ||
          savedAlerts.length === 0
        ) {
          setLiveRates({});
          setFailedPairs([]);
          return;
        }

        try {
          if (showRefreshIndicator) {
            setRefreshingRates(true);
          }

          const requests =
            savedAlerts.map(
              (item) => ({
                fromCurrency:
                  item.fromCurrency,

                toCurrency:
                  item.toCurrency,
              })
            );

          const result =
            await getAlertRates(
              requests
            );

          setLiveRates(
            result.rates
          );

          setFailedPairs(
            result.failedPairs
          );

          setLastChecked(
            new Date()
          );
        } catch (error) {
          console.log(
            "Alert live-rate error:",
            error
          );

          Alert.alert(
            "Unable to refresh rates",
            "Check your internet connection and try again."
          );
        } finally {
          if (showRefreshIndicator) {
            setRefreshingRates(false);
          }
        }
      },
      [
        loadingSettings,
        savedAlerts,
      ]
    );

  useEffect(() => {
    if (
      loadingSettings ||
      savedAlerts.length === 0
    ) {
      return;
    }

    void refreshLiveRates(false);

    const refreshTimer =
      setInterval(() => {
        void refreshLiveRates(false);
      }, AUTO_REFRESH_INTERVAL);

    return () => {
      clearInterval(
        refreshTimer
      );
    };
  }, [
    loadingSettings,
    savedAlerts.length,
    refreshLiveRates,
  ]);

  useEffect(() => {
    if (
      loadingSettings ||
      !notificationsEnabled ||
      !deviceNotificationsReady
    ) {
      return;
    }

    savedAlerts.forEach(
      (item) => {
        const pairKey =
          getPairKey(
            item.fromCurrency,
            item.toCurrency
          );

        const currentRate =
          liveRates[pairKey];

        const reached =
          item.enabled &&
          getAlertStatus(
            item,
            currentRate
          ) === "reached";

        if (!reached) {
          notifiedAlertIds.current.delete(
            item.id
          );

          return;
        }

        if (
          notifiedAlertIds.current.has(
            item.id
          )
        ) {
          return;
        }

        notifiedAlertIds.current.add(
          item.id
        );

        void sendRateAlertNotification({
          alertId: item.id,
          fromCurrency:
            item.fromCurrency,
          toCurrency:
            item.toCurrency,
          currentRate:
            currentRate as number,
          targetRate:
            item.targetRate,
          condition:
            item.condition,
        }).then(
          (notificationId) => {
            if (!notificationId) {
              notifiedAlertIds.current.delete(
                item.id
              );
            }
          }
        );
      }
    );

    const savedAlertIds =
      new Set(
        savedAlerts.map(
          (item) => item.id
        )
      );

    Array.from(
      notifiedAlertIds.current
    ).forEach((alertId) => {
      if (
        !savedAlertIds.has(alertId)
      ) {
        notifiedAlertIds.current.delete(
          alertId
        );
      }
    });
  }, [
    loadingSettings,
    notificationsEnabled,
    deviceNotificationsReady,
    savedAlerts,
    liveRates,
  ]);

  const swapCurrencies = () => {
    const previousFrom =
      fromCurrency;

    setFromCurrency(
      toCurrency
    );

    setToCurrency(
      previousFrom
    );
  };

  const handleCurrencySelect = (
    currency: CurrencyOption
  ) => {
    if (pickerType === "from") {
      setFromCurrency(
        currency.code
      );
    }

    if (pickerType === "to") {
      setToCurrency(
        currency.code
      );
    }

    setPickerType(null);
  };

  const handleTargetRateChange = (
    text: string
  ) => {
    const cleaned = text.replace(
      /[^0-9.]/g,
      ""
    );

    const parts =
      cleaned.split(".");

    if (parts.length <= 1) {
      setTargetRate(cleaned);
      return;
    }

    setTargetRate(
      `${parts[0]}.${parts
        .slice(1)
        .join("")}`
    );
  };

  const createAlert =
    async () => {
      const parsedTargetRate =
        Number(targetRate);

      if (
        !Number.isFinite(
          parsedTargetRate
        ) ||
        parsedTargetRate <= 0
      ) {
        Alert.alert(
          "Invalid target rate",
          "Please enter a valid exchange rate."
        );

        return;
      }

      if (
        fromCurrency ===
        toCurrency
      ) {
        Alert.alert(
          "Choose different currencies",
          "The sending and receiving currencies must be different."
        );

        return;
      }

      const newAlert: SavedRateAlert = {
        id: `${Date.now()}`,
        fromCurrency,
        toCurrency,
        targetRate:
          parsedTargetRate,
        condition,
        enabled:
          notificationsEnabled,
      };

      try {
        setSaving(true);

        await addSavedAlert(
          newAlert
        );

        Alert.alert(
          "Alert saved",
          notificationsEnabled
            ? `Your ${fromCurrency}/${toCurrency} alert is now active.`
            : "The alert was saved, but notifications are currently disabled."
        );
      } catch (error) {
        console.log(
          "Create alert error:",
          error
        );

        Alert.alert(
          "Unable to save alert",
          "Please try again."
        );
      } finally {
        setSaving(false);
      }
    };

  const toggleAlert = async (
    item: SavedRateAlert
  ) => {
    if (
      !notificationsEnabled &&
      !item.enabled
    ) {
      Alert.alert(
        "Notifications disabled",
        "Enable notifications from the Profile tab before activating this alert."
      );

      return;
    }

    try {
      if (item.enabled) {
        notifiedAlertIds.current.delete(
          item.id
        );
      }

      await updateSavedAlert({
        ...item,
        enabled:
          !item.enabled,
      });
    } catch (error) {
      console.log(
        "Toggle alert error:",
        error
      );

      Alert.alert(
        "Unable to update alert",
        "Please try again."
      );
    }
  };

  const confirmDeleteAlert = (
    alertId: string
  ) => {
    Alert.alert(
      "Delete alert?",
      "This saved rate alert will be permanently removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              notifiedAlertIds.current.delete(
                alertId
              );

              await deleteSavedAlert(
                alertId
              );
            } catch (error) {
              console.log(
                "Delete alert error:",
                error
              );

              Alert.alert(
                "Unable to delete alert",
                "Please try again."
              );
            }
          },
        },
      ]
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

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
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
                refreshingRates
              }
              onRefresh={() =>
                refreshLiveRates(true)
              }
              tintColor="#2FE58C"
              colors={["#2FE58C"]}
              progressBackgroundColor="#0E2C43"
            />
          }
        >
          <ScreenHeader
            title="Rate Alerts"
            subtitle="Monitor live rates against your saved targets"
            showAction
            actionIcon="refresh"
            onActionPress={() =>
              refreshLiveRates(true)
            }
          />

          <AlertSummaryCard
            enabledAlerts={
              enabledAlerts
            }
            refreshingRates={
              refreshingRates
            }
            reachedAlerts={
              reachedAlerts
            }
            notificationsEnabled={
              notificationsEnabled
            }
            lastChecked={
              lastChecked
            }
          />

          {!notificationsEnabled ||
          !deviceNotificationsReady ? (
            <View
              style={
                styles.warningCard
              }
            >
              <Ionicons
                name="warning-outline"
                size={20}
                color="#FF9C70"
              />

              <Text
                style={
                  styles.warningText
                }
              >
                {!notificationsEnabled
                  ? "Notifications are disabled in FXCompare settings. Live rates will still be shown, but alerts cannot send device notifications."
                  : "Device notification permission is not available. Allow notifications in your phone settings to receive target alerts."}
              </Text>
            </View>
          ) : null}

          {failedPairs.length > 0 ? (
            <View
              style={
                styles.errorCard
              }
            >
              <Ionicons
                name="cloud-offline-outline"
                size={20}
                color="#FF9C70"
              />

              <Text
                style={
                  styles.errorText
                }
              >
                Some live rates could not be
                loaded. Pull down to try again.
              </Text>
            </View>
          ) : null}

          <CreateAlertCard
            fromCurrency={
              fromCurrency
            }
            toCurrency={
              toCurrency
            }
            fromDetails={
              fromDetails
            }
            toDetails={
              toDetails
            }
            condition={
              condition
            }
            targetRate={
              targetRate
            }
            saving={saving}
            loadingSettings={
              loadingSettings
            }
            onOpenPicker={
              setPickerType
            }
            onSwapCurrencies={
              swapCurrencies
            }
            onConditionChange={
              setCondition
            }
            onTargetRateChange={
              handleTargetRateChange
            }
            onCreateAlert={() => {
              void createAlert();
            }}
          />

          <View
            style={
              styles.listHeader
            }
          >
            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Your Alerts
              </Text>

              <Text
                style={
                  styles.listSubtitle
                }
              >
                Live status updates every 30 seconds
              </Text>
            </View>

            <View
              style={
                styles.countBadge
              }
            >
              <Text
                style={
                  styles.countText
                }
              >
                {savedAlerts.length}
              </Text>
            </View>
          </View>

          {loadingSettings ? (
            <EmptyState
              icon="hourglass-outline"
              title="Loading alerts"
              message="Restoring your saved rate targets."
            />
          ) : savedAlerts.length ===
            0 ? (
            <EmptyState
              icon="notifications-off-outline"
              title="No alerts created"
              message="Create your first target-rate alert using the form above."
            />
           ) : (
            <AlertList>
            {savedAlerts.map(
              (item) => {
                const pairKey =
                  getPairKey(
                    item.fromCurrency,
                    item.toCurrency
                  );

                const currentRate =
                  liveRates[pairKey];

                const status =
                  getAlertStatus(
                    item,
                    currentRate
                  );

                const distance =
                  getDistanceToTarget(
                    item,
                    currentRate
                  );

                const from =
                  getCurrencyDetails(
                    item.fromCurrency
                  );

                const to =
                  getCurrencyDetails(
                    item.toCurrency
                  );

                const statusConfig = {
                  reached: {
                    title:
                      "TARGET REACHED",
                    icon:
                      "checkmark-circle" as const,
                    color:
                      "#2FE58C",
                    background:
                      "rgba(47,229,140,0.12)",
                  },

                  close: {
                    title:
                      "CLOSE",
                    icon:
                      "navigate-circle" as const,
                    color:
                      "#FFD65A",
                    background:
                      "rgba(255,214,90,0.12)",
                  },

                  waiting: {
                    title:
                      "WAITING",
                    icon:
                      "time" as const,
                    color:
                      "#64AFFF",
                    background:
                      "rgba(100,175,255,0.12)",
                  },

                  unavailable: {
                    title:
                      "UNAVAILABLE",
                    icon:
                      "cloud-offline" as const,
                    color:
                      "#FF9C70",
                    background:
                      "rgba(255,156,112,0.12)",
                  },
                }[status];

                return (
                  <AlertCard
                    key={item.id}
                    item={item}
                    from={from}
                    to={to}
                    currentRate={
                      currentRate
                    }
                    distance={
                      distance
                    }
                    status={status}
                    statusConfig={
                      statusConfig
                    }
                    lastChecked={
                      lastChecked
                    }
                    loadingSettings={
                      loadingSettings
                    }
                    onToggle={(alert) => {
                      void toggleAlert(
                        alert
                      );
                    }}
                    onDelete={
                      confirmDeleteAlert
                    }
                  />
                );
              }
             )}
            </AlertList>
          )}

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
              Active alerts are checked every
              30 seconds while FXCompare is open.
              A device notification is sent once
              when a target is reached and can
              trigger again after the rate moves
              away from the target.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CurrencyPickerModal
        visible={
          pickerType !== null
        }
        title={
          pickerType === "from"
            ? "Select Base Currency"
            : "Select Target Currency"
        }
        selectedCurrency={
          selectedPickerCurrency
        }
        onClose={() =>
          setPickerType(null)
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

  keyboardView: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 130,
  },

  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor:
      "rgba(255,156,112,0.1)",
    borderRadius: 17,
    borderWidth: 1,
    borderColor:
      "rgba(255,156,112,0.3)",
    padding: 14,
    marginBottom: 18,
  },

  warningText: {
    flex: 1,
    color: "#FFB08B",
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 10,
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor:
      "rgba(255,156,112,0.1)",
    borderRadius: 17,
    borderWidth: 1,
    borderColor:
      "rgba(255,156,112,0.3)",
    padding: 14,
    marginBottom: 18,
  },

  errorText: {
    flex: 1,
    color: "#FFB08B",
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 10,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
    paddingHorizontal: 2,
  },

  listSubtitle: {
    color: "#829CAF",
    fontSize: 12,
    marginTop: 4,
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
    borderWidth: 1,
    borderColor: "#21516E",
  },

  countText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  emptyCard: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E2C43",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#194661",
    paddingHorizontal: 25,
    marginBottom: 18,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 13,
  },

  emptyText: {
    color: "#829CAF",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 7,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#0E2C43",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 15,
    marginTop: 4,
  },

  infoText: {
    flex: 1,
    color: "#8EA7BA",
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 10,
  },
});