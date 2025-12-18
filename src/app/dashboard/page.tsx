"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {formatFecha} from '@/utils/formatFecha';
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

interface Pedido {
  intPedido: number;
  datPedido: string;
  dblTotal: number;
  strEstado: string;
  tbItems: Array<{
    intCantidad: number;
  }>;
}

interface DashboardData {
  pedidosRecientes: Pedido[];
  totalPedidos: number;
  pedidosEnCamino: number;
  pedidosCompletados: number;
  totalGastado: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isGuest, logout, user, token } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPedidos, setTotalPedidos] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || isGuest)) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, isGuest, router]);

  // Cargar datos reales del usuario
  useEffect(() => {
    if (mounted && isAuthenticated && !isGuest && user) {
      fetchDashboardData();
    }
  }, [mounted, isAuthenticated, isGuest, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query ObtenerPedidos {
              obtenerPedidos {
                intPedido
                datPedido
                dblTotal
                strEstado
                tbItems {
                  intCantidad
                }
                tbClientes {
                  intCliente
                }
              }
            }
          `,
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error("Error al cargar pedidos:", result.errors);
        return;
      }

      // Filtrar pedidos del usuario actual
      const todosPedidos = result.data?.obtenerPedidos || [];
      
      // IMPORTANTE: Solo los clientes tienen pedidos
      // Si el usuario es empleado sin intCliente, no tiene pedidos
      const idUsuario = user?.intCliente; // Solo buscar por intCliente
      
      // console.log('🔍 Debug Dashboard:');
      // console.log('Tipo de usuario:', user?.tipoUsuario);
      // console.log('intCliente:', user?.intCliente);
      // console.log('intEmpleado:', user?.intEmpleado);
      // console.log('ID usado para filtrar:', idUsuario);
      // console.log('Total pedidos en BD:', todosPedidos.length);
      
      // Si no tiene intCliente, no tiene pedidos
      const pedidos = idUsuario
        ? todosPedidos.filter((p: any) => p.tbClientes?.intCliente === idUsuario)
        : [];
      
     // console.log('Pedidos filtrados:', pedidos.length);
      //console.log("Pedidos del usuario:", pedidos);
      // Calcular estadísticas
      const totalPedidos = pedidos.length;
      const pedidosEnCamino = pedidos.filter((p: Pedido) => 
        p.strEstado.toLowerCase() === "enviado" || 
        p.strEstado.toLowerCase() === "en_camino"
      ).length;
      const pedidosCompletados = pedidos.filter((p: Pedido) => 
        p.strEstado.toLowerCase() === "entregado" || 
        p.strEstado.toLowerCase() === "completado"
      ).length;
      const totalGastado = pedidos.reduce((sum: number, p: Pedido) => sum + p.dblTotal, 0);

      // Ordenar por fecha más reciente y tomar los últimos 3
      const pedidosRecientes = [...pedidos]
        .sort((a: Pedido, b: Pedido) => 
          new Date(b.datPedido).getTime() - new Date(a.datPedido).getTime()
        )
        .slice(0, 3);

        setTotalPedidos( totalPedidos);

      setDashboardData({
        pedidosRecientes,
        totalPedidos,
        pedidosEnCamino,
        pedidosCompletados,
        totalGastado,
      });
    } catch (error) {
      console.error("Error al obtener datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated || isGuest || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6EA5] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Estadísticas calculadas desde los datos reales
  const estadisticas = [
    {
      titulo: "Total de pedidos",
      valor: dashboardData?.totalPedidos.toString() || "0",
      icono: ShoppingBag,
      color: "bg-blue-500",
      tendencia: dashboardData?.totalPedidos ? `${dashboardData.totalPedidos} pedidos realizados` : "Sin pedidos",
    },
    {
      titulo: "En camino",
      valor: dashboardData?.pedidosEnCamino.toString() || "0",
      icono: Package,
      color: "bg-orange-500",
      tendencia: dashboardData?.pedidosEnCamino ? "Llegada estimada: 3-7 días" : "Sin envíos activos",
    },
    {
      titulo: "Completados",
      valor: dashboardData?.pedidosCompletados.toString() || "0",
      icono: CheckCircle,
      color: "bg-green-500",
      tendencia: "Pedidos entregados",
    },
    {
      titulo: "Total gastado",
      valor: `$${(dashboardData?.totalGastado || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      icono: TrendingUp,
      color: "bg-purple-500",
      tendencia: "Historial completo",
    },
  ];

  const menuItems = [
    {
      titulo: "Mis Pedidos",
      descripcion: "Ver historial completo",
      icono: Package,
      ruta: "/dashboard/pedidos",
      badge: {totalPedidos}
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
    const estadoLower = estado.toLowerCase();
    const estados = {
      entregado: {
        texto: "Entregado",
        color: "bg-green-100 text-green-700",
      },
      completado: {
        texto: "Completado",
        color: "bg-green-100 text-green-700",
      },
      enviado: {
        texto: "En camino",
        color: "bg-blue-100 text-blue-700",
      },
      en_camino: {
        texto: "En camino",
        color: "bg-blue-100 text-blue-700",
      },
      procesando: {
        texto: "Procesando",
        color: "bg-yellow-100 text-yellow-700",
      },
      confirmado: {
        texto: "Confirmado",
        color: "bg-purple-100 text-purple-700",
      },
      pendiente: {
        texto: "Pendiente",
        color: "bg-orange-100 text-orange-700",
      },
    };
    return (
      estados[estadoLower as keyof typeof estados] || {
        texto: estado,
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
              <h1 className="text-lg font-normal text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Mi cuenta</h1>
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
                <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {user?.strNombre?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500">Hola</p>
                  <p className="font-semibold text-gray-900 truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {user?.strNombre}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-sm text-black hover:text-gray-700 font-normal text-left"
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
                   style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  <div className="flex items-center gap-3">
                    <item.icono className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-900">{item.titulo}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs text-gray-500">{totalPedidos}</span>
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
                  <p className="text-2xl font-semibold text-gray-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {stat.valor}
                  </p>
                  <p className="text-xs text-gray-600" style={{ fontFamily: "'Playfair Display', serif" }}>{stat.titulo}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.tendencia}</p>
                </div>
              ))}
            </div>

            {/* Pedidos recientes */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900"  style={{ fontFamily: "'Playfair Display', serif" }}>
                    Compras
                  </h2>
                  <button
                    onClick={() => router.push("/dashboard/pedidos")}
                    className="text-sm text-black hover:text-gray-700 font-normal"
                     style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Ver historial
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {dashboardData?.pedidosRecientes && dashboardData.pedidosRecientes.length > 0 ? (
                  dashboardData.pedidosRecientes.map((pedido: Pedido) => {
                    const badge = getEstadoBadge(pedido.strEstado);
                    const totalProductos = pedido.tbItems.reduce((sum, item) => sum + item.intCantidad, 0);
                    
                    return (
                      <div
                        key={pedido.intPedido}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/pedido/confirmacion/${pedido.intPedido}`)
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
                                {formatFecha(pedido.datPedido)}
                              </span>
                                  
                            </div>
                            <p className="text-sm text-gray-600">
                              {totalProductos}{" "}
                              {totalProductos === 1 ? "producto" : "productos"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-semibold text-gray-900">
                              $
                              {pedido.dblTotal.toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Pedido #{pedido.intPedido.toString().padStart(8, '0')}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No tienes pedidos aún</p>
                    <button
                      onClick={() => router.push("/products")}
                      className="mt-4 text-black hover:text-gray-700 text-sm font-medium"
                    >
                      Explorar productos
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Banner promocional estilo ML */}
            <div className="bg-black rounded-lg p-6 shadow-sm text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    ¡Descubre productos increíbles!
                  </h3>
                  <p className="text-blue-100 text-sm mb-4">
                    Explora nuestra selección y encuentra lo que buscas
                  </p>
                  <button
                    onClick={() => router.push("/products")}
                    className="bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors text-sm"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Ver productos
                  </button>
                </div>
                <div className="hidden md:block">
                  <ShoppingBag className="w-24 h-24 text-white/30 opacity-50" />
                </div>
              </div>
            </div>

            {/* Información de la cuenta */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Datos de tu cuenta
                </h3>
                <button
                  onClick={() => router.push("/dashboard/perfil")}
                  className="text-sm text-black hover:text-gray-700 font-normal"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Editar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Nombre</p>
                  <p className="text-sm font-medium text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {user?.strNombre}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Email</p>
                  <p className="text-sm font-medium text-gray-900 truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {user?.strCorreo || user?.strUsuario}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Teléfono</p>
                  <p className="text-sm font-medium text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {user?.strTelefono || "No registrado"}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Miembro desde</p>
                  <p className="text-sm font-medium text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {new Date().toLocaleDateString("es-MX", {
                      month: "long",
                      year: "numeric",
                    })}
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
