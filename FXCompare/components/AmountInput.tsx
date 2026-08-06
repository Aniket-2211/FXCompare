import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
};

export default function AmountInput({
  value,
  onChangeText,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>
          Amount to Send
        </Text>

        <Text style={styles.live}>
          Live Calculation
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.currency}>
          $
        </Text>

        <TextInput
          value={value}
          onChangeText={(text) => {
            const cleaned = text.replace(
              /[^0-9.]/g,
              ""
            );

            onChangeText(cleaned);
          }}
          keyboardType="decimal-pad"
          placeholder="1000"
          placeholderTextColor="#64798A"
          style={styles.input}
          selectionColor="#2FE58C"
        />
      </View>

      <Text style={styles.note}>
        Enter the amount you want to convert.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  live: {
    color: "#2FE58C",
    fontSize: 12,
    fontWeight: "700",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#21516E",
    paddingHorizontal: 18,
    height: 64,
  },

  currency: {
    color: "#2FE58C",
    fontSize: 28,
    fontWeight: "800",
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    paddingVertical: 0,
  },

  note: {
    color: "#7F95A8",
    marginTop: 10,
    fontSize: 12,
  },
});