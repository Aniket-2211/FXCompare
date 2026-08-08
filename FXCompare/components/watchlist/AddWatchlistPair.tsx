import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Ionicons,
} from "@expo/vector-icons";

import type {
  CurrencyOption,
} from "../CurrencyPickerModal";

type Props = {
  fromCurrency: string;
  toCurrency: string;
  fromDetails: CurrencyOption;
  toDetails: CurrencyOption;
  targetRate: string;
  note: string;
  saving: boolean;

  onOpenFrom: () => void;
  onOpenTo: () => void;
  onSwap: () => void;
  onTargetRateChange: (
    value: string
  ) => void;
  onNoteChange: (
    value: string
  ) => void;
  onSave: () => void;
};

export default function AddWatchlistPair({
  fromCurrency,
  toCurrency,
  fromDetails,
  toDetails,
  targetRate,
  note,
  saving,
  onOpenFrom,
  onOpenTo,
  onSwap,
  onTargetRateChange,
  onNoteChange,
  onSave,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Add Pair
      </Text>

      <Text style={styles.subtitle}>
        Track a currency pair and optional target rate
      </Text>

      <View style={styles.currencyRow}>
        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.currencyButton}
          onPress={onOpenFrom}
        >
          <Text style={styles.flag}>
            {fromDetails.flag}
          </Text>

          <Text style={styles.code}>
            {fromCurrency}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.swapButton}
          onPress={onSwap}
        >
          <Ionicons
            name="swap-horizontal"
            size={20}
            color="#2FE58C"
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.currencyButton}
          onPress={onOpenTo}
        >
          <Text style={styles.flag}>
            {toDetails.flag}
          </Text>

          <Text style={styles.code}>
            {toCurrency}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>
        Target rate (optional)
      </Text>

      <TextInput
        value={targetRate}
        onChangeText={
          onTargetRateChange
        }
        placeholder="e.g. 90.00"
        placeholderTextColor="#6F8799"
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <Text style={styles.label}>
        Note (optional)
      </Text>

      <TextInput
        value={note}
        onChangeText={onNoteChange}
        placeholder="Why are you watching this pair?"
        placeholderTextColor="#6F8799"
        style={[
          styles.input,
          styles.noteInput,
        ]}
        multiline
        maxLength={120}
      />

      <TouchableOpacity
        activeOpacity={0.86}
        disabled={saving}
        style={[
          styles.saveButton,
          saving &&
            styles.disabledButton,
        ]}
        onPress={onSave}
      >
        <Ionicons
          name="add-circle-outline"
          size={20}
          color="#071521"
        />

        <Text style={styles.saveText}>
          {saving
            ? "Saving..."
            : "Add to Watchlist"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0E2C43",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 16,
    marginBottom: 20,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },

  subtitle: {
    color: "#829CAF",
    fontSize: 10,
    marginTop: 4,
  },

  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  currencyButton: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#16344C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  flag: {
    fontSize: 21,
  },

  code: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 7,
  },

  swapButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(47,229,140,0.09)",
    marginHorizontal: 8,
  },

  label: {
    color: "#A8BDCC",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 7,
  },

  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1C465F",
    backgroundColor: "#102B40",
    color: "#FFFFFF",
    paddingHorizontal: 13,
    fontSize: 13,
  },

  noteInput: {
    minHeight: 76,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  saveButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#2FE58C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },

  disabledButton: {
    opacity: 0.55,
  },

  saveText: {
    color: "#071521",
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 7,
  },
});