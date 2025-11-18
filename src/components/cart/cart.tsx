"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, use } from "react";
import { Productos } from "@/types/types";
import { useTienda } from "@/context/TiendaContext";
import { useProductFilters } from "@/hooks/productHooks";
import { s } from "framer-motion/client";



export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const { itemVariants } = useProductFilters();
  const { carrito,eliminarDelCarrito, aumentarCantidad, disminuirCantidad } = useTienda();

  // Esperar a que el componente esté montado en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);


 // console.log("Carrito actual:", carrito);

  const applyPromo = async () => {
      try {
      //  console.log("🔄 Cargando producto con slug:", slug);
        const response = await fetch("http://localhost:3000/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
               query ($strCodigo: String!) {
                obtenerDescuentosCodigos(strCodigo: $strCodigo) {
                intDescuentoCodigo
                strCodigo
                dblPorcentajeDescuento
                datFechaInicio
                datFechaFin
                bolActivo                                
                }
              }
            `,
             variables: { strCodigo: promoCode },
             
          }),
        });
        console.log("Response del codigo de descuento:", response);
        const result = await response.json();
        const descuentos = result.data.obtenerDescuentosCodigos;
        if (descuentos.length > 0) {
          const descuentoValido = descuentos[0];
        }
      } catch (error) {
        console.error("Error encontrando el codigo de descuento:", error);
      }
    }



  const subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
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
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F5] to-[#FFFFFF] py-12 px-4 md:px-6">
      {/* Decoraciones de fondo */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-[#3A6EA5]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-[#E6C89C]/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-2">
            Carrito de{" "}
            <span className="bg-gradient-to-r from-[#3A6EA5] via-[#8BAAAD] to-[#E6C89C] bg-clip-text text-transparent">
              Compras
            </span>
          </h1>
          <p className="text-[#1A1A1A]/70">
            {carrito.length} {carrito.length === 1 ? "producto" : "productos"} en tu carrito
          </p>
        </motion.div>

        {carrito.length === 0 ? (
          /* Carrito vacío */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 text-center shadow-lg"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#3A6EA5]/10 flex items-center justify-center">
              <svg className="w-12 h-12 text-[#3A6EA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8h14m-10 0a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">Tu carrito está vacío</h2>
            <p className="text-[#1A1A1A]/60 mb-8">Agrega productos para comenzar tu compra</p>
            <a
              href="/products"
              className="inline-flex items-center px-8 py-3 rounded-full bg-[#3A6EA5] text-white font-medium hover:bg-[#2E5A8C] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Explorar productos
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {carrito.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(58,110,165,0.12)] transition-shadow duration-300"
                  >
                    <div className="flex gap-6">
                      {/* Imagen del producto */}
                      <div className="relative flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-[#F5F5F5]">
                        <img
                          src=""
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">
                              {item.nombre}
                            </h3>
                            <p className="text-sm text-[#1A1A1A]/60">Color: {item.color}</p>
                          </div>
                          <button
                             onClick={() => eliminarDelCarrito(item.id, item.color || null, item.talla || null)}
                            className="p-2 rounded-full hover:bg-red-50 text-[#1A1A1A]/40 hover:text-red-500 transition-all duration-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                          {/* Control de cantidad */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-[#1A1A1A]/60">Cantidad:</span>
                            <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-lg p-1">
                              <button
                                onClick={() => disminuirCantidad(item.id, item.color || null, item.talla || null)}
                                className="w-8 h-8 rounded-md hover:bg-white transition-colors flex items-center justify-center text-[#3A6EA5] font-bold"
                              >
                                −
                              </button>
                              <span className="w-12 text-center font-semibold text-[#1A1A1A]">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => aumentarCantidad(item.id, item.color || null, item.talla || null)}
                                disabled={item.cantidad >= (item.stock || 0)}
                                className="w-8 h-8 rounded-md hover:bg-white transition-colors flex items-center justify-center text-[#3A6EA5] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>
                            {/* Mostrar stock disponible */}
                            {item.stock! >= 100 && (
                              <span className="text-xs text-[#1A1A1A]/50 ml-2">
                                Stock: <span className="text-green-600">Disponible</span>
                              </span>
                            )}
                              {item.stock! < 3 && (
                              <span className="text-xs text-[#1A1A1A]/50 ml-2">
                                Stock: <span className="text-red-600">Solo quedan {item.stock} unidades</span>
                              </span>
                            )}
                          </div>

                          {/* Precio */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#3A6EA5]">
                              ${(item.precio * item.cantidad).toLocaleString()}
                            </div>
                            <div className="text-sm text-[#1A1A1A]/60">
                              ${item.precio.toLocaleString()} c/u
                            </div>
                          </div>
                        </div>

                        {/* Stock warning */}
                        {item.cantidad >= 3 && (
                          <div className="mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-lg inline-block">
                            Stock máximo disponible
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Continuar comprando */}
              <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                href="/products"
                className="flex items-center gap-2 text-[#3A6EA5] hover:text-[#2E5A8C] font-medium mt-6 group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Continuar comprando
              </motion.a>
            </div>

            {/* Resumen del pedido */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] sticky top-6">
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Resumen del Pedido</h2>

                {/* Código promocional */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-[#1A1A1A] mb-2 block">
                    Código Promocional
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Ingresa tu código"
                      className="flex-1 px-4 py-2.5 rounded-lg border border-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/20 text-sm"
                    />
                    <button
                      onClick={applyPromo}
                      className="px-4 py-2.5 rounded-lg bg-[#3A6EA5] text-white text-sm font-medium hover:bg-[#2E5A8C] transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                  {promoApplied && (
                    <div className="mt-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      ✓ Código aplicado: {discount * 100}% de descuento
                    </div>
                  )}
                  {!promoApplied && promoCode && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      Código inválido.
                    </div>
                  )}
                </div>

                {/* Desglose de precios */}
                <div className="space-y-3 mb-6 pb-6 border-b border-[#F5F5F5]">
                  <div className="flex justify-between text-[#1A1A1A]/70">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento ({discount * 100}%)</span>
                      <span>-${discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#1A1A1A]/70">
                    <span>Envío</span>
                    <span>{shipping === 0 ? "Gratis" : `$${shipping}`}</span>
                  </div>
                  {subtotal < 5000 && (
                    <div className="text-xs text-[#3A6EA5] bg-[#3A6EA5]/10 px-3 py-2 rounded-lg">
                      Envío gratis en compras mayores a $5,000
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-[#1A1A1A]">Total</span>
                  <span className="text-3xl font-bold text-[#3A6EA5]">
                    ${total.toLocaleString()}
                  </span>
                </div>

                {/* Botón de checkout */}
                <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] text-white font-semibold hover:shadow-lg transition-all duration-300 mb-3 flex items-center justify-center gap-2">
                  Proceder al pago
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>

                {/* Métodos de pago */}
                <div className="text-center">
                  <p className="text-xs text-[#1A1A1A]/50 mb-3">Métodos de pago seguros</p>
                  <div className="flex justify-center gap-2">
                    {["Visa", "Mastercard", "PayPal"].map((method) => (
                      <div
                        key={method}
                        className="px-3 py-1.5 rounded-md bg-[#F5F5F5] text-[#1A1A1A]/60 text-xs font-medium"
                      >
                        {method}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Garantías */}
                <div className="mt-6 pt-6 border-t border-[#F5F5F5] space-y-3">
                  <div className="flex items-center gap-3 text-sm text-[#1A1A1A]/70">
                    <svg className="w-5 h-5 text-[#3A6EA5] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Compra 100% segura
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#1A1A1A]/70">
                    <svg className="w-5 h-5 text-[#3A6EA5] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    30 días para devoluciones
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#1A1A1A]/70">
                    <svg className="w-5 h-5 text-[#3A6EA5] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Envío express disponible
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