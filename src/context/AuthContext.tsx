"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  intCliente?: number; // ID del cliente en la base de datos
  intEmpleado?: number; // ID del empleado en la base de datos
  strNombre: string;
  strUsuario: string;
  strCorreo?: string;
  strTelefono?: string;
  strRol?: string; // Rol del usuario: 'cliente', 'empleado', 'admin', etc.
  tipoUsuario?: 'cliente' | 'empleado'; // Tipo de usuario para distinguir en consultas
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
      // 🛒 MIGRAR CARRITO DE INVITADO AL USUARIO
      const carritoInvitado = localStorage.getItem("carrito_guest");
      const carritoUsuario = localStorage.getItem(`carrito_${userData.strUsuario}`);
      
      if (carritoInvitado) {
        try {
          const itemsInvitado = JSON.parse(carritoInvitado);
          
          if (carritoUsuario) {
            // Si el usuario ya tiene un carrito, fusionar ambos
            const itemsUsuario = JSON.parse(carritoUsuario);
            const carritoFusionado = [...itemsUsuario];
            
            // Agregar items del invitado que no existan en el carrito del usuario
            itemsInvitado.forEach((itemInvitado: any) => {
              const existe = carritoFusionado.find(
                (item: any) => 
                  item.id === itemInvitado.id &&
                  item.color === itemInvitado.color &&
                  item.talla === itemInvitado.talla
              );
              
              if (existe) {
                // Si existe, sumar las cantidades (respetando el límite de stock)
                existe.cantidad = Math.min(
                  existe.cantidad + itemInvitado.cantidad,
                  itemInvitado.stock || 999
                );
              } else {
                // Si no existe, agregarlo
                carritoFusionado.push(itemInvitado);
              }
            });
            
            localStorage.setItem(`carrito_${userData.strUsuario}`, JSON.stringify(carritoFusionado));
            console.log(`🛒 Carrito fusionado: ${itemsInvitado.length} items de invitado + ${itemsUsuario.length} items existentes`);
          } else {
            // Si no tiene carrito previo, usar directamente el del invitado
            localStorage.setItem(`carrito_${userData.strUsuario}`, carritoInvitado);
            console.log(`🛒 Carrito de invitado migrado a usuario ${userData.strUsuario}: ${itemsInvitado.length} items`);
          }
          
          // Limpiar carrito de invitado
          localStorage.removeItem("carrito_guest");
        } catch (error) {
          console.error("Error al migrar carrito de invitado:", error);
        }
      }
      
      // Guardar datos de autenticación
      localStorage.setItem("authToken", newToken);
      localStorage.setItem("authUser", JSON.stringify(userData));
      localStorage.removeItem("isGuest");
      
      // 🔄 Disparar evento para que TiendaContext recargue el carrito
      window.dispatchEvent(new Event("storage"));
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
