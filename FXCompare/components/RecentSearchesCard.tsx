// components/RecentSearchesCard.tsx

import React, {
  useMemo,
} from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  RecentSearch,
} from "../services/recentSearchService";

type Props = {
  searches?: RecentSearch[];
  loading?: boolean;
  saving?: boolean;
  onSearchPress?: (
    search: RecentSearch
  ) => void;
  onDeletePress?: (
    id: string
  ) => void;
  onClearAllPress?: () => void;
};

const currencyFlags: Record<
  string,
  string
> = {
  USD: "🇺🇸",
  INR: "🇮🇳",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  AED: "🇦🇪",
  JPY: "🇯🇵",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  SGD: "🇸🇬",
  CHF: "🇨🇭",
  NZD: "🇳🇿",
  CNY: "🇨🇳",
  HKD: "🇭🇰",
};

const getCurrencyFlag = (
  currencyCode: string
) =>
  currencyFlags[
    currencyCode.toUpperCase()
  ] ?? "🌐";

const formatAmount = (
  amount: string
) => {
  const parsedAmount = Number(
    amount.replace(/,/g, "")
  );

  if (
    !Number.isFinite(parsedAmount)
  ) {
    return amount;
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  ).format(parsedAmount);
};

const formatRelativeTime = (
  createdAt: string
) => {
  const createdDate =
    new Date(createdAt);

  if (
    Number.isNaN(
      createdDate.getTime()
    )
  ) {
    return "Recently";
  }

  const difference =
    Date.now() -
    createdDate.getTime();

  const minutes = Math.floor(
    difference / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hr${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return createdDate.toLocaleDateString(
    [],
    {
      day: "2-digit",
      month: "short",
    }
  );
};

export default function RecentSearchesCard({
  searches = [],
  loading = false,
  saving = false,
  onSearchPress,
  onDeletePress,
  onClearAllPress,
}: Props) {
  const visibleSearches = useMemo(
    () => searches.slice(0, 5),
    [searches]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            HISTORY
          </Text>

          <Text style={styles.title}>
            Recent Searches
          </Text>

          <Text style={styles.subtitle}>
            Quickly reopen your latest currency conversions
          </Text>
        </View>

        {visibleSearches.length >
          0 &&
        onClearAllPress ? (
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={saving}
            style={[
              styles.clearAllButton,
              saving &&
                styles.disabledButton,
            ]}
            onPress={onClearAllPress}
          >
            <Ionicons
              name="trash-outline"
              size={15}
              color="#FF8296"
            />

            <Text
              style={
                styles.clearAllText
              }
            >
              Clear
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerIcon}>
            <Ionicons
              name="time-outline"
              size={22}
              color="#64AFFF"
            />
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.stateCard}>
          <View style={styles.stateIcon}>
            <Ionicons
              name="hourglass-outline"
              size={31}
              color="#67869C"
            />
          </View>

          <Text style={styles.stateTitle}>
            Loading recent searches
          </Text>

          <Text style={styles.stateText}>
            Restoring your latest currency pairs.
          </Text>
        </View>
      ) : visibleSearches.length ===
        0 ? (
        <View style={styles.stateCard}>
          <View style={styles.stateIcon}>
            <Ionicons
              name="time-outline"
              size={34}
              color="#67869C"
            />
          </View>

          <Text style={styles.stateTitle}>
            No recent searches
          </Text>

          <Text style={styles.stateText}>
            Currency comparisons you make will appear here automatically.
          </Text>
        </View>
      ) : (
        <View style={styles.listCard}>
          {visibleSearches.map(
            (search, index) => (
              <TouchableOpacity
                key={search.id}
                activeOpacity={0.84}
                style={[
                  styles.searchRow,
                  index !==
                    visibleSearches.length -
                      1 &&
                    styles.searchRowDivider,
                ]}
                onPress={() =>
                  onSearchPress?.(
                    search
                  )
                }
              >
                <View
                  style={
                    styles.searchLeft
                  }
                >
                  <View
                    style={
                      styles.flagStack
                    }
                  >
                    <View
                      style={
                        styles.primaryFlag
                      }
                    >
                      <Text
                        style={
                          styles.flag
                        }
                      >
                        {getCurrencyFlag(
                          search.fromCurrency
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.secondaryFlag
                      }
                    >
                      <Text
                        style={
                          styles.smallFlag
                        }
                      >
                        {getCurrencyFlag(
                          search.toCurrency
                        )}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.searchInfo
                    }
                  >
                    <View
                      style={
                        styles.pairRow
                      }
                    >
                      <Text
                        style={
                          styles.currencyCode
                        }
                      >
                        {
                          search.fromCurrency
                        }
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color="#64AFFF"
                        style={
                          styles.arrowIcon
                        }
                      />

                      <Text
                        style={
                          styles.currencyCode
                        }
                      >
                        {
                          search.toCurrency
                        }
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.searchMeta
                      }
                    >
                      {formatAmount(
                        search.amount
                      )}{" "}
                      {
                        search.fromCurrency
                      }{" "}
                      •{" "}
                      {formatRelativeTime(
                        search.createdAt
                      )}
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.searchActions
                  }
                >
                  <View
                    style={
                      styles.reopenButton
                    }
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={17}
                      color="#64AFFF"
                    />
                  </View>

                  {onDeletePress ? (
                    <TouchableOpacity
                      activeOpacity={
                        0.8
                      }
                      disabled={
                        saving
                      }
                      style={[
                        styles.deleteButton,
                        saving &&
                          styles.disabledButton,
                      ]}
                      onPress={(
                        event
                      ) => {
                        event.stopPropagation();

                        onDeletePress(
                          search.id
                        );
                      }}
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color="#FF8296"
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </TouchableOpacity>
            )
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Ionicons
          name="shield-checkmark-outline"
          size={16}
          color="#728DA1"
        />

        <Text style={styles.footerText}>
          Recent searches are stored only on this device.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0E2C43",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 17,
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    color: "#64AFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 5,
  },

  subtitle: {
    color: "#829CAF",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(100,175,255,0.10)",
    borderWidth: 1,
    borderColor:
      "rgba(100,175,255,0.22)",
  },

  clearAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(255,130,150,0.10)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      "rgba(255,130,150,0.24)",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  clearAllText: {
    color: "#FF8296",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 5,
  },

  disabledButton: {
    opacity: 0.55,
  },

  listCard: {
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingHorizontal: 13,
  },

  searchRow: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  searchRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#295069",
  },

  searchLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  flagStack: {
    width: 49,
    height: 49,
    marginRight: 12,
  },

  primaryFlag: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B425A",
  },

  secondaryFlag: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E2C43",
    borderWidth: 2,
    borderColor: "#16344C",
  },

  flag: {
    fontSize: 23,
  },

  smallFlag: {
    fontSize: 13,
  },

  searchInfo: {
    flex: 1,
  },

  pairRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  currencyCode: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  arrowIcon: {
    marginHorizontal: 7,
  },

  searchMeta: {
    color: "#829CAF",
    fontSize: 9,
    marginTop: 5,
  },

  searchActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  reopenButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(100,175,255,0.10)",
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,130,150,0.10)",
    marginLeft: 7,
  },

  stateCard: {
    minHeight: 170,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingHorizontal: 25,
  },

  stateIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B425A",
  },

  stateTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 12,
  },

  stateText: {
    color: "#829CAF",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 6,
  },

  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    paddingHorizontal: 2,
  },

  footerText: {
    flex: 1,
    color: "#728DA1",
    fontSize: 9,
    lineHeight: 15,
    marginLeft: 7,
  },
});