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
  pros: string[];
  cons: string[];
};

export default function ProviderProsCons({
  pros,
  cons,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.prosCard}>
        <View
          style={styles.smallHeader}
        >
          <Ionicons
            name="thumbs-up-outline"
            size={19}
            color="#2FE58C"
          />

          <Text
            style={styles.smallTitle}
          >
            Pros
          </Text>
        </View>

        {pros.map((item) => (
          <BulletRow
            key={item}
            text={item}
            positive
          />
        ))}
      </View>

      <View style={styles.consCard}>
        <View
          style={styles.smallHeader}
        >
          <Ionicons
            name="alert-circle-outline"
            size={19}
            color="#FF9C70"
          />

          <Text
            style={styles.smallTitle}
          >
            Consider
          </Text>
        </View>

        {cons.map((item) => (
          <BulletRow
            key={item}
            text={item}
          />
        ))}
      </View>
    </View>
  );
}

function BulletRow({
  text,
  positive = false,
}: {
  text: string;
  positive?: boolean;
}) {
  return (
    <View style={styles.bulletRow}>
      <View
        style={[
          styles.bullet,
          positive
            ? styles.positiveBullet
            : styles.negativeBullet,
        ]}
      />

      <Text style={styles.bulletText}>
        {text}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    row: {
      flexDirection: "row",
      marginHorizontal: -5,
      marginBottom: 20,
    },

    prosCard: {
      flex: 1,
      backgroundColor:
        "rgba(47,229,140,0.07)",
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "rgba(47,229,140,0.22)",
      padding: 14,
      marginHorizontal: 5,
    },

    consCard: {
      flex: 1,
      backgroundColor:
        "rgba(255,156,112,0.07)",
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "rgba(255,156,112,0.22)",
      padding: 14,
      marginHorizontal: 5,
    },

    smallHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },

    smallTitle: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
      marginLeft: 7,
    },

    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 9,
    },

    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 5,
      marginRight: 7,
    },

    positiveBullet: {
      backgroundColor:
        "#2FE58C",
    },

    negativeBullet: {
      backgroundColor:
        "#FF9C70",
    },

    bulletText: {
      flex: 1,
      color: "#A9BECC",
      fontSize: 10,
      lineHeight: 15,
    },
  });