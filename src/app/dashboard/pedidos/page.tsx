"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatFecha } from "@/utils/formatFecha";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ChevronRight,
  Clock,
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  Filter,
} from "lucide-react";

interface Pedido {
  intPedido: number;
  datPedido: string;
  dblTotal: number;
  strEstado: string;
  strNumeroRastreo?: string;
  tbItems: Array<{
    intCantidad: number;
    dblSubtotal: number;
    tbProducto: {
      intProducto: number;
      strNombre: string;
      dblPrecio: number;
      strImagen?: string;
    };
  }>;
}

export default function PedidosPage() {
  const router = useRouter();
  const { isAuthenticated, isGuest, user, token } = useAuth();
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [mounted, setMounted] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || isGuest)) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, isGuest, router]);

  // Cargar pedidos reales del usuario
  useEffect(() => {
    if (mounted && isAuthenticated && !isGuest && user?.intCliente) {
      fetchPedidos();
    }
  }, [mounted, isAuthenticated, isGuest, user]);

  const fetchPedidos = async () => {
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
                  dblSubtotal
                  tbProducto {
                    intProducto
                    strNombre
                    dblPrecio
                    strImagen
                  }
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
      const pedidosUsuario = todosPedidos.filter(
        (p: any) => p.tbClientes?.intCliente === user?.intCliente
      );

      // Ordenar por fecha más reciente
      const pedidosOrdenados = [...pedidosUsuario].sort(
        (a: Pedido, b: Pedido) =>
          new Date(b.datPedido).getTime() - new Date(a.datPedido).getTime()
      );

      setPedidos(pedidosOrdenados);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
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

  const filtros = [
    { id: "todos", nombre: "Todos", icono: Package },
    { id: "procesando", nombre: "Procesando", icono: Clock },
    { id: "en_camino", nombre: "En camino", icono: Truck },
    { id: "entregado", nombre: "Entregados", icono: CheckCircle },
    { id: "cancelado", nombre: "Cancelados", icono: XCircle },
  ];

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const estadoNormalizado = pedido.strEstado.toLowerCase();
    const cumpleFiltro =
      filtro === "todos" || 
      estadoNormalizado === filtro ||
      (filtro === "en_camino" && (estadoNormalizado === "enviado" || estadoNormalizado === "en_camino")) ||
      (filtro === "entregado" && (estadoNormalizado === "entregado" || estadoNormalizado === "completado"));
    
    const cumpleBusqueda =
      busqueda === "" ||
      pedido.intPedido.toString().includes(busqueda) ||
      pedido.tbItems.some((item) =>
        item.tbProducto.strNombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    return cumpleFiltro && cumpleBusqueda;
  });

  const getEstadoConfig = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    const estados = {
      entregado: {
        texto: "Entregado",
        color: "bg-green-100 text-green-700 border-green-200",
        icono: CheckCircle,
        iconoColor: "text-green-600",
      },
      completado: {
        texto: "Completado",
        color: "bg-green-100 text-green-700 border-green-200",
        icono: CheckCircle,
        iconoColor: "text-green-600",
      },
      en_camino: {
        texto: "En camino",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icono: Truck,
        iconoColor: "text-blue-600",
      },
      enviado: {
        texto: "En camino",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icono: Truck,
        iconoColor: "text-blue-600",
      },
      procesando: {
        texto: "Procesando",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icono: Clock,
        iconoColor: "text-yellow-600",
      },
      confirmado: {
        texto: "Confirmado",
        color: "bg-purple-100 text-purple-700 border-purple-200",
        icono: Clock,
        iconoColor: "text-purple-600",
      },
      pendiente: {
        texto: "Pendiente",
        color: "bg-orange-100 text-orange-700 border-orange-200",
        icono: Clock,
        iconoColor: "text-orange-600",
      },
      cancelado: {
        texto: "Cancelado",
        color: "bg-red-100 text-red-700 border-red-200",
        icono: XCircle,
        iconoColor: "text-red-600",
      },
    };
    return (
      estados[estadoLower as keyof typeof estados] || {
        texto: estado,
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icono: Package,
        iconoColor: "text-gray-600",
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#EDEDEE]">
      {/* Header estilo Mercado Libre */}
      <div className="bg-[#FFFF] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
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
              <div>
                <h1 className="text-lg font-normal text-gray-800">Compras</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Buscador */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar en tus compras"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-md bg-white border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Filtros estilo tabs */}
        <div className="bg-white rounded-md shadow-sm mb-4 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {filtros.map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-normal transition-colors whitespace-nowrap ${
                  filtro === f.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {f.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Pedidos */}
        <AnimatePresence mode="wait">
          {pedidosFiltrados.length === 0 ? (
            <div className="bg-white rounded-md shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron compras
              </h3>
              <p className="text-gray-500 text-sm">
                {busqueda
                  ? "Intenta con otra búsqueda"
                  : "No tienes compras en esta categoría"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidosFiltrados.map((pedido, index) => {
                const estadoConfig = getEstadoConfig(pedido.strEstado);

                return (
                  <div
                    key={pedido.intPedido}
                    className="bg-white rounded-md shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      {/* Header del pedido */}
                      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-medium ${estadoConfig.color} border`}
                            >
                              {estadoConfig.texto}
                            </span>
                            <span className="text-sm text-gray-500">
                             {formatFecha(pedido.datPedido)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Pedido #{pedido.intPedido.toString().padStart(8, '0')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Total</p>
                          <p className="text-xl font-semibold text-gray-900">
                            $
                            {pedido.dblTotal.toLocaleString("es-MX", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Productos */}
                      <div className="mb-4">
                        {pedido.tbItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-16 h-16 rounded bg-cover bg-center"
                                style={{
                                  backgroundImage: item.tbProducto.strImagen
                                    ? `url(${item.tbProducto.strImagen})`
                                    : 'none',
                                  backgroundColor: !item.tbProducto.strImagen ? '#f3f4f6' : 'transparent'
                                }}
                              >
                                {!item.tbProducto.strImagen && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm text-gray-900 font-normal">
                                  {item.tbProducto.strNombre}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Cantidad: {item.intCantidad}
                                </p>
                                <p className="text-xs text-gray-600 font-medium">
                                  ${item.dblSubtotal.toLocaleString("es-MX", {
                                    minimumFractionDigits: 2,
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {/* {pedido.strNumeroRastreo && (
                          <div className="text-sm text-gray-600">
                            <span className="text-xs text-gray-500">
                              Seguimiento: 
                            </span>
                            <span className="font-medium ml-1">
                              {pedido.strNumeroRastreo}
                            </span>
                          </div>
                        )} */}
                        <button
                          onClick={() =>
                            router.push(`/pedido/confirmacion/${pedido.intPedido}`)
                          }
                          className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-normal"
                        >
                          Ver compra
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
