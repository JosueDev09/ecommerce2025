"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MapPin, ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react";
import { useShippingAddress } from "@/hooks/useShippingAddress";
import { useEffect, useState } from "react";

interface ShippingAddressSectionProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  openSection: number;
  completedSections: number[];
  toggleSection: (section: number) => void;
  handleSectionComplete: (section: number) => void;
  setFormData: (data: any) => void;
}

export default function ShippingAddressSection({
  formData,
  handleInputChange,
  openSection,
  completedSections,
  toggleSection,
  handleSectionComplete,
  setFormData,
}: ShippingAddressSectionProps) {
  const { loading, error, addresses, selectedAddressId, selectAddress, saveAddress, hasAddresses } = useShippingAddress();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // 🔄 Auto-completar con dirección seleccionada
  useEffect(() => {
    if (selectedAddressId && addresses.length > 0 && openSection === 2 && !isCreatingNew) {
      const selectedAddress = addresses.find(addr => addr.intDireccion === selectedAddressId);
      
      if (selectedAddress) {
        console.log("📍 Auto-completando dirección seleccionada:", selectedAddress);
        setFormData((prev: any) => ({
          ...prev,
          calle: selectedAddress.strCalle || "",
          numeroExterior: selectedAddress.strNumeroExterior || "",
          numeroInterior: selectedAddress.strNumeroInterior || "",
          colonia: selectedAddress.strColonia || "",
          codigoPostal: selectedAddress.strCP || "",
          ciudad: selectedAddress.strCiudad || "",
          estado: selectedAddress.strEstado || "",
          referencias: selectedAddress.strReferencias || "",
        }));
      }
    }
  }, [selectedAddressId, addresses, openSection, isCreatingNew]);

  const isFormValid = formData.calle && formData.numeroExterior && formData.colonia && 
                      formData.codigoPostal && formData.ciudad && formData.estado;

  const handleContinue = async () => {
    if (!isFormValid) return;

    // 💾 Guardar dirección en la base de datos
    const addressData = {
      strCalle: formData.calle,
      strNumeroExterior: formData.numeroExterior,
      strNumeroInterior: formData.numeroInterior || "",
      strColonia: formData.colonia,
      strCP: formData.codigoPostal,
      strCiudad: formData.ciudad,
      strEstado: formData.estado,
      strPais: "México", // Valor por defecto
      strReferencias: formData.referencias || "",
    };

    const savedAddress = await saveAddress(addressData, isCreatingNew);
    
    if (savedAddress) {
      console.log("✅ Dirección guardada exitosamente");
      setIsCreatingNew(false);
      handleSectionComplete(2);
    } else {
      console.error("❌ Error al guardar la dirección");
    }
  };

  const handleSelectAddress = (intDireccion: number) => {
    selectAddress(intDireccion);
    setIsCreatingNew(false);
  };

  const handleNewAddress = () => {
    setIsCreatingNew(true);
    // Limpiar el formulario
    setFormData((prev: any) => ({
      ...prev,
      calle: "",
      numeroExterior: "",
      numeroInterior: "",
      colonia: "",
      codigoPostal: "",
      ciudad: "",
      estado: "",
      referencias: "",
    }));
  };

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
              {/* Selector de direcciones existentes */}
              {hasAddresses && !isCreatingNew && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">Mis direcciones guardadas</h4>
                    <button
                      onClick={handleNewAddress}
                      className="text-sm text-[#3A6EA5] hover:text-[#2E5A8C] font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Nueva dirección
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {addresses.map((address) => (
                      <label
                        key={address.intDireccion}
                        className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedAddressId === address.intDireccion
                            ? "border-[#3A6EA5] bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={selectedAddressId === address.intDireccion}
                            onChange={() => handleSelectAddress(address.intDireccion!)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {address.strCalle} {address.strNumeroExterior}
                              {address.strNumeroInterior && `, ${address.strNumeroInterior}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.strColonia}, {address.strCiudad}, {address.strEstado}
                            </p>
                            <p className="text-sm text-gray-500">C.P. {address.strCP}</p>
                            {address.strReferencias && (
                              <p className="text-xs text-gray-500 mt-1">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {address.strReferencias}
                              </p>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Botón continuar con dirección seleccionada */}
                  <button
                    onClick={() => handleSectionComplete(2)}
                    disabled={!selectedAddressId}
                    className="w-full py-3 rounded-lg bg-[#3A6EA5] text-white font-semibold hover:bg-[#2E5A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar con esta dirección
                  </button>
                </div>
              )}

              {/* Formulario de dirección (nueva o sin direcciones previas) */}
              {(!hasAddresses || isCreatingNew) && (
                <>
                  {isCreatingNew && (
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700">Nueva dirección</h4>
                      <button
                        onClick={() => setIsCreatingNew(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        ← Volver a mis direcciones
                      </button>
                    </div>
                  )}

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

              {/* Mensaje de error si hay */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleContinue}
                disabled={!isFormValid || loading}
                className="w-full py-3 rounded-lg bg-[#3A6EA5] text-white font-semibold hover:bg-[#2E5A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>{isCreatingNew ? "Guardar nueva dirección" : "Guardar y continuar"}</span>
                )}
              </button>
              </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
