import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import BottomTabs from "./BottomTabs";
import ProviderDetailsScreen from "../screens/ProviderDetailsScreen";
import LoginScreen from "../screens/LoginScreen";

import {
  useAuth,
} from "../context/AuthContext";

export type ProviderRecommendationReason = {
  id: string;
  label: string;
  icon?: string;
};

export type ProviderScoreBreakdown = {
  payout: number;
  fee: number;
  speed: number;
  rating: number;
  reliability: number;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;

  ProviderDetails: {
    name: string;
    rate: number;
    fee: number;
    finalAmount: number;
    deliveryTime: string;
    rating: number;
    recommended?: boolean;
    paymentMethods: string[];
    score: number;
    confidence: number;
    reasons: ProviderRecommendationReason[];
    breakdown: ProviderScoreBreakdown;
    savings: number;
  };
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const {
    user,
    loadingAuth,
  } = useAuth();

  if (loadingAuth) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#2FE58C"
        />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor:
            "#071521",
        },
        animation:
          "slide_from_right",
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="MainTabs"
            component={BottomTabs}
          />

          <Stack.Screen
            name="ProviderDetails"
            component={
              ProviderDetailsScreen
            }
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            animation: "fade",
          }}
        />
      )}
    </Stack.Navigator>
  );
}

const styles =
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#071521",
    },
  });