import React from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import {
  Ionicons,
} from "@expo/vector-icons";

import ScreenHeader from "../components/ScreenHeader";
import SettingsSection, {
  SettingsSectionItem,
} from "../components/profile/SettingsSection";

import {
  useAppSettings,
} from "../context/AppSettingsContext";

export default function SettingsScreen() {
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
    clearAllSettings,
  } = useAppSettings();

  const preferenceItems:
    SettingsSectionItem[] = [
    {
      id: "currency",
      title:
        "Default Currency Pair",
      subtitle: `${defaultFromCurrency} → ${defaultToCurrency}`,
      icon: "swap-horizontal-outline",
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
      value: darkMode,
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle:
        notificationsEnabled
          ? "Rate-alert notifications enabled"
          : "Notifications disabled",
      icon:
        "notifications-outline",
      type: "switch",
      value:
        notificationsEnabled,
    },
  ];

  const dataItems:
    SettingsSectionItem[] = [
    {
      id: "sync",
      title: "Cloud Sync",
      subtitle:
        "Firebase settings, alerts and favourites",
      icon: "cloud-done-outline",
      type: "arrow",
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      subtitle:
        "Review how FXCompare handles account and app data",
      icon:
        "shield-checkmark-outline",
      type: "arrow",
    },
    {
      id: "about",
      title:
        "About FXCompare Pro",
      subtitle:
        "Version 1.0.0",
      icon:
        "information-circle-outline",
      type: "arrow",
    },
  ];

  const dangerItems:
    SettingsSectionItem[] = [
    {
      id: "reset",
      title:
        "Reset App Settings",
      subtitle:
        "Restore defaults and remove saved alerts and favourites",
      icon:
        "refresh-outline",
      type: "arrow",
      destructive: true,
    },
  ];

  const handlePress = (
    item:
      SettingsSectionItem
  ) => {
    switch (item.id) {
      case "currency":
        Alert.alert(
          "Default Currency Pair",
          `Your current default is ${defaultFromCurrency} → ${defaultToCurrency}. A dedicated default-currency picker can be connected to the existing settings context in a later polish pass.`
        );
        break;

      case "sync":
        Alert.alert(
          "Cloud Sync",
          `${savedAlerts.length} alert${
            savedAlerts.length ===
            1
              ? ""
              : "s"
          } and ${favouriteProviders.length} favourite provider${
            favouriteProviders.length ===
            1
              ? ""
              : "s"
          } are currently loaded in your FXCompare settings.`
        );
        break;

      case "privacy":
        Alert.alert(
          "Privacy Policy",
          "The production privacy-policy document will be linked during release preparation."
        );
        break;

      case "about":
        Alert.alert(
          "FXCompare Pro",
          "Version 1.0.0\n\nCompare market reference rates, estimated provider payouts, live alerts and market intelligence."
        );
        break;

      case "reset":
        confirmReset();
        break;
    }
  };

  const handleToggle =
    async (
      item:
        SettingsSectionItem,
      value: boolean
    ) => {
      try {
        if (
          item.id ===
          "theme"
        ) {
          await setDarkMode(
            value
          );
        }

        if (
          item.id ===
          "notifications"
        ) {
          await setNotificationsEnabled(
            value
          );
        }
      } catch (error) {
        console.log(
          "Settings update error:",
          error
        );

        Alert.alert(
          "Unable to update setting",
          "Please try again."
        );
      }
    };

  const confirmReset = () => {
    Alert.alert(
      "Reset all settings?",
      "This restores default currencies, notification and theme preferences and removes saved alerts and favourite providers.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style:
            "destructive",
          onPress:
            async () => {
              try {
                await clearAllSettings();

                Alert.alert(
                  "Settings reset",
                  "FXCompare settings were restored to their defaults."
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
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        backgroundColor="#071521"
        barStyle="light-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.container
        }
      >
        <ScreenHeader
          title="Settings"
          subtitle="Personalize FXCompare and manage app preferences"
        />

        <SettingsSection
          title="Preferences"
          items={
            preferenceItems
          }
          disabled={
            loadingSettings
          }
          onPress={
            handlePress
          }
          onToggle={
            handleToggle
          }
        />

        <SettingsSection
          title="Account & Data"
          items={dataItems}
          disabled={
            loadingSettings
          }
          onPress={
            handlePress
          }
        />

        <SettingsSection
          title="Reset"
          items={
            dangerItems
          }
          disabled={
            loadingSettings
          }
          onPress={
            handlePress
          }
        />

        <TouchableOpacity
          activeOpacity={0.84}
          style={
            styles.releaseCard
          }
          onPress={() =>
            Alert.alert(
              "Release Status",
              "FXCompare Pro is currently in MVP development. Production legal documents, provider integrations and store-release configuration are completed during the final release sprints."
            )
          }
        >
          <Ionicons
            name="rocket-outline"
            size={21}
            color="#2FE58C"
          />

          <Text
            style={
              styles.releaseText
            }
          >
            MVP Release Status
          </Text>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#829CAF"
          />
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
    backgroundColor:
      "#071521",
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 130,
  },

  releaseCard: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(47,229,140,0.07)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      "rgba(47,229,140,0.22)",
    paddingHorizontal: 15,
  },

  releaseText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 10,
  },

  footer: {
    color: "#64798A",
    textAlign: "center",
    marginTop: 26,
    marginBottom: 30,
    fontSize: 11,
  },
});