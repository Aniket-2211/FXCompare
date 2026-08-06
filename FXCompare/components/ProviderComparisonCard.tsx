import React, {
  useMemo,
  useState,
} from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  useAppSettings,
} from "../context/AppSettingsContext";

import AnimatedCard from "./AnimatedCard";
import AnimatedNumber from "./AnimatedNumber";
import AnimatedProgressBar from "./AnimatedProgressBar";
import SkeletonLoader from "./SkeletonLoader";
import ProviderLogo from "./ProviderLogo";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(
    true
  );
}

type Props = {
  name: string;
  rate: number;
  fee: number;
  finalAmount: number;
  recommended?: boolean;
  deliveryTime?: string;
  rating?: number;
  paymentMethods?: string[];
  loading?: boolean;
  animationDelay?: number;
  onPress?: () => void;
};

type ProviderMeta = {
  icon:
    keyof typeof Ionicons.glyphMap;
  description: string;
  trustLabel: string;
};

const providerMeta: Record<
  string,
  ProviderMeta
> = {
  Wise: {
    icon: "flash-outline",
    description:
      "Transparent pricing and competitive international transfer rates.",
    trustLabel: "Excellent",
  },

  Remitly: {
    icon: "send-outline",
    description:
      "Express transfers with flexible payment and delivery options.",
    trustLabel: "Very Good",
  },

  PayPal: {
    icon: "wallet-outline",
    description:
      "Digital-wallet transfers across a broad international network.",
    trustLabel: "Very Good",
  },

  Revolut: {
    icon: "card-outline",
    description:
      "Fast app-based transfers with multi-currency features.",
    trustLabel: "Very Good",
  },

  OFX: {
    icon: "business-outline",
    description:
      "International bank transfers designed for larger amounts.",
    trustLabel: "Very Good",
  },
};

const fallbackMeta: ProviderMeta = {
  icon: "business-outline",
  description:
    "International money-transfer provider.",
  trustLabel: "Verified",
};

const formatNumber = (
  value: number,
  maximumFractionDigits = 2
) => {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits,
    }
  ).format(value);
};

const calculateProviderScore = (
  rating: number,
  recommended: boolean,
  fee: number
) => {
  const safeRating = Math.min(
    Math.max(rating, 0),
    5
  );

  const ratingScore =
    (safeRating / 5) * 8;

  const recommendationBonus =
    recommended ? 1.2 : 0.5;

  const feeBonus =
    fee <= 0
      ? 0.8
      : fee < 10
      ? 0.7
      : fee < 50
      ? 0.5
      : 0.3;

  return Math.min(
    ratingScore +
      recommendationBonus +
      feeBonus,
    10
  );
};

export default function ProviderComparisonCard({
  name,
  rate,
  fee,
  finalAmount,
  recommended = false,
  deliveryTime = "Varies",
  rating = 4.5,
  paymentMethods = [
    "Bank Transfer",
    "Debit Card",
  ],
  loading = false,
  animationDelay = 0,
  onPress,
}: Props) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);

  const [
    favouriteSaving,
    setFavouriteSaving,
  ] = useState(false);

  const {
    favouriteProviders,
    toggleFavouriteProvider,
  } = useAppSettings();

  const meta =
    providerMeta[name] ??
    fallbackMeta;

  const isFavourite =
    favouriteProviders.some(
      (providerName) =>
        providerName
          .trim()
          .toLowerCase() ===
        name
          .trim()
          .toLowerCase()
    );

  const providerScore =
    useMemo(() => {
      return calculateProviderScore(
        rating,
        recommended,
        fee
      );
    }, [
      rating,
      recommended,
      fee,
    ]);

  const scoreLabel =
    providerScore >= 9
      ? "Excellent"
      : providerScore >= 8
      ? "Very Good"
      : providerScore >= 7
      ? "Good"
      : "Fair";

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets
        .easeInEaseOut
    );

    setExpanded(
      (current) => !current
    );
  };

  const handleFavouritePress =
    async () => {
      if (favouriteSaving) {
        return;
      }

      try {
        setFavouriteSaving(true);

        LayoutAnimation.configureNext(
          LayoutAnimation.Presets
            .easeInEaseOut
        );

        await toggleFavouriteProvider(
          name
        );
      } catch (error) {
        console.log(
          "Favourite provider error:",
          error
        );
      } finally {
        setFavouriteSaving(false);
      }
    };

  return (
    <AnimatedCard
      delay={animationDelay}
      duration={480}
      style={[
        styles.card,
        recommended &&
          styles.recommendedCard,
      ]}
    >
      <View
        style={
          styles.backgroundGlow
        }
      />

      {recommended ? (
        <View
          style={
            styles.bestRibbon
          }
        >
          <Ionicons
            name="trophy"
            size={13}
            color="#062014"
          />

          <Text
            style={
              styles.bestRibbonText
            }
          >
            BEST VALUE
          </Text>
        </View>
      ) : null}

      <View
        style={styles.header}
      >
        <View
          style={
            styles.providerRow
          }
        >
          <View
            style={[
              styles.logoBox,
              recommended &&
                styles.recommendedLogoBox,
            ]}
          >
            <ProviderLogo
              provider={name}
              size={48}
            />
          </View>

          <View
            style={
              styles.providerInfo
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
                {name}
              </Text>

              {isFavourite ? (
                <View
                  style={
                    styles.savedBadge
                  }
                >
                  <Ionicons
                    name="heart"
                    size={11}
                    color="#FF6B81"
                  />

                  <Text
                    style={
                      styles.savedBadgeText
                    }
                  >
                    SAVED
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              style={
                styles.providerDescription
              }
              numberOfLines={2}
            >
              {meta.description}
            </Text>

            <View
              style={
                styles.ratingRow
              }
            >
              <Ionicons
                name="star"
                size={14}
                color="#FFD65A"
              />

              <Text
                style={
                  styles.ratingText
                }
              >
                {rating.toFixed(1)}
              </Text>

              <View
                style={
                  styles.ratingDivider
                }
              />

              <Text
                style={
                  styles.trustText
                }
              >
                {meta.trustLabel}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={
            favouriteSaving
          }
          style={[
            styles.favouriteButton,
            isFavourite &&
              styles.activeFavouriteButton,
          ]}
          onPress={
            handleFavouritePress
          }
        >
          <Ionicons
            name={
              isFavourite
                ? "heart"
                : "heart-outline"
            }
            size={21}
            color={
              isFavourite
                ? "#FF6B81"
                : "#9FB6C9"
            }
          />
        </TouchableOpacity>
      </View>

      <View
        style={
          styles.scoreSection
        }
      >
        <View
          style={
            styles.scoreCircle
          }
        >
          <AnimatedNumber
            value={providerScore}
            duration={650}
            minimumFractionDigits={1}
            maximumFractionDigits={1}
            style={styles.scoreValue}
          />

          <Text
            style={
              styles.scoreMaximum
            }
          >
            /10
          </Text>
        </View>

        <View
          style={
            styles.scoreContent
          }
        >
          <View
            style={
              styles.scoreHeader
            }
          >
            <Text
              style={
                styles.scoreTitle
              }
            >
              Provider Score
            </Text>

            <Text
              style={
                styles.scoreLabel
              }
            >
              {scoreLabel}
            </Text>
          </View>

          <View
            style={
              styles.scoreTrack
            }
          >
            <AnimatedProgressBar
              progress={Math.min(
                providerScore * 10,
                100
              )}
              height={6}
            />
          </View>

          <Text
            style={
              styles.scoreDescription
            }
          >
            Based on estimated value,
            rating and fees
          </Text>
        </View>
      </View>

      <View
        style={styles.statsGrid}
      >
        <View
          style={
            styles.statItem
          }
        >
          <View
            style={
              styles.statIconBox
            }
          >
            <Ionicons
              name="trending-up-outline"
              size={17}
              color="#64AFFF"
            />
          </View>

          <Text
            style={
              styles.statLabel
            }
          >
            Exchange Rate
          </Text>

          {loading ? (
            <SkeletonLoader
              width="72%"
              height={16}
              borderRadius={7}
              style={styles.statSkeleton}
            />
          ) : (
            <AnimatedNumber
              value={rate}
              duration={650}
              minimumFractionDigits={2}
              maximumFractionDigits={4}
              style={styles.statValue}
            />
          )}
        </View>

        <View
          style={
            styles.statDivider
          }
        />

        <View
          style={
            styles.statItem
          }
        >
          <View
            style={
              styles.statIconBox
            }
          >
            <Ionicons
              name="pricetag-outline"
              size={17}
              color="#FFD65A"
            />
          </View>

          <Text
            style={
              styles.statLabel
            }
          >
            Estimated Fee
          </Text>

          {loading ? (
            <SkeletonLoader
              width="68%"
              height={16}
              borderRadius={7}
              style={styles.statSkeleton}
            />
          ) : (
            <AnimatedNumber
              value={fee}
              duration={650}
              minimumFractionDigits={2}
              maximumFractionDigits={2}
              style={styles.statValue}
            />
          )}
        </View>

        <View
          style={
            styles.statDivider
          }
        />

        <View
          style={
            styles.statItem
          }
        >
          <View
            style={
              styles.statIconBox
            }
          >
            <Ionicons
              name="time-outline"
              size={17}
              color="#FFB86B"
            />
          </View>

          <Text
            style={
              styles.statLabel
            }
          >
            Arrival
          </Text>

          <Text
            style={
              styles.statValueSmall
            }
            numberOfLines={1}
          >
            {deliveryTime}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.receiveBox
        }
      >
        <View
          style={
            styles.receiveTextBox
          }
        >
          <Text
            style={
              styles.receiveLabel
            }
          >
            Estimated Amount Received
          </Text>

          {loading ? (
            <SkeletonLoader
              width="74%"
              height={31}
              borderRadius={10}
              style={styles.receiveSkeleton}
            />
          ) : (
            <AnimatedNumber
              value={finalAmount}
              duration={800}
              minimumFractionDigits={2}
              maximumFractionDigits={2}
              style={styles.receiveAmount}
            />
          )}

          <Text
            style={
              styles.receiveCaption
            }
          >
            After estimated provider fee
          </Text>
        </View>

        <View
          style={[
            styles.receiveIcon,
            !recommended &&
              styles.standardReceiveIcon,
          ]}
        >
          <Ionicons
            name={
              recommended
                ? "trophy"
                : "checkmark"
            }
            size={23}
            color={
              recommended
                ? "#062014"
                : "#FFFFFF"
            }
          />
        </View>
      </View>

      <View
        style={
          styles.quickFactsRow
        }
      >
        <View
          style={
            styles.quickFact
          }
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={17}
            color="#2FE58C"
          />

          <Text
            style={
              styles.quickFactText
            }
          >
            Verified
          </Text>
        </View>

        <View
          style={
            styles.quickFact
          }
        >
          <Ionicons
            name="wallet-outline"
            size={17}
            color="#64AFFF"
          />

          <Text
            style={
              styles.quickFactText
            }
          >
            {
              paymentMethods.length
            }{" "}
            payment methods
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={
          styles.expandButton
        }
        onPress={toggleExpanded}
      >
        <View
          style={
            styles.expandLeft
          }
        >
          <View
            style={
              styles.expandIconBox
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#64AFFF"
            />
          </View>

          <View>
            <Text
              style={
                styles.expandText
              }
            >
              {expanded
                ? "Hide Details"
                : "View Transfer Details"}
            </Text>

            <Text
              style={
                styles.expandSubtitle
              }
            >
              Payment methods and
              transfer information
            </Text>
          </View>
        </View>

        <Ionicons
          name={
            expanded
              ? "chevron-up"
              : "chevron-down"
          }
          size={19}
          color="#64AFFF"
        />
      </TouchableOpacity>

      {expanded ? (
        <View
          style={styles.details}
        >
          <Text
            style={
              styles.detailsTitle
            }
          >
            Payment Methods
          </Text>

          <View
            style={
              styles.methodsWrap
            }
          >
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
                    size={15}
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

          <View
            style={
              styles.detailList
            }
          >
            <DetailRow
              icon="time-outline"
              label="Transfer Speed"
              value={deliveryTime}
            />

            <DetailRow
              icon="shield-checkmark-outline"
              label="Provider Status"
              value="Verified"
            />

            <DetailRow
              icon="star-outline"
              label="Customer Rating"
              value={`${rating.toFixed(
                1
              )} out of 5`}
              showDivider={false}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.continueButton,
              recommended &&
                styles.recommendedButton,
            ]}
            onPress={onPress}
          >
            <Text
              style={
                styles.continueText
              }
            >
              Open {name} Details
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      ) : null}
    </AnimatedCard>
  );
}

type DetailRowProps = {
  icon:
    keyof typeof Ionicons.glyphMap;
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
      <View
        style={
          styles.detailLeft
        }
      >
        <Ionicons
          name={icon}
          size={17}
          color="#64AFFF"
        />

        <Text
          style={
            styles.detailLabel
          }
        >
          {label}
        </Text>
      </View>

      <Text
        style={
          styles.detailValue
        }
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    backgroundColor: "#0E2C43",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#194661",
    padding: 17,
    marginBottom: 14,
    overflow: "hidden",
  },

  recommendedCard: {
    borderColor: "#2FE58C",
    backgroundColor: "#0E3045",
  },

  backgroundGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -115,
    right: -90,
    backgroundColor:
      "rgba(47,229,140,0.06)",
  },

  bestRibbon: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2FE58C",
    borderBottomLeftRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  bestRibbonText: {
    color: "#062014",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginLeft: 5,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 5,
  },

  providerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  logoBox: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#173A51",
    borderWidth: 1,
    borderColor: "#23526C",
  },

  recommendedLogoBox: {
    backgroundColor:
      "rgba(47,229,140,0.10)",
    borderColor:
      "rgba(47,229,140,0.35)",
  },

  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  providerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  providerName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginRight: 7,
  },

  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "rgba(255,107,129,0.11)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  savedBadgeText: {
    color: "#FF8296",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginLeft: 3,
  },

  providerDescription: {
    color: "#829CAF",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  ratingText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 4,
  },

  ratingDivider: {
    width: 1,
    height: 11,
    backgroundColor: "#31526A",
    marginHorizontal: 7,
  },

  trustText: {
    color: "#2FE58C",
    fontSize: 10,
    fontWeight: "700",
  },

  favouriteButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16344C",
    borderWidth: 1,
    borderColor: "#23526C",
  },

  activeFavouriteButton: {
    backgroundColor:
      "rgba(255,107,129,0.12)",
    borderColor:
      "rgba(255,107,129,0.4)",
  },

  scoreSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 18,
    padding: 13,
    marginTop: 17,
  },

  scoreCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    backgroundColor:
      "rgba(47,229,140,0.11)",
    borderWidth: 2,
    borderColor:
      "rgba(47,229,140,0.34)",
    paddingTop: 17,
  },

  scoreValue: {
    color: "#2FE58C",
    fontSize: 20,
    fontWeight: "900",
  },

  scoreMaximum: {
    color: "#7FA494",
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 1,
  },

  scoreContent: {
    flex: 1,
    marginLeft: 13,
  },

  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  scoreTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  scoreLabel: {
    color: "#2FE58C",
    fontSize: 10,
    fontWeight: "800",
  },

  scoreTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 9,
  },

  scoreDescription: {
    color: "#7894A7",
    fontSize: 9,
    marginTop: 7,
  },

  statsGrid: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#16344C",
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 8,
    marginTop: 12,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B425A",
    marginBottom: 7,
  },

  statLabel: {
    color: "#829CAF",
    fontSize: 8,
    fontWeight: "600",
    textAlign: "center",
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "center",
  },

  statValueSmall: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 5,
    textAlign: "center",
  },

  statSkeleton: {
    alignSelf: "center",
    marginTop: 5,
  },

  statDivider: {
    width: 1,
    backgroundColor: "#295069",
    marginVertical: 4,
  },

  receiveBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor:
      "rgba(47,229,140,0.08)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      "rgba(47,229,140,0.24)",
    padding: 15,
    marginTop: 12,
  },

  receiveTextBox: {
    flex: 1,
    paddingRight: 12,
  },

  receiveLabel: {
    color: "#A5BEAF",
    fontSize: 10,
    fontWeight: "600",
  },

  receiveAmount: {
    color: "#2FE58C",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 5,
  },

  receiveCaption: {
    color: "#779386",
    fontSize: 9,
    marginTop: 4,
  },

  receiveSkeleton: {
    marginTop: 7,
  },

  receiveIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2FE58C",
  },

  standardReceiveIcon: {
    backgroundColor: "#1687E8",
  },

  quickFactsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
  },

  quickFact: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#15384E",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginRight: 8,
  },

  quickFactText: {
    color: "#A6BAC8",
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 5,
  },

  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#20465E",
    paddingTop: 14,
    marginTop: 14,
  },

  expandLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  expandIconBox: {
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(100,175,255,0.10)",
    marginRight: 9,
  },

  expandText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  expandSubtitle: {
    color: "#728DA1",
    fontSize: 9,
    marginTop: 3,
  },

  details: {
    marginTop: 15,
  },

  detailsTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 9,
  },

  methodsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },

  methodChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16344C",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 7,
    margin: 4,
  },

  methodText: {
    color: "#B7C9D6",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 5,
  },

  detailList: {
    backgroundColor: "#16344C",
    borderRadius: 16,
    paddingHorizontal: 12,
    marginTop: 12,
  },

  detailRow: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#295069",
  },

  detailLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  detailLabel: {
    color: "#91A9BA",
    fontSize: 10,
    marginLeft: 7,
  },

  detailValue: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "right",
  },

  continueButton: {
    height: 51,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#21628D",
    borderRadius: 16,
    marginTop: 14,
  },

  recommendedButton: {
    backgroundColor: "#1687E8",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    marginRight: 8,
  },
});