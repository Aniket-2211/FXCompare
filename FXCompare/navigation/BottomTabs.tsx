// navigation/BottomTabs.tsx

import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import MarketsScreen from "../screens/MarketsScreen";
import CompareScreen from "../screens/CompareScreen";
import AlertsScreen from "../screens/AlertsScreen";
import ProfileScreen from "../screens/ProfileScreen";

export type BottomTabParamList = {
  Home: undefined;
  Markets: undefined;
  Compare: undefined;
  Alerts: undefined;
  Profile: undefined;
};

const Tab =
  createBottomTabNavigator<BottomTabParamList>();

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
  routeName: keyof BottomTabParamList;
};

function TabIcon({
  focused,
  color,
  size,
  routeName,
}: TabIconProps) {
  let iconName:
    | keyof typeof Ionicons.glyphMap
    | undefined;

  switch (routeName) {
    case "Home":
      iconName = focused
        ? "home"
        : "home-outline";
      break;

    case "Markets":
      iconName = focused
        ? "stats-chart"
        : "stats-chart-outline";
      break;

    case "Compare":
      iconName = focused
        ? "git-compare"
        : "git-compare-outline";
      break;

    case "Alerts":
      iconName = focused
        ? "notifications"
        : "notifications-outline";
      break;

    case "Profile":
      iconName = focused
        ? "person"
        : "person-outline";
      break;
  }

  return (
    <View
      style={[
        styles.iconContainer,
        focused &&
          styles.activeIconContainer,
      ]}
    >
      <Ionicons
        name={iconName ?? "ellipse"}
        size={focused ? size + 1 : size}
        color={color}
      />
    </View>
  );
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor: "#2FE58C",
        tabBarInactiveTintColor: "#7891A5",

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 1,
          marginBottom: 4,
        },

        tabBarStyle: styles.tabBar,

        tabBarItemStyle: styles.tabBarItem,

        tabBarIcon: ({
          focused,
          color,
          size,
        }) => (
          <TabIcon
            focused={focused}
            color={color}
            size={size}
            routeName={
              route.name as keyof BottomTabParamList
            }
          />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Markets"
        component={MarketsScreen}
      />

      <Tab.Screen
        name="Compare"
        component={CompareScreen}
      />

      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,

    height: 76,

    paddingTop: 8,
    paddingBottom: 8,

    backgroundColor: "#0B2233",

    borderTopWidth: 0,
    borderRadius: 24,

    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 16,
  },

  tabBarItem: {
    paddingVertical: 2,
  },

  iconContainer: {
    width: 42,
    height: 32,
    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",
  },

  activeIconContainer: {
    backgroundColor:
      "rgba(47, 229, 140, 0.12)",
  },
});