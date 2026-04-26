import { createContext, useState, useEffect } from "react";
import { clearAllApplications } from "../utils/applicationStorage";
import { clearAllCVs } from "../utils/cvStorage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra xem có user thật trong máy chưa
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setAuthLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const updateUser = (updatedFields) => {
    setUser((currentUser) => {
      const nextUser = { ...currentUser, ...updatedFields };
      if (nextUser) {
        localStorage.setItem("user", JSON.stringify(nextUser));
      }
      return nextUser;
    });
  };

  const logout = () => {
    // Clear user-scoped data BEFORE clearing the user
    clearAllApplications(user);
    clearAllCVs(user);
    setUser(null);
    // Only clear user info from localStorage, not everything
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
