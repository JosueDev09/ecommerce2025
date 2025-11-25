"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTienda } from "@/context/TiendaContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { aplicarPromocion } from "@/hooks/aplicarCodigoPromocion";
import { useCheckoutForm } from "@/hooks/useCheckoutForm";
import { useCheckoutCalculations } from "@/hooks/useCheckoutCalculations";
import { useCheckoutSections } from "@/hooks/useCheckoutSections";
import { useCheckoutSubmit } from "@/hooks/useCheckoutSubmit";
import ContactInfoSection from "@/components/checkout/ContactInfoSection";
import ShippingAddressSection from "@/components/checkout/ShippingAddressSection";
import ShippingMethodSection from "@/components/checkout/ShippingMethodSection";
import PaymentMethodSection from "@/components/checkout/PaymentMethodSection";
import OrderSummary from "@/components/checkout/OrderSummary";

export default function ProcessBuyPage() {
  const router = useRouter();
  const { carrito } = useTienda();
  const { user, isAuthenticated, isGuest } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Hooks personalizados
  const { formData, setFormData, cardType, esTarjetaElegibleMSI, handleInputChange } = useCheckoutForm();
  const { openSection, completedSections, toggleSection, handleSectionComplete } = useCheckoutSections();
  const { promoCode, setPromoCode, discount, promoApplied, showPromoSuccess, showPromoError, applyPromo } = aplicarPromocion();
  const { 
    subtotal, 
    descuentoProductos, 
    descuentoCodigo, 
    envio, 
    total, 
    obtenerPrecioFinal 
  } = useCheckoutCalculations(carrito as any, formData, discount);
  
  // Hook para procesar la compra
  const { finalizarCompra, isProcessing, error: checkoutError } = useCheckoutSubmit();

  useEffect(() => {
    setMounted(true);
    // Validar que haya items en el carrito
    if (carrito.length === 0) {
      router.push("/cart");
    }
  }, [carrito, router]);

  const handleFinalizarCompra = async () => {
    console.log("🛒 Iniciando proceso de compra...");
    console.log("📋 Datos del formulario:", formData);
    
    const resultado = await finalizarCompra(formData as any, total);
    
    if (resultado.success) {
      console.log("✅ Compra exitosa!", resultado);
      // El hook ya redirige a la página de confirmación
    } else {
      console.error("❌ Error en la compra:", resultado.error);
      alert(`Error: ${resultado.error}`);
    }
  };

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
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            ✓ Código promocional aplicado correctamente
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar Fijo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Botón de regreso */}
            <button
              onClick={() => router.push("/cart")}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Volver al carrito
            </button>

            {/* Título central */}
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-gray-900">
                Finalizar compra
              </h1>
              <p className="text-sm text-gray-500">
                {isGuest ? "Invitado" : user?.strNombre || "Usuario"}
              </p>
            </div>

            {/* Total (solo desktop) */}
            <div className="hidden md:flex items-center space-x-2">
              <Lock className="w-4 h-4 text-green-600" />
              <div className="text-right">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">
                   ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario principal */}
          <div className="lg:col-span-2 space-y-4">
            <ContactInfoSection
              formData={formData}
              handleInputChange={handleInputChange}
              openSection={openSection}
              completedSections={completedSections}
              toggleSection={toggleSection}
              handleSectionComplete={handleSectionComplete}
            />

            <ShippingAddressSection
              formData={formData}
              handleInputChange={handleInputChange}
              openSection={openSection}
              completedSections={completedSections}
              toggleSection={toggleSection}
              handleSectionComplete={handleSectionComplete}
            />

            <ShippingMethodSection
              formData={formData}
              handleInputChange={handleInputChange}
              openSection={openSection}
              completedSections={completedSections}
              toggleSection={toggleSection}
              handleSectionComplete={handleSectionComplete}
              subtotal={subtotal}
            />

            <PaymentMethodSection
              formData={formData}
              handleInputChange={handleInputChange}
              openSection={openSection}
              completedSections={completedSections}
              toggleSection={toggleSection}
              handleSectionComplete={handleSectionComplete}
              cardType={cardType}
              esTarjetaElegibleMSI={esTarjetaElegibleMSI}
              total={total}
            />

            {/* Botón finalizar compra */}
            {completedSections.includes(4) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {checkoutError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    ❌ {checkoutError}
                  </div>
                )}
                
                <button
                  onClick={handleFinalizarCompra}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-lg bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando compra...
                    </>
                  ) : (
                    `Finalizar compra - $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                  )}
                </button>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Resumen del pedido */}
          <div className="lg:col-span-1">
            <OrderSummary
              carrito={carrito}
              subtotal={subtotal}
              descuentoProductos={descuentoProductos}
              descuentoCodigo={descuentoCodigo}
              envio={envio}
              total={total}
              obtenerPrecioFinal={obtenerPrecioFinal}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              promoApplied={promoApplied}
              showPromoSuccess={showPromoSuccess}
              showPromoError={showPromoError}
              applyPromo={applyPromo}
              mesesSinIntereses={formData.mesesSinIntereses ? parseInt(formData.mesesSinIntereses) : 0}
              metodoPago={formData.metodoPago}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
