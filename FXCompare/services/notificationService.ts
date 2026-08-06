// services/notificationService.ts

type RateAlertNotification = {
  alertId: string;
  fromCurrency: string;
  toCurrency: string;
  currentRate: number;
  targetRate: number;
  condition: "above" | "below";
};

/**
 * Notifications are temporarily disabled while FXCompare runs in Expo Go.
 * Expo Go does not support the Android notification functionality required
 * by expo-notifications for this project setup.
 *
 * These functions intentionally remain available so the Alerts screen does
 * not need to change. When you move to an EAS development build, this file
 * can be replaced with the production expo-notifications implementation.
 */

export async function configureNotifications(): Promise<boolean> {
  return false;
}

export async function getNotificationPermissionStatus(): Promise<boolean> {
  return false;
}

export async function sendRateAlertNotification(
  _alert: RateAlertNotification
): Promise<string | null> {
  return null;
}

export async function sendTestNotification(): Promise<string | null> {
  return null;
}

export async function dismissAllRateNotifications(): Promise<void> {
  return;
}