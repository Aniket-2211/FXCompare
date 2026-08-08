
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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
  useNavigation,
} from "@react-navigation/native";

import ScreenHeader from "../components/ScreenHeader";
import AccountStatusCard from "../components/profile/AccountStatusCard";

import {
  useAppSettings,
} from "../context/AppSettingsContext";
import {
  useAuth,
} from "../context/AuthContext";

type ProviderMeta = {
  icon:
    keyof typeof Ionicons.glyphMap;
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
  const navigation =
    useNavigation<any>();

  const {
    user,
    logout,
  } = useAuth();

  const {
    loadingSettings,
    notificationsEnabled,
    savedAlerts,
    favouriteProviders,
    removeFavouriteProvider,
  } = useAppSettings();

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split(
      "@"
    )[0] ||
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
        part
          .charAt(0)
          .toUpperCase()
      )
      .join("") ||
    "FX";

  const confirmLogout =
    () => {
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
            style:
              "destructive",
            onPress:
              async () => {
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

  const confirmRemoveFavourite =
    (
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
            style:
              "destructive",
            onPress:
              async () => {
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
          title="Profile"
          subtitle="Your account, favourites and FXCompare activity"
        />

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {user?.photoURL ? (
              <Image
                source={{
                  uri: user.photoURL,
                }}
                style={
                  styles.avatarImage
                }
              />
            ) : (
              <Text
                style={
                  styles.avatarInitials
                }
              >
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

          <View style={styles.badge}>
            <Ionicons
              name="shield-checkmark"
              size={14}
              color="#2FE58C"
            />

            <Text
              style={styles.badgeText}
            >
              VERIFIED SESSION
            </Text>
          </View>
        </View>

        <AccountStatusCard
          email={email}
          favouritesCount={
            favouriteProviders.length
          }
          alertsCount={
            savedAlerts.length
          }
          notificationsEnabled={
            notificationsEnabled
          }
        />

        <TouchableOpacity
          activeOpacity={0.86}
          style={
            styles.settingsButton
          }
          onPress={() =>
            navigation.navigate(
              "Settings"
            )
          }
        >
          <View
            style={
              styles.settingsIcon
            }
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color="#64AFFF"
            />
          </View>

          <View
            style={
              styles.settingsTextBox
            }
          >
            <Text
              style={
                styles.settingsTitle
              }
            >
              App Settings
            </Text>

            <Text
              style={
                styles.settingsSubtitle
              }
            >
              Currency defaults, theme, notifications, privacy and reset options
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color="#829CAF"
          />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={styles.sectionTitle}
            >
              Favourite Providers
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Providers you saved from comparison results
            </Text>
          </View>

          <View
            style={
              styles.favouriteCount
            }
          >
            <Text
              style={
                styles.favouriteCountText
              }
            >
              {
                favouriteProviders.length
              }
            </Text>
          </View>
        </View>

        {loadingSettings ? (
          <EmptyFavourite
            icon="hourglass-outline"
            title="Loading favourites"
            message="Restoring your saved providers."
          />
        ) : favouriteProviders.length ===
          0 ? (
          <EmptyFavourite
            icon="heart-outline"
            title="No favourite providers"
            message="Open a provider from Compare and tap the heart icon to save it here."
          />
        ) : (
          favouriteProviders.map(
            (
              providerName
            ) => {
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
                  key={
                    providerName
                  }
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
                        name={
                          meta.icon
                        }
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
                          {
                            providerName
                          }
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
                        numberOfLines={
                          1
                        }
                      >
                        {
                          meta.description
                        }
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={
                      0.8
                    }
                    style={
                      styles.removeButton
                    }
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
          <Stat
            value={`${favouriteProviders.length}`}
            label="Favourites"
          />

          <View
            style={styles.divider}
          />

          <Stat
            value={`${savedAlerts.length}`}
            label="Saved Alerts"
          />

          <View
            style={styles.divider}
          />

          <Stat
            value="LIVE"
            label="Rates"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.feedbackButton
          }
          onPress={() =>
            Alert.alert(
              "Send Feedback",
              "Feedback submission will be connected before release."
            )
          }
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.feedbackText
            }
          >
            Send Feedback
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.logoutButton
          }
          onPress={
            confirmLogout
          }
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#FF8B8B"
          />

          <Text
            style={
              styles.logoutText
            }
          >
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          FXCompare Pro • Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyFavourite({
  icon,
  title,
  message,
}: {
  icon:
    keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}) {
  return (
    <View
      style={
        styles.emptyFavouriteCard
      }
    >
      <View
        style={
          styles.emptyHeartBox
        }
      >
        <Ionicons
          name={icon}
          size={31}
          color="#FF8296"
        />
      </View>

      <Text
        style={
          styles.emptyFavouriteTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.emptyFavouriteText
        }
      >
        {message}
      </Text>
    </View>
  );
}

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Text
        style={styles.statValue}
      >
        {value}
      </Text>

      <Text
        style={styles.statLabel}
      >
        {label}
      </Text>
    </View>
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
    marginBottom: 16,
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
    fontWeight: "900",
    marginTop: 15,
  },

  email: {
    color: "#8EA7BA",
    marginTop: 5,
    fontSize: 13,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    backgroundColor:
      "rgba(47,229,140,0.12)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  badgeText: {
    color: "#2FE58C",
    marginLeft: 5,
    fontWeight: "900",
    fontSize: 9,
  },

  settingsButton: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0E2C43",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 14,
    marginBottom: 24,
  },

  settingsIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
  },

  settingsTextBox: {
    flex: 1,
    marginHorizontal: 12,
  },

  settingsTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  settingsSubtitle: {
    color: "#829CAF",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#829CAF",
    fontSize: 11,
    marginTop: 4,
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
    fontSize: 15,
    fontWeight: "800",
    marginRight: 7,
  },

  providerDescription: {
    color: "#829CAF",
    fontSize: 10,
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
    minHeight: 172,
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
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,107,129,0.1)",
  },

  emptyFavouriteTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 13,
  },

  emptyFavouriteText: {
    color: "#829CAF",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 6,
  },

  statsCard: {
    flexDirection: "row",
    backgroundColor: "#0E2C43",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#194661",
    marginTop: 8,
    paddingVertical: 20,
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
    fontSize: 17,
    fontWeight: "900",
  },

  statLabel: {
    color: "#829CAF",
    marginTop: 5,
    fontSize: 10,
    textAlign: "center",
  },

  feedbackButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#1687E8",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  feedbackText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 9,
  },

  logoutButton: {
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

  logoutText: {
    color: "#FF8B8B",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  footer: {
    color: "#64798A",
    textAlign: "center",
    marginTop: 26,
    marginBottom: 30,
    fontSize: 11,
  },
});