import {
  loadUserDocument,
  saveUserDocument,
} from "./firestore";

export type CloudAppSettings = {
  darkMode?: boolean;
  notificationsEnabled?: boolean;
  defaultFromCurrency?: string;
  defaultToCurrency?: string;
  defaultAmount?: string;
  savedAlerts?: unknown[];
};

export async function loadCloudSettings(
  uid: string
): Promise<CloudAppSettings | null> {
  const document =
    await loadUserDocument(uid);

  if (
    !document ||
    typeof document !== "object"
  ) {
    return null;
  }

  const settings =
    (
      document as {
        settings?: unknown;
      }
    ).settings;

  if (
    !settings ||
    typeof settings !== "object"
  ) {
    return null;
  }

  return settings as CloudAppSettings;
}

export async function saveCloudSettings(
  uid: string,
  settings: CloudAppSettings
) {
  await saveUserDocument(
    uid,
    {
      settings: {
        ...settings,
        updatedAt:
          new Date().toISOString(),
      },
    }
  );
}