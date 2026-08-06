// App.tsx

import React from "react";
import {
  StatusBar,
} from "react-native";
import {
  NavigationContainer,
  DarkTheme,
} from "@react-navigation/native";
import {
  SafeAreaProvider,
} from "react-native-safe-area-context";

import RootNavigator from "./navigation/RootNavigator";

import {
  AppSettingsProvider,
} from "./context/AppSettingsContext";

import {
  CurrencyProvider,
} from "./context/CurrencyContext";

const navigationTheme = {
  ...DarkTheme,

  colors: {
    ...DarkTheme.colors,

    primary: "#2FE58C",
    background: "#071521",
    card: "#0B2233",
    text: "#FFFFFF",
    border: "#194661",
    notification: "#FF7A7A",
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppSettingsProvider>
        <CurrencyProvider>
          <NavigationContainer
            theme={navigationTheme}
          >
            <StatusBar
              backgroundColor="#071521"
              barStyle="light-content"
            />

            <RootNavigator />
          </NavigationContainer>
        </CurrencyProvider>
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}