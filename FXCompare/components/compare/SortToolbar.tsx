import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type SortOption =
  | "best"
  | "payout"
  | "fee"
  | "speed"
  | "rating"
  | "favourites";

type SortItem = {
  key: SortOption;
  label: string;
  icon:
    keyof typeof Ionicons.glyphMap;
};

type Props = {
  selectedSort: SortOption;
  onSortChange: (
    option: SortOption
  ) => void;
};

const sortOptions: SortItem[] = [
  {
    key: "best",
    label: "Best Value",
    icon: "trophy-outline",
  },
  {
    key: "payout",
    label: "Highest Payout",
    icon: "cash-outline",
  },
  {
    key: "fee",
    label: "Lowest Fee",
    icon: "pricetag-outline",
  },
  {
    key: "speed",
    label: "Fastest",
    icon: "flash-outline",
  },
  {
    key: "rating",
    label: "Top Rated",
    icon: "star-outline",
  },
  {
    key: "favourites",
    label: "Favourites",
    icon: "heart-outline",
  },
];

export default function SortToolbar({
  selectedSort,
  onSortChange,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.sortList
      }
    >
      {sortOptions.map((option) => {
        const active =
          selectedSort ===
          option.key;

        return (
          <TouchableOpacity
            key={option.key}
            activeOpacity={0.85}
            onPress={() =>
              onSortChange(
                option.key
              )
            }
            style={[
              styles.sortButton,
              active &&
                styles.activeSortButton,
            ]}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={
                active
                  ? "#FFFFFF"
                  : "#829CAF"
              }
            />

            <Text
              style={[
                styles.sortText,
                active &&
                  styles.activeSortText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sortList: {
    paddingBottom: 18,
    paddingRight: 18,
  },

  sortButton: {
    height: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E2C43",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#194661",
    paddingHorizontal: 14,
    marginRight: 9,
  },

  activeSortButton: {
    backgroundColor: "#1687E8",
    borderColor: "#1687E8",
  },

  sortText: {
    color: "#829CAF",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 6,
  },

  activeSortText: {
    color: "#FFFFFF",
  },
});