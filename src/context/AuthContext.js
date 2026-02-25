import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  const login = (userData) => {
    setUser(userData);
    setIsGuest(false);
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isGuest, login, logout, continueAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
