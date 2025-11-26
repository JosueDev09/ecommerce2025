"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  intCliente?: number; // ID del cliente en la base de datos
  strNombre: string;
  strUsuario: string;
  strCorreo?: string;
  strTelefono?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  continueAsGuest: () => void;
  setRedirectPath: (path: string) => void;
  getRedirectPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [redirectPath, setRedirectPathState] = useState<string>("/");

  // 🔄 Cargar datos de autenticación desde localStorage al iniciar
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("authUser");
        const guestMode = localStorage.getItem("isGuest");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else if (guestMode === "true") {
          setIsGuest(true);
        }
      } catch (error) {
        console.error("Error al cargar datos de autenticación:", error);
      }
    }
  }, []);

  // 🔐 Login con token y datos de usuario
  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    setIsGuest(false);
    
    
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", newToken);
      localStorage.setItem("authUser", JSON.stringify(userData));
      localStorage.removeItem("isGuest");
    }
  };

  // 🚪 Logout - limpiar todo
  const logout = () => {
    // Obtener el usuario actual antes de limpiar
    const currentUser = user?.strUsuario || "guest";
    
    setToken(null);
    setUser(null);
    setIsGuest(false);
    
    if (typeof window !== "undefined") {
      // Limpiar el carrito del usuario actual
      const carritoKey = `carrito_${currentUser}`;
      localStorage.removeItem(carritoKey);
      
      // Limpiar datos de autenticación
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      localStorage.removeItem("isGuest");
      
      // console.log(`🚪 Sesión cerrada. Carrito de ${currentUser} limpiado.`);
    }
  };

  // 👤 Continuar como invitado
  const continueAsGuest = () => {
    setIsGuest(true);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("isGuest", "true");
    }
  };

  // 📍 Guardar ruta de redirección
  const setRedirectPath = (path: string) => {
    setRedirectPathState(path);
    if (typeof window !== "undefined") {
      localStorage.setItem("redirectAfterLogin", path);
    }
  };

  // 📍 Obtener ruta de redirección
  const getRedirectPath = () => {
    if (typeof window !== "undefined") {
      const path = localStorage.getItem("redirectAfterLogin");
      localStorage.removeItem("redirectAfterLogin");
      return path || "/";
    }
    return "/";
  };

  const isAuthenticated = !!token || isGuest;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isGuest,
        login,
        logout,
        continueAsGuest,
        setRedirectPath,
        getRedirectPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
}
