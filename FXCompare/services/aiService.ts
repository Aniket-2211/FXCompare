import {
  auth,
} from "./firebase";

export type AIProviderContext = {
  name: string;
  rate: number;
  fee: number;
  finalAmount: number;
  deliveryTime: string;
  rating: number;
};

export type AIChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export type FXCompareAIContext = {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  referenceRate: number;
  estimatedSavings: number;
  bestProvider:
    | AIProviderContext
    | null;
  secondBestProvider:
    | AIProviderContext
    | null;
};

type AIResponse = {
  answer?: string;
  error?: string;
};

const AI_API_URL =
  process.env
    .EXPO_PUBLIC_FXCOMPARE_AI_URL ??
  "";

export const isRemoteAIConfigured =
  () =>
    AI_API_URL.trim().length >
    0;

export async function askFXCompareAI({
  question,
  context,
  history,
}: {
  question: string;
  context: FXCompareAIContext;
  history: AIChatMessage[];
}): Promise<string> {
  const endpoint =
    AI_API_URL.trim();

  if (!endpoint) {
    throw new Error(
      "FXCompare AI backend is not configured."
    );
  }

  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "Please sign in again to use FXCompare AI."
    );
  }

  const idToken =
    await user.getIdToken();

  const response =
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        Authorization:
          `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        question:
          question.trim(),
        context,
        history:
          history.slice(-8),
      }),
    });

  let body:
    | AIResponse
    | null = null;

  try {
    body =
      (await response.json()) as
        AIResponse;
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(
      body?.error ??
        "FXCompare AI is temporarily unavailable."
    );
  }

  const answer =
    body?.answer?.trim();

  if (!answer) {
    throw new Error(
      "FXCompare AI returned an empty response."
    );
  }

  return answer;
}