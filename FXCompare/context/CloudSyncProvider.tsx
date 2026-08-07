import React, {
  ReactNode,
  useEffect,
  useRef,
} from "react";

import {
  useAuth,
} from "./AuthContext";

import {
  SavedRateAlert,
  useAppSettings,
} from "./AppSettingsContext";

import {
  loadCloudSettings,
  saveCloudSettings,
} from "../services/settingsSync";

import {
  loadCloudFavouriteProviders,
  saveCloudFavouriteProviders,
} from "../services/favoritesSync";

export default function CloudSyncProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    user,
  } = useAuth();

  const {
    loadingSettings,

    darkMode,
    notificationsEnabled,

    defaultFromCurrency,
    defaultToCurrency,
    defaultAmount,

    savedAlerts,
    favouriteProviders,

    setDarkMode,
    setNotificationsEnabled,

    setDefaultFromCurrency,
    setDefaultToCurrency,
    setDefaultAmount,

    addSavedAlert,
    updateSavedAlert,
    deleteSavedAlert,

    addFavouriteProvider,
    removeFavouriteProvider,
  } = useAppSettings();

  const hydratedUserRef =
    useRef<string | null>(
      null
    );

  const applyingCloudRef =
    useRef(false);

  useEffect(() => {
    if (
      !user ||
      loadingSettings
    ) {
      return;
    }

    if (
      hydratedUserRef.current ===
      user.uid
    ) {
      return;
    }

    let cancelled = false;

    const hydrate =
      async () => {
        applyingCloudRef.current =
          true;

        try {
          const [
            cloudSettings,
            cloudFavourites,
          ] =
            await Promise.all([
              loadCloudSettings(
                user.uid
              ),
              loadCloudFavouriteProviders(
                user.uid
              ),
            ]);

          if (cancelled) {
            return;
          }

          if (cloudSettings) {
            if (
              typeof cloudSettings.darkMode ===
              "boolean"
            ) {
              await setDarkMode(
                cloudSettings.darkMode
              );
            }

            if (
              typeof cloudSettings.notificationsEnabled ===
              "boolean"
            ) {
              await setNotificationsEnabled(
                cloudSettings.notificationsEnabled
              );
            }

            if (
              typeof cloudSettings.defaultFromCurrency ===
                "string" &&
              cloudSettings.defaultFromCurrency
            ) {
              await setDefaultFromCurrency(
                cloudSettings.defaultFromCurrency
              );
            }

            if (
              typeof cloudSettings.defaultToCurrency ===
                "string" &&
              cloudSettings.defaultToCurrency
            ) {
              await setDefaultToCurrency(
                cloudSettings.defaultToCurrency
              );
            }

            if (
              typeof cloudSettings.defaultAmount ===
              "string"
            ) {
              await setDefaultAmount(
                cloudSettings.defaultAmount
              );
            }

            if (
              Array.isArray(
                cloudSettings.savedAlerts
              )
            ) {
              const cloudAlerts =
                cloudSettings.savedAlerts as SavedRateAlert[];

              const localIds =
                new Set(
                  savedAlerts.map(
                    (alert) =>
                      alert.id
                  )
                );

              for (
                const alert of cloudAlerts
              ) {
                if (
                  !alert ||
                  typeof alert.id !==
                    "string"
                ) {
                  continue;
                }

                if (
                  localIds.has(
                    alert.id
                  )
                ) {
                  await updateSavedAlert(
                    alert
                  );
                } else {
                  await addSavedAlert(
                    alert
                  );
                }
              }

              const cloudIds =
                new Set(
                  cloudAlerts.map(
                    (alert) =>
                      alert.id
                  )
                );

              for (
                const localAlert of savedAlerts
              ) {
                if (
                  !cloudIds.has(
                    localAlert.id
                  )
                ) {
                  await deleteSavedAlert(
                    localAlert.id
                  );
                }
              }
            }
          }

          if (cloudFavourites) {
            const cloudSet =
              new Set(
                cloudFavourites.map(
                  (provider) =>
                    provider
                      .trim()
                      .toLowerCase()
                )
              );

            const localSet =
              new Set(
                favouriteProviders.map(
                  (provider) =>
                    provider
                      .trim()
                      .toLowerCase()
                )
              );

            for (
              const provider of cloudFavourites
            ) {
              if (
                !localSet.has(
                  provider
                    .trim()
                    .toLowerCase()
                )
              ) {
                await addFavouriteProvider(
                  provider
                );
              }
            }

            for (
              const provider of favouriteProviders
            ) {
              if (
                !cloudSet.has(
                  provider
                    .trim()
                    .toLowerCase()
                )
              ) {
                await removeFavouriteProvider(
                  provider
                );
              }
            }
          }

          if (
            !cloudSettings
          ) {
            await saveCloudSettings(
              user.uid,
              {
                darkMode,
                notificationsEnabled,
                defaultFromCurrency,
                defaultToCurrency,
                defaultAmount,
                savedAlerts,
              }
            );
          }

          if (
            !cloudFavourites
          ) {
            await saveCloudFavouriteProviders(
              user.uid,
              favouriteProviders
            );
          }

          hydratedUserRef.current =
            user.uid;
        } catch (error) {
          console.log(
            "Cloud hydration error:",
            error
          );
        } finally {
          applyingCloudRef.current =
            false;
        }
      };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    loadingSettings,

    darkMode,
    notificationsEnabled,
    defaultFromCurrency,
    defaultToCurrency,
    defaultAmount,
    savedAlerts,
    favouriteProviders,

    setDarkMode,
    setNotificationsEnabled,
    setDefaultFromCurrency,
    setDefaultToCurrency,
    setDefaultAmount,

    addSavedAlert,
    updateSavedAlert,
    deleteSavedAlert,

    addFavouriteProvider,
    removeFavouriteProvider,
  ]);

  useEffect(() => {
    if (
      !user ||
      loadingSettings ||
      applyingCloudRef.current ||
      hydratedUserRef.current !==
        user.uid
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        void saveCloudSettings(
          user.uid,
          {
            darkMode,
            notificationsEnabled,
            defaultFromCurrency,
            defaultToCurrency,
            defaultAmount,
            savedAlerts,
          }
        ).catch(
          (error) => {
            console.log(
              "Cloud settings sync error:",
              error
            );
          }
        );
      }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [
    user,
    loadingSettings,
    darkMode,
    notificationsEnabled,
    defaultFromCurrency,
    defaultToCurrency,
    defaultAmount,
    savedAlerts,
  ]);

  useEffect(() => {
    if (
      !user ||
      loadingSettings ||
      applyingCloudRef.current ||
      hydratedUserRef.current !==
        user.uid
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        void saveCloudFavouriteProviders(
          user.uid,
          favouriteProviders
        ).catch(
          (error) => {
            console.log(
              "Cloud favourites sync error:",
              error
            );
          }
        );
      }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [
    user,
    loadingSettings,
    favouriteProviders,
  ]);

  useEffect(() => {
    if (!user) {
      hydratedUserRef.current =
        null;
      applyingCloudRef.current =
        false;
    }
  }, [user]);

  return <>{children}</>;
}