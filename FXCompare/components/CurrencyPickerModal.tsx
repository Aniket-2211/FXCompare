import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  getFavouriteCurrencies,
  getRecentCurrencies,
  POPULAR_CURRENCIES,
  saveRecentCurrency,
  toggleFavouriteCurrency,
} from "../services/currencyPreferences";

export type CurrencyOption = {
  code: string;
  name: string;
  flag: string;
  symbol: string;
};

type Props = {
  visible: boolean;
  selectedCurrency: string;

  onClose: () => void;

  onSelect: (
    currency: CurrencyOption
  ) => void;

  title?: string;
};

export const currencyOptions: CurrencyOption[] = [
  {
    code: "USD",
    name: "US Dollar",
    flag: "🇺🇸",
    symbol: "$",
  },
  {
    code: "INR",
    name: "Indian Rupee",
    flag: "🇮🇳",
    symbol: "₹",
  },
  {
    code: "EUR",
    name: "Euro",
    flag: "🇪🇺",
    symbol: "€",
  },
  {
    code: "GBP",
    name: "British Pound",
    flag: "🇬🇧",
    symbol: "£",
  },
  {
    code: "AED",
    name: "UAE Dirham",
    flag: "🇦🇪",
    symbol: "د.إ",
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    flag: "🇯🇵",
    symbol: "¥",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    flag: "🇨🇦",
    symbol: "$",
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    flag: "🇦🇺",
    symbol: "$",
  },
  {
    code: "SGD",
    name: "Singapore Dollar",
    flag: "🇸🇬",
    symbol: "$",
  },
  {
    code: "CHF",
    name: "Swiss Franc",
    flag: "🇨🇭",
    symbol: "CHF",
  },
  {
    code: "NZD",
    name: "New Zealand Dollar",
    flag: "🇳🇿",
    symbol: "$",
  },
  {
    code: "SAR",
    name: "Saudi Riyal",
    flag: "🇸🇦",
    symbol: "﷼",
  },
  {
    code: "THB",
    name: "Thai Baht",
    flag: "🇹🇭",
    symbol: "฿",
  },
  {
    code: "MYR",
    name: "Malaysian Ringgit",
    flag: "🇲🇾",
    symbol: "RM",
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    flag: "🇨🇳",
    symbol: "¥",
  },
  {
    code: "HKD",
    name: "Hong Kong Dollar",
    flag: "🇭🇰",
    symbol: "$",
  },
  {
    code: "KRW",
    name: "South Korean Won",
    flag: "🇰🇷",
    symbol: "₩",
  },
  {
    code: "ZAR",
    name: "South African Rand",
    flag: "🇿🇦",
    symbol: "R",
  },
  {
    code: "BRL",
    name: "Brazilian Real",
    flag: "🇧🇷",
    symbol: "R$",
  },
  {
    code: "MXN",
    name: "Mexican Peso",
    flag: "🇲🇽",
    symbol: "$",
  },
  {
    code: "SEK",
    name: "Swedish Krona",
    flag: "🇸🇪",
    symbol: "kr",
  },
  {
    code: "NOK",
    name: "Norwegian Krone",
    flag: "🇳🇴",
    symbol: "kr",
  },
  {
    code: "DKK",
    name: "Danish Krone",
    flag: "🇩🇰",
    symbol: "kr",
  },
  {
    code: "PLN",
    name: "Polish Zloty",
    flag: "🇵🇱",
    symbol: "zł",
  },
  {
    code: "TRY",
    name: "Turkish Lira",
    flag: "🇹🇷",
    symbol: "₺",
  },
];

const getCurrencyByCode = (
  code: string
) =>
  currencyOptions.find(
    (currency) =>
      currency.code === code
  );

const rankCurrency = (
  currency: CurrencyOption,
  search: string
) => {
  const code =
    currency.code.toLowerCase();

  const name =
    currency.name.toLowerCase();

  const symbol =
    currency.symbol.toLowerCase();

  if (code === search) {
    return 0;
  }

  if (
    code.startsWith(search)
  ) {
    return 1;
  }

  if (
    name.startsWith(search)
  ) {
    return 2;
  }

  if (
    code.includes(search)
  ) {
    return 3;
  }

  if (
    name.includes(search)
  ) {
    return 4;
  }

  if (
    symbol.includes(search)
  ) {
    return 5;
  }

  return 99;
};

export default function CurrencyPickerModal({
  visible,
  selectedCurrency,
  onClose,
  onSelect,
  title = "Select Currency",
}: Props) {
  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    favouriteCurrencies,
    setFavouriteCurrencies,
  ] = useState<string[]>(
    []
  );

  const [
    recentCurrencies,
    setRecentCurrencies,
  ] = useState<string[]>(
    []
  );

  const [
    loadingPreferences,
    setLoadingPreferences,
  ] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSearchText("");
      return;
    }

    let mounted = true;

    const loadPreferences =
      async () => {
        try {
          setLoadingPreferences(
            true
          );

          const [
            favourites,
            recents,
          ] =
            await Promise.all([
              getFavouriteCurrencies(),
              getRecentCurrencies(),
            ]);

          if (!mounted) {
            return;
          }

          setFavouriteCurrencies(
            favourites
          );

          setRecentCurrencies(
            recents
          );
        } catch (error) {
          console.log(
            "Currency preference load error:",
            error
          );
        } finally {
          if (mounted) {
            setLoadingPreferences(
              false
            );
          }
        }
      };

    void loadPreferences();

    return () => {
      mounted = false;
    };
  }, [visible]);

  const favourites =
    useMemo(() => {
      return favouriteCurrencies
        .map(
          getCurrencyByCode
        )
        .filter(
          (
            item
          ): item is CurrencyOption =>
            item !== undefined
        );
    }, [
      favouriteCurrencies,
    ]);

  const recents =
    useMemo(() => {
      return recentCurrencies
        .filter(
          (code) =>
            !favouriteCurrencies.includes(
              code
            )
        )
        .map(
          getCurrencyByCode
        )
        .filter(
          (
            item
          ): item is CurrencyOption =>
            item !== undefined
        );
    }, [
      recentCurrencies,
      favouriteCurrencies,
    ]);

  const popular =
    useMemo(() => {
      return POPULAR_CURRENCIES
        .filter(
          (code) =>
            !favouriteCurrencies.includes(
              code
            ) &&
            !recentCurrencies.includes(
              code
            )
        )
        .map(
          getCurrencyByCode
        )
        .filter(
          (
            item
          ): item is CurrencyOption =>
            item !== undefined
        );
    }, [
      favouriteCurrencies,
      recentCurrencies,
    ]);

  const filteredCurrencies =
    useMemo(() => {
      const search =
        searchText
          .trim()
          .toLowerCase();

      if (!search) {
        return currencyOptions;
      }

      return currencyOptions
        .filter(
          (currency) =>
            currency.code
              .toLowerCase()
              .includes(
                search
              ) ||
            currency.name
              .toLowerCase()
              .includes(
                search
              ) ||
            currency.symbol
              .toLowerCase()
              .includes(
                search
              )
        )
        .sort(
          (
            first,
            second
          ) =>
            rankCurrency(
              first,
              search
            ) -
            rankCurrency(
              second,
              search
            )
        );
    }, [
      searchText,
    ]);

  const handleClose =
    () => {
      Keyboard.dismiss();

      setSearchText("");

      onClose();
    };

  const handleSelect =
    async (
      currency: CurrencyOption
    ) => {
      try {
        const updatedRecents =
          await saveRecentCurrency(
            currency.code
          );

        setRecentCurrencies(
          updatedRecents
        );
      } catch (error) {
        console.log(
          "Recent currency save error:",
          error
        );
      }

      Keyboard.dismiss();

      onSelect(currency);

      setSearchText("");

      onClose();
    };

  const handleFavouriteToggle =
    async (
      code: string
    ) => {
      try {
        const updated =
          await toggleFavouriteCurrency(
            code
          );

        setFavouriteCurrencies(
          updated
        );
      } catch (error) {
        console.log(
          "Favourite currency error:",
          error
        );
      }
    };

  const renderCurrencyRow = (
    item: CurrencyOption
  ) => {
    const selected =
      selectedCurrency.toUpperCase() ===
      item.code;

    const favourite =
      favouriteCurrencies.includes(
        item.code
      );

    return (
      <TouchableOpacity
        activeOpacity={0.82}
        style={[
          styles.currencyRow,
          selected &&
            styles.selectedCurrencyRow,
        ]}
        onPress={() => {
          void handleSelect(
            item
          );
        }}
      >
        <View
          style={styles.flagBox}
        >
          <Text
            style={styles.flag}
          >
            {item.flag}
          </Text>
        </View>

        <View
          style={
            styles.currencyInfo
          }
        >
          <Text
            style={
              styles.currencyCode
            }
          >
            {item.code}
          </Text>

          <Text
            style={
              styles.currencyName
            }
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </View>

        <Text
          style={styles.symbol}
        >
          {item.symbol}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={
            styles.favouriteButton
          }
          onPress={(event) => {
            event.stopPropagation();

            void handleFavouriteToggle(
              item.code
            );
          }}
        >
          <Ionicons
            name={
              favourite
                ? "star"
                : "star-outline"
            }
            size={20}
            color={
              favourite
                ? "#FFD65A"
                : "#607C90"
            }
          />
        </TouchableOpacity>

        {selected ? (
          <Ionicons
            name="checkmark-circle"
            size={23}
            color="#2FE58C"
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={19}
            color="#536F83"
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderQuickSection =
    (
      sectionTitle: string,
      icon:
        keyof typeof Ionicons.glyphMap,
      items: CurrencyOption[]
    ) => {
      if (
        items.length === 0
      ) {
        return null;
      }

      return (
        <View
          style={
            styles.quickSection
          }
        >
          <View
            style={
              styles.quickHeader
            }
          >
            <Ionicons
              name={icon}
              size={15}
              color="#64AFFF"
            />

            <Text
              style={
                styles.quickTitle
              }
            >
              {sectionTitle}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.quickScrollContent
            }
          >
            {items.map(
              (item) => (
                <TouchableOpacity
                  key={
                    `${sectionTitle}-${item.code}`
                  }
                  activeOpacity={
                    0.82
                  }
                  style={
                    styles.quickChip
                  }
                  onPress={() => {
                    void handleSelect(
                      item
                    );
                  }}
                >
                  <Text
                    style={
                      styles.quickFlag
                    }
                  >
                    {
                      item.flag
                    }
                  </Text>

                  <Text
                    style={
                      styles.quickCode
                    }
                  >
                    {
                      item.code
                    }
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>
      );
    };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={false}
      onRequestClose={
        handleClose
      }
    >
      <SafeAreaView
        style={styles.safeArea}
        edges={[
          "top",
          "left",
          "right",
          "bottom",
        ]}
      >
        <View
          style={styles.header}
        >
          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={styles.title}
            >
              {title}
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Search, favourite or choose a recent currency
            </Text>
          </View>

          <Pressable
            style={
              styles.closeButton
            }
            onPress={
              handleClose
            }
            hitSlop={10}
          >
            <Ionicons
              name="close"
              size={24}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <View
          style={styles.searchBox}
        >
          <Ionicons
            name="search"
            size={20}
            color="#7892A5"
          />

          <TextInput
            value={searchText}
            onChangeText={
              setSearchText
            }
            placeholder="Search currency"
            placeholderTextColor="#6F8799"
            selectionColor="#2FE58C"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="search"
            style={
              styles.searchInput
            }
          />

          {searchText.length >
          0 ? (
            <TouchableOpacity
              activeOpacity={
                0.8
              }
              style={
                styles.clearButton
              }
              onPress={() =>
                setSearchText("")
              }
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#7892A5"
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {searchText.trim()
          .length === 0 ? (
          <View>
            {loadingPreferences ? (
              <View
                style={
                  styles.loadingPreferencesBox
                }
              >
                <Ionicons
                  name="sync-outline"
                  size={16}
                  color="#64AFFF"
                />

                <Text
                  style={
                    styles.loadingPreferencesText
                  }
                >
                  Loading your currency preferences...
                </Text>
              </View>
            ) : (
              <>
                {renderQuickSection(
                  "Favourites",
                  "star",
                  favourites
                )}

                {renderQuickSection(
                  "Recent",
                  "time-outline",
                  recents
                )}

                {renderQuickSection(
                  "Popular",
                  "globe-outline",
                  popular
                )}
              </>
            )}
          </View>
        ) : null}

        <View
          style={
            styles.resultHeader
          }
        >
          <Text
            style={
              styles.resultTitle
            }
          >
            {searchText.trim()
              .length > 0
              ? "Search Results"
              : "All Currencies"}
          </Text>

          <Text
            style={
              styles.resultCount
            }
          >
            {
              filteredCurrencies.length
            }
          </Text>
        </View>

        <FlatList
          data={
            filteredCurrencies
          }
          keyExtractor={(
            item
          ) => item.code}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.list
          }
          renderItem={({
            item,
          }) =>
            renderCurrencyRow(
              item
            )
          }
          ListEmptyComponent={
            <View
              style={
                styles.emptyBox
              }
            >
              <View
                style={
                  styles.emptyIcon
                }
              >
                <Ionicons
                  name="search-outline"
                  size={34}
                  color="#67869C"
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No currency found
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Try a different currency code, name or symbol.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        "#071521",
      paddingHorizontal: 18,
    },

    header: {
      minHeight: 82,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingTop: 8,
      paddingBottom: 16,
    },

    headerText: {
      flex: 1,
      paddingRight: 14,
    },

    title: {
      color: "#FFFFFF",
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: -0.4,
    },

    subtitle: {
      color: "#829CAF",
      fontSize: 13,
      marginTop: 5,
    },

    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#153147",
      borderWidth: 1,
      borderColor:
        "#21465E",
    },

    searchBox: {
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#102B40",
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        "#1C465F",
      paddingHorizontal: 16,
      marginBottom: 15,
    },

    searchInput: {
      flex: 1,
      color: "#FFFFFF",
      fontSize: 16,
      marginLeft: 10,
      paddingVertical: 0,
    },

    clearButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingPreferencesBox: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#0E293E",
      borderRadius: 14,
      paddingHorizontal: 12,
      marginBottom: 12,
    },

    loadingPreferencesText: {
      color: "#829CAF",
      fontSize: 10,
      marginLeft: 7,
    },

    quickSection: {
      marginBottom: 14,
    },

    quickHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },

    quickTitle: {
      color: "#A8BDCC",
      fontSize: 11,
      fontWeight: "800",
      marginLeft: 5,
    },

    quickScrollContent: {
      paddingRight: 4,
    },

    quickChip: {
      minWidth: 76,
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#0E293E",
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        "#183D55",
      paddingHorizontal: 11,
      marginRight: 8,
    },

    quickFlag: {
      fontSize: 19,
    },

    quickCode: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "900",
      marginLeft: 6,
    },

    resultHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 12,
      paddingHorizontal: 2,
    },

    resultTitle: {
      color: "#A8BDCC",
      fontSize: 12,
      fontWeight: "700",
    },

    resultCount: {
      color: "#2FE58C",
      fontSize: 12,
      fontWeight: "800",
    },

    list: {
      paddingBottom: 30,
      flexGrow: 1,
    },

    currencyRow: {
      minHeight: 74,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#0E293E",
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        "#183D55",
      paddingHorizontal: 14,
      marginBottom: 10,
    },

    selectedCurrencyRow: {
      borderColor:
        "#2FE58C",
      backgroundColor:
        "rgba(47,229,140,0.08)",
    },

    flagBox: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#173A51",
    },

    flag: {
      fontSize: 25,
    },

    currencyInfo: {
      flex: 1,
      marginLeft: 13,
    },

    currencyCode: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "800",
    },

    currencyName: {
      color: "#829CAF",
      fontSize: 12,
      marginTop: 3,
    },

    symbol: {
      color: "#A8BDCC",
      fontSize: 16,
      fontWeight: "700",
      marginRight: 7,
    },

    favouriteButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 3,
    },

    emptyBox: {
      flex: 1,
      minHeight: 360,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
    },

    emptyIcon: {
      width: 66,
      height: 66,
      borderRadius: 33,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#102B40",
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