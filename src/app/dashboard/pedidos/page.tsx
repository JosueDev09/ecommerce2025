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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-6"></div>
          <p className="font-[family-name:var(--font-inter)] text-white/70 text-sm tracking-wide">Cargando pedidos...</p>
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-white/70 hover:text-white transition-colors"
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
                    strokeWidth={1.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-white tracking-tight">Mis Pedidos</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Buscador */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar en tus pedidos"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-white/30 transition-colors font-[family-name:var(--font-inter)] text-sm tracking-wide"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 mb-8 overflow-x-auto">
          <div className="flex border-b border-white/10">
            {filtros.map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`flex-1 min-w-[120px] px-6 py-4 font-[family-name:var(--font-inter)] text-xs tracking-wider uppercase transition-colors whitespace-nowrap ${
                  filtro === f.id
                    ? "text-white border-b-2 border-white"
                    : "text-white/60 hover:text-white"
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
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-16 text-center"
            >
              <Package className="w-20 h-20 text-white/30 mx-auto mb-6" />
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-white mb-3 tracking-tight">
                No se encontraron pedidos
              </h3>
              <p className="font-[family-name:var(--font-inter)] text-white/60 text-sm tracking-wide">
                {busqueda
                  ? "Intenta con otra búsqueda"
                  : "No tienes pedidos en esta categoría"}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {pedidosFiltrados.map((pedido, index) => {
                const estadoConfig = getEstadoConfig(pedido.strEstado);

                return (
                  <motion.div
                    key={pedido.intPedido}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all group"
                  >
                    <div className="p-6">
                      {/* Header del pedido */}
                      <div className="flex items-start justify-between mb-6 pb-6 border-b border-white/10">
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                            <span
                              className={`px-3 py-1.5 text-xs font-[family-name:var(--font-inter)] tracking-wider uppercase border ${estadoConfig.color.replace('bg-', 'bg-white/').replace('text-', 'text-white/').replace('border-', 'border-white/')} bg-white/5 text-white border-white/20`}
                            >
                              {estadoConfig.texto}
                            </span>
                            <span className="font-[family-name:var(--font-inter)] text-sm text-white/60 tracking-wide">
                             {formatFecha(pedido.datPedido)}
                            </span>
                          </div>
                          <p className="font-[family-name:var(--font-inter)] text-xs text-white/50 tracking-wider uppercase">
                            Pedido #{pedido.intPedido.toString().padStart(8, '0')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-[family-name:var(--font-inter)] text-xs text-white/50 tracking-wider uppercase mb-2">Total</p>
                          <p className="font-[family-name:var(--font-playfair)] text-2xl text-white tracking-tight">
                            $
                            {pedido.dblTotal.toLocaleString("es-MX", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Productos */}
                      <div className="mb-6 space-y-4">
                        {pedido.tbItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-5 py-3 hover:bg-white/5 transition-colors -mx-2 px-2"
                          >
                            <div 
                              className="w-20 h-20 bg-white/5 bg-cover bg-center border border-white/10 flex-shrink-0"
                              style={{
                                backgroundImage: item.tbProducto.strImagen
                                  ? `url(${item.tbProducto.strImagen})`
                                  : 'none',
                              }}
                            >
                              {!item.tbProducto.strImagen && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag className="w-6 h-6 text-white/30" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-[family-name:var(--font-playfair)] text-base text-white mb-2">
                                {item.tbProducto.strNombre}
                              </p>
                              <p className="font-[family-name:var(--font-inter)] text-xs text-white/60 tracking-wide mb-1">
                                Cantidad: {item.intCantidad}
                              </p>
                              <p className="font-[family-name:var(--font-playfair)] text-sm text-white">
                                ${item.dblSubtotal.toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <button
                          onClick={() =>
                            router.push(`/pedido/confirmacion/${pedido.intPedido}`)
                          }
                          className="ml-auto font-[family-name:var(--font-inter)] text-sm text-white tracking-wider uppercase hover:opacity-70 transition-opacity flex items-center gap-2"
                        >
                          Ver Detalles
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
