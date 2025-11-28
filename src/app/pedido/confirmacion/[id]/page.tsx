"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, Mail, CreditCard, Truck, Copy, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTienda } from "@/context/TiendaContext";
import OrderStatusTimeline from "@/components/order/OrderStatusTimeline";

interface OrderItem {
  intProducto: number;
  strNombre: string;
  intCantidad: number;
  dblPrecio: number;
  dblSubtotal: number;
  jsonImagenes?: string;
}

interface OrderData {
  intPedido: number;
  strEstado: string;
  dblSubtotal: number;
  dblCostoEnvio: number;
  dblTotal: number;
  strMetodoEnvio: string;
  strDireccionEnvio?: {
    strCalle: string;
    strNumeroExterior: string;
    strColonia: string;
    strCiudad: string;
    strEstado: string;
    strCP: string;
  };
  items: OrderItem[];
  strFechaCreacion: string;
  strFechaEntregaEstimada: string;
  strNumeroRastreo?: string;
  
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const { limpiarCarrito } = useTienda(); // 🧹 Importar limpiarCarrito
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOrderData(params.id as string);
    }
  }, [params.id]);

  // 🧹 Limpiar carrito cuando se carga la página de confirmación
  useEffect(() => {
    if (orderData) {
     console.log('datos',orderData);
      limpiarCarrito();
    }
  }, [orderData]);

  const fetchOrderData = async (orderId: string) => {
    try {
      const response = await fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
           query ObtenerPedido($intPedido: Int!) {
                obtenerPedido(intPedido: $intPedido) {
                    intPedido
                    datPedido
                    dblSubtotal
                    dblCostoEnvio
                    dblTotal
                    strEstado
                    strMetodoEnvio
                    tbItems {
                        intPedidoItem
                        intCantidad
                        dblSubtotal
                        tbProducto {
                            intProducto
                            strNombre
                            dblPrecio
                            jsonImagenes
                        }
                    }
                    tbDirecciones {
                        intDireccion
                        strCalle
                        strNumeroExterior
                        strColonia
                        strCiudad
                        strEstado
                        strCP
                    }
                }
            }
          `,
          variables: {
            intPedido: parseInt(orderId),
          },
        }),
      });

      const result = await response.json();
      console.log("Resultado de obtener pedido:", result);
      
      if (result.errors) {
        console.error("Errores de GraphQL:", result.errors);
        throw new Error(result.errors[0]?.message || "Error al obtener pedido");
      }
      
      if (result.data?.obtenerPedido) {
        const pedido = result.data.obtenerPedido;
        
        // Transformar items con datos del producto
        const itemsTransformados = pedido.tbItems.map((item: any) => ({
          intProducto: item.tbProducto.intProducto,
          strNombre: item.tbProducto.strNombre,
          jsonImagenes: item.tbProducto.jsonImagenes,
          intCantidad: item.intCantidad,
          dblPrecio: item.tbProducto.dblPrecio,
          dblSubtotal: item.dblSubtotal,
        }));
        
        // Transformar dirección si existe
        const direccionTransformada = pedido.tbDireccion ? {
          strCalle: pedido.tbDireccion.strCalle,
          strNumeroExterior: pedido.tbDireccion.strNumeroExterior,
          strColonia: pedido.tbDireccion.strColonia,
          strCiudad: pedido.tbDireccion.strCiudad,
          strEstado: pedido.tbDireccion.strEstado,
          strCP: pedido.tbDireccion.strCP,
        } : undefined;
        
        setOrderData({
          intPedido: pedido.intPedido,
          strEstado: pedido.strEstado,
          dblSubtotal: pedido.dblSubtotal,
          dblCostoEnvio: pedido.dblCostoEnvio,
          dblTotal: pedido.dblTotal,
          strMetodoEnvio: pedido.strMetodoEnvio,
          strDireccionEnvio: direccionTransformada,
          items: itemsTransformados,
          strFechaCreacion: pedido.datPedido,
          strFechaEntregaEstimada: "", // Calcular en base a método de envío
          strNumeroRastreo: undefined,
        });
      }
    } catch (error) {
      console.error("Error al cargar pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyOrderNumber = () => {
    if (orderData) {
      navigator.clipboard.writeText(`#${orderData.intPedido.toString().padStart(8, '0')}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3A6EA5] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del pedido...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido no encontrado</h1>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-[#3A6EA5] text-white rounded-lg font-semibold hover:bg-[#2E5A8C]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* 🔹 Menú Estático Superior */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="text-2xl font-bold bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                Ecommerce
              </button>
            </div>

            {/* Links de navegación - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => router.push("/")}
                className="text-gray-700 hover:text-[#3A6EA5] font-medium transition-colors"
              >
                Inicio
              </button>
              <button
                onClick={() => router.push("/products")}
                className="text-gray-700 hover:text-[#3A6EA5] font-medium transition-colors"
              >
                Productos
              </button>
              <button
                onClick={() => router.push("/quejas")}
                className="text-gray-700 hover:text-[#3A6EA5] font-medium transition-colors"
              >
                Contacto
              </button>
            </nav>

            {/* Botón de usuario */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(user ? "/dashboard" : "/login")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-6 h-6 text-[#3A6EA5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M12 12a4 4 0 100-8 4 4 0 000 8z"
                  />
                </svg>
                {user && (
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {user.strNombre}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-10 lg:px-20 py-10 sm:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header de confirmación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-6 text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            
            <div className="space-y-3">
              <h1 className="text-4xl font-black text-gray-900">
                ¡Gracias por tu compra!
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Tu pedido ha sido confirmado. Hemos enviado un recibo detallado a tu correo electrónico.
              </p>
            </div>

            {/* Número de orden */}
            <div className="flex items-center gap-3 bg-white rounded-lg p-4 px-6 border-2 border-gray-200 shadow-sm">
              <p className="text-gray-700">
                Número de pedido: <span className="font-bold text-gray-900">#{orderData.intPedido.toString().padStart(8, '0')}</span>
              </p>
              <button
                onClick={copyOrderNumber}
                className="text-gray-500 hover:text-[#3A6EA5] transition-colors"
                title="Copiar número de pedido"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda - Resumen del pedido */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Resumen del Pedido</h2>
                </div>

              
              
                <div className="divide-y divide-gray-200">
                  {orderData.items.map((item, index) => (
                    
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-4 p-6"
                    >
                       
                      <div
                        className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                        style={{
                          backgroundImage: item.jsonImagenes 
                            ? `url(${item.jsonImagenes})`
                            : undefined
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.strNombre}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.intCantidad}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${item.dblSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Totales */}
                <div className="p-6 bg-gray-50 space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>${orderData.dblSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Envío</span>
                    <span>${orderData.dblCostoEnvio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>${orderData.dblTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Columna derecha - Información de envío y acciones */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Información de entrega */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="w-6 h-6 text-[#3A6EA5]" />
                  <h3 className="text-lg font-bold text-gray-900">Información de Entrega</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Entrega Estimada</p>
                    <p className="text-base text-gray-900 font-semibold">
                      {orderData.strMetodoEnvio === "express" 
                        ? "2-3 días hábiles" 
                        : orderData.strMetodoEnvio === "estandar"
                        ? "5-7 días hábiles"
                        : "Recoger en tienda"}
                    </p>
                  </div>
                  
                  {orderData.strDireccionEnvio && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Dirección de Envío</p>
                      <div className="text-base text-gray-900">
                        <p>{user?.strNombre || "Cliente"}</p>
                        <p>{orderData.strDireccionEnvio.strCalle} {orderData.strDireccionEnvio.strNumeroExterior}</p>
                        <p>{orderData.strDireccionEnvio.strColonia}</p>
                        <p>{orderData.strDireccionEnvio.strCiudad}, {orderData.strDireccionEnvio.strEstado}</p>
                        <p>C.P. {orderData.strDireccionEnvio.strCP}</p>
                      </div>
                    </div>
                  )}

                  {orderData.strMetodoEnvio === "recoger" && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Importante:</strong> Recuerda presentar tu número de pedido al recoger en tienda.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Estado del pedido */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-6 h-6 text-[#3A6EA5]" />
                  <h3 className="text-lg font-bold text-gray-900">Estado del Pedido</h3>
                </div>
                
                <OrderStatusTimeline currentStatus="confirmado" />
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/products")}
                  className="w-full py-3 bg-[#3A6EA5] text-white rounded-lg font-semibold hover:bg-[#2E5A8C] transition-colors"
                >
                  Continuar Comprando
                </button>
                
                <button
                  onClick={() => router.push("/cuenta/pedidos")}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Ver Mis Pedidos
                </button>
              </div>
            </motion.div>
          </div>

          {/* Footer de ayuda */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600">
              ¿Necesitas ayuda? {" "}
              <a href="/contacto" className="font-semibold text-[#3A6EA5] hover:underline">
                Contáctanos
              </a>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
