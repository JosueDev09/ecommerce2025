"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Package, ChevronDown, ChevronUp, Plus, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { usePaymentCards } from "@/hooks/usePaymentCards";
import CreditCardForm from "./CreditCardForm";

interface PaymentMethodSectionProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  openSection: number;
  completedSections: number[];
  toggleSection: (section: number) => void;
  handleSectionComplete: (section: number) => void;
  cardType: "visa" | "mastercard" | "amex" | "unknown";
  esTarjetaElegibleMSI: boolean;
  total: number;
  setFormData: (data: any) => void;
}

export default function PaymentMethodSection({
  formData,
  handleInputChange,
  openSection,
  completedSections,
  toggleSection,
  handleSectionComplete,
  cardType,
  esTarjetaElegibleMSI,
  total,
  setFormData,
}: PaymentMethodSectionProps) {
  const { loading, error, cards, selectedCardId, selectCard, saveCard, deleteCard, hasCards } = usePaymentCards();
  const [isAddingNewCard, setIsAddingNewCard] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // Auto-completar con tarjeta seleccionada
  useEffect(() => {
    if (selectedCardId && cards.length > 0 && formData.metodoPago === "tarjeta" && !isAddingNewCard) {
      const selectedCard = cards.find(card => card.intTarjeta === selectedCardId);
      
      if (selectedCard) {
        console.log("💳 Auto-completando tarjeta guardada:");
        console.log("   - ID:", selectedCard.intTarjeta);
        console.log("   - Número guardado:", selectedCard.strNumeroTarjeta);
        console.log("   - Longitud:", selectedCard.strNumeroTarjeta?.length);
        console.log("   - Últimos 4:", selectedCard.strNumeroTarjeta?.slice(-4));
        
        setFormData((prev: any) => ({
          ...prev,
          numeroTarjeta: selectedCard.strNumeroTarjeta, // Número completo del backend
          nombreTarjeta: selectedCard.strNombreTarjeta,
          tipoTarjeta: selectedCard.strTipoTarjeta,
          fechaExpiracion: selectedCard.strFechaExpiracion,
          usandoTarjetaGuardada: true,
          idTarjetaGuardada: selectedCard.intTarjeta,
        }));
      }
    }
  }, [selectedCardId, cards, formData.metodoPago, isAddingNewCard]);

  const isFormValid = formData.metodoPago && 
    (formData.metodoPago !== "tarjeta" || 
      (formData.usandoTarjetaGuardada && formData.cvv && formData.cvv.length >= 3) || // Si usa tarjeta guardada, requiere CVV
        (formData.numeroTarjeta && formData.nombreTarjeta && formData.fechaExpiracion && formData.cvv && formData.tipoTarjeta));

  const handleSaveNewCard = async () => {
    if (!formData.numeroTarjeta || !formData.nombreTarjeta || !formData.fechaExpiracion || !formData.tipoTarjeta || !formData.cvv) {
      alert("Por favor completa todos los campos de la tarjeta");
      return;
    }

    try {
      // 1. Tokenizar la tarjeta con MercadoPago antes de guardar
      const { loadMercadoPago } = await import("@mercadopago/sdk-js");
      await loadMercadoPago();
      
      const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
      if (!publicKey) {
        alert("Error de configuración: Clave pública de MercadoPago no encontrada");
        return;
      }

      const mp = new (window as any).MercadoPago(publicKey);
      
      // Parsear fecha de expiración
      const [mes, anio] = formData.fechaExpiracion.split("/");
      
      // 🔥 IMPORTANTE: Limpiar el número de tarjeta (solo dígitos) para MercadoPago
      const numeroLimpio = formData.numeroTarjeta.replace(/\D/g, '');

      console.log("🔐 Tokenizando tarjeta para guardar...");
      console.log("📋 Número limpio (solo dígitos):", numeroLimpio);
      
      // Crear token con número limpio (solo dígitos)
      const cardToken = await mp.createCardToken({
        cardNumber: numeroLimpio, // ✅ Solo dígitos sin espacios
        cardholderName: formData.nombreTarjeta,
        cardExpirationMonth: mes,
        cardExpirationYear: anio,
        securityCode: formData.cvv,
        identificationType: "RFC",
        identificationNumber: "XAXX010101000"
      });

      console.log("✅ Token generado para guardar:", cardToken.id);

      // 2. Guardar tarjeta con el número completo (para poder regenerar token)
      const cardData = {
        strNumeroTarjeta: numeroLimpio, // 💾 Número completo sin espacios
        strNombreTarjeta: formData.nombreTarjeta,
        strTipoTarjeta: formData.tipoTarjeta,
        strFechaExpiracion: formData.fechaExpiracion,
        strTokenMercadoPago: cardToken.id, // 🔐 Guardar el token
      };

      console.log("💾 Guardando tarjeta con estos datos:", {
        strNumeroTarjeta: cardData.strNumeroTarjeta,
        longitudNumero: cardData.strNumeroTarjeta.length,
        ultimos4: cardData.strNumeroTarjeta.slice(-4),
        strNombreTarjeta: cardData.strNombreTarjeta,
        strTipoTarjeta: cardData.strTipoTarjeta,
        strFechaExpiracion: cardData.strFechaExpiracion,
        strTokenMercadoPago: cardData.strTokenMercadoPago ? "Token presente: " + cardData.strTokenMercadoPago : "NO PRESENTE"
      });

      const savedCard = await saveCard(cardData, true);
      
      if (savedCard) {
        console.log("✅ Tarjeta y token guardados exitosamente");
        setIsAddingNewCard(false);
        handleSectionComplete(4);
      } else {
        console.error("❌ Error al guardar la tarjeta");
      }
    } catch (error: any) {
      console.error("❌ Error al tokenizar/guardar tarjeta:", error);
      alert("Error al procesar la tarjeta. Verifica los datos ingresados.");
    }
  };

  const handleSelectCard = (intTarjeta: number) => {
    selectCard(intTarjeta);
    setIsAddingNewCard(false);
    setFormData((prev: any) => ({
      ...prev,
      cvv: "", // Limpiar CVV al cambiar de tarjeta
      usandoTarjetaGuardada: true,
    }));
  };

  const handleNewCard = () => {
    setIsAddingNewCard(true);
    // Limpiar el formulario
    setFormData((prev: any) => ({
      ...prev,
      numeroTarjeta: "",
      nombreTarjeta: "",
      fechaExpiracion: "",
      cvv: "",
      tipoTarjeta: "",
      mesesSinIntereses: "",
      usandoTarjetaGuardada: false,
    }));
  };

  const handleDeleteCard = async (intTarjeta: number) => {
    const success = await deleteCard(intTarjeta);
    if (success) {
    //  console.log("✅ Tarjeta eliminada");
      setShowDeleteConfirm(null);
    }
  };

  const getCardIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "visa":
        return "💳 Visa";
      case "mastercard":
        return "💳 Mastercard";
      case "amex":
        return "💳 Amex";
      default:
        return "💳";
    }
  };

  return (
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
                <div className="space-y-4">
                  {/* Selector de tarjetas guardadas */}
                  {hasCards && !isAddingNewCard && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-700">Mis tarjetas guardadas</h4>
                        <button
                          onClick={handleNewCard}
                          className="text-sm text-[#3A6EA5] hover:text-[#2E5A8C] font-medium flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Nueva tarjeta
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {cards.map((card) => {
                          // Mostrar solo últimos 4 dígitos en UI (por seguridad)
                          const ultimos4Digitos = card.strNumeroTarjeta.replace(/\D/g, '').slice(-4);
                          
                          return (
                          <div key={card.intTarjeta} className="relative">
                            <label
                              className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedCardId === card.intTarjeta
                                  ? "border-[#3A6EA5] bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  name="selectedCard"
                                  checked={selectedCardId === card.intTarjeta}
                                  onChange={() => handleSelectCard(card.intTarjeta!)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-gray-900">
                                      {getCardIcon(card.strTipoTarjeta)} •••• {ultimos4Digitos}
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setShowDeleteConfirm(card.intTarjeta!);
                                      }}
                                      className="text-red-500 hover:text-red-700 p-1"
                                      title="Eliminar tarjeta"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{card.strNombreTarjeta}</p>
                                  <p className="text-xs text-gray-500">Expira: {card.strFechaExpiracion}</p>
                                </div>
                              </div>
                            </label>
                            
                            {/* Modal de confirmación de eliminación */}
                            {showDeleteConfirm === card.intTarjeta && (
                              <div className="absolute inset-0 bg-white rounded-lg border-2 border-red-500 p-4 z-10">
                                <p className="text-sm font-medium text-gray-900 mb-2">
                                  ¿Eliminar esta tarjeta?
                                </p>
                                <p className="text-xs text-gray-600 mb-3">
                                  Esta acción no se puede deshacer
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDeleteCard(card.intTarjeta!)}
                                    disabled={loading}
                                    className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                                  >
                                    {loading ? "Eliminando..." : "Eliminar"}
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                        })}
                      </div>

                      {/* Mensaje de error si hay */}
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                          {error}
                        </div>
                      )}

                      {/* Campo CVV para tarjeta seleccionada */}
                      {selectedCardId && (
                        <div className="space-y-3">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700 mb-3">
                              🔒 Por seguridad, ingresa el CVV de tu tarjeta para continuar
                            </p>
                            <p className="text-xs text-gray-600 mb-3">
                              � Usaremos el token guardado de esta tarjeta para procesar el pago de forma segura
                            </p>
                            <div className="max-w-xs">
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                CVV <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="cvv"
                                value={formData.cvv || ""}
                                onChange={handleInputChange}
                                placeholder="123"
                                maxLength={4}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all text-sm"
                                required
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Los 3 o 4 dígitos en el reverso de tu tarjeta
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Botón continuar con tarjeta seleccionada */}
                      <button
                        onClick={() => handleSectionComplete(4)}
                        disabled={!selectedCardId || !formData.cvv || formData.cvv.length < 3}
                        className="w-full py-3 rounded-lg bg-[#3A6EA5] text-white font-semibold hover:bg-[#2E5A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continuar con esta tarjeta
                      </button>
                    </div>
                  )}

                  {/* Formulario de nueva tarjeta */}
                  {(!hasCards || isAddingNewCard) && (
                    <>
                      {isAddingNewCard && (
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700">Nueva tarjeta</h4>
                          <button
                            onClick={() => setIsAddingNewCard(false)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            ← Volver a mis tarjetas
                          </button>
                        </div>
                      )}

                      <CreditCardForm
                        formData={formData}
                        handleInputChange={handleInputChange}
                        cardType={cardType}
                        esTarjetaElegibleMSI={esTarjetaElegibleMSI}
                        total={total}
                      />

                      {/* Mensaje de error si hay */}
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                          {error}
                        </div>
                      )}

                      <button
                        onClick={handleSaveNewCard}
                        disabled={!formData.numeroTarjeta || !formData.nombreTarjeta || !formData.fechaExpiracion || !formData.cvv || loading}
                        className="w-full py-3 rounded-lg bg-[#3A6EA5] text-white font-semibold hover:bg-[#2E5A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Continuando con el pago...</span>
                          </>
                        ) : (
                          <span>Continuar con el pago</span>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Botón para otros métodos de pago (PayPal, Efectivo) */}
              {formData.metodoPago && formData.metodoPago !== "tarjeta" && (
                <button
                  onClick={() => handleSectionComplete(4)}
                  disabled={!isFormValid}
                  className="w-full py-3 rounded-lg bg-[#3A6EA5] text-white font-semibold hover:bg-[#2E5A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar método de pago
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
