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

  useEffect(() => {
    setMounted(true);
    // Validar que haya items en el carrito
    if (carrito.length === 0) {
      router.push("/cart");
    }
  }, [carrito, router]);

  const handleFinalizarCompra = () => {
    console.log("Datos de la compra:", formData);
    alert("¡Compra procesada exitosamente!");
    router.push("/");
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
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleFinalizarCompra}
                className="w-full py-4 rounded-lg bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                Finalizar compra - ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </motion.button>
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
