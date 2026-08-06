import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import ScreenHeader from "../components/ScreenHeader";
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

          <View
            style={
              styles.summaryCard
            }
          >
            <View
              style={
                styles.summaryIcon
              }
            >
              {refreshingRates ? (
                <ActivityIndicator
                  size="small"
                  color="#2FE58C"
                />
              ) : (
                <Ionicons
                  name={
                    reachedAlerts > 0
                      ? "checkmark-circle"
                      : notificationsEnabled
                      ? "notifications"
                      : "notifications-off"
                  }
                  size={25}
                  color={
                    reachedAlerts > 0
                      ? "#2FE58C"
                      : notificationsEnabled
                      ? "#64AFFF"
                      : "#FF9C70"
                  }
                />
              )}
            </View>

            <View
              style={
                styles.summaryText
              }
            >
              <Text
                style={
                  styles.summaryLabel
                }
              >
                Active Alerts
              </Text>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {enabledAlerts}
              </Text>

              <Text
                style={
                  styles.checkedText
                }
              >
                Checked{" "}
                {formatCheckedTime(
                  lastChecked
                )}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                reachedAlerts > 0 &&
                  styles.reachedSummaryBadge,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  reachedAlerts > 0 &&
                    styles.reachedSummaryDot,
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  reachedAlerts > 0 &&
                    styles.reachedSummaryText,
                ]}
              >
                {reachedAlerts > 0
                  ? `${reachedAlerts} REACHED`
                  : refreshingRates
                  ? "CHECKING"
                  : "MONITORING"}
              </Text>
            </View>
          </View>

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

          <Text
            style={
              styles.sectionTitle
            }
          >
            Create New Alert
          </Text>

          <View
            style={
              styles.formCard
            }
          >
            <Text
              style={
                styles.inputLabel
              }
            >
              Currency Pair
            </Text>

            <View
              style={
                styles.currencyRow
              }
            >
              <TouchableOpacity
                activeOpacity={0.85}
                style={
                  styles.currencyCard
                }
                onPress={() =>
                  setPickerType("from")
                }
              >
                <Text
                  style={styles.flag}
                >
                  {fromDetails.flag}
                </Text>

                <View
                  style={
                    styles.currencyTextBox
                  }
                >
                  <Text
                    style={
                      styles.currencyCode
                    }
                  >
                    {fromCurrency}
                  </Text>

                  <Text
                    style={
                      styles.currencyName
                    }
                    numberOfLines={1}
                  >
                    {fromDetails.name}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-down"
                  size={17}
                  color="#829CAF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={
                  styles.swapButton
                }
                onPress={
                  swapCurrencies
                }
              >
                <Ionicons
                  name="swap-horizontal"
                  size={23}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={
                  styles.currencyCard
                }
                onPress={() =>
                  setPickerType("to")
                }
              >
                <Text
                  style={styles.flag}
                >
                  {toDetails.flag}
                </Text>

                <View
                  style={
                    styles.currencyTextBox
                  }
                >
                  <Text
                    style={
                      styles.currencyCode
                    }
                  >
                    {toCurrency}
                  </Text>

                  <Text
                    style={
                      styles.currencyName
                    }
                    numberOfLines={1}
                  >
                    {toDetails.name}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-down"
                  size={17}
                  color="#829CAF"
                />
              </TouchableOpacity>
            </View>

            <Text
              style={
                styles.inputLabel
              }
            >
              Notify Me When Rate Is
            </Text>

            <View
              style={
                styles.conditionRow
              }
            >
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.conditionButton,
                  condition ===
                    "above" &&
                    styles.activeConditionButton,
                ]}
                onPress={() =>
                  setCondition("above")
                }
              >
                <Ionicons
                  name="arrow-up"
                  size={18}
                  color={
                    condition ===
                    "above"
                      ? "#FFFFFF"
                      : "#829CAF"
                  }
                />

                <Text
                  style={[
                    styles.conditionText,
                    condition ===
                      "above" &&
                      styles.activeConditionText,
                  ]}
                >
                  Above
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.conditionButton,
                  condition ===
                    "below" &&
                    styles.activeConditionButton,
                ]}
                onPress={() =>
                  setCondition("below")
                }
              >
                <Ionicons
                  name="arrow-down"
                  size={18}
                  color={
                    condition ===
                    "below"
                      ? "#FFFFFF"
                      : "#829CAF"
                  }
                />

                <Text
                  style={[
                    styles.conditionText,
                    condition ===
                      "below" &&
                      styles.activeConditionText,
                  ]}
                >
                  Below
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={
                styles.inputLabel
              }
            >
              Target Exchange Rate
            </Text>

            <View
              style={
                styles.rateInputBox
              }
            >
              <Text
                style={
                  styles.ratePrefix
                }
              >
                1 {fromCurrency} =
              </Text>

              <TextInput
                value={targetRate}
                onChangeText={
                  handleTargetRateChange
                }
                keyboardType="decimal-pad"
                placeholder="90.00"
                placeholderTextColor="#64798A"
                selectionColor="#2FE58C"
                style={
                  styles.rateInput
                }
              />

              <Text
                style={
                  styles.rateSuffix
                }
              >
                {toCurrency}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              disabled={
                saving ||
                loadingSettings
              }
              style={[
                styles.createButton,
                (saving ||
                  loadingSettings) &&
                  styles.disabledButton,
              ]}
              onPress={createAlert}
            >
              <Ionicons
                name={
                  saving
                    ? "hourglass-outline"
                    : "notifications"
                }
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.createButtonText
                }
              >
                {saving
                  ? "Saving Alert..."
                  : "Create Rate Alert"}
              </Text>
            </TouchableOpacity>
          </View>

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
            savedAlerts.map(
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
                  <View
                    key={item.id}
                    style={[
                      styles.alertCard,
                      status ===
                        "reached" &&
                        styles.reachedAlertCard,

                      !item.enabled &&
                        styles.disabledAlertCard,
                    ]}
                  >
                    <View
                      style={
                        styles.alertHeader
                      }
                    >
                      <View
                        style={
                          styles.alertPairRow
                        }
                      >
                        <View
                          style={
                            styles.alertIcon
                          }
                        >
                          <Text
                            style={
                              styles.alertFlag
                            }
                          >
                            {from.flag}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.savedPairText
                          }
                        >
                          <Text
                            style={
                              styles.alertPair
                            }
                          >
                            {
                              item.fromCurrency
                            }
                            {" / "}
                            {
                              item.toCurrency
                            }
                          </Text>

                          <Text
                            style={
                              styles.alertCondition
                            }
                          >
                            Notify when rate is{" "}
                            {
                              item.condition
                            }
                          </Text>
                        </View>
                      </View>

                      <Switch
                        disabled={
                          loadingSettings
                        }
                        value={
                          item.enabled
                        }
                        onValueChange={() =>
                          toggleAlert(
                            item
                          )
                        }
                        trackColor={{
                          false:
                            "#294558",
                          true:
                            "#1B8C63",
                        }}
                        thumbColor={
                          item.enabled
                            ? "#2FE58C"
                            : "#829CAF"
                        }
                      />
                    </View>

                    <View
                      style={[
                        styles.liveStatusBadge,
                        {
                          backgroundColor:
                            statusConfig.background,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          statusConfig.icon
                        }
                        size={16}
                        color={
                          statusConfig.color
                        }
                      />

                      <Text
                        style={[
                          styles.liveStatusText,
                          {
                            color:
                              statusConfig.color,
                          },
                        ]}
                      >
                        {
                          statusConfig.title
                        }
                      </Text>
                    </View>

                    <View
                      style={
                        styles.ratesGrid
                      }
                    >
                      <View
                        style={
                          styles.rateStat
                        }
                      >
                        <Text
                          style={
                            styles.rateStatLabel
                          }
                        >
                          Current Rate
                        </Text>

                        <Text
                          style={
                            styles.currentRateValue
                          }
                        >
                          {formatRate(
                            currentRate
                          )}
                        </Text>

                        <Text
                          style={
                            styles.rateCurrency
                          }
                        >
                          {to.flag}{" "}
                          {
                            item.toCurrency
                          }
                        </Text>
                      </View>

                      <View
                        style={
                          styles.rateDivider
                        }
                      />

                      <View
                        style={
                          styles.rateStat
                        }
                      >
                        <Text
                          style={
                            styles.rateStatLabel
                          }
                        >
                          Target Rate
                        </Text>

                        <Text
                          style={
                            styles.targetRateValue
                          }
                        >
                          {formatRate(
                            item.targetRate
                          )}
                        </Text>

                        <Text
                          style={
                            styles.rateCurrency
                          }
                        >
                          {item.condition ===
                          "above"
                            ? "Above"
                            : "Below"}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.distanceBox
                      }
                    >
                      <View>
                        <Text
                          style={
                            styles.distanceLabel
                          }
                        >
                          {status ===
                          "reached"
                            ? "Target condition"
                            : "Distance to target"}
                        </Text>

                        <Text
                          style={
                            styles.distanceValue
                          }
                        >
                          {status ===
                          "reached"
                            ? "Condition met"
                            : distance !==
                              null
                            ? formatRate(
                                distance
                              )
                            : "--"}
                        </Text>
                      </View>

                      <Ionicons
                        name={
                          item.condition ===
                          "above"
                            ? "arrow-up-circle-outline"
                            : "arrow-down-circle-outline"
                        }
                        size={27}
                        color={
                          statusConfig.color
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.alertFooter
                      }
                    >
                      <View
                        style={
                          styles.notificationState
                        }
                      >
                        <Ionicons
                          name={
                            item.enabled
                              ? "radio-outline"
                              : "pause-circle-outline"
                          }
                          size={17}
                          color={
                            item.enabled
                              ? "#2FE58C"
                              : "#829CAF"
                          }
                        />

                        <Text
                          style={
                            styles.notificationStateText
                          }
                        >
                          {item.enabled
                            ? `Checked ${formatCheckedTime(
                                lastChecked
                              )}`
                            : "Monitoring paused"}
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={
                          styles.deleteButton
                        }
                        onPress={() =>
                          confirmDeleteAlert(
                            item.id
                          )
                        }
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#FF7A7A"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }
            )
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

type EmptyStateProps = {
  icon:
    keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
};

function EmptyState({
  icon,
  title,
  message,
}: EmptyStateProps) {
  return (
    <View style={styles.emptyCard}>
      <Ionicons
        name={icon}
        size={39}
        color="#67869C"
      />

      <Text
        style={
          styles.emptyTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.emptyText
        }
      >
        {message}
      </Text>
    </View>
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

  summaryCard: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0E2C43",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#194661",
    paddingHorizontal: 17,
    marginBottom: 18,
  },

  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(47,229,140,0.12)",
  },

  summaryText: {
    flex: 1,
    marginLeft: 14,
  },

  summaryLabel: {
    color: "#829CAF",
    fontSize: 12,
    fontWeight: "600",
  },

  summaryValue: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 2,
  },

  checkedText: {
    color: "#6F8DA2",
    fontSize: 10,
    marginTop: 3,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(100,175,255,0.12)",
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#64AFFF",
    marginRight: 6,
  },

  statusText: {
    color: "#64AFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  reachedSummaryBadge: {
    backgroundColor:
      "rgba(47,229,140,0.12)",
  },

  reachedSummaryDot: {
    backgroundColor: "#2FE58C",
  },

  reachedSummaryText: {
    color: "#2FE58C",
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

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },

  formCard: {
    backgroundColor: "#0E2C43",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 16,
    marginTop: 13,
    marginBottom: 25,
  },

  inputLabel: {
    color: "#9FB6C9",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 9,
    marginTop: 5,
  },

  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  currencyCard: {
    flex: 1,
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#21516E",
    paddingHorizontal: 10,
  },

  flag: {
    fontSize: 22,
    marginRight: 7,
  },

  currencyTextBox: {
    flex: 1,
    minWidth: 0,
  },

  currencyCode: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  currencyName: {
    color: "#829CAF",
    fontSize: 9,
    marginTop: 3,
  },

  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1687E8",
    borderWidth: 4,
    borderColor: "#0E2C43",
    marginHorizontal: -3,
    zIndex: 2,
  },

  conditionRow: {
    flexDirection: "row",
    backgroundColor: "#16344C",
    borderRadius: 17,
    padding: 4,
    marginBottom: 18,
  },

  conditionButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },

  activeConditionButton: {
    backgroundColor: "#1687E8",
  },

  conditionText: {
    color: "#829CAF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 7,
  },

  activeConditionText: {
    color: "#FFFFFF",
  },

  rateInputBox: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#21516E",
    paddingHorizontal: 14,
  },

  ratePrefix: {
    color: "#8EA7BA",
    fontSize: 13,
    fontWeight: "600",
  },

  rateInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    paddingHorizontal: 8,
  },

  rateSuffix: {
    color: "#2FE58C",
    fontSize: 13,
    fontWeight: "800",
  },

  createButton: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1687E8",
    borderRadius: 19,
    marginTop: 18,
    elevation: 7,
  },

  disabledButton: {
    opacity: 0.6,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 9,
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

  alertCard: {
    backgroundColor: "#0E2C43",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 16,
    marginBottom: 13,
  },

  reachedAlertCard: {
    borderColor:
      "rgba(47,229,140,0.65)",
  },

  disabledAlertCard: {
    opacity: 0.62,
  },

  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  alertPairRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  alertIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
    marginRight: 12,
  },

  alertFlag: {
    fontSize: 23,
  },

  savedPairText: {
    flex: 1,
  },

  alertPair: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  alertCondition: {
    color: "#829CAF",
    fontSize: 11,
    marginTop: 4,
  },

  liveStatusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 15,
  },

  liveStatusText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginLeft: 5,
  },

  ratesGrid: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 17,
    padding: 14,
    marginTop: 13,
  },

  rateStat: {
    flex: 1,
  },

  rateStatLabel: {
    color: "#829CAF",
    fontSize: 10,
  },

  currentRateValue: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 5,
  },

  targetRateValue: {
    color: "#2FE58C",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 5,
  },

  rateCurrency: {
    color: "#829CAF",
    fontSize: 10,
    marginTop: 4,
  },

  rateDivider: {
    width: 1,
    height: 52,
    backgroundColor: "#295069",
    marginHorizontal: 14,
  },

  distanceBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#102A3D",
    borderRadius: 15,
    padding: 13,
    marginTop: 12,
  },

  distanceLabel: {
    color: "#829CAF",
    fontSize: 10,
  },

  distanceValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },

  alertFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
  },

  notificationState: {
    flexDirection: "row",
    alignItems: "center",
  },

  notificationStateText: {
    color: "#9CB1C1",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,122,122,0.1)",
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