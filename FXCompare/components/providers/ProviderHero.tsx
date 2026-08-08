import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Ionicons,
} from "@expo/vector-icons";

import ProviderLogo from "../ProviderLogo";

type Props = {
  name: string;
  rating: number;
  trustScore: string;
  description: string;
  recommended: boolean;
  favourite: boolean;
};

export default function ProviderHero({
  name,
  rating,
  trustScore,
  description,
  recommended,
  favourite,
}: Props) {
  return (
    <View
      style={[
        styles.heroCard,
        recommended &&
          styles.recommendedHero,
      ]}
    >
      {recommended ? (
        <View style={styles.bestBadge}>
          <Ionicons
            name="trophy"
            size={14}
            color="#062014"
          />

          <Text
            style={
              styles.bestBadgeText
            }
          >
            BEST VALUE
          </Text>
        </View>
      ) : null}

      <View style={styles.providerIcon}>
        <ProviderLogo
          provider={name}
          size={62}
        />
      </View>

      <Text style={styles.providerName}>
        {name}
      </Text>

      <View style={styles.ratingRow}>
        <Ionicons
          name="star"
          size={17}
          color="#FFD65A"
        />

        <Text style={styles.rating}>
          {rating.toFixed(1)}
        </Text>

        <Text style={styles.trustText}>
          {trustScore}
        </Text>
      </View>

      {favourite ? (
        <View
          style={
            styles.favouriteBadge
          }
        >
          <Ionicons
            name="heart"
            size={14}
            color="#FF6B81"
          />

          <Text
            style={
              styles.favouriteBadgeText
            }
          >
            FAVOURITE PROVIDER
          </Text>
        </View>
      ) : null}

      <Text style={styles.description}>
        {description}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    heroCard: {
      alignItems: "center",
      backgroundColor:
        "#0E2C43",
      borderRadius: 26,
      borderWidth: 1,
      borderColor:
        "#194661",
      padding: 22,
      overflow: "hidden",
    },

    recommendedHero: {
      borderColor: "#2FE58C",
    },

    bestBadge: {
      position: "absolute",
      top: 0,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#2FE58C",
      borderBottomLeftRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },

    bestBadgeText: {
      color: "#062014",
      fontSize: 10,
      fontWeight: "900",
      marginLeft: 5,
    },

    providerIcon: {
      width: 82,
      height: 82,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#173A51",
      borderWidth: 1,
      borderColor:
        "#23526C",
    },

    providerName: {
      color: "#FFFFFF",
      fontSize: 27,
      fontWeight: "900",
      marginTop: 14,
    },

    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },

    rating: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
      marginLeft: 5,
    },

    trustText: {
      color: "#2FE58C",
      fontSize: 12,
      fontWeight: "700",
      marginLeft: 10,
    },

    favouriteBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "rgba(255,107,129,0.12)",
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 7,
      marginTop: 12,
    },

    favouriteBadgeText: {
      color: "#FF8296",
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.5,
      marginLeft: 5,
    },

    description: {
      color: "#9FB6C9",
      fontSize: 13,
      lineHeight: 20,
      textAlign: "center",
      marginTop: 14,
    },
  });