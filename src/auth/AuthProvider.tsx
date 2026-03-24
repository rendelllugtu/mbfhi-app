// src/auth/AuthProvider.tsx

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "./types";

import { auth, provider } from "../firebase";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { apiCall } from "../api/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  // =============================
  // FIREBASE AUTH LISTENER
  // =============================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }

      try {
        const email = firebaseUser.email;

        // 🔥 get role from your Google Sheet
        const roleRes = await apiCall<{
          roles: string[];
          name: string;
        }>("getUserRole", { email });

        const newUser = {
          email: email || "",
          roles: roleRes.roles || ["user"],
          name: roleRes.name || firebaseUser.displayName || "",
        };

        setUser(newUser);

      } catch (err) {
        console.error(err);
        setUser(null);
      }
    });

    return () => unsub();
  }, []);

  // =============================
  // LOGIN
  // =============================
  const login = async () => {
    await signInWithPopup(auth, provider);
  };

  // =============================
  // LOGOUT
  // =============================
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {user === undefined ? (
        <div className="p-6">Loading...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};