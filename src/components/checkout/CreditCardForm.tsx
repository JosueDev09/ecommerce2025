"use client";
import { motion } from "framer-motion";
import { CreditCard, Lock, Shield, Check } from "lucide-react";
import CreditCardVisualization from "./CreditCardVisualization";

interface CreditCardFormProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  cardType: "visa" | "mastercard" | "amex" | "unknown";
  esTarjetaElegibleMSI: boolean;
  total: number;
}

export default function CreditCardForm({
  formData,
  handleInputChange,
  cardType,
  esTarjetaElegibleMSI,
  total,
}: CreditCardFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-6 pt-4 border-t border-gray-200"
    >
      {/* Visualización de la tarjeta */}
      <CreditCardVisualization formData={formData} cardType={cardType} />

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
              maxLength={23}
              className="w-full px-4 py-3  border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all text-base font-mono"
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
            className="w-full px-4 py-3  border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all uppercase text-base"
            required
          />
        </div>

        {/* Tipo de tarjeta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tipo de tarjeta <span className="text-red-500">*</span>
          </label>
          <select
            name="tipoTarjeta"
            value={formData.tipoTarjeta}
            onChange={handleInputChange}
            className="w-full px-4 py-3  border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all text-base"
            required
          >
            <option value="">Selecciona el tipo</option>
            <option value="credito">Tarjeta de Crédito</option>
            <option value="debito">Tarjeta de Débito</option>
          </select>
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
              className="w-full px-4 py-3  border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all font-mono text-base"
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
                className="w-full px-4 py-3  border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all font-mono text-base"
                required
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">3 dígitos en el reverso</p>
          </div>
        </div>

        {/* Meses sin intereses */}
        {esTarjetaElegibleMSI && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">¡Tu tarjeta de crédito es participante!</p>
                <p className="text-xs text-blue-700">Puedes pagar a meses sin intereses</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Meses sin intereses
              </label>
              <select
                name="mesesSinIntereses"
                value={formData.mesesSinIntereses}
                onChange={handleInputChange}
                className="w-full px-4 py-3  border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all text-base"
              >
                <option value="0">Pago de contado</option>
                <option value="3">3 meses sin intereses</option>
                <option value="6">6 meses sin intereses</option>
                <option value="9">9 meses sin intereses</option>
                <option value="12">12 meses sin intereses</option>
              </select>
            </div>

            {formData.mesesSinIntereses && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-gray-50  border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pago mensual:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${(total / parseInt(formData.mesesSinIntereses)).toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.mesesSinIntereses} pagos de ${(total / parseInt(formData.mesesSinIntereses)).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} MXN
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Mensaje de seguridad */}
        <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 ">
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
  );
}
