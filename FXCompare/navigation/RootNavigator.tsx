// navigation/RootNavigator.tsx

import React from "react";
import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import BottomTabs from "./BottomTabs";
import ProviderDetailsScreen from "../screens/ProviderDetailsScreen";

export type RootStackParamList = {
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
  };
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#071521",
        },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={BottomTabs}
      />

      <Stack.Screen
        name="ProviderDetails"
        component={ProviderDetailsScreen}
      />
    </Stack.Navigator>
  );
}