import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../theme";

type Props = {
  title: string;
  currency: string;
  amount: string;
};

export default function CurrencyInput({
  title,
  currency,
  amount,
}: Props) {
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.box}>
        <Text style={styles.currency}>{currency}</Text>

        <Text style={styles.amount}>{amount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "#8EA9C8",
    marginBottom: 8,
  },

  box: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  currency: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  amount: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
});