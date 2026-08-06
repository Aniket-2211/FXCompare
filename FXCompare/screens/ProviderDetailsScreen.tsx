import React, {
  useEffect,
  useState,
} from "react";
import {
  Alert,
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
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  RootStackParamList,
} from "../navigation/RootNavigator";
import {
  useAppSettings,
} from "../context/AppSettingsContext";
import ProviderLogo from "../components/ProviderLogo";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ProviderDetails"
>;

type ProviderInformation = {
  description: string;
  trustScore: string;
  supportedCountries: string;
  minimumTransfer: string;
  maximumTransfer: string;
  pros: string[];
  cons: string[];
};

const formatNumber = (
  value: number,
  maximumFractionDigits = 2
) => {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value);
};

const providerInformation: Record<
  string,
  ProviderInformation
> = {
  Wise: {
    description:
      "Wise is known for transparent fees and exchange rates that closely follow the market reference rate.",
    trustScore: "Excellent",
    supportedCountries: "160+ countries",
    minimumTransfer: "Varies by currency",
    maximumTransfer:
      "Varies by payment method",
    pros: [
      "Transparent fee structure",
      "Competitive exchange rates",
      "Clear transfer tracking",
    ],
    cons: [
      "Delivery speed can vary",
      "Some payment methods cost more",
    ],
  },

  Remitly: {
    description:
      "Remitly provides international transfers with express and economy delivery options.",
    trustScore: "Very Good",
    supportedCountries: "170+ countries",
    minimumTransfer: "Varies by route",
    maximumTransfer:
      "Depends on verification",
    pros: [
      "Express delivery available",
      "Cash pickup supported",
      "Easy transfer tracking",
    ],
    cons: [
      "Promotional rates may expire",
      "Fees vary by delivery method",
    ],
  },

  PayPal: {
    description:
      "PayPal supports wallet-based international payments and transfers across a large global network.",
    trustScore: "Very Good",
    supportedCountries: "200+ markets",
    minimumTransfer: "Varies by country",
    maximumTransfer:
      "Depends on account status",
    pros: [
      "Familiar digital wallet",
      "Fast wallet transfers",
      "Broad global availability",
    ],
    cons: [
      "Currency conversion markup",
      "Fees can be higher",
    ],
  },

  Revolut: {
    description:
      "Revolut offers app-based international transfers, multi-currency balances and digital payment services.",
    trustScore: "Very Good",
    supportedCountries:
      "Available markets vary",
    minimumTransfer:
      "Varies by currency",
    maximumTransfer:
      "Depends on account verification",
    pros: [
      "Multi-currency account",
      "Fast app experience",
      "Competitive weekday rates",
    ],
    cons: [
      "Weekend markups may apply",
      "Availability varies by country",
    ],
  },

  OFX: {
    description:
      "OFX focuses on international bank transfers and larger-value currency transactions.",
    trustScore: "Very Good",
    supportedCountries: "190+ countries",
    minimumTransfer:
      "Minimum may apply by route",
    maximumTransfer:
      "Large transfers supported",
    pros: [
      "Suitable for larger transfers",
      "Specialist currency service",
      "Phone support available",
    ],
    cons: [
      "Not designed for instant payments",
      "Minimum transfer may apply",
    ],
  },
};

const fallbackInformation: ProviderInformation = {
  description:
    "Review the estimated rate, fee and transfer details before continuing with this provider.",
  trustScore: "Verified",
  supportedCountries: "Varies",
  minimumTransfer: "Varies",
  maximumTransfer: "Varies",
  pros: [
    "International transfer service",
    "Multiple payment options",
  ],
  cons: [
    "Final quote may differ",
  ],
};

export default function ProviderDetailsScreen({
  navigation,
  route,
}: Props) {
  const {
    loadingSettings,
    favouriteProviders,
    toggleFavouriteProvider,
  } = useAppSettings();

  const {
    name,
    rate,
    fee,
    finalAmount,
    deliveryTime,
    rating,
    recommended = false,
    paymentMethods,
  } = route.params;

  const [
    favourite,
    setFavourite,
  ] = useState(false);

  const [
    updatingFavourite,
    setUpdatingFavourite,
  ] = useState(false);

  const information =
    providerInformation[name] ??
    fallbackInformation;

  useEffect(() => {
    const savedAsFavourite =
      favouriteProviders.some(
        (provider) =>
          provider
            .trim()
            .toLowerCase() ===
          name
            .trim()
            .toLowerCase()
      );

    setFavourite(savedAsFavourite);
  }, [
    favouriteProviders,
    name,
  ]);

  const handleFavouritePress =
    async () => {
      if (
        loadingSettings ||
        updatingFavourite
      ) {
        return;
      }

      const previousValue =
        favourite;

      const nextValue =
        !previousValue;

      try {
        setUpdatingFavourite(true);

        setFavourite(nextValue);

        const savedValue =
          await toggleFavouriteProvider(
            name
          );

        setFavourite(savedValue);

        Alert.alert(
          savedValue
            ? "Added to favourites"
            : "Removed from favourites",
          savedValue
            ? `${name} has been saved as a favourite provider.`
            : `${name} has been removed from your favourite providers.`
        );
      } catch (error) {
        console.log(
          "Favourite provider error:",
          error
        );

        setFavourite(previousValue);

        Alert.alert(
          "Unable to update favourite",
          "Please try again."
        );
      } finally {
        setUpdatingFavourite(false);
      }
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#071521"
        barStyle="light-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.container
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={
              navigation.goBack
            }
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Provider Details
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={
              loadingSettings ||
              updatingFavourite
            }
            style={[
              styles.favoriteButton,
              favourite &&
                styles.activeFavoriteButton,
            ]}
            onPress={
              handleFavouritePress
            }
          >
            <Ionicons
              name={
                favourite
                  ? "heart"
                  : "heart-outline"
              }
              size={22}
              color={
                favourite
                  ? "#FF6B81"
                  : "#FFFFFF"
              }
            />
          </TouchableOpacity>
        </View>

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
              {information.trustScore}
            </Text>
          </View>

          {favourite ? (
            <View style={styles.favouriteBadge}>
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
            {information.description}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              Exchange Rate
            </Text>

            <Text style={styles.summaryValue}>
              {formatNumber(rate, 4)}
            </Text>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              Estimated Fee
            </Text>

            <Text style={styles.summaryValue}>
              {formatNumber(fee)}
            </Text>
          </View>
        </View>

        <View style={styles.receiveCard}>
          <View>
            <Text style={styles.receiveLabel}>
              Estimated Amount Received
            </Text>

            <Text style={styles.receiveAmount}>
              {formatNumber(
                finalAmount
              )}
            </Text>
          </View>

          <View style={styles.checkIcon}>
            <Ionicons
              name="checkmark"
              size={24}
              color="#071521"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Transfer Details
        </Text>

        <View style={styles.detailsCard}>
          <DetailRow
            icon="time-outline"
            label="Estimated Arrival"
            value={deliveryTime}
          />

          <DetailRow
            icon="globe-outline"
            label="Supported Countries"
            value={
              information.supportedCountries
            }
          />

          <DetailRow
            icon="arrow-down-circle-outline"
            label="Minimum Transfer"
            value={
              information.minimumTransfer
            }
          />

          <DetailRow
            icon="arrow-up-circle-outline"
            label="Maximum Transfer"
            value={
              information.maximumTransfer
            }
            showDivider={false}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Payment Methods
        </Text>

        <View style={styles.methodsCard}>
          <View style={styles.methodsWrap}>
            {paymentMethods.map(
              (method) => (
                <View
                  key={method}
                  style={
                    styles.methodChip
                  }
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#2FE58C"
                  />

                  <Text
                    style={
                      styles.methodText
                    }
                  >
                    {method}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>

        <View style={styles.prosConsRow}>
          <View style={styles.prosCard}>
            <View style={styles.smallHeader}>
              <Ionicons
                name="thumbs-up-outline"
                size={19}
                color="#2FE58C"
              />

              <Text style={styles.smallTitle}>
                Pros
              </Text>
            </View>

            {information.pros.map(
              (item) => (
                <BulletRow
                  key={item}
                  text={item}
                  positive
                />
              )
            )}
          </View>

          <View style={styles.consCard}>
            <View style={styles.smallHeader}>
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color="#FF9C70"
              />

              <Text style={styles.smallTitle}>
                Consider
              </Text>
            </View>

            {information.cons.map(
              (item) => (
                <BulletRow
                  key={item}
                  text={item}
                />
              )
            )}
          </View>
        </View>

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
          <Text style={styles.continueText}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

type DetailRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  showDivider?: boolean;
};

function DetailRow({
  icon,
  label,
  value,
  showDivider = true,
}: DetailRowProps) {
  return (
    <View
      style={[
        styles.detailRow,
        showDivider &&
          styles.detailRowDivider,
      ]}
    >
      <View style={styles.detailLeft}>
        <View style={styles.detailIcon}>
          <Ionicons
            name={icon}
            size={19}
            color="#64AFFF"
          />
        </View>

        <Text style={styles.detailLabel}>
          {label}
        </Text>
      </View>

      <Text style={styles.detailValue}>
        {value}
      </Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#071521",
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 40,
  },

  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#153147",
    borderWidth: 1,
    borderColor: "#21465E",
  },

  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#153147",
    borderWidth: 1,
    borderColor: "#21465E",
  },

  activeFavoriteButton: {
    backgroundColor:
      "rgba(255,107,129,0.12)",
    borderColor:
      "rgba(255,107,129,0.45)",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  heroCard: {
    alignItems: "center",
    backgroundColor: "#0E2C43",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#194661",
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
    backgroundColor: "#2FE58C",
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
    backgroundColor: "#173A51",
    borderWidth: 1,
    borderColor: "#23526C",
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

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0E2C43",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 16,
    marginTop: 16,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryLabel: {
    color: "#829CAF",
    fontSize: 11,
  },

  summaryValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 6,
  },

  verticalDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#295069",
  },

  receiveCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor:
      "rgba(47,229,140,0.10)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor:
      "rgba(47,229,140,0.35)",
    padding: 17,
    marginTop: 14,
    marginBottom: 24,
  },

  receiveLabel: {
    color: "#A5BEAF",
    fontSize: 12,
  },

  receiveAmount: {
    color: "#2FE58C",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 5,
  },

  checkIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2FE58C",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },

  detailsCard: {
    backgroundColor: "#0E2C43",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#194661",
    paddingHorizontal: 15,
    marginBottom: 22,
  },

  detailRow: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#20465E",
  },

  detailLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
  },

  detailLabel: {
    color: "#A9BECC",
    fontSize: 12,
    marginLeft: 11,
  },

  detailValue: {
    maxWidth: "47%",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
  },

  methodsCard: {
    backgroundColor: "#0E2C43",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 13,
    marginBottom: 22,
  },

  methodsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  methodChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 9,
    margin: 4,
  },

  methodText: {
    color: "#C0D0DB",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },

  prosConsRow: {
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
    backgroundColor: "#2FE58C",
  },

  negativeBullet: {
    backgroundColor: "#FF9C70",
  },

  bulletText: {
    flex: 1,
    color: "#A9BECC",
    fontSize: 10,
    lineHeight: 15,
  },

  continueButton: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1687E8",
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
    backgroundColor: "#0E2C43",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#194661",
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