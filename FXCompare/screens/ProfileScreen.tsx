import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import ScreenHeader from "../components/ScreenHeader";
import { useAppSettings } from "../context/AppSettingsContext";
import { useAuth } from "../context/AuthContext";

type SettingItem = {
  id:
    | "currency"
    | "theme"
    | "notifications"
    | "privacy"
    | "about";

  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: "switch" | "arrow";
};

type ProviderMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
};

const providerMeta: Record<
  string,
  ProviderMeta
> = {
  Wise: {
    icon: "flash-outline",
    description:
      "Transparent fees and competitive rates",
  },

  Remitly: {
    icon: "send-outline",
    description:
      "Express international transfers",
  },

  PayPal: {
    icon: "wallet-outline",
    description:
      "Digital wallet and global payments",
  },

  Revolut: {
    icon: "card-outline",
    description:
      "Multi-currency account and transfers",
  },

  OFX: {
    icon: "business-outline",
    description:
      "International bank transfers",
  },
};

export default function ProfileScreen() {
  const {
    user,
    logout,
  } = useAuth();

  const {
    loadingSettings,

    darkMode,
    notificationsEnabled,

    defaultFromCurrency,
    defaultToCurrency,

    savedAlerts,
    favouriteProviders,

    setDarkMode,
    setNotificationsEnabled,

    removeFavouriteProvider,
    clearAllSettings,
  } = useAppSettings();

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "FXCompare User";

  const email =
    user?.email ??
    "No email available";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("") || "FX";

  const confirmLogout = () => {
    Alert.alert(
      "Sign out?",
      "You will return to the FXCompare login screen.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.log(
                "Logout error:",
                error
              );

              Alert.alert(
                "Unable to sign out",
                "Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const settings: SettingItem[] = [
    {
      id: "currency",
      title: "Default Currency",
      subtitle: `${defaultFromCurrency} → ${defaultToCurrency}`,
      icon: "cash-outline",
      type: "arrow",
    },

    {
      id: "theme",
      title: "Dark Theme",
      subtitle: darkMode
        ? "Dark appearance enabled"
        : "Dark appearance disabled",
      icon: "moon-outline",
      type: "switch",
    },

    {
      id: "notifications",
      title: "Notifications",
      subtitle: notificationsEnabled
        ? "Price alerts and updates enabled"
        : "Notifications disabled",
      icon: "notifications-outline",
      type: "switch",
    },

    {
      id: "privacy",
      title: "Privacy Policy",
      subtitle: "Read our privacy policy",
      icon: "shield-checkmark-outline",
      type: "arrow",
    },

    {
      id: "about",
      title: "About FXCompare Pro",
      subtitle: "Version 1.0.0",
      icon: "information-circle-outline",
      type: "arrow",
    },
  ];

  const handleSettingPress = (
    settingId: SettingItem["id"]
  ) => {
    switch (settingId) {
      case "currency":
        Alert.alert(
          "Default Currency",
          "The default currency picker will be connected in the next step."
        );
        break;

      case "privacy":
        Alert.alert(
          "Privacy Policy",
          "The privacy policy screen will be connected before release."
        );
        break;

      case "about":
        Alert.alert(
          "FXCompare Pro",
          "Version 1.0.0\n\nCompare exchange-rate reference values and estimated provider payouts."
        );
        break;
    }
  };

  const confirmRemoveFavourite = (
    providerName: string
  ) => {
    Alert.alert(
      "Remove favourite?",
      `${providerName} will be removed from your favourite providers.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFavouriteProvider(
                providerName
              );
            } catch (error) {
              console.log(
                "Remove favourite error:",
                error
              );

              Alert.alert(
                "Unable to remove provider",
                "Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      "Reset all settings?",
      "This will restore the default currencies, amount, notification preference, theme preference, saved alerts, and favourite providers.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllSettings();

              Alert.alert(
                "Settings reset",
                "All saved preferences have been restored to their defaults."
              );
            } catch (error) {
              console.log(
                "Reset settings error:",
                error
              );

              Alert.alert(
                "Unable to reset",
                "Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#071521"
        barStyle="light-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <ScreenHeader
          title="Profile"
          subtitle="Manage your preferences and settings"
        />

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {user?.photoURL ? (
              <Image
                source={{
                  uri: user.photoURL,
                }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarInitials}>
                {initials}
              </Text>
            )}
          </View>

          <Text style={styles.name}>
            {displayName}
          </Text>

          <Text style={styles.email}>
            {email}
          </Text>

          <View style={styles.accountStatusRow}>
            <View style={styles.accountStatusDot} />

            <Text style={styles.accountStatusText}>
              Firebase account
            </Text>
          </View>

          <View style={styles.badge}>
            <Ionicons
              name="shield-checkmark"
              size={14}
              color="#2FE58C"
            />

            <Text style={styles.badgeText}>
              SIGNED IN
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Preferences
        </Text>

        {settings.map((item) => {
          const isSwitch =
            item.type === "switch";

          const switchValue =
            item.id === "theme"
              ? darkMode
              : notificationsEnabled;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={
                isSwitch ? 1 : 0.85
              }
              disabled={
                isSwitch ||
                loadingSettings
              }
              style={styles.settingCard}
              onPress={() =>
                handleSettingPress(item.id)
              }
            >
              <View style={styles.left}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color="#64AFFF"
                  />
                </View>

                <View style={styles.textBox}>
                  <Text style={styles.settingTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.settingSubtitle}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>

              {isSwitch ? (
                <Switch
                  disabled={loadingSettings}
                  value={switchValue}
                  onValueChange={async (
                    value
                  ) => {
                    try {
                      if (
                        item.id === "theme"
                      ) {
                        await setDarkMode(
                          value
                        );
                      } else {
                        await setNotificationsEnabled(
                          value
                        );
                      }
                    } catch (error) {
                      console.log(
                        "Setting update error:",
                        error
                      );

                      Alert.alert(
                        "Unable to update setting",
                        "Please try again."
                      );
                    }
                  }}
                  trackColor={{
                    false: "#2B475C",
                    true: "#1B8C63",
                  }}
                  thumbColor={
                    switchValue
                      ? "#2FE58C"
                      : "#829CAF"
                  }
                />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color="#829CAF"
                />
              )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.favouritesHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Favourite Providers
            </Text>

            <Text style={styles.sectionSubtitle}>
              Providers saved from the comparison screen
            </Text>
          </View>

          <View style={styles.favouriteCount}>
            <Text style={styles.favouriteCountText}>
              {favouriteProviders.length}
            </Text>
          </View>
        </View>

        {loadingSettings ? (
          <View style={styles.emptyFavouriteCard}>
            <Ionicons
              name="hourglass-outline"
              size={34}
              color="#67869C"
            />

            <Text style={styles.emptyFavouriteTitle}>
              Loading favourites
            </Text>

            <Text style={styles.emptyFavouriteText}>
              Restoring your saved providers.
            </Text>
          </View>
        ) : favouriteProviders.length === 0 ? (
          <View style={styles.emptyFavouriteCard}>
            <View style={styles.emptyHeartBox}>
              <Ionicons
                name="heart-outline"
                size={32}
                color="#FF8296"
              />
            </View>

            <Text style={styles.emptyFavouriteTitle}>
              No favourite providers
            </Text>

            <Text style={styles.emptyFavouriteText}>
              Open a provider from the Compare tab and tap the heart icon to
              save it here.
            </Text>
          </View>
        ) : (
          favouriteProviders.map(
            (providerName) => {
              const meta =
                providerMeta[
                  providerName
                ] ?? {
                  icon:
                    "business-outline" as const,
                  description:
                    "Saved money transfer provider",
                };

              return (
                <View
                  key={providerName}
                  style={
                    styles.favouriteCard
                  }
                >
                  <View
                    style={
                      styles.favouriteLeft
                    }
                  >
                    <View
                      style={
                        styles.providerIconBox
                      }
                    >
                      <Ionicons
                        name={meta.icon}
                        size={23}
                        color="#64AFFF"
                      />
                    </View>

                    <View
                      style={
                        styles.providerTextBox
                      }
                    >
                      <View
                        style={
                          styles.providerNameRow
                        }
                      >
                        <Text
                          style={
                            styles.providerName
                          }
                        >
                          {providerName}
                        </Text>

                        <Ionicons
                          name="heart"
                          size={15}
                          color="#FF6B81"
                        />
                      </View>

                      <Text
                        style={
                          styles.providerDescription
                        }
                        numberOfLines={1}
                      >
                        {meta.description}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.removeButton}
                    onPress={() =>
                      confirmRemoveFavourite(
                        providerName
                      )
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={19}
                      color="#FF7A7A"
                    />
                  </TouchableOpacity>
                </View>
              );
            }
          )
        )}

        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {favouriteProviders.length}
            </Text>

            <Text style={styles.statLabel}>
              Favourites
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {savedAlerts.length}
            </Text>

            <Text style={styles.statLabel}>
              Saved Alerts
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.stat}>
            <Text style={styles.statValue}>
              LATEST
            </Text>

            <Text style={styles.statLabel}>
              Rates
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.feedbackButton}
          onPress={() =>
            Alert.alert(
              "Send Feedback",
              "The feedback form will be connected before release."
            )
          }
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.feedbackText}>
            Send Feedback
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.logoutButton}
          onPress={confirmLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.logoutText}>
            Sign Out
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color="#FF8B8B"
          />

          <Text style={styles.resetText}>
            Reset App Settings
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          FXCompare Pro • Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#071521",
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 130,
  },

  profileCard: {
    backgroundColor: "#0E2C43",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#194661",
    alignItems: "center",
    padding: 24,
    marginBottom: 24,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1687E8",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },

  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 16,
  },

  email: {
    color: "#8EA7BA",
    marginTop: 6,
    fontSize: 14,
  },

  accountStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  accountStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#2FE58C",
    marginRight: 6,
  },

  accountStatusText: {
    color: "#8EA7BA",
    fontSize: 11,
    fontWeight: "700",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    backgroundColor:
      "rgba(47,229,140,0.12)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  badgeText: {
    color: "#2FE58C",
    marginLeft: 6,
    fontWeight: "800",
    fontSize: 11,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },

  sectionSubtitle: {
    color: "#829CAF",
    fontSize: 12,
    marginTop: -8,
  },

  settingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0E2C43",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 16,
    marginBottom: 12,
  },

  left: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#16344C",
    justifyContent: "center",
    alignItems: "center",
  },

  textBox: {
    marginLeft: 14,
    flex: 1,
  },

  settingTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  settingSubtitle: {
    color: "#829CAF",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  favouritesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 14,
    paddingHorizontal: 2,
  },

  favouriteCount: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,107,129,0.12)",
    borderWidth: 1,
    borderColor:
      "rgba(255,107,129,0.35)",
  },

  favouriteCountText: {
    color: "#FF8296",
    fontSize: 13,
    fontWeight: "900",
  },

  favouriteCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0E2C43",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#194661",
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  favouriteLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },

  providerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
    borderWidth: 1,
    borderColor: "#21516E",
  },

  providerTextBox: {
    flex: 1,
    marginLeft: 13,
  },

  providerNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  providerName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginRight: 7,
  },

  providerDescription: {
    color: "#829CAF",
    fontSize: 11,
    marginTop: 5,
  },

  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,122,122,0.1)",
  },

  emptyFavouriteCard: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E2C43",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#194661",
    paddingHorizontal: 28,
    marginBottom: 12,
  },

  emptyHeartBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,107,129,0.1)",
  },

  emptyFavouriteTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 14,
  },

  emptyFavouriteText: {
    color: "#829CAF",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 7,
  },

  statsCard: {
    flexDirection: "row",
    backgroundColor: "#0E2C43",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#194661",
    marginTop: 18,
    paddingVertical: 22,
    justifyContent: "space-around",
  },

  stat: {
    alignItems: "center",
    flex: 1,
  },

  divider: {
    width: 1,
    backgroundColor: "#21465E",
  },

  statValue: {
    color: "#2FE58C",
    fontSize: 18,
    fontWeight: "800",
  },

  statLabel: {
    color: "#829CAF",
    marginTop: 6,
    fontSize: 11,
    textAlign: "center",
  },

  feedbackButton: {
    height: 58,
    borderRadius: 18,
    backgroundColor: "#1687E8",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  feedbackText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 10,
  },

  logoutButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#1687E8",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  logoutText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  resetButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor:
      "rgba(255,122,122,0.08)",
    borderWidth: 1,
    borderColor:
      "rgba(255,122,122,0.3)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  resetText: {
    color: "#FF8B8B",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  footer: {
    color: "#64798A",
    textAlign: "center",
    marginTop: 28,
    marginBottom: 30,
    fontSize: 12,
  },
});