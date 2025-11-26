"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  User,
  Package,
  ShoppingBag,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isGuest, logout,user } = useAuth();
  const [mounted, setMounted] = useState(false);

 // console.log("🔍 DashboardPage - Usuario:", user)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || isGuest)) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, isGuest, router]);

  if (!mounted || !isAuthenticated || isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6EA5] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Datos de ejemplo - estos vendrían de tu API
  const pedidosRecientes = [
    {
      id: "ORD-001",
      fecha: "2025-11-20",
      total: 5999.0,
      estado: "entregado",
      productos: 3,
    },
    {
      id: "ORD-002",
      fecha: "2025-11-22",
      total: 1299.0,
      estado: "en_camino",
      productos: 1,
    },
    {
      id: "ORD-003",
      fecha: "2025-11-24",
      total: 3499.0,
      estado: "procesando",
      productos: 2,
    },
  ];

  const estadisticas = [
    {
      titulo: "Total de pedidos",
      valor: "12",
      icono: ShoppingBag,
      color: "bg-blue-500",
      tendencia: "+2 este mes",
    },
    {
      titulo: "En camino",
      valor: "1",
      icono: Package,
      color: "bg-orange-500",
      tendencia: "Llegada estimada: 3 días",
    },
    {
      titulo: "Completados",
      valor: "10",
      icono: CheckCircle,
      color: "bg-green-500",
      tendencia: "Últimos 90 días",
    },
    {
      titulo: "Total gastado",
      valor: "$45,299",
      icono: TrendingUp,
      color: "bg-purple-500",
      tendencia: "+15% vs mes anterior",
    },
  ];

  const menuItems = [
    {
      titulo: "Mis Pedidos",
      descripcion: "Ver historial completo",
      icono: Package,
      ruta: "/dashboard/pedidos",
      badge: "3 activos",
    },
    {
      titulo: "Mi Información",
      descripcion: "Datos personales",
      icono: User,
      ruta: "/dashboard/perfil",
      badge: null,
    },
    {
      titulo: "Direcciones",
      descripcion: "Gestionar direcciones de envío",
      icono: MapPin,
      ruta: "/dashboard/direcciones",
      badge: "2 guardadas",
    },
    {
      titulo: "Favoritos",
      descripcion: "Productos guardados",
      icono: Heart,
      ruta: "/dashboard/favoritos",
      badge: "8",
    },
    {
      titulo: "Configuración",
      descripcion: "Preferencias y seguridad",
      icono: Settings,
      ruta: "/dashboard/configuracion",
      badge: null,
    },
  ];

  const getEstadoBadge = (estado: string) => {
    const estados = {
      entregado: {
        texto: "Entregado",
        color: "bg-green-100 text-green-700",
      },
      en_camino: {
        texto: "En camino",
        color: "bg-blue-100 text-blue-700",
      },
      procesando: {
        texto: "Procesando",
        color: "bg-yellow-100 text-yellow-700",
      },
    };
    return (
      estados[estado as keyof typeof estados] || {
        texto: "Desconocido",
        color: "bg-gray-100 text-gray-700",
      }
    );
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#EDEDEE]">
      {/* Header estilo Mercado Libre */}
      <div className="bg-[#fff] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-lg font-normal text-gray-800">Mi cuenta</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar izquierdo */}
          <div className="lg:col-span-1">
            {/* Card de usuario */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    {user?.strNombre?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500">Hola</p>
                  <p className="font-semibold text-gray-900 truncate">
                    {user?.strNombre}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-normal text-left"
              >
                Salir
              </button>
            </div>

            {/* Menú lateral */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {menuItems.map((item, index) => (
                <button
                  key={item.titulo}
                  onClick={() => router.push(item.ruta)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    index !== menuItems.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icono className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-900">{item.titulo}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs text-gray-500">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {estadisticas.map((stat, index) => (
                <div
                  key={stat.titulo}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <stat.icono className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-900 mb-1">
                    {stat.valor}
                  </p>
                  <p className="text-xs text-gray-600">{stat.titulo}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.tendencia}</p>
                </div>
              ))}
            </div>

            {/* Pedidos recientes */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Compras
                  </h2>
                  <button
                    onClick={() => router.push("/dashboard/pedidos")}
                    className="text-sm text-blue-600 hover:text-blue-700 font-normal"
                  >
                    Ver historial
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {pedidosRecientes.map((pedido) => {
                  const badge = getEstadoBadge(pedido.estado);
                  return (
                    <div
                      key={pedido.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/pedidos/${pedido.id}`)
                      }
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}
                            >
                              {badge.texto}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(pedido.fecha).toLocaleDateString(
                                "es-MX",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {pedido.productos}{" "}
                            {pedido.productos === 1 ? "producto" : "productos"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-semibold text-gray-900">
                            $
                            {pedido.total.toLocaleString("es-MX", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Pedido #{pedido.id}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Banner promocional estilo ML */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 shadow-sm text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    ¡Descubre productos increíbles!
                  </h3>
                  <p className="text-blue-100 text-sm mb-4">
                    Explora nuestra selección y encuentra lo que buscas
                  </p>
                  <button
                    onClick={() => router.push("/products")}
                    className="bg-white text-blue-600 px-6 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors text-sm"
                  >
                    Ver productos
                  </button>
                </div>
                <div className="hidden md:block">
                  <ShoppingBag className="w-24 h-24 text-blue-300 opacity-50" />
                </div>
              </div>
            </div>

            {/* Información de la cuenta */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Datos de tu cuenta
                </h3>
                <button
                  onClick={() => router.push("/dashboard/perfil")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-normal"
                >
                  Editar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Nombre</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.strNombre}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.strCorreo || user?.strUsuario}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.strTelefono || "No registrado"}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Miembro desde</p>
                  <p className="text-sm font-medium text-gray-900">
                    Enero 2024
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
