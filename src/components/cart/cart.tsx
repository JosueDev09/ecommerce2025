"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, use } from "react";
import { Productos } from "@/types/types";
import { useTienda } from "@/context/TiendaContext";
import { useProductFilters } from "@/hooks/productHooks";
import { s } from "framer-motion/client";
import { Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";



export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const { itemVariants } = useProductFilters();
  const { carrito,eliminarDelCarrito, aumentarCantidad, disminuirCantidad } = useTienda();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const { isAuthenticated, setRedirectPath } = useAuth();
  const router = useRouter();

  // Esperar a que el componente esté montado en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para obtener el precio final de un producto (con o sin descuento)
  const obtenerPrecioFinal = (item: any) => {
    // Si el item tiene descuento aplicado desde el carrito, usarlo
    if (item.tieneDescuento && item.precioDescuento) {
      return item.precioDescuento;
    }
    return item.precio;
  };


  // 🛒 Función para proceder al pago
  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Si no está autenticado, guardar la ruta actual y redirigir al login
      setRedirectPath("/processBuy");
      router.push("/login");
    } else {
      // Si está autenticado, ir al proceso de compra
      router.push("/processBuy");
    }
  };



  const subtotal = carrito.reduce((sum, item) => sum + obtenerPrecioFinal(item) * item.cantidad, 0);
  const discountAmount = subtotal * discount;
  const shipping = subtotal > 5000 ? 0 : 299;
  const total = subtotal - discountAmount + shipping;

  // No renderizar hasta que esté montado en el cliente
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F5F5] to-[#FFFFFF] py-12 px-4 md:px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3A6EA5] mx-auto mb-4"></div>
          <p className="text-[#1A1A1A]/70">Cargando carrito...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen  py-16 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl text-black tracking-tight">
            Bolsa de Compras
          </h1>
        </motion.div>

        {carrito.length === 0 ? (
          /* Carrito vacío */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-sm p-20 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-8 flex items-center justify-center">
              <svg className="w-full h-full text-gray-300" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-inter)] text-xl font-light text-black mb-4">Tu carrito está vacío</h2>
            <p className="font-[family-name:var(--font-inter)] text-sm text-gray-500 mb-10">Agrega artículos para comenzar</p>
            <a
              href="/products"
              className="inline-block px-10 py-3 bg-black text-white font-[family-name:var(--font-inter)] text-sm font-medium tracking-widest uppercase hover:bg-gray-900 transition-colors duration-300"
            >
              Continuar comprando...
            </a>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Lista de productos - Izquierda */}
            <div className="space-y-0">
              <AnimatePresence mode="popLayout">
                {carrito.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${item.color}-${item.talla}-${index}`}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="bg-white p-8 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex gap-8">
                      {/* Imagen del producto */}
                      <div className="relative flex-shrink-0 w-32 h-32 bg-gray-50">
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="font-[family-name:var(--font-inter)] text-base font-medium text-black mb-3">
                            {item.nombre}
                          </h3>
                          
                          <div className="space-y-1">
                            <p className="font-[family-name:var(--font-inter)] text-sm text-gray-600">
                              ${obtenerPrecioFinal(item).toLocaleString()}
                            </p>
                            {item.color && (
                              <p className="font-[family-name:var(--font-inter)] text-sm text-gray-600">
                                Color: {item.color}
                              </p>
                            )}
                            {item.talla && (
                              <p className="font-[family-name:var(--font-inter)] text-sm text-gray-600">
                                Talla: {item.talla}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          {/* Control de cantidad minimalista */}
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => disminuirCantidad(item.id, item.color || null, item.talla || null)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors duration-200 border border-gray-200 hover:border-black"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                              </svg>
                            </button>
                            
                            <span className="font-[family-name:var(--font-inter)] text-sm text-black w-8 text-center">
                              {item.cantidad}
                            </span>
                            
                            <button
                              onClick={() => aumentarCantidad(item.id, item.color || null, item.talla || null)}
                              disabled={item.cantidad >= (item.stock || 0)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors duration-200 border border-gray-200 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                              </svg>
                            </button>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center gap-6">
                           
                            <button
                              onClick={() => eliminarDelCarrito(item.id, item.color || null, item.talla || null)}
                              className="font-[family-name:var(--font-inter)] text-sm text-gray-500 hover:text-black underline transition-colors duration-200"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary - Derecha */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:sticky lg:top-8 h-fit"
            >
              <div className="bg-white p-8">
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-black mb-8 tracking-tight">
                  Resumen del Pedido
                </h2>

                {/* Desglose de precios */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="font-[family-name:var(--font-inter)] text-sm text-gray-600">
                      Subtotal
                    </span>
                    <span className="font-[family-name:var(--font-inter)] text-sm text-black">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-[family-name:var(--font-inter)] text-sm text-gray-600">
                      Envío
                    </span>
                    <span className="font-[family-name:var(--font-inter)] text-sm text-black">
                      {shipping === 0 ? "Calculado al finalizar la compra" : `$${shipping}`}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="font-[family-name:var(--font-inter)] text-sm">
                        Descuento ({discount * 100}%)
                      </span>
                      <span className="font-[family-name:var(--font-inter)] text-sm">
                        -${discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="font-[family-name:var(--font-inter)] text-sm text-gray-600">
                      Impuestos
                    </span>
                    <span className="font-[family-name:var(--font-inter)] text-sm text-black">
                      Calculado al finalizar la compra
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-8 pb-8 border-b border-gray-100">
                  <span className="font-[family-name:var(--font-inter)] text-lg font-medium text-black">
                    Total
                  </span>
                  <span className="font-[family-name:var(--font-inter)] text-2xl font-medium text-black">
                    ${total.toLocaleString()}
                  </span>
                </div>

                {/* Botón de checkout */}
                <button 
                  onClick={handleCheckout}
                  className="w-full py-4 bg-[#4C6EF5] text-white text-center font-[family-name:var(--font-inter)] text-sm font-medium tracking-wider uppercase hover:bg-[#3D5FE6] transition-colors duration-300 mb-6"
                >
                  Proceder al Pago
                </button>

                {/* Métodos de pago */}
                <div className="text-center">
                  <p className="font-[family-name:var(--font-inter)] text-xs text-gray-400 mb-4 tracking-wide">
                    Aceptamos:
                  </p>
                  <div className="flex justify-center gap-3 opacity-40">
                    <div className="w-10 h-7 bg-gray-200 rounded"></div>
                    <div className="w-10 h-7 bg-gray-200 rounded"></div>
                    <div className="w-10 h-7 bg-gray-200 rounded"></div>
                    <div className="w-10 h-7 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}