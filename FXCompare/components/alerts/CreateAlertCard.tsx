import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  CurrencyOption,
} from "../CurrencyPickerModal";

import {
  AlertCondition,
} from "../../context/AppSettingsContext";

type PickerType =
  | "from"
  | "to"
  | null;

type Props = {
  fromCurrency: string;
  toCurrency: string;

  fromDetails: CurrencyOption;
  toDetails: CurrencyOption;

  condition: AlertCondition;
  targetRate: string;

  saving: boolean;
  loadingSettings: boolean;

  onOpenPicker: (
    pickerType: Exclude<
      PickerType,
      null
    >
  ) => void;

  onSwapCurrencies: () => void;

  onConditionChange: (
    condition: AlertCondition
  ) => void;

  onTargetRateChange: (
    value: string
  ) => void;

  onCreateAlert: () => void;
};

export default function CreateAlertCard({
  fromCurrency,
  toCurrency,
  fromDetails,
  toDetails,
  condition,
  targetRate,
  saving,
  loadingSettings,
  onOpenPicker,
  onSwapCurrencies,
  onConditionChange,
  onTargetRateChange,
  onCreateAlert,
}: Props) {
  const disabled =
    saving ||
    loadingSettings;

  return (
    <>
      <Text style={styles.sectionTitle}>
        Create New Alert
      </Text>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>
          Currency Pair
        </Text>

        <View style={styles.currencyRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.currencyCard}
            onPress={() =>
              onOpenPicker("from")
            }
          >
            <Text style={styles.flag}>
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
            style={styles.swapButton}
            onPress={
              onSwapCurrencies
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
            style={styles.currencyCard}
            onPress={() =>
              onOpenPicker("to")
            }
          >
            <Text style={styles.flag}>
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

        <Text style={styles.inputLabel}>
          Notify Me When Rate Is
        </Text>

        <View
          style={styles.conditionRow}
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
              onConditionChange(
                "above"
              )
            }
          >
            <Ionicons
              name="arrow-up"
              size={18}
              color={
                condition === "above"
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
              onConditionChange(
                "below"
              )
            }
          >
            <Ionicons
              name="arrow-down"
              size={18}
              color={
                condition === "below"
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

        <Text style={styles.inputLabel}>
          Target Exchange Rate
        </Text>

        <View
          style={styles.rateInputBox}
        >
          <Text
            style={styles.ratePrefix}
          >
            1 {fromCurrency} =
          </Text>

          <TextInput
            value={targetRate}
            onChangeText={
              onTargetRateChange
            }
            keyboardType="decimal-pad"
            placeholder="90.00"
            placeholderTextColor="#64798A"
            selectionColor="#2FE58C"
            style={styles.rateInput}
          />

          <Text
            style={styles.rateSuffix}
          >
            {toCurrency}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={disabled}
          style={[
            styles.createButton,
            disabled &&
              styles.disabledButton,
          ]}
          onPress={onCreateAlert}
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
    </>
  );
}

const styles =
  StyleSheet.create({
    sectionTitle: {
      color: "#FFFFFF",
      fontSize: 21,
      fontWeight: "800",
    },

    formCard: {
      backgroundColor:
        "#0E2C43",
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
      backgroundColor:
        "#16344C",
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
      backgroundColor:
        "#1687E8",
      borderWidth: 4,
      borderColor: "#0E2C43",
      marginHorizontal: -3,
      zIndex: 2,
    },

    conditionRow: {
      flexDirection: "row",
      backgroundColor:
        "#16344C",
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
      backgroundColor:
        "#1687E8",
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
      backgroundColor:
        "#16344C",
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
      backgroundColor:
        "#1687E8",
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
  });