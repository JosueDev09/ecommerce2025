"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, User, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";

interface ContactInfoSectionProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  openSection: number;
  completedSections: number[];
  toggleSection: (section: number) => void;
  handleSectionComplete: (section: number) => void;
}

export default function ContactInfoSection({
  formData,
  handleInputChange,
  openSection,
  completedSections,
  toggleSection,
  handleSectionComplete,
}: ContactInfoSectionProps) {
  return (
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
                  <div className="relative">
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-10 rounded-lg border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all"
                      required
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
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
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-10 rounded-lg border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pl-10 rounded-lg border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all"
                    required
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <button
                onClick={() => handleSectionComplete(1)}
                disabled={!formData.nombre || !formData.apellido || !formData.email || !formData.telefono}
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
