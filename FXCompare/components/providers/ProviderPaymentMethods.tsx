import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Ionicons,
} from "@expo/vector-icons";

type Props = {
  paymentMethods: string[];
};

export default function ProviderPaymentMethods({
  paymentMethods,
}: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>
        Payment Methods
      </Text>

      <View style={styles.card}>
        <View style={styles.wrap}>
          {paymentMethods.map(
            (method) => (
              <View
                key={method}
                style={
                  styles.methodChip
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#2FE58C"
                />

                <Text
                  style={
                    styles.methodText
                  }
                >
                  {method}
                </Text>
              </View>
            )
          )}
        </View>
      </View>
    </>
  );
}

const styles =
  StyleSheet.create({
    sectionTitle: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 12,
    },

    card: {
      backgroundColor:
        "#0E2C43",
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "#194661",
      padding: 13,
      marginBottom: 22,
    },

    wrap: {
      flexDirection: "row",
      flexWrap: "wrap",
    },

    methodChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#16344C",
      borderRadius: 13,
      paddingHorizontal: 10,
      paddingVertical: 9,
      margin: 4,
    },

    methodText: {
      color: "#C0D0DB",
      fontSize: 11,
      fontWeight: "700",
      marginLeft: 6,
    },
  });