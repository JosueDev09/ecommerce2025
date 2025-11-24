"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MapPin, ChevronDown, ChevronUp } from "lucide-react";

interface ShippingAddressSectionProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  openSection: number;
  completedSections: number[];
  toggleSection: (section: number) => void;
  handleSectionComplete: (section: number) => void;
}

export default function ShippingAddressSection({
  formData,
  handleInputChange,
  openSection,
  completedSections,
  toggleSection,
  handleSectionComplete,
}: ShippingAddressSectionProps) {
  const isFormValid = formData.calle && formData.numeroExterior && formData.colonia && 
                      formData.codigoPostal && formData.ciudad && formData.estado;

  return (
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
                  placeholder="Entre qué calles está, color de casa, etc."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all text-sm resize-none"
                />
              </div>

              <button
                onClick={() => handleSectionComplete(2)}
                disabled={!isFormValid}
                className="w-full py-3 rounded-lg bg-[#3A6EA5] text-white font-semibold hover:bg-[#2E5A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
