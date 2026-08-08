import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Ionicons,
} from "@expo/vector-icons";

type Props = {
  name: string;
};

export default function ProviderActions({
  name,
}: Props) {
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.continueButton}
        onPress={() =>
          Alert.alert(
            name,
            "The official provider link will be connected before release."
          )
        }
      >
        <Text
          style={styles.continueText}
        >
          Continue to {name}
        </Text>

        <Ionicons
          name="open-outline"
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <View style={styles.noticeCard}>
        <Ionicons
          name="information-circle-outline"
          size={19}
          color="#64AFFF"
        />

        <Text style={styles.noticeText}>
          Rates and fees shown here are
          estimates. Confirm the final quote
          directly with the provider before
          completing a transfer.
        </Text>
      </View>
    </>
  );
}

const styles =
  StyleSheet.create({
    continueButton: {
      height: 60,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#1687E8",
      borderRadius: 19,
    },

    continueText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
      marginRight: 9,
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
      padding: 14,
      marginTop: 14,
    },

    noticeText: {
      flex: 1,
      color: "#829CAF",
      fontSize: 11,
      lineHeight: 17,
      marginLeft: 9,
    },
  });