import React, { createContext, useState, useContext, useEffect } from "react";
import { auth, logoutFromCloud } from "../models/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          username:
            firebaseUser.displayName || firebaseUser.email.split("@")[0],
        });
        setIsGuest(false);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData) => {
    setUser({
      id: userData.uid,
      email: userData.email,
      username: userData.displayName || userData.email.split("@")[0],
    });
    setIsGuest(false);
  };

  const logout = async () => {
    try {
      await logoutFromCloud();
      setUser(null);
      setIsGuest(false);
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isGuest, isLoading, login, logout, continueAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
