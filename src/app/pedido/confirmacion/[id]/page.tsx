"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, Mail, CreditCard, Truck, Copy, Check, MapPin, Calendar, Home, Phone, User, ArrowRight, Download, Share2, Star } from "lucide-react";
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

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-[#EDEDEE]">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb estilo ML */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button onClick={() => router.push("/")} className="hover:text-[#3A6EA5]">
                Inicio
              </button>
              <span>/</span>
              <button onClick={() => router.push("/dashboard/pedidos")} className="hover:text-[#3A6EA5]">
                Mis compras
              </button>
              <span>/</span>
              <span className="text-gray-900">Detalle de compra</span>
            </div>
          </div>

          {/* Header de confirmación estilo ML */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-md shadow-sm p-6 mb-4"
          >
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex-shrink-0"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </motion.div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  ¡Listo! Ya recibimos tu pago
                </h1>
                <p className="text-gray-600 mb-4">
                  Te enviamos un email a <span className="font-medium">{user?.strCorreo || user?.strUsuario}</span> con los detalles de tu compra.
                </p>
                
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-md">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      Pedido <span className="font-semibold">#{orderData.intPedido.toString().padStart(8, '0')}</span>
                    </span>
                    <button
                      onClick={copyOrderNumber}
                      className="text-gray-500 hover:text-[#3A6EA5] transition-colors ml-1"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-md">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {new Date(orderData.strFechaCreacion).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Total pagado</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${orderData.dblTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Grid principal estilo ML */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Columna izquierda - Productos y detalles */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-4"
            >
              {/* Productos */}
              <div className="bg-white rounded-md shadow-sm">
                <div className="p-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Productos</h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-4">
                        <div
                          className="w-24 h-24 rounded-md bg-gray-100 bg-cover bg-center flex-shrink-0 border border-gray-200"
                          style={{
                            backgroundImage: item.jsonImagenes ? `url(${item.jsonImagenes})` : undefined
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                            {item.strNombre}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Cantidad: <span className="font-medium">{item.intCantidad}</span>
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500">Precio unitario</p>
                              <p className="text-sm font-medium text-gray-900">
                                ${item.dblPrecio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Subtotal</p>
                              <p className="text-lg font-semibold text-gray-900">
                                ${item.dblSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales detallados */}
                <div className="p-5 bg-gray-50 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Productos ({orderData.items.reduce((acc, item) => acc + item.intCantidad, 0)})
                      </span>
                      <span className="font-medium text-gray-900">
                        ${orderData.dblSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío</span>
                      <span className="font-medium text-green-600">
                        {orderData.dblCostoEnvio === 0 
                          ? 'Gratis' 
                          : `$${orderData.dblCostoEnvio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ${orderData.dblTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de envío */}
              {orderData.strMetodoEnvio !== "recoger" && orderData.strDireccionEnvio && (
                <div className="bg-white rounded-md shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Envío</h3>
                      <p className="text-sm text-gray-600">
                        {orderData.strMetodoEnvio === "express" 
                          ? "Express (2-3 días hábiles)" 
                          : "Estándar (5-7 días hábiles)"}
                      </p>
                    </div>
                  </div>

                  <div className="pl-13 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Dirección de entrega</p>
                      <div className="text-sm text-gray-900">
                        <p className="font-medium">{user?.strNombre || "Cliente"}</p>
                        <p>{orderData.strDireccionEnvio.strCalle} {orderData.strDireccionEnvio.strNumeroExterior}</p>
                        <p>{orderData.strDireccionEnvio.strColonia}</p>
                        <p>{orderData.strDireccionEnvio.strCiudad}, {orderData.strDireccionEnvio.strEstado}</p>
                        <p>C.P. {orderData.strDireccionEnvio.strCP}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Importante:</strong> Recibirás un email cuando tu pedido esté en camino con el número de seguimiento.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recoger en tienda */}
              {orderData.strMetodoEnvio === "recoger" && (
                <div className="bg-white rounded-md shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Home className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Recoger en tienda</h3>
                      <p className="text-sm text-gray-600">Disponible en 24 horas</p>
                    </div>
                  </div>

                  <div className="pl-13 space-y-3">
                    <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
                      <p className="text-sm text-purple-900 font-medium mb-2">
                        Presenta tu número de pedido en tienda
                      </p>
                      <p className="text-xs text-purple-800">
                        Horario de atención: Lunes a Viernes 9:00 AM - 6:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Columna derecha - Estado y acciones */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {/* Estado del pedido */}
              <div className="bg-white rounded-md shadow-sm p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Estado del pedido</h3>
                    <p className="text-sm text-green-600 font-medium">Confirmado</p>
                  </div>
                </div>
                
                <OrderStatusTimeline currentStatus="confirmado" />
              </div>

              {/* Acciones rápidas */}
              <div className="bg-white rounded-md shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Acciones</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push("/dashboard/pedidos")}
                    className="w-full py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Ver mis compras</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Descargar recibo</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </button>

                  <button
                    onClick={() => router.push("/products")}
                    className="w-full py-3 bg-[#3A6EA5] text-white rounded-md font-medium hover:bg-[#2E5A8C] transition-colors"
                  >
                    Seguir comprando
                  </button>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="bg-white rounded-md shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4">¿Necesitas ayuda?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600">Llámanos al</p>
                      <p className="font-medium text-gray-900">01 800 123 4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600">Escríbenos a</p>
                      <p className="font-medium text-gray-900">ayuda@ecommerce.com</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/quejas")}
                    className="w-full mt-3 py-2 text-[#3A6EA5] hover:bg-blue-50 rounded-md transition-colors font-medium"
                  >
                    Centro de ayuda
                  </button>
                </div>
              </div>

              {/* Banner promocional */}
              <div className="bg-gradient-to-br from-[#3A6EA5] to-[#2E5A8C] rounded-md shadow-sm p-5 text-white">
                <div className="flex items-start gap-3 mb-3">
                  <Star className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">¡Gracias por tu compra!</h3>
                    <p className="text-sm text-blue-100">
                      Obtén 10% de descuento en tu próxima compra
                    </p>
                  </div>
                </div>
                <button className="w-full mt-3 py-2 bg-white text-[#3A6EA5] rounded-md font-medium hover:bg-blue-50 transition-colors text-sm">
                  Ver promociones
                </button>
              </div>
            </motion.div>
          </div>

          {/* Sección de ayuda inferior */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-white rounded-md shadow-sm p-6"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Qué puedes hacer ahora?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <button
                  onClick={() => router.push("/dashboard/pedidos")}
                  className="p-4 border border-gray-200 rounded-md hover:border-[#3A6EA5] hover:bg-blue-50 transition-all group"
                >
                  <Package className="w-8 h-8 text-gray-600 group-hover:text-[#3A6EA5] mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Seguir mi pedido</p>
                  <p className="text-xs text-gray-500 mt-1">Ve el estado en tiempo real</p>
                </button>

                <button
                  onClick={() => router.push("/products")}
                  className="p-4 border border-gray-200 rounded-md hover:border-[#3A6EA5] hover:bg-blue-50 transition-all group"
                >
                  <Package className="w-8 h-8 text-gray-600 group-hover:text-[#3A6EA5] mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Ver más productos</p>
                  <p className="text-xs text-gray-500 mt-1">Descubre nuestra colección</p>
                </button>

                <button
                  onClick={() => router.push("/quejas")}
                  className="p-4 border border-gray-200 rounded-md hover:border-[#3A6EA5] hover:bg-blue-50 transition-all group"
                >
                  <Mail className="w-8 h-8 text-gray-600 group-hover:text-[#3A6EA5] mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Contactar soporte</p>
                  <p className="text-xs text-gray-500 mt-1">Estamos para ayudarte</p>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
