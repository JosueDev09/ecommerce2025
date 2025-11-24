"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Package, ChevronDown, ChevronUp } from "lucide-react";
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
}: PaymentMethodSectionProps) {
  const isFormValid = formData.metodoPago && 
    (formData.metodoPago !== "tarjeta" || 
      (formData.numeroTarjeta && formData.nombreTarjeta && formData.fechaExpiracion && formData.cvv && formData.tipoTarjeta));

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
                <CreditCardForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                  cardType={cardType}
                  esTarjetaElegibleMSI={esTarjetaElegibleMSI}
                  total={total}
                />
              )}

              <button
                onClick={() => handleSectionComplete(4)}
                disabled={!isFormValid}
                className="w-full py-3 rounded-lg bg-[#3A6EA5] text-white font-semibold hover:bg-[#2E5A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar método de pago
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
