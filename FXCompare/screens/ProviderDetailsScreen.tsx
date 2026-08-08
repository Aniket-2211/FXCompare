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

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import type {
  RootStackParamList,
} from "../navigation/RootNavigator";

import {
  useAppSettings,
} from "../context/AppSettingsContext";

import ProviderHero from "../components/providers/ProviderHero";
import ProviderSummary from "../components/providers/ProviderSummary";
import ProviderAIScore from "../components/providers/ProviderAIScore";
import ProviderTransferDetails from "../components/providers/ProviderTransferDetails";
import ProviderPaymentMethods from "../components/providers/ProviderPaymentMethods";
import ProviderProsCons from "../components/providers/ProviderProsCons";
import ProviderActions from "../components/providers/ProviderActions";

import {
  providerInformation,
  fallbackInformation,
} from "../components/providers/providerData";

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "ProviderDetails"
  >;

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
    score,
    confidence,
    reasons,
    breakdown,
    savings,
  } = route.params;

  const [favourite, setFavourite] = useState(false);
  const [updatingFavourite, setUpdatingFavourite] = useState(false);

  const information =
    providerInformation[name] ??
    fallbackInformation;

  useEffect(() => {
    const savedAsFavourite =
      favouriteProviders.some(
        (provider) =>
          provider.trim().toLowerCase() ===
          name.trim().toLowerCase()
      );

    setFavourite(savedAsFavourite);
  }, [favouriteProviders, name]);

  const handleFavouritePress = async () => {
    if (loadingSettings || updatingFavourite) {
      return;
    }

    const previousValue = favourite;
    const nextValue = !previousValue;

    try {
      setUpdatingFavourite(true);
      setFavourite(nextValue);

      const savedValue =
        await toggleFavouriteProvider(name);

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
      console.log("Favourite provider error:", error);
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
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
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
            disabled={loadingSettings || updatingFavourite}
            style={[
              styles.headerButton,
              favourite && styles.activeFavoriteButton,
              (loadingSettings || updatingFavourite) && styles.disabledButton,
            ]}
            onPress={() => {
              void handleFavouritePress();
            }}
          >
            <Ionicons
              name={favourite ? "heart" : "heart-outline"}
              size={22}
              color={favourite ? "#FF6B81" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        <ProviderHero
          name={name}
          rating={rating}
          trustScore={information.trustScore}
          description={information.description}
          recommended={recommended}
          favourite={favourite}
        />

        <ProviderSummary
          rate={rate}
          fee={fee}
          finalAmount={finalAmount}
        />

        <ProviderAIScore
          score={score}
          confidence={confidence}
          reasons={reasons}
          breakdown={breakdown}
          savings={savings}
        />

        <ProviderTransferDetails
          deliveryTime={deliveryTime}
          supportedCountries={information.supportedCountries}
          minimumTransfer={information.minimumTransfer}
          maximumTransfer={information.maximumTransfer}
        />

        <ProviderPaymentMethods
          paymentMethods={paymentMethods}
        />

        <ProviderProsCons
          pros={information.pros}
          cons={information.cons}
        />

        <ProviderActions name={name} />
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
    paddingBottom: 40,
  },
  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerButton: {
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
    backgroundColor: "rgba(255,107,129,0.12)",
    borderColor: "rgba(255,107,129,0.45)",
  },
  disabledButton: {
    opacity: 0.6,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});