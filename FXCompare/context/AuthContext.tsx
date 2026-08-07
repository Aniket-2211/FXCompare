import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";

import { auth } from "../services/firebase";
import {
  loadUserDocument,
  saveUserDocument,
} from "../services/firestore";

type AuthContextValue = {
  user: User | null;
  loadingAuth: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<void>;

  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;

  resetPassword: (
    email: string
  ) => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loadingAuth, setLoadingAuth] =
    useState(true);

  const ensureUserDocument =
    async (firebaseUser: User) => {
      const existing =
        await loadUserDocument(
          firebaseUser.uid
        );

      if (existing) {
        return;
      }

      await saveUserDocument(
        firebaseUser.uid,
        {
          profile: {
            name:
              firebaseUser.displayName ??
              firebaseUser.email?.split(
                "@"
              )[0] ??
              "FXCompare User",

            email:
              firebaseUser.email,

            createdAt:
              new Date().toISOString(),
          },
        }
      );
    };

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (nextUser) => {
          setUser(nextUser);
          setLoadingAuth(false);
        }
      );

    return unsubscribe;
  }, []);

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,
        loadingAuth,

        signIn: async (
          email,
          password
        ) => {
          const credential =
            await signInWithEmailAndPassword(
              auth,
              email.trim(),
              password
            );

          await ensureUserDocument(
            credential.user
          );
        },

        signUp: async (
          name,
          email,
          password
        ) => {
          const credential =
            await createUserWithEmailAndPassword(
              auth,
              email.trim(),
              password
            );

          const cleanName =
            name.trim();

          if (cleanName) {
            await updateProfile(
              credential.user,
              {
                displayName:
                  cleanName,
              }
            );
          }

          await saveUserDocument(
            credential.user.uid,
            {
              profile: {
                name:
                  cleanName ||
                  credential.user.email?.split(
                    "@"
                  )[0] ||
                  "FXCompare User",

                email:
                  credential.user.email,

                createdAt:
                  new Date().toISOString(),
              },
            }
          );
        },

        logout: async () => {
          await signOut(auth);
        },

        resetPassword: async (
          email
        ) => {
          await sendPasswordResetEmail(
            auth,
            email.trim()
          );
        },
      }),
      [user, loadingAuth]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}