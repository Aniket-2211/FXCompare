import React, {
  useMemo,
  useState,
} from "react";

import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

type ProviderContext = {
  name: string;
  rate: number;
  fee: number;
  finalAmount: number;
  deliveryTime: string;
  rating: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;

  amount: number;
  fromCurrency: string;
  toCurrency: string;
  referenceRate: number;

  bestProvider: ProviderContext | null;
  secondBestProvider: ProviderContext | null;

  estimatedSavings: number;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const formatAmount = (
  value: number
) => {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(value);
};

const formatRate = (
  value: number
) => {
  if (!Number.isFinite(value)) {
    return "--";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }
  ).format(value);
};

const suggestedQuestions = [
  "Which provider is best right now?",
  "Why is this provider recommended?",
  "Which provider has the lowest fee?",
  "Which provider is fastest?",
  "How much can I save?",
  "Should I transfer today?",
];

export default function FXCompareAISheet({
  visible,
  onClose,

  amount,
  fromCurrency,
  toCurrency,
  referenceRate,

  bestProvider,
  secondBestProvider,

  estimatedSavings,
}: Props) {
  const [
    input,
    setInput,
  ] = useState("");

  const [
    messages,
    setMessages,
  ] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text:
        "I can explain your current FXCompare results, provider ranking, fees, speed and estimated savings.",
    },
  ]);

  const contextReady =
    !!bestProvider &&
    amount > 0 &&
    referenceRate > 0;

  const lowestFeeProvider =
    useMemo(() => {
      const candidates = [
        bestProvider,
        secondBestProvider,
      ].filter(
        (
          provider
        ): provider is ProviderContext =>
          provider !== null
      );

      if (
        candidates.length === 0
      ) {
        return null;
      }

      return [
        ...candidates,
      ].sort(
        (
          first,
          second
        ) =>
          first.fee -
          second.fee
      )[0];
    }, [
      bestProvider,
      secondBestProvider,
    ]);

  const fastestProvider =
    useMemo(() => {
      const candidates = [
        bestProvider,
        secondBestProvider,
      ].filter(
        (
          provider
        ): provider is ProviderContext =>
          provider !== null
      );

      if (
        candidates.length === 0
      ) {
        return null;
      }

      const minutes = (
        text: string
      ) => {
        const value =
          text.toLowerCase();

        if (
          value.includes(
            "instant"
          )
        ) {
          return 1;
        }

        const numbers =
          value.match(
            /\d+(?:\.\d+)?/g
          );

        if (!numbers) {
          return 9999;
        }

        const average =
          numbers
            .map(Number)
            .reduce(
              (
                sum,
                number
              ) =>
                sum +
                number,
              0
            ) /
          numbers.length;

        if (
          value.includes(
            "day"
          )
        ) {
          return (
            average *
            1440
          );
        }

        if (
          value.includes(
            "hour"
          ) ||
          value.includes(
            "hr"
          )
        ) {
          return (
            average *
            60
          );
        }

        return average;
      };

      return [
        ...candidates,
      ].sort(
        (
          first,
          second
        ) =>
          minutes(
            first.deliveryTime
          ) -
          minutes(
            second.deliveryTime
          )
      )[0];
    }, [
      bestProvider,
      secondBestProvider,
    ]);

  const getAnswer = (
    question: string
  ) => {
    const normalized =
      question
        .trim()
        .toLowerCase();

    if (!contextReady) {
      return (
        "Run a live comparison first. Once FXCompare has a current rate and provider results, I can explain the best option, fees, speed and estimated savings."
      );
    }

    if (
      normalized.includes(
        "best"
      ) ||
      normalized.includes(
        "recommend"
      )
    ) {
      return (
        `${bestProvider!.name} is currently the strongest option in this comparison. ` +
        `The estimated recipient payout is ${formatAmount(
          bestProvider!.finalAmount
        )} ${toCurrency}, with an estimated fee of ${formatAmount(
          bestProvider!.fee
        )} ${toCurrency} and delivery around ${bestProvider!.deliveryTime}.`
      );
    }

    if (
      normalized.includes(
        "lowest fee"
      ) ||
      normalized.includes(
        "cheapest"
      ) ||
      normalized === "fee"
    ) {
      if (!lowestFeeProvider) {
        return (
          "I do not have enough provider results yet to compare fees."
        );
      }

      return (
        `${lowestFeeProvider.name} has the lowest estimated fee among the currently available results I can see: ${formatAmount(
          lowestFeeProvider.fee
        )} ${toCurrency}.`
      );
    }

    if (
      normalized.includes(
        "fast"
      ) ||
      normalized.includes(
        "speed"
      )
    ) {
      if (!fastestProvider) {
        return (
          "I do not have enough provider results yet to compare transfer speed."
        );
      }

      return (
        `${fastestProvider.name} is the fastest among the currently available results, with an estimated delivery time of ${fastestProvider.deliveryTime}.`
      );
    }

    if (
      normalized.includes(
        "save"
      ) ||
      normalized.includes(
        "saving"
      )
    ) {
      return (
        estimatedSavings > 0
          ? `The best current option is estimated to deliver about ${formatAmount(
              estimatedSavings
            )} ${toCurrency} more than the next-best payout shown on the dashboard.`
          : "The current top providers are very close, so the estimated savings advantage is minimal."
      );
    }

    if (
      normalized.includes(
        "rate"
      )
    ) {
      return (
        `The current market reference rate is 1 ${fromCurrency} = ${formatRate(
          referenceRate
        )} ${toCurrency}. Provider quotes may differ because of fees, spreads and delivery method.`
      );
    }

    if (
      normalized.includes(
        "today"
      ) ||
      normalized.includes(
        "wait"
      ) ||
      normalized.includes(
        "should i"
      )
    ) {
      return (
        `I can explain the current data, but I cannot reliably predict whether ${fromCurrency}/${toCurrency} will improve later today. ` +
        `Right now the reference rate is ${formatRate(
          referenceRate
        )}, and ${bestProvider!.name} gives the strongest estimated result in FXCompare. ` +
        "If timing is flexible, compare the current result with your own target rate or set an alert rather than relying on a short-term prediction."
      );
    }

    return (
      `${bestProvider!.name} is currently the top provider for your ${formatAmount(
        amount
      )} ${fromCurrency} comparison. ` +
      `The reference rate is ${formatRate(
        referenceRate
      )} ${toCurrency} per ${fromCurrency}. ` +
      "Ask me about the best provider, fees, speed, savings or whether the current rate meets your target."
    );
  };

  const submitQuestion = (
    question?: string
  ) => {
    const finalQuestion =
      (
        question ??
        input
      ).trim();

    if (!finalQuestion) {
      return;
    }

    const timestamp =
      Date.now();

    const userMessage: Message = {
      id: `user-${timestamp}`,
      role: "user",
      text: finalQuestion,
    };

    const assistantMessage: Message = {
      id: `assistant-${timestamp}`,
      role: "assistant",
      text:
        getAnswer(
          finalQuestion
        ),
    };

    setMessages(
      (current) => [
        ...current,
        userMessage,
        assistantMessage,
      ]
    );

    setInput("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >
        <Pressable
          style={
            styles.backdrop
          }
          onPress={
            onClose
          }
        />

        <View style={styles.sheet}>
          <View
            style={
              styles.handle
            }
          />

          <View
            style={
              styles.header
            }
          >
            <View
              style={
                styles.aiIcon
              }
            >
              <Ionicons
                name="sparkles"
                size={22}
                color="#2FE58C"
              />
            </View>

            <View
              style={
                styles.headerText
              }
            >
              <Text
                style={
                  styles.eyebrow
                }
              >
                FXCOMPARE AI
              </Text>

              <Text
                style={
                  styles.title
                }
              >
                Transfer Assistant
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={
                0.8
              }
              style={
                styles.closeButton
              }
              onPress={
                onClose
              }
            >
              <Ionicons
                name="close"
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <View
            style={
              styles.contextBar
            }
          >
            <Ionicons
              name="pulse-outline"
              size={16}
              color={
                contextReady
                  ? "#2FE58C"
                  : "#FFD65A"
              }
            />

            <Text
              style={
                styles.contextText
              }
            >
              {contextReady
                ? `${formatAmount(
                    amount
                  )} ${fromCurrency} → ${toCurrency} • ${bestProvider!.name}`
                : "Run a comparison to unlock live context"}
            </Text>
          </View>

          <ScrollView
            style={
              styles.messages
            }
            contentContainerStyle={
              styles.messagesContent
            }
            showsVerticalScrollIndicator={
              false
            }
          >
            {messages.map(
              (message) => (
                <View
                  key={
                    message.id
                  }
                  style={[
                    styles.messageRow,
                    message.role ===
                      "user" &&
                      styles.userMessageRow,
                  ]}
                >
                  {message.role ===
                  "assistant" ? (
                    <View
                      style={
                        styles.messageAvatar
                      }
                    >
                      <Ionicons
                        name="sparkles"
                        size={15}
                        color="#2FE58C"
                      />
                    </View>
                  ) : null}

                  <View
                    style={[
                      styles.messageBubble,
                      message.role ===
                      "user"
                        ? styles.userBubble
                        : styles.assistantBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.role ===
                          "user" &&
                          styles.userMessageText,
                      ]}
                    >
                      {
                        message.text
                      }
                    </Text>
                  </View>
                </View>
              )
            )}

            <Text
              style={
                styles.suggestedTitle
              }
            >
              Suggested questions
            </Text>

            <View
              style={
                styles.suggestions
              }
            >
              {suggestedQuestions.map(
                (
                  question
                ) => (
                  <TouchableOpacity
                    key={
                      question
                    }
                    activeOpacity={
                      0.82
                    }
                    style={
                      styles.suggestionChip
                    }
                    onPress={() =>
                      submitQuestion(
                        question
                      )
                    }
                  >
                    <Ionicons
                      name="sparkles-outline"
                      size={14}
                      color="#64AFFF"
                    />

                    <Text
                      style={
                        styles.suggestionText
                      }
                    >
                      {
                        question
                      }
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </ScrollView>

          <View
            style={
              styles.inputBar
            }
          >
            <TextInput
              value={input}
              onChangeText={
                setInput
              }
              placeholder="Ask about rates, fees or providers..."
              placeholderTextColor="#6F8DA2"
              style={
                styles.input
              }
              returnKeyType="send"
              onSubmitEditing={() =>
                submitQuestion()
              }
            />

            <TouchableOpacity
              activeOpacity={
                0.85
              }
              style={
                styles.sendButton
              }
              onPress={() =>
                submitQuestion()
              }
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color="#071521"
              />
            </TouchableOpacity>
          </View>

          <Text
            style={
              styles.disclaimer
            }
          >
            FXCompare AI explains current app data and does not provide financial advice.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent:
        "flex-end",
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        "rgba(2,10,16,0.72)",
    },

    sheet: {
      height: "88%",
      backgroundColor:
        "#071521",
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor:
        "#194661",
      paddingHorizontal: 16,
      paddingBottom:
        Platform.OS ===
        "ios"
          ? 20
          : 12,
      overflow: "hidden",
    },

    handle: {
      width: 45,
      height: 5,
      borderRadius: 3,
      backgroundColor:
        "#31526A",
      alignSelf: "center",
      marginTop: 9,
      marginBottom: 13,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 13,
    },

    aiIcon: {
      width: 44,
      height: 44,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(47,229,140,0.11)",
      borderWidth: 1,
      borderColor:
        "rgba(47,229,140,0.23)",
    },

    headerText: {
      flex: 1,
      marginLeft: 10,
    },

    eyebrow: {
      color: "#2FE58C",
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 0.8,
    },

    title: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "900",
      marginTop: 3,
    },

    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#153147",
      borderWidth: 1,
      borderColor:
        "#21465E",
    },

    contextBar: {
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#0E2C43",
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#194661",
      paddingHorizontal: 12,
      marginBottom: 10,
    },

    contextText: {
      flex: 1,
      color: "#A9BECC",
      fontSize: 10,
      fontWeight: "700",
      marginLeft: 7,
    },

    messages: {
      flex: 1,
    },

    messagesContent: {
      paddingTop: 6,
      paddingBottom: 18,
    },

    messageRow: {
      flexDirection: "row",
      alignItems:
        "flex-end",
      marginBottom: 11,
    },

    userMessageRow: {
      justifyContent:
        "flex-end",
    },

    messageAvatar: {
      width: 30,
      height: 30,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(47,229,140,0.10)",
      marginRight: 7,
    },

    messageBubble: {
      maxWidth: "84%",
      borderRadius: 17,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },

    assistantBubble: {
      backgroundColor:
        "#0E2C43",
      borderWidth: 1,
      borderColor:
        "#194661",
      borderBottomLeftRadius: 6,
    },

    userBubble: {
      backgroundColor:
        "#1687E8",
      borderBottomRightRadius: 6,
    },

    messageText: {
      color: "#C3D2DC",
      fontSize: 11,
      lineHeight: 17,
    },

    userMessageText: {
      color: "#FFFFFF",
    },

    suggestedTitle: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "900",
      marginTop: 6,
      marginBottom: 10,
    },

    suggestions: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -4,
    },

    suggestionChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#0E2C43",
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#194661",
      paddingHorizontal: 10,
      paddingVertical: 9,
      margin: 4,
    },

    suggestionText: {
      color: "#A9BECC",
      fontSize: 9,
      fontWeight: "700",
      marginLeft: 5,
    },

    inputBar: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#0E2C43",
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        "#21516E",
      paddingLeft: 13,
      paddingRight: 6,
      marginTop: 8,
    },

    input: {
      flex: 1,
      color: "#FFFFFF",
      fontSize: 11,
      paddingVertical: 10,
      paddingRight: 10,
    },

    sendButton: {
      width: 43,
      height: 43,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#2FE58C",
    },

    disclaimer: {
      color: "#5F7B8E",
      fontSize: 8,
      lineHeight: 12,
      textAlign: "center",
      marginTop: 7,
    },
  });