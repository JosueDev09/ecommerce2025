"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Truck, Clock, Package, ChevronDown, ChevronUp } from "lucide-react";

interface ShippingMethodSectionProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  openSection: number;
  completedSections: number[];
  toggleSection: (section: number) => void;
  handleSectionComplete: (section: number) => void;
  subtotal: number;
}

export default function ShippingMethodSection({
  formData,
  handleInputChange,
  openSection,
  completedSections,
  toggleSection,
  handleSectionComplete,
  subtotal,
}: ShippingMethodSectionProps) {
  return (
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
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-600"
          }`}>
            {completedSections.includes(3) ? <Check className="w-5 h-5" /> : "3"}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Método de envío</h3>
            {completedSections.includes(3) && formData.metodoEnvio && (
              <p className="text-sm text-gray-500">
                {formData.metodoEnvio === "express" && "Envío Express"}
                {formData.metodoEnvio === "estandar" && "Envío Estándar"}
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
            <div className="p-6 space-y-3">
              <label className="block p-4 border-2 cursor-pointer hover:border-[#3A6EA5] transition-all has-[:checked]:border-[#3A6EA5] has-[:checked]:bg-[#3A6EA5]/5">
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="metodoEnvio"
                    value="express"
                    checked={formData.metodoEnvio === "express"}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-[#3A6EA5] focus:ring-[#3A6EA5]"
                  />
                  <Truck className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 text-sm">Envío Express</p>
                      <p className="font-bold text-gray-900 text-sm">$299</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Llega en 24 horas</p>
                    <p className="text-xs text-gray-400 mt-1">⚡ El más rápido, perfecto para urgencias</p>
                  </div>
                </div>
              </label>

              <label className="block p-4 border-2 cursor-pointer hover:border-[#3A6EA5] transition-all has-[:checked]:border-[#3A6EA5] has-[:checked]:bg-[#3A6EA5]/5">
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="metodoEnvio"
                    value="estandar"
                    checked={formData.metodoEnvio === "estandar"}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-[#3A6EA5] focus:ring-[#3A6EA5]"
                  />
                  <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 text-sm">Envío Estándar</p>
                      <p className="font-bold text-gray-900 text-sm">
                        {subtotal > 5000 ? (
                          <span className="text-green-600">Gratis</span>
                        ) : (
                          "$150"
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Llega en 3-5 días hábiles</p>
                    <p className="text-xs text-gray-400 mt-1">
                      📦 {subtotal > 5000 ? "¡Envío gratis en tu compra!" : "Gratis en compras mayores a $5,000"}
                    </p>
                  </div>
                </div>
              </label>

              <label className="block p-4 border-2 cursor-pointer hover:border-[#3A6EA5] transition-all has-[:checked]:border-[#3A6EA5] has-[:checked]:bg-[#3A6EA5]/5">
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="metodoEnvio"
                    value="recoger"
                    checked={formData.metodoEnvio === "recoger"}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-black focus:ring-black"
                  />
                  <Package className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
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

              <button
                onClick={() => handleSectionComplete(3)}
                disabled={!formData.metodoEnvio}
                className="w-full py-3 bg-black text-white font-semibold hover:bg-[#2E5A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
