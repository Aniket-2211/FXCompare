import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ProviderComparisonCard from "../ProviderComparisonCard";
import SortToolbar, {
  SortOption,
} from "./SortToolbar";

export type ProviderResult = {
  name: string;
  rate: number;
  fee: number;
  finalAmount: number;
  recommended?: boolean;
};

export type ProviderDetails = {
  deliveryTime: string;
  deliveryMinutes: number;
  rating: number;
  paymentMethods: string[];
  description: string;
};

type Props = {
  providers: ProviderResult[];
  rankedByPayout: ProviderResult[];
  sortBy: SortOption;
  favouriteProviders: string[];
  loading: boolean;
  providerDetails: Record<
    string,
    ProviderDetails
  >;
  fallbackProviderDetails:
    ProviderDetails;
  onSortChange: (
    option: SortOption
  ) => void;
  onProviderPress: (
    provider: ProviderResult
  ) => void;
};

const providerNamesMatch = (
  firstName: string,
  secondName: string
) => {
  return (
    firstName
      .trim()
      .toLowerCase() ===
    secondName
      .trim()
      .toLowerCase()
  );
};

export default function ProviderResults({
  providers,
  rankedByPayout,
  sortBy,
  favouriteProviders,
  loading,
  providerDetails,
  fallbackProviderDetails,
  onSortChange,
  onProviderPress,
}: Props) {
  return (
    <>
      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.resultsTitle}>
            Ranked Providers
          </Text>

          <Text
            style={styles.resultsSubtitle}
          >
            Expand a provider to review transfer details
          </Text>
        </View>

        <View style={styles.resultCount}>
          <Text
            style={styles.resultCountText}
          >
            {providers.length}
          </Text>
        </View>
      </View>

      <SortToolbar
        selectedSort={sortBy}
        onSortChange={onSortChange}
      />

      {providers.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconBox}>
            <Ionicons
              name="git-compare-outline"
              size={39}
              color="#67869C"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No comparison available
          </Text>

          <Text style={styles.emptyText}>
            Enter an amount and refresh the live rate to
            generate provider estimates.
          </Text>
        </View>
      ) : (
        providers.map(
          (provider, index) => {
            const details =
              providerDetails[
                provider.name
              ] ??
              fallbackProviderDetails;

            const actualRank =
              rankedByPayout.findIndex(
                (rankedProvider) =>
                  rankedProvider.name ===
                  provider.name
              ) + 1;

            const isFavourite =
              favouriteProviders.some(
                (providerName) =>
                  providerNamesMatch(
                    providerName,
                    provider.name
                  )
              );

            return (
              <View
                key={provider.name}
                style={
                  styles.rankedCardWrapper
                }
              >
                <View
                  style={[
                    styles.rankBadge,
                    actualRank === 1 &&
                      styles.firstRankBadge,
                    actualRank === 2 &&
                      styles.secondRankBadge,
                    actualRank === 3 &&
                      styles.thirdRankBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.rankText,
                      actualRank === 1 &&
                        styles.firstRankText,
                    ]}
                  >
                    #{actualRank}
                  </Text>
                </View>

                <ProviderComparisonCard
                  name={provider.name}
                  rate={provider.rate}
                  fee={provider.fee}
                  finalAmount={
                    provider.finalAmount
                  }
                  recommended={
                    provider.recommended
                  }
                  deliveryTime={
                    details.deliveryTime
                  }
                  rating={details.rating}
                  paymentMethods={
                    details.paymentMethods
                  }
                  loading={loading}
                  animationDelay={Math.min(
                    index * 90,
                    360
                  )}
                  onPress={() =>
                    onProviderPress(
                      provider
                    )
                  }
                />

                {index === 0 &&
                sortBy ===
                  "favourites" &&
                isFavourite ? (
                  <View
                    style={
                      styles.favouriteSortBadge
                    }
                  >
                    <Ionicons
                      name="heart"
                      size={13}
                      color="#FF6B81"
                    />

                    <Text
                      style={
                        styles.favouriteSortText
                      }
                    >
                      FAVOURITE
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          }
        )
      )}
    </>
  );
}

const styles = StyleSheet.create({
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 14,
    paddingHorizontal: 2,
  },

  resultsTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },

  resultsSubtitle: {
    color: "#829CAF",
    fontSize: 11,
    marginTop: 4,
  },

  resultCount: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
    borderWidth: 1,
    borderColor: "#21516E",
  },

  resultCountText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  rankedCardWrapper: {
    position: "relative",
  },

  rankBadge: {
    position: "absolute",
    left: -7,
    top: -7,
    zIndex: 10,
    minWidth: 38,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#29485D",
    borderWidth: 2,
    borderColor: "#071521",
    paddingHorizontal: 7,
  },

  firstRankBadge: {
    backgroundColor: "#FFD65A",
  },

  secondRankBadge: {
    backgroundColor: "#B8C6D0",
  },

  thirdRankBadge: {
    backgroundColor: "#D89A68",
  },

  rankText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  firstRankText: {
    color: "#3A2A00",
  },

  favouriteSortBadge: {
    position: "absolute",
    right: 12,
    bottom: 24,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(255,107,129,0.12)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  favouriteSortText: {
    color: "#FF8296",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginLeft: 4,
  },

  emptyCard: {
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E2C43",
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#194661",
    paddingHorizontal: 28,
    marginBottom: 18,
  },

  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 14,
  },

  emptyText: {
    color: "#829CAF",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 7,
  },
});