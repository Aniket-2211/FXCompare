import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";

type Mode = "login" | "signup";

const firebaseMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code?: string }).code ?? "");

    switch (code) {
      case "auth/invalid-email":
        return "Enter a valid email address.";

      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Incorrect email or password.";

      case "auth/email-already-in-use":
        return "An account already exists with this email.";

      case "auth/weak-password":
        return "Password must contain at least 6 characters.";

      case "auth/network-request-failed":
        return "Check your internet connection and try again.";
    }
  }

  return "Something went wrong. Please try again.";
};

export default function LoginScreen() {
  const {
    signIn,
    signUp,
    resetPassword,
  } = useAuth();

  const [mode, setMode] =
    useState<Mode>("login");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const isSignup =
    mode === "signup";

  const submit = async () => {
    const cleanEmail =
      email.trim();

    if (
      isSignup &&
      !name.trim()
    ) {
      Alert.alert(
        "Name required",
        "Enter your name to continue."
      );
      return;
    }

    if (!cleanEmail) {
      Alert.alert(
        "Email required",
        "Enter your email address."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Password required",
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setSubmitting(true);

      if (isSignup) {
        await signUp(
          name,
          cleanEmail,
          password
        );
      } else {
        await signIn(
          cleanEmail,
          password
        );
      }
    } catch (error) {
      Alert.alert(
        isSignup
          ? "Unable to create account"
          : "Unable to sign in",
        firebaseMessage(error)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset =
    async () => {
      const cleanEmail =
        email.trim();

      if (!cleanEmail) {
        Alert.alert(
          "Enter your email",
          "Type your email address first, then tap Forgot password."
        );
        return;
      }

      try {
        await resetPassword(
          cleanEmail
        );

        Alert.alert(
          "Reset email sent",
          "Check your inbox for the password reset link."
        );
      } catch (error) {
        Alert.alert(
          "Unable to send reset email",
          firebaseMessage(error)
        );
      }
    };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        backgroundColor="#071521"
        barStyle="light-content"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.container
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={styles.brandIcon}
          >
            <Ionicons
              name="swap-horizontal"
              size={31}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={styles.brand}
          >
            FXCompare
          </Text>

          <Text
            style={styles.subtitle}
          >
            {isSignup
              ? "Create your account and keep your FXCompare preferences together."
              : "Sign in to access your account and saved preferences."}
          </Text>

          <View
            style={styles.card}
          >
            <Text
              style={styles.cardTitle}
            >
              {isSignup
                ? "Create Account"
                : "Welcome Back"}
            </Text>

            <Text
              style={styles.cardSubtitle}
            >
              {isSignup
                ? "Start with email and password."
                : "Continue with your FXCompare account."}
            </Text>

            {isSignup ? (
              <>
                <Text
                  style={styles.label}
                >
                  Name
                </Text>

                <View
                  style={styles.inputBox}
                >
                  <Ionicons
                    name="person-outline"
                    size={19}
                    color="#7892A5"
                  />

                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor="#64798A"
                    autoCapitalize="words"
                    style={styles.input}
                    selectionColor="#2FE58C"
                  />
                </View>
              </>
            ) : null}

            <Text
              style={styles.label}
            >
              Email
            </Text>

            <View
              style={styles.inputBox}
            >
              <Ionicons
                name="mail-outline"
                size={19}
                color="#7892A5"
              />

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor="#64798A"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                selectionColor="#2FE58C"
              />
            </View>

            <Text
              style={styles.label}
            >
              Password
            </Text>

            <View
              style={styles.inputBox}
            >
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color="#7892A5"
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 characters"
                placeholderTextColor="#64798A"
                secureTextEntry={
                  !showPassword
                }
                autoCapitalize="none"
                style={styles.input}
                selectionColor="#2FE58C"
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={20}
                  color="#829CAF"
                />
              </TouchableOpacity>
            </View>

            {!isSignup ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.forgotButton}
                onPress={() => {
                  void handleReset();
                }}
              >
                <Text
                  style={styles.forgotText}
                >
                  Forgot password?
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.9}
              disabled={submitting}
              style={[
                styles.primaryButton,
                submitting &&
                  styles.disabledButton,
              ]}
              onPress={() => {
                void submit();
              }}
            >
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name={
                      isSignup
                        ? "person-add-outline"
                        : "log-in-outline"
                    }
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    {isSignup
                      ? "Create Account"
                      : "Sign In"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View
              style={styles.switchRow}
            >
              <Text
                style={styles.switchText}
              >
                {isSignup
                  ? "Already have an account?"
                  : "New to FXCompare?"}
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setMode(
                    isSignup
                      ? "login"
                      : "signup"
                  )
                }
              >
                <Text
                  style={
                    styles.switchAction
                  }
                >
                  {isSignup
                    ? "Sign In"
                    : "Create Account"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={styles.securityRow}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color="#2FE58C"
            />

            <Text
              style={styles.securityText}
            >
              Authentication is securely handled by Firebase.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    safeArea: {
      flex: 1,
      backgroundColor:
        "#071521",
    },

    container: {
      flexGrow: 1,
      justifyContent:
        "center",
      paddingHorizontal: 20,
      paddingVertical: 30,
    },

    brandIcon: {
      width: 66,
      height: 66,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      backgroundColor:
        "#1687E8",
      marginBottom: 15,
    },

    brand: {
      color: "#FFFFFF",
      fontSize: 30,
      fontWeight: "900",
      textAlign: "center",
    },

    subtitle: {
      color: "#8EA7BA",
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      marginTop: 8,
      marginBottom: 25,
      paddingHorizontal: 12,
    },

    card: {
      backgroundColor:
        "#0E2C43",
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        "#194661",
      padding: 18,
    },

    cardTitle: {
      color: "#FFFFFF",
      fontSize: 22,
      fontWeight: "900",
    },

    cardSubtitle: {
      color: "#829CAF",
      fontSize: 12,
      lineHeight: 18,
      marginTop: 5,
      marginBottom: 18,
    },

    label: {
      color: "#A4BAC9",
      fontSize: 11,
      fontWeight: "800",
      marginBottom: 8,
      marginTop: 7,
    },

    inputBox: {
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#16344C",
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#21516E",
      paddingHorizontal: 13,
      marginBottom: 11,
    },

    input: {
      flex: 1,
      color: "#FFFFFF",
      fontSize: 14,
      marginLeft: 9,
      paddingVertical: 12,
    },

    forgotButton: {
      alignSelf: "flex-end",
      paddingVertical: 7,
    },

    forgotText: {
      color: "#64AFFF",
      fontSize: 11,
      fontWeight: "800",
    },

    primaryButton: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#1687E8",
      borderRadius: 18,
      marginTop: 13,
    },

    disabledButton: {
      opacity: 0.65,
    },

    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
      marginLeft: 8,
    },

    switchRow: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      marginTop: 19,
    },

    switchText: {
      color: "#829CAF",
      fontSize: 12,
    },

    switchAction: {
      color: "#2FE58C",
      fontSize: 12,
      fontWeight: "900",
      marginLeft: 5,
    },

    securityRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 18,
    },

    securityText: {
      color: "#6F8DA2",
      fontSize: 10,
      marginLeft: 6,
    },
  });