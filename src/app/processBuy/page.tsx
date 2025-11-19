"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTienda } from "@/context/TiendaContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Check, MapPin, CreditCard, Package, ShoppingBag, User, Phone, Mail, ChevronDown, ChevronUp, Lock, Shield, Truck, Clock } from "lucide-react";
import { detectCardType } from "@/utils/detectarTipoTarjeta";
import { aplicarPromocion } from "@/hooks/aplicarCodigoPromocion";

export default function ProcessBuyPage() {
  const router = useRouter();
  const { carrito } = useTienda();
  const { user, isAuthenticated, isGuest } = useAuth();  
  const [openSection, setOpenSection] = useState<number>(1);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);
  const [cardType, setCardType] = useState<"visa" | "mastercard" | "amex" | "unknown">("unknown");
  const { promoCode, setPromoCode, discount, promoApplied, showPromoSuccess, showPromoError, applyPromo } = aplicarPromocion();

  // Función para detectar el tipo de tarjeta
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    // Información de contacto
    nombre: user?.strNombre || "",
    apellido: "",
    email: user?.strCorreo || "",
    telefono: user?.strTelefono || "",
    
    // Dirección de envío
    calle: "",
    numeroExterior: "",
    numeroInterior: "",
    colonia: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    referencias: "",
    
    // Método de envío
    metodoEnvio: "",
    
    // Método de pago
    metodoPago: "",
    
    // Tarjeta (si aplica)
    numeroTarjeta: "",
    nombreTarjeta: "",
    fechaExpiracion: "",
    cvv: "",
  });

  useEffect(() => {
    setMounted(true);
    // Validar que haya items en el carrito
    if (carrito.length === 0) {
      router.push("/cart");
    }
  }, [carrito, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Formateo especial para número de tarjeta (agregar espacios cada 4 dígitos)
    if (name === "numeroTarjeta") {
      const numeros = value.replace(/\s/g, "").replace(/\D/g, "");
      const formateado = numeros.match(/.{1,4}/g)?.join(" ") || numeros;
      setFormData(prev => ({ ...prev, [name]: formateado }));
      // Detectar tipo de tarjeta
      setCardType(detectCardType(formateado));
      return;
    }
    
    // Formateo para fecha de expiración (MM/AA)
    if (name === "fechaExpiracion") {
      const numeros = value.replace(/\D/g, "");
      let formateado = numeros;
      if (numeros.length >= 2) {
        formateado = numeros.slice(0, 2) + "/" + numeros.slice(2, 4);
      }
      setFormData(prev => ({ ...prev, [name]: formateado }));
      return;
    }
    
    // Formateo para CVV (solo números)
    if (name === "cvv") {
      const numeros = value.replace(/\D/g, "");
      setFormData(prev => ({ ...prev, [name]: numeros }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

//   const applyPromo = async () => {
//     try {
//       const response = await fetch("http://localhost:3000/api/graphql", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           query: `
//             query ($strCodigo: String!) {
//               obtenerDescuentoCodigo(strCodigo: $strCodigo) {
//                 intDescuentoCodigo
//                 strCodigo
//                 intPorcentajeDescuento
//                 datFechaInicio
//                 datFechaFin
//                 bolActivo                                
//               }
//             }
//           `,
//           variables: { strCodigo: promoCode },
//         }),
//       });
//       const result = await response.json();

//       if (result.errors) {
//         setPromoApplied(false);
//         setDiscount(0);
//         setShowPromoError(true);
//         setShowPromoSuccess(false);
//         setTimeout(() => setShowPromoError(false), 3000);
//         return;
//       }

//       const descuento = result.data.obtenerDescuentoCodigo;
//       setDiscount(descuento.intPorcentajeDescuento / 100);
//       setPromoApplied(true);
//       setShowPromoSuccess(true);
//       setShowPromoError(false);
//       setTimeout(() => setShowPromoSuccess(false), 3000);
//     } catch (error) {
//       console.error("Error al aplicar código de descuento:", error);
//       setPromoApplied(false);
//       setDiscount(0);
//       setShowPromoError(true);
//       setShowPromoSuccess(false);
//       setTimeout(() => setShowPromoError(false), 3000);
//     }
//   };

  const handleSectionComplete = (sectionNumber: number) => {
    if (!completedSections.includes(sectionNumber)) {
      setCompletedSections([...completedSections, sectionNumber]);
    }
    // Abrir siguiente sección
    if (sectionNumber < 4) {
      setOpenSection(sectionNumber + 1);
    }
  };

  const toggleSection = (sectionNumber: number) => {
    setOpenSection(openSection === sectionNumber ? 0 : sectionNumber);
  };

  const handleFinalizarCompra = async () => {
    // Aquí iría la lógica para procesar el pago
    console.log("Procesando compra:", formData);
    // Llamar a tu API GraphQL para crear la orden
    alert("¡Compra procesada exitosamente!");
    router.push("/");
  };

  // Calcular totales
  // Función para obtener el precio final de un producto (con o sin descuento)
  const obtenerPrecioFinal = (item: any) => {
    if (item.tieneDescuento && item.precioDescuento) {
      return item.precioDescuento;
    }
    return item.precio;
  };

  const subtotal = carrito.reduce((sum, item) => sum + obtenerPrecioFinal(item) * item.cantidad, 0);
  
  // Calcular descuento por productos con precio especial
  const descuentoProductos = carrito.reduce((sum, item) => {
    if (item.tieneDescuento && item.precioDescuento) {
      return sum + ((item.precio - item.precioDescuento) * item.cantidad);
    }
    return sum;
  }, 0);

  // Calcular descuento por código promocional
  const descuentoCodigo = subtotal * discount;
  
  // Calcular envío según método seleccionado
  let envio = 0;
  if (formData.metodoEnvio === "express") {
    envio = 299;
  } else if (formData.metodoEnvio === "estandar") {
    envio = subtotal > 5000 ? 0 : 150;
  } else if (formData.metodoEnvio === "recoger") {
    envio = 0;
  }
  
  const total = subtotal - descuentoCodigo + envio;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3A6EA5] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Notificación de código promocional aplicado */}
      <AnimatePresence>
        {showPromoSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50 bg-white border-l-4 border-emerald-500 rounded-lg shadow-xl p-4 flex items-center gap-3 max-w-md"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-emerald-900 text-sm">¡Código aplicado!</p>
              <p className="text-xs text-emerald-700">
                Descuento del {discount * 100}% aplicado a tu compra
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPromoError && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50 bg-white border-l-4 border-red-500 rounded-lg shadow-xl p-4 flex items-center gap-3 max-w-md"
          >
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-red-900 text-sm">Código inválido</p>
              <p className="text-xs text-red-700">
                El código ingresado no existe o ha expirado
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header fijo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/cart")}
                className="text-gray-600 hover:text-[#3A6EA5] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Finalizar compra
                </h1>
                <p className="text-sm text-gray-500">
                  {isGuest ? "Comprando como invitado" : user?.strNombre}
                </p>
              </div>
            </div>
            
            {/* Total en header (solo desktop) */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total a pagar</p>
                <p className="text-2xl font-bold text-[#3A6EA5]">${total.toLocaleString()}</p>
              </div>
              <Lock className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna principal - Formulario acordeón */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Sección 1: Información de contacto */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <button
                onClick={() => toggleSection(1)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    completedSections.includes(1)
                      ? "bg-green-500 text-white"
                      : openSection === 1
                      ? "bg-[#3A6EA5] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {completedSections.includes(1) ? <Check className="w-5 h-5" /> : "1"}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">Información de contacto</h3>
                    {completedSections.includes(1) && (
                      <p className="text-sm text-gray-500">{formData.nombre} {formData.apellido}</p>
                    )}
                  </div>
                </div>
                {openSection === 1 ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {openSection === 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Nombre <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            placeholder="Juan"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Apellido <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleInputChange}
                            placeholder="Pérez"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Correo electrónico <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="tu@email.com"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          placeholder="55 1234 5678"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all text-sm"
                          required
                        />
                      </div>

                      <button
                        onClick={() => handleSectionComplete(1)}
                        className="w-full py-3 rounded-lg bg-[#3A6EA5] text-white font-semibold hover:bg-[#2E5A8C] transition-colors"
                      >
                        Continuar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sección 2: Dirección de envío */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <button
                onClick={() => toggleSection(2)}
                disabled={!completedSections.includes(1)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    completedSections.includes(2)
                      ? "bg-green-500 text-white"
                      : openSection === 2
                      ? "bg-[#3A6EA5] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {completedSections.includes(2) ? <Check className="w-5 h-5" /> : "2"}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">Dirección de envío</h3>
                    {completedSections.includes(2) && (
                      <p className="text-sm text-gray-500">{formData.calle} {formData.numeroExterior}, {formData.ciudad}</p>
                    )}
                  </div>
                </div>
                {openSection === 2 ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {openSection === 2 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Calle <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="calle"
                            value={formData.calle}
                            onChange={handleInputChange}
                            placeholder="Av. Insurgentes"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Núm. Ext <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="numeroExterior"
                            value={formData.numeroExterior}
                            onChange={handleInputChange}
                            placeholder="123"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Núm. Interior
                          </label>
                          <input
                            type="text"
                            name="numeroInterior"
                            value={formData.numeroInterior}
                            onChange={handleInputChange}
                            placeholder="Depto 4B"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Colonia <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="colonia"
                            value={formData.colonia}
                            onChange={handleInputChange}
                            placeholder="Roma Norte"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            C.P. <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="codigoPostal"
                            value={formData.codigoPostal}
                            onChange={handleInputChange}
                            placeholder="06700"
                            maxLength={5}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Ciudad <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="ciudad"
                            value={formData.ciudad}
                            onChange={handleInputChange}
                            placeholder="CDMX"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Estado <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="estado"
                            value={formData.estado}
                            onChange={handleInputChange}
                            placeholder="CDMX"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Referencias
                        </label>
                        <textarea
                          name="referencias"
                          value={formData.referencias}
                          onChange={handleInputChange}
                          placeholder="Casa azul, entre calle X y Y"
                          rows={2}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all resize-none text-sm"
                        />
                      </div>

                      <button
                        onClick={() => handleSectionComplete(2)}
                        className="w-full py-3 rounded-lg bg-[#3A6EA5] text-white font-semibold hover:bg-[#2E5A8C] transition-colors"
                      >
                        Continuar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sección 3: Método de envío */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <button
                onClick={() => toggleSection(3)}
                disabled={!completedSections.includes(2)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    completedSections.includes(3)
                      ? "bg-green-500 text-white"
                      : openSection === 3
                      ? "bg-[#3A6EA5] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {completedSections.includes(3) ? <Check className="w-5 h-5" /> : "3"}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">Método de envío</h3>
                    {completedSections.includes(3) && formData.metodoEnvio && (
                      <p className="text-sm text-gray-500">
                        {formData.metodoEnvio === "express" && "Envío Express - 1-2 días"}
                        {formData.metodoEnvio === "estandar" && "Envío Estándar - 3-5 días"}
                        {formData.metodoEnvio === "recoger" && "Recoger en tienda"}
                      </p>
                    )}
                  </div>
                </div>
                {openSection === 3 ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {openSection === 3 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6 space-y-4">
                      <div className="space-y-3">
                        <label className="block p-4 border-2 rounded-lg cursor-pointer hover:border-[#3A6EA5] transition-all has-[:checked]:border-[#3A6EA5] has-[:checked]:bg-[#3A6EA5]/5">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="metodoEnvio"
                              value="express"
                              checked={formData.metodoEnvio === "express"}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-[#3A6EA5] focus:ring-[#3A6EA5] mt-0.5"
                            />
                            <Truck className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-gray-900 text-sm">Envío Express</p>
                                <p className="font-bold text-[#3A6EA5] text-sm">$299</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">Entrega en 1-2 días hábiles</p>
                              <p className="text-xs text-gray-400 mt-1">📦 Recibe tu pedido lo antes posible</p>
                            </div>
                          </div>
                        </label>

                        <label className="block p-4 border-2 rounded-lg cursor-pointer hover:border-[#3A6EA5] transition-all has-[:checked]:border-[#3A6EA5] has-[:checked]:bg-[#3A6EA5]/5">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="metodoEnvio"
                              value="estandar"
                              checked={formData.metodoEnvio === "estandar"}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-[#3A6EA5] focus:ring-[#3A6EA5] mt-0.5"
                            />
                            <Package className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-gray-900 text-sm">Envío Estándar</p>
                                <p className="font-bold text-[#3A6EA5] text-sm">
                                  {subtotal > 5000 ? "Gratis" : "$150"}
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">Entrega en 3-5 días hábiles</p>
                              {subtotal > 5000 ? (
                                <p className="text-xs text-green-600 mt-1 font-medium">✓ Envío gratis aplicado</p>
                              ) : (
                                <p className="text-xs text-gray-400 mt-1">💡 Gratis en compras mayores a $5,000</p>
                              )}
                            </div>
                          </div>
                        </label>

                        <label className="block p-4 border-2 rounded-lg cursor-pointer hover:border-[#3A6EA5] transition-all has-[:checked]:border-[#3A6EA5] has-[:checked]:bg-[#3A6EA5]/5">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="metodoEnvio"
                              value="recoger"
                              checked={formData.metodoEnvio === "recoger"}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-[#3A6EA5] focus:ring-[#3A6EA5] mt-0.5"
                            />
                            <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-gray-900 text-sm">Recoger en tienda</p>
                                <p className="font-bold text-green-600 text-sm">Gratis</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">Disponible en 24 horas</p>
                              <p className="text-xs text-gray-400 mt-1">🏪 Recoge en nuestra sucursal más cercana</p>
                            </div>
                          </div>
                        </label>
                      </div>

                      <button
                        onClick={() => handleSectionComplete(3)}
                        disabled={!formData.metodoEnvio}
                        className="w-full py-3 rounded-lg bg-[#3A6EA5] text-white font-semibold hover:bg-[#2E5A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continuar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sección 4: Método de pago */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <button
                onClick={() => toggleSection(4)}
                disabled={!completedSections.includes(3)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    completedSections.includes(4)
                      ? "bg-green-500 text-white"
                      : openSection === 4
                      ? "bg-[#3A6EA5] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {completedSections.includes(4) ? <Check className="w-5 h-5" /> : "4"}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">Método de pago</h3>
                    {completedSections.includes(4) && formData.metodoPago && (
                      <p className="text-sm text-gray-500">
                        {formData.metodoPago === "tarjeta" && "Tarjeta de crédito/débito"}
                        {formData.metodoPago === "paypal" && "PayPal"}
                        {formData.metodoPago === "efectivo" && "Pago contra entrega"}
                      </p>
                    )}
                  </div>
                </div>
                {openSection === 4 ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {openSection === 4 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6 space-y-4">
                      <div className="space-y-3">
                        <label className="block p-4 border-2 rounded-lg cursor-pointer hover:border-[#3A6EA5] transition-all has-[:checked]:border-[#3A6EA5] has-[:checked]:bg-[#3A6EA5]/5">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="metodoPago"
                              value="tarjeta"
                              checked={formData.metodoPago === "tarjeta"}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-[#3A6EA5] focus:ring-[#3A6EA5]"
                            />
                            <CreditCard className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">Tarjeta de crédito/débito</p>
                              <p className="text-xs text-gray-500">Visa, Mastercard, American Express</p>
                            </div>
                          </div>
                        </label>

                        <label className="block p-4 border-2 rounded-lg cursor-pointer hover:border-[#3A6EA5] transition-all has-[:checked]:border-[#3A6EA5] has-[:checked]:bg-[#3A6EA5]/5">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="metodoPago"
                              value="paypal"
                              checked={formData.metodoPago === "paypal"}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-[#3A6EA5] focus:ring-[#3A6EA5]"
                            />
                            <div className="w-5 h-5 bg-[#0070BA] rounded flex items-center justify-center text-white text-xs font-bold">
                              P
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">PayPal</p>
                              <p className="text-xs text-gray-500">Paga con tu cuenta PayPal</p>
                            </div>
                          </div>
                        </label>

                        <label className="block p-4 border-2 rounded-lg cursor-pointer hover:border-[#3A6EA5] transition-all has-[:checked]:border-[#3A6EA5] has-[:checked]:bg-[#3A6EA5]/5">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="metodoPago"
                              value="efectivo"
                              checked={formData.metodoPago === "efectivo"}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-[#3A6EA5] focus:ring-[#3A6EA5]"
                            />
                            <Package className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">Pago contra entrega</p>
                              <p className="text-xs text-gray-500">Paga en efectivo al recibir</p>
                            </div>
                          </div>
                        </label>
                      </div>

                      {formData.metodoPago === "tarjeta" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-6 pt-4 border-t border-gray-200"
                        >
                          {/* Visualización de la tarjeta */}
                          <div className="relative max-w-sm mx-auto">
                            <div className="w-full h-48 rounded-xl bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa] p-5 shadow-2xl relative overflow-hidden">
                              {/* Patrón de fondo */}
                              <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
                              </div>

                              {/* Chip de la tarjeta */}
                              <div className="relative z-10">
                                <div className="w-10 h-8 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded mb-3 shadow-md">
                                  <div className="grid grid-cols-2 gap-0.5 p-1 h-full">
                                    <div className="bg-yellow-600 rounded-sm"></div>
                                    <div className="bg-yellow-600 rounded-sm"></div>
                                    <div className="bg-yellow-600 rounded-sm"></div>
                                    <div className="bg-yellow-600 rounded-sm"></div>
                                  </div>
                                </div>

                                {/* Número de tarjeta */}
                                <div className="text-white text-lg font-mono tracking-wider mb-4 mt-4">
                                  {formData.numeroTarjeta || "•••• •••• •••• ••••"}
                                </div>

                                {/* Nombre y fecha */}
                                <div className="flex justify-between items-end">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white/60 text-[9px] uppercase mb-0.5 tracking-wide">Titular</p>
                                    <p className="text-white text-xs font-semibold uppercase tracking-wide truncate">
                                      {formData.nombreTarjeta || "NOMBRE APELLIDO"}
                                    </p>
                                  </div>
                                  <div className="text-right ml-4">
                                    <p className="text-white/60 text-[9px] uppercase mb-0.5 tracking-wide">Expira</p>
                                    <p className="text-white text-xs font-mono tracking-wide">
                                      {formData.fechaExpiracion || "MM/AA"}
                                    </p>
                                  </div>
                                </div>

                                {/* Logo dinámico según tipo de tarjeta */}
                                <div className="absolute top-4 right-4">
                                  {cardType === "visa" && (
                                    <div className="text-white font-bold text-xl italic">VISA</div>
                                  )}
                                  {cardType === "mastercard" && (
                                    <div className="flex gap-0.5">
                                      <div className="w-7 h-7 rounded-full bg-red-500 opacity-80"></div>
                                      <div className="w-7 h-7 rounded-full bg-yellow-400 opacity-80 -ml-3"></div>
                                    </div>
                                  )}
                                  {cardType === "amex" && (
                                    <div className="text-white font-bold text-sm">
                                      <div>AMERICAN</div>
                                      <div className="text-xs">EXPRESS</div>
                                    </div>
                                  )}
                                  {cardType === "unknown" && (
                                    <div className="w-8 h-8 rounded border-2 border-white/30"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Formulario de entrada */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Número de tarjeta <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  name="numeroTarjeta"
                                  value={formData.numeroTarjeta}
                                  onChange={handleInputChange}
                                  placeholder="1234 5678 9012 3456"
                                  maxLength={19}
                                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all text-base font-mono"
                                  required
                                />
                                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Nombre del titular <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="nombreTarjeta"
                                value={formData.nombreTarjeta}
                                onChange={handleInputChange}
                                placeholder="Nombre como aparece en la tarjeta"
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all uppercase text-base"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                  Fecha de expiración <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  name="fechaExpiracion"
                                  value={formData.fechaExpiracion}
                                  onChange={handleInputChange}
                                  placeholder="MM/AA"
                                  maxLength={5}
                                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all font-mono text-base"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                  CVV <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    name="cvv"
                                    value={formData.cvv}
                                    onChange={handleInputChange}
                                    placeholder="123"
                                    maxLength={4}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all font-mono text-base"
                                    required
                                  />
                                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">3 dígitos en el reverso</p>
                              </div>
                            </div>

                            {/* Mensaje de seguridad */}
                            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-green-900">Pago 100% seguro</p>
                                <p className="text-xs text-green-700 mt-0.5">
                                  Tu información está protegida con encriptación SSL de 256 bits
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <button
                        onClick={() => handleSectionComplete(4)}
                        disabled={!formData.metodoPago || (formData.metodoPago === "tarjeta" && (!formData.numeroTarjeta || !formData.nombreTarjeta || !formData.fechaExpiracion || !formData.cvv))}
                        className="w-full py-3 rounded-lg bg-[#3A6EA5] text-white font-semibold hover:bg-[#2E5A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirmar método de pago
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Columna lateral - Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Tu pedido ({carrito.length} {carrito.length === 1 ? "producto" : "productos"})
                </h3>
              </div>

              <div className="p-6 max-h-80 overflow-y-auto space-y-4">
                {carrito.map((item) => (
                  <div key={`${item.id}-${item.color}-${item.talla}`} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.nombre}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {item.color && <span>Color: {item.color}</span>}
                        {item.talla && <span>• Talla: {item.talla}</span>}
                      </div>
                      {item.tieneDescuento && item.precioDescuento && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-semibold">
                          Con descuento
                        </span>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">Cant: {item.cantidad}</span>
                        <div className="text-right">
                          {item.tieneDescuento && item.precioDescuento ? (
                            <div>
                              <span className="text-sm font-semibold text-emerald-600">
                                ${(item.precioDescuento * item.cantidad).toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-400 line-through ml-1">
                                ${(item.precio * item.cantidad).toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-gray-900">
                              ${(item.precio * item.cantidad).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-200 space-y-3">
                {/* Código promocional */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Código Promocional
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Ingresa tu código"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/20 text-sm"
                    />
                    <button
                      onClick={applyPromo}
                      className="px-4 py-2 rounded-lg bg-[#3A6EA5] text-white text-sm font-medium hover:bg-[#2E5A8C] transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                  {showPromoSuccess && (
                    <div className="mt-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      Código aplicado: {discount * 100}% de descuento
                    </div>
                  )}
                  {showPromoError && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      Código inválido o expirado
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
                </div>
                
                {descuentoProductos > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Descuentos en productos</span>
                    <span className="font-medium">-${descuentoProductos.toLocaleString()}</span>
                  </div>
                )}
                
                {descuentoCodigo > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Descuento código ({discount * 100}%)</span>
                    <span className="font-medium">-${descuentoCodigo.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Envío</span>
                  <span className="font-medium">{envio === 0 ? "Gratis" : `$${envio}`}</span>
                </div>
                {formData.metodoEnvio === "estandar" && subtotal < 5000 && (
                  <div className="text-xs text-[#3A6EA5] bg-[#3A6EA5]/10 px-3 py-2 rounded-lg">
                    💡 Faltan ${(5000 - subtotal).toLocaleString()} para envío gratis estándar
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#3A6EA5]">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={handleFinalizarCompra}
                  disabled={!completedSections.includes(4)}
                  className="w-full py-3.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Finalizar compra segura
                </button>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Transacción segura y encriptada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
