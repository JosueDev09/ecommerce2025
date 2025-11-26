"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Check, X } from "lucide-react";

interface OrderSummaryProps {
  carrito: any[];
  subtotal: number;
  descuentoProductos: number;
  descuentoCodigo: number;
  envio: number;
  total: number;
  obtenerPrecioFinal: (item: any) => number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  promoApplied: boolean;
  showPromoSuccess: boolean;
  showPromoError: boolean;
  applyPromo: () => Promise<void>;
  mesesSinIntereses?: number;
  metodoPago?: string;
}

export default function OrderSummary({
  carrito,
  subtotal,
  descuentoProductos,
  descuentoCodigo,
  envio,
  total,
  obtenerPrecioFinal,
  promoCode,
  setPromoCode,
  promoApplied,
  showPromoSuccess,
  showPromoError,
  applyPromo,
  mesesSinIntereses,
  metodoPago,
}: OrderSummaryProps) {
  const pagoMensual = mesesSinIntereses && mesesSinIntereses > 0 
    ? total / mesesSinIntereses 
    : "";

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#3A6EA5]/10 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-[#3A6EA5]" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Resumen del pedido</h3>
          <p className="text-xs text-gray-500">{carrito.length} {carrito.length === 1 ? 'producto' : 'productos'}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
        {carrito.map((item, index) => (
          <div key={index} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
              <img
               src={item.imagen}
                alt={item.nombre}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.nombre}</p>
              <p className="text-xs text-gray-500 mt-0.5">Cantidad: {item.cantidad}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-bold text-gray-900">
                  ${obtenerPrecioFinal(item).toLocaleString()}
                </p>
                {item.tieneDescuento && item.precioDescuento && (
                  <>
                    <p className="text-xs text-gray-400 line-through">
                      ${item.precio.toLocaleString()}
                    </p>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-semibold">
                      -{Math.round(((item.precio - item.precioDescuento) / item.precio) * 100)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Código promocional */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Código promocional
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="DESCUENTO10"
            disabled={promoApplied}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#3A6EA5] focus:ring-1 focus:ring-[#3A6EA5] outline-none transition-all disabled:bg-gray-100 uppercase"
          />
          <button
            onClick={applyPromo}
            disabled={!promoCode || promoApplied}
            className="px-4 py-2 rounded-lg bg-[#3A6EA5] text-white text-sm font-medium hover:bg-[#2E5A8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Aplicar
          </button>
        </div>

        <AnimatePresence>
          {showPromoSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-700">¡Código aplicado correctamente!</p>
            </motion.div>
          )}

          {showPromoError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
            >
              <X className="w-4 h-4 text-red-600" />
              <p className="text-xs text-red-700">Código inválido o expirado</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
        </div>

        {descuentoProductos > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento por productos</span>
            <span>-${descuentoProductos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        )}

        {descuentoCodigo > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento por código</span>
            <span>-${descuentoCodigo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Envío</span>
          <span>{envio === 0 ? 'Gratis' : `$${envio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}</span>
        </div>

        <div className="pt-3 mt-3 border-t-2 border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-[#3A6EA5]">
              ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Información de MSI */}
         
          {metodoPago === 'tarjeta' && (mesesSinIntereses && mesesSinIntereses > 0) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Meses Sin Intereses
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-blue-700">
                  {mesesSinIntereses} pagos
                </span>
                <span className="text-sm text-blue-600">de</span>
                <span className="text-lg font-bold text-blue-700">
                  ${pagoMensual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Sin intereses • Pago mensual
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
