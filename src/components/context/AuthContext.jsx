import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Ошибка загрузки пользователя:", e);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("token") || null;
    } catch (e) {
      console.error("Ошибка загрузки токена:", e);
      return null;
    }
  });

  // Синхронизация между вкладками
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        setToken(e.newValue);
      } else if (e.key === "user") {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (error) {
          console.error("Ошибка парсинга user из storage:", error);
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (userData, accessToken) => {
    if (!userData || !accessToken) {
      console.error("Некорректные данные для входа");
      return;
    }

    setUser(userData);
    setToken(accessToken);
    
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", accessToken);
    } catch (e) {
      console.error("Ошибка сохранения в localStorage:", e);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (e) {
      console.error("Ошибка очистки localStorage:", e);
    }
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    
    try {
      localStorage.setItem("user", JSON.stringify(newUser));
    } catch (e) {
      console.error("Ошибка обновления пользователя:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};  