// context/AppSettingsContext.tsx

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

export type AlertCondition =
  | "above"
  | "below";

export type SavedRateAlert = {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  targetRate: number;
  condition: AlertCondition;
  enabled: boolean;
};

type AppSettingsContextType = {
  loadingSettings: boolean;

  darkMode: boolean;
  notificationsEnabled: boolean;

  defaultFromCurrency: string;
  defaultToCurrency: string;
  defaultAmount: string;

  savedAlerts: SavedRateAlert[];
  favouriteProviders: string[];

  setDarkMode: (
    enabled: boolean
  ) => Promise<void>;

  setNotificationsEnabled: (
    enabled: boolean
  ) => Promise<void>;

  setDefaultFromCurrency: (
    currency: string
  ) => Promise<void>;

  setDefaultToCurrency: (
    currency: string
  ) => Promise<void>;

  setDefaultAmount: (
    amount: string
  ) => Promise<void>;

  addSavedAlert: (
    alert: SavedRateAlert
  ) => Promise<void>;

  updateSavedAlert: (
    alert: SavedRateAlert
  ) => Promise<void>;

  deleteSavedAlert: (
    alertId: string
  ) => Promise<void>;

  addFavouriteProvider: (
    providerName: string
  ) => Promise<void>;

  removeFavouriteProvider: (
    providerName: string
  ) => Promise<void>;

  toggleFavouriteProvider: (
    providerName: string
  ) => Promise<boolean>;

  isFavouriteProvider: (
    providerName: string
  ) => boolean;

  clearAllSettings: () => Promise<void>;
};

type Props = {
  children: ReactNode;
};

const STORAGE_KEYS = {
  darkMode:
    "@fxcompare/darkMode",

  notifications:
    "@fxcompare/notifications",

  fromCurrency:
    "@fxcompare/defaultFromCurrency",

  toCurrency:
    "@fxcompare/defaultToCurrency",

  defaultAmount:
    "@fxcompare/defaultAmount",

  alerts:
    "@fxcompare/savedAlerts",

  favouriteProviders:
    "@fxcompare/favouriteProviders",
};

const AppSettingsContext =
  createContext<
    AppSettingsContextType | undefined
  >(undefined);

const normalizeProviderName = (
  providerName: string
) => {
  return providerName.trim();
};

const providerNamesMatch = (
  firstName: string,
  secondName: string
) => {
  return (
    firstName.trim().toLowerCase() ===
    secondName.trim().toLowerCase()
  );
};

export function AppSettingsProvider({
  children,
}: Props) {
  const [
    loadingSettings,
    setLoadingSettings,
  ] = useState(true);

  const [
    darkMode,
    setDarkModeState,
  ] = useState(true);

  const [
    notificationsEnabled,
    setNotificationsEnabledState,
  ] = useState(true);

  const [
    defaultFromCurrency,
    setDefaultFromCurrencyState,
  ] = useState("USD");

  const [
    defaultToCurrency,
    setDefaultToCurrencyState,
  ] = useState("INR");

  const [
    defaultAmount,
    setDefaultAmountState,
  ] = useState("1000");

  const [
    savedAlerts,
    setSavedAlerts,
  ] = useState<SavedRateAlert[]>([]);

  const [
    favouriteProviders,
    setFavouriteProviders,
  ] = useState<string[]>([]);

  const favouriteProvidersRef =
    useRef<string[]>([]);

  const savedAlertsRef =
    useRef<SavedRateAlert[]>([]);

  const updateFavouriteState = (
    providers: string[]
  ) => {
    favouriteProvidersRef.current =
      providers;

    setFavouriteProviders(
      providers
    );
  };

  const updateAlertsState = (
    alerts: SavedRateAlert[]
  ) => {
    savedAlertsRef.current =
      alerts;

    setSavedAlerts(alerts);
  };

  useEffect(() => {
    const loadStoredSettings =
      async () => {
        try {
          const [
            storedDarkMode,
            storedNotifications,
            storedFromCurrency,
            storedToCurrency,
            storedAmount,
            storedAlerts,
            storedFavouriteProviders,
          ] = await Promise.all([
            AsyncStorage.getItem(
              STORAGE_KEYS.darkMode
            ),

            AsyncStorage.getItem(
              STORAGE_KEYS.notifications
            ),

            AsyncStorage.getItem(
              STORAGE_KEYS.fromCurrency
            ),

            AsyncStorage.getItem(
              STORAGE_KEYS.toCurrency
            ),

            AsyncStorage.getItem(
              STORAGE_KEYS.defaultAmount
            ),

            AsyncStorage.getItem(
              STORAGE_KEYS.alerts
            ),

            AsyncStorage.getItem(
              STORAGE_KEYS.favouriteProviders
            ),
          ]);

          if (
            storedDarkMode !== null
          ) {
            setDarkModeState(
              storedDarkMode ===
                "true"
            );
          }

          if (
            storedNotifications !==
            null
          ) {
            setNotificationsEnabledState(
              storedNotifications ===
                "true"
            );
          }

          if (
            storedFromCurrency
          ) {
            setDefaultFromCurrencyState(
              storedFromCurrency
            );
          }

          if (
            storedToCurrency
          ) {
            setDefaultToCurrencyState(
              storedToCurrency
            );
          }

          if (storedAmount) {
            setDefaultAmountState(
              storedAmount
            );
          }

          if (storedAlerts) {
            const parsedAlerts =
              JSON.parse(
                storedAlerts
              );

            if (
              Array.isArray(
                parsedAlerts
              )
            ) {
              updateAlertsState(
                parsedAlerts
              );
            }
          }

          if (
            storedFavouriteProviders
          ) {
            const parsedProviders =
              JSON.parse(
                storedFavouriteProviders
              );

            if (
              Array.isArray(
                parsedProviders
              )
            ) {
              const validProviders =
                parsedProviders
                  .filter(
                    (
                      provider
                    ): provider is string =>
                      typeof provider ===
                        "string" &&
                      provider.trim()
                        .length > 0
                  )
                  .map(
                    normalizeProviderName
                  );

              const uniqueProviders =
                validProviders.filter(
                  (
                    provider,
                    index,
                    list
                  ) =>
                    list.findIndex(
                      (
                        currentProvider
                      ) =>
                        providerNamesMatch(
                          currentProvider,
                          provider
                        )
                    ) === index
                );

              updateFavouriteState(
                uniqueProviders
              );
            }
          }
        } catch (error) {
          console.log(
            "Unable to load app settings:",
            error
          );
        } finally {
          setLoadingSettings(
            false
          );
        }
      };

    void loadStoredSettings();
  }, []);

  const setDarkMode = async (
    enabled: boolean
  ) => {
    setDarkModeState(enabled);

    await AsyncStorage.setItem(
      STORAGE_KEYS.darkMode,
      String(enabled)
    );
  };

  const setNotificationsEnabled =
    async (
      enabled: boolean
    ) => {
      setNotificationsEnabledState(
        enabled
      );

      await AsyncStorage.setItem(
        STORAGE_KEYS.notifications,
        String(enabled)
      );
    };

  const setDefaultFromCurrency =
    async (
      currency: string
    ) => {
      const normalizedCurrency =
        currency
          .trim()
          .toUpperCase();

      if (!normalizedCurrency) {
        return;
      }

      setDefaultFromCurrencyState(
        normalizedCurrency
      );

      await AsyncStorage.setItem(
        STORAGE_KEYS.fromCurrency,
        normalizedCurrency
      );
    };

  const setDefaultToCurrency =
    async (
      currency: string
    ) => {
      const normalizedCurrency =
        currency
          .trim()
          .toUpperCase();

      if (!normalizedCurrency) {
        return;
      }

      setDefaultToCurrencyState(
        normalizedCurrency
      );

      await AsyncStorage.setItem(
        STORAGE_KEYS.toCurrency,
        normalizedCurrency
      );
    };

  const setDefaultAmount =
    async (
      amount: string
    ) => {
      setDefaultAmountState(
        amount
      );

      await AsyncStorage.setItem(
        STORAGE_KEYS.defaultAmount,
        amount
      );
    };

  const persistAlerts = async (
    alerts: SavedRateAlert[]
  ) => {
    const previousAlerts =
      savedAlertsRef.current;

    updateAlertsState(alerts);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.alerts,
        JSON.stringify(alerts)
      );
    } catch (error) {
      updateAlertsState(
        previousAlerts
      );

      throw error;
    }
  };

  const addSavedAlert =
    async (
      alert: SavedRateAlert
    ) => {
      const updatedAlerts = [
        alert,
        ...savedAlertsRef.current,
      ];

      await persistAlerts(
        updatedAlerts
      );
    };

  const updateSavedAlert =
    async (
      alert: SavedRateAlert
    ) => {
      const updatedAlerts =
        savedAlertsRef.current.map(
          (currentAlert) =>
            currentAlert.id ===
            alert.id
              ? alert
              : currentAlert
        );

      await persistAlerts(
        updatedAlerts
      );
    };

  const deleteSavedAlert =
    async (
      alertId: string
    ) => {
      const updatedAlerts =
        savedAlertsRef.current.filter(
          (alert) =>
            alert.id !== alertId
        );

      await persistAlerts(
        updatedAlerts
      );
    };

  const persistFavouriteProviders =
    async (
      providers: string[]
    ) => {
      const previousProviders =
        favouriteProvidersRef.current;

      updateFavouriteState(
        providers
      );

      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.favouriteProviders,
          JSON.stringify(
            providers
          )
        );
      } catch (error) {
        updateFavouriteState(
          previousProviders
        );

        throw error;
      }
    };

  const addFavouriteProvider =
    async (
      providerName: string
    ) => {
      const normalizedName =
        normalizeProviderName(
          providerName
        );

      if (!normalizedName) {
        return;
      }

      const alreadySaved =
        favouriteProvidersRef.current.some(
          (provider) =>
            providerNamesMatch(
              provider,
              normalizedName
            )
        );

      if (alreadySaved) {
        return;
      }

      await persistFavouriteProviders(
        [
          ...favouriteProvidersRef.current,
          normalizedName,
        ]
      );
    };

  const removeFavouriteProvider =
    async (
      providerName: string
    ) => {
      const normalizedName =
        normalizeProviderName(
          providerName
        );

      const updatedProviders =
        favouriteProvidersRef.current.filter(
          (provider) =>
            !providerNamesMatch(
              provider,
              normalizedName
            )
        );

      await persistFavouriteProviders(
        updatedProviders
      );
    };

  const toggleFavouriteProvider =
    async (
      providerName: string
    ): Promise<boolean> => {
      const normalizedName =
        normalizeProviderName(
          providerName
        );

      if (!normalizedName) {
        return false;
      }

      const currentProviders =
        favouriteProvidersRef.current;

      const currentlyFavourite =
        currentProviders.some(
          (provider) =>
            providerNamesMatch(
              provider,
              normalizedName
            )
        );

      if (currentlyFavourite) {
        const updatedProviders =
          currentProviders.filter(
            (provider) =>
              !providerNamesMatch(
                provider,
                normalizedName
              )
          );

        await persistFavouriteProviders(
          updatedProviders
        );

        return false;
      }

      const updatedProviders = [
        ...currentProviders,
        normalizedName,
      ];

      await persistFavouriteProviders(
        updatedProviders
      );

      return true;
    };

  const isFavouriteProvider = (
    providerName: string
  ) => {
    return favouriteProvidersRef.current.some(
      (provider) =>
        providerNamesMatch(
          provider,
          providerName
        )
    );
  };

  const clearAllSettings =
    async () => {
      await AsyncStorage.multiRemove(
        Object.values(
          STORAGE_KEYS
        )
      );

      setDarkModeState(true);

      setNotificationsEnabledState(
        true
      );

      setDefaultFromCurrencyState(
        "USD"
      );

      setDefaultToCurrencyState(
        "INR"
      );

      setDefaultAmountState(
        "1000"
      );

      updateAlertsState([]);

      updateFavouriteState([]);
    };

  return (
    <AppSettingsContext.Provider
      value={{
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

        toggleFavouriteProvider,

        isFavouriteProvider,

        clearAllSettings,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(
    AppSettingsContext
  );

  if (!context) {
    throw new Error(
      "useAppSettings must be used inside AppSettingsProvider."
    );
  }

  return context;
}