// components/CurrencySelector.tsx

import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import CurrencyPickerModal, {
  CurrencyOption,
  currencyOptions,
} from "./CurrencyPickerModal";

type Props = {
  fromCurrency: string;
  toCurrency: string;
  onFromPress: (currency: string) => void;
  onToPress: (currency: string) => void;
  onSwapPress: () => void;
};

type PickerType = "from" | "to" | null;

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

export default function CurrencySelector({
  fromCurrency,
  toCurrency,
  onFromPress,
  onToPress,
  onSwapPress,
}: Props) {
  const [pickerType, setPickerType] =
    useState<PickerType>(null);

  const fromDetails = useMemo(
    () => getCurrencyDetails(fromCurrency),
    [fromCurrency]
  );

  const toDetails = useMemo(
    () => getCurrencyDetails(toCurrency),
    [toCurrency]
  );

  const selectedCurrency =
    pickerType === "from"
      ? fromCurrency
      : toCurrency;

  const handleCurrencySelect = (
    currency: CurrencyOption
  ) => {
    if (pickerType === "from") {
      onFromPress(currency.code);
    }

    if (pickerType === "to") {
      onToPress(currency.code);
    }

    setPickerType(null);
  };

  return (
    <>
      <View style={styles.wrapper}>
        <View style={styles.labelsRow}>
          <Text style={styles.label}>
            From
          </Text>

          <Text style={styles.label}>
            To
          </Text>
        </View>

        <View style={styles.container}>
          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.currencyCard}
            onPress={() =>
              setPickerType("from")
            }
          >
            <View style={styles.flagBox}>
              <Text style={styles.flag}>
                {fromDetails.flag}
              </Text>
            </View>

            <View style={styles.currencyInfo}>
              <Text style={styles.currencyCode}>
                {fromDetails.code}
              </Text>

              <Text
                style={styles.currencyName}
                numberOfLines={1}
              >
                {fromDetails.name}
              </Text>
            </View>

            <Ionicons
              name="chevron-down"
              size={18}
              color="#829CAF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.swapButton}
            onPress={onSwapPress}
          >
            <Ionicons
              name="swap-horizontal"
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.currencyCard}
            onPress={() =>
              setPickerType("to")
            }
          >
            <View style={styles.flagBox}>
              <Text style={styles.flag}>
                {toDetails.flag}
              </Text>
            </View>

            <View style={styles.currencyInfo}>
              <Text style={styles.currencyCode}>
                {toDetails.code}
              </Text>

              <Text
                style={styles.currencyName}
                numberOfLines={1}
              >
                {toDetails.name}
              </Text>
            </View>

            <Ionicons
              name="chevron-down"
              size={18}
              color="#829CAF"
            />
          </TouchableOpacity>
        </View>
      </View>

      <CurrencyPickerModal
        visible={pickerType !== null}
        title={
          pickerType === "from"
            ? "Select Sending Currency"
            : "Select Receiving Currency"
        }
        selectedCurrency={selectedCurrency}
        onClose={() =>
          setPickerType(null)
        }
        onSelect={handleCurrencySelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },

  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 9,
  },

  label: {
    width: "43%",
    color: "#8EA7BA",
    fontSize: 12,
    fontWeight: "600",
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  currencyCard: {
    flex: 1,
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#21516E",
    paddingHorizontal: 10,
  },

  flagBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B4058",
    marginRight: 8,
  },

  flag: {
    fontSize: 22,
  },

  currencyInfo: {
    flex: 1,
    minWidth: 0,
  },

  currencyCode: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  currencyName: {
    color: "#829CAF",
    fontSize: 10,
    marginTop: 3,
  },

  swapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1687E8",
    borderWidth: 4,
    borderColor: "#0E2C43",
    marginHorizontal: -4,
    zIndex: 2,
    elevation: 5,
  },
});