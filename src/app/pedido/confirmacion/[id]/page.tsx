"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, Mail, CreditCard, Truck, Copy, Check, MapPin, Calendar, Home, Phone, User, ArrowRight, Download, Share2, Star, ChevronRight } from "lucide-react";
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
  strTalla?: string;
  strColor?: string;
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
     //console.log('datos',orderData);
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
                        strTalla
                        strColor
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
      //console.log("Resultado de obtener pedido:", result);
      
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
          strTalla: item.strTalla,
          strColor: item.strColor,
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
 // console.log('orderData',orderData);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-6"></div>
          <p className="font-[family-name:var(--font-inter)] text-white/70 text-sm tracking-wide">Cargando información del pedido...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-white mb-6 tracking-tight">Order Not Found</h1>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-4 bg-white text-black font-[family-name:var(--font-inter)] text-sm tracking-wider uppercase hover:bg-white/90 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 🔹 Menú Estático Superior */}
      <header className="bg-black/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="font-[family-name:var(--font-playfair)] text-2xl text-white hover:opacity-70 transition-opacity tracking-tight"
              >
                ESYMBEL
              </button>
            </div>

            {/* Links de navegación - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => router.push("/")}
                className="font-[family-name:var(--font-inter)] text-sm text-white/80 hover:text-white tracking-wide uppercase transition-colors"
              >
                Inicio
              </button>
              <button
                onClick={() => router.push("/products")}
                className="font-[family-name:var(--font-inter)] text-sm text-white/80 hover:text-white tracking-wide uppercase transition-colors"
              >
                Productos
              </button>
              <button
                onClick={() => router.push("/quejas")}
                className="font-[family-name:var(--font-inter)] text-sm text-white/80 hover:text-white tracking-wide uppercase transition-colors"
              >
                Contacto
              </button>
            </nav>

            {/* Botón de usuario */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(user ? "/dashboard" : "/login")}
                className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:bg-white/5 transition-colors"
              >
                <User className="w-5 h-5 text-white" />
                {user && (
                  <span className="hidden lg:block text-sm font-[family-name:var(--font-inter)] text-white tracking-wide">
                    {user.strNombre}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-[family-name:var(--font-inter)] text-white/60 uppercase tracking-wider">
              <button onClick={() => router.push("/")} className="hover:text-white transition-colors">
                Inicio
              </button>
              <ChevronRight className="w-3 h-3" />
              <button onClick={() => router.push("/dashboard/pedidos")} className="hover:text-white transition-colors">
                Mis compras
              </button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">Confirmación</span>
            </div>
          </div>

          {/* Header de confirmación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 mb-6"
          >
            <div className="flex items-start gap-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex-shrink-0"
              >
                <div className="w-20 h-20 border border-white/20 flex items-center justify-center bg-white/5">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              
              <div className="flex-1">
                <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-white mb-3 tracking-tight">
                  Pedido Confirmado
                </h1>
                <p className="font-[family-name:var(--font-inter)] text-white/70 text-sm tracking-wide mb-6">
                  Confirmación enviada a <span className="text-white">{user?.strCorreo || user?.strUsuario}</span>
                </p>
                
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10">
                    <Package className="w-4 h-4 text-white/70" />
                    <span className="font-[family-name:var(--font-inter)] text-sm text-white/90 tracking-wide">
                      Pedido <span className="text-white">#{orderData.intPedido.toString().padStart(8, '0')}</span>
                    </span>
                    <button
                      onClick={copyOrderNumber}
                      className="text-white/50 hover:text-white transition-colors ml-1"
                    >
                      {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10">
                    <Calendar className="w-4 h-4 text-white/70" />
                    <span className="font-[family-name:var(--font-inter)] text-sm text-white/90 tracking-wide">
                      {new Date(orderData.strFechaCreacion).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="font-[family-name:var(--font-inter)] text-xs text-white/60 tracking-wider uppercase mb-2">Total</p>
                <p className="font-[family-name:var(--font-playfair)] text-4xl text-white tracking-tight">
                  ${orderData.dblTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda - Productos y detalles */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Productos */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6 border-b border-white/10">
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-white tracking-tight">Productos</h2>
                </div>

                <div className="divide-y divide-white/10">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="p-6 hover:bg-white/5 transition-colors">
                      <div className="flex gap-6">
                        <div
                          className="w-28 h-28 bg-white/5 bg-cover bg-center flex-shrink-0 border border-white/10"
                          style={{
                            backgroundImage: item.jsonImagenes ? `url(${item.jsonImagenes})` : undefined
                          }}
                        />
                       
                        <div className="flex-1 min-w-0">
                          <h3 className="font-[family-name:var(--font-playfair)] text-lg text-white mb-2 line-clamp-2">
                            {item.strNombre}
                          </h3>
                          <p className="font-[family-name:var(--font-inter)] text-sm text-white/60 mb-3 tracking-wide">
                            Cantidad: <span className="text-white">{item.intCantidad}</span>
                          </p>
                          <p className="font-[family-name:var(--font-inter)] text-sm text-white/60 mb-3 tracking-wide">
                            Talla: <span className="text-white">{item.strTalla?.toUpperCase()}</span>
                          </p>
                        { item.strColor && (
                           <p className="font-[family-name:var(--font-inter)] text-sm text-white/60 mb-3 tracking-wide">
                            Color: <span className="text-white">{item.strColor?.toUpperCase()}</span>
                          </p>  
                        )}
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-[family-name:var(--font-inter)] text-xs text-white/50 tracking-wider uppercase mb-1">Precio Unitario</p>
                              <p className="font-[family-name:var(--font-playfair)] text-base text-white">
                                ${item.dblPrecio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-[family-name:var(--font-inter)] text-xs text-white/50 tracking-wider uppercase mb-1">Subtotal</p>
                              <p className="font-[family-name:var(--font-playfair)] text-xl text-white">
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
                <div className="p-6 bg-white/5 border-t border-white/10">
                  <div className="space-y-3">
                    <div className="flex justify-between font-[family-name:var(--font-inter)] text-sm tracking-wide">
                      <span className="text-white/60">
                        Productos ({orderData.items.reduce((acc, item) => acc + item.intCantidad, 0)})
                      </span>
                      <span className="text-white">
                        ${orderData.dblSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between font-[family-name:var(--font-inter)] text-sm tracking-wide">
                      <span className="text-white/60">Envío</span>
                      <span className="text-white">
                        {orderData.dblCostoEnvio === 0 
                          ? 'Gratis' 
                          : `$${orderData.dblCostoEnvio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-white/20">
                      <span className="font-[family-name:var(--font-playfair)] text-xl text-white">Total</span>
                      <span className="font-[family-name:var(--font-playfair)] text-2xl text-white">
                        ${orderData.dblTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de envío */}
              {orderData.strMetodoEnvio !== "recoger" && orderData.strDireccionEnvio && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 border border-white/20 flex items-center justify-center bg-white/5">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white tracking-tight">Envío</h3>
                      <p className="font-[family-name:var(--font-inter)] text-sm text-white/60 tracking-wide">
                        {orderData.strMetodoEnvio === "express" 
                          ? "Express (2-3 business days)" 
                          : "Standard (5-7 business days)"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="font-[family-name:var(--font-inter)] text-xs text-white/50 tracking-wider uppercase mb-2">Direccion de envío</p>
                      <div className="font-[family-name:var(--font-inter)] text-sm text-white/80 space-y-1">
                        <p className="text-white">{user?.strNombre || "Customer"}</p>
                        <p>{orderData.strDireccionEnvio.strCalle} {orderData.strDireccionEnvio.strNumeroExterior}</p>
                        <p>{orderData.strDireccionEnvio.strColonia}</p>
                        <p>{orderData.strDireccionEnvio.strCiudad}, {orderData.strDireccionEnvio.strEstado}</p>
                        <p>Código Postal {orderData.strDireccionEnvio.strCP}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10">
                      <p className="font-[family-name:var(--font-inter)] text-sm text-white/70 tracking-wide">
                        Recibirás un correo electrónico con la información de seguimiento una vez que tu pedido sea enviado.
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
              className="space-y-6"
            >
              {/* Estado del pedido */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 border border-white/20 flex items-center justify-center bg-white/5">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white tracking-tight">Estado del pedido</h3>
                    <p className="font-[family-name:var(--font-inter)] text-sm text-white tracking-wide">Confirmado</p>
                  </div>
                </div>
                
                <OrderStatusTimeline currentStatus={orderData.strEstado} />
              </div>

              {/* Acciones rápidas */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white mb-6 tracking-tight">Acciones</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/dashboard/pedidos")}
                    className="w-full py-4 px-5 border border-white/20 hover:bg-white/5 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-white/70" />
                      <span className="font-[family-name:var(--font-inter)] text-sm text-white tracking-wide">Mis pedidos</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white" />
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-4 px-5 border border-white/20 hover:bg-white/5 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-white/70" />
                      <span className="font-[family-name:var(--font-inter)] text-sm text-white tracking-wide">Descargar recibo</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white" />
                  </button>

                  <button
                    onClick={() => router.push("/products")}
                    className="w-full py-4 bg-white text-black font-[family-name:var(--font-inter)] text-sm tracking-wider uppercase hover:bg-white/90 transition-colors"
                  >
                    Continuar comprando
                  </button>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white mb-6 tracking-tight">¿Necesitas ayuda?</h3>
                <div className="space-y-4 font-[family-name:var(--font-inter)] text-sm">
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-white/70 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white/60 tracking-wide">Llámanos</p>
                      <p className="text-white tracking-wide">01 800 123 4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-white/70 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white/60 tracking-wide">Envíanos un correo</p>
                      <p className="text-white tracking-wide">help@esymbel.com</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/quejas")}
                    className="w-full mt-4 py-3 border border-white/20 text-white hover:bg-white/5 transition-colors tracking-wider uppercase text-xs"
                  >
                    Centro de ayuda
                  </button>
                </div>
              </div>

              {/* Banner promocional */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Star className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg text-white mb-2 tracking-tight">Gracias</h3>
                    <p className="font-[family-name:var(--font-inter)] text-sm text-white/70 tracking-wide">
                      Disfruta un 10% de descuento en tu próxima compra
                    </p>
                  </div>
                </div>
                <button className="w-full mt-4 py-3 bg-white text-black font-[family-name:var(--font-inter)] text-xs tracking-wider uppercase hover:bg-white/90 transition-colors">
                  Ver ofertas
                </button>
              </div>
            </motion.div>
          </div>

          {/* Sección de ayuda inferior */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 p-8"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-white mb-8 tracking-tight">
                ¿Qué sigue?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <button
                  onClick={() => router.push("/dashboard/pedidos")}
                  className="p-6 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all group"
                >
                  <Package className="w-10 h-10 text-white/70 group-hover:text-white mx-auto mb-3" />
                  <p className="font-[family-name:var(--font-playfair)] text-base text-white mb-2">Rastrea tu pedido</p>
                  <p className="font-[family-name:var(--font-inter)] text-xs text-white/60 tracking-wide">Actualizaciones en tiempo real</p>
                </button>

                <button
                  onClick={() => router.push("/products")}
                  className="p-6 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all group"
                >
                  <Package className="w-10 h-10 text-white/70 group-hover:text-white mx-auto mb-3" />
                  <p className="font-[family-name:var(--font-playfair)] text-base text-white mb-2">Busca nuestra colección</p>
                  <p className="font-[family-name:var(--font-inter)] text-xs text-white/60 tracking-wide">Descubre más</p>
                </button>

                <button
                  onClick={() => router.push("/quejas")}
                  className="p-6 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all group"
                >
                  <Mail className="w-10 h-10 text-white/70 group-hover:text-white mx-auto mb-3" />
                  <p className="font-[family-name:var(--font-playfair)] text-base text-white mb-2">Soporte</p>
                  <p className="font-[family-name:var(--font-inter)] text-xs text-white/60 tracking-wide">Estamos aquí para ayudar</p>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
