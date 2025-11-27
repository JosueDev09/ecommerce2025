"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, AlertTriangle, CreditCard, ArrowLeft } from "lucide-react";

function FailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams.get("payment_id");
  const preferenceId = searchParams.get("preference_id");
  const status = searchParams.get("status");

  useEffect(() => {
    const verificarPago = async () => {
      try {
        console.log("🔍 Verificando estado del pago rechazado...");
        
        if (preferenceId) {
          const response = await fetch("http://localhost:3000/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                query ObtenerEstadoPago($strPreferenciaId: String!) {
                  obtenerEstadoPago(strPreferenciaId: $strPreferenciaId) {
                    intPago
                    intPedido
                    dblMonto
                    strEstado
                    tbPedido {
                      intPedido
                      dblTotal
                      strEstado
                    }
                  }
                }
              `,
              variables: {
                strPreferenciaId: preferenceId,
              },
            }),
          });

          const result = await response.json();
          
          if (!result.errors) {
            setPaymentData(result.data.obtenerEstadoPago);
          }
        }
      } catch (error) {
        console.error("Error al verificar pago:", error);
      } finally {
        setLoading(false);
      }
    };

    verificarPago();
  }, [paymentId, preferenceId, status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando estado del pago...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
      >
        {/* Cabecera con ícono de error */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Pago Rechazado
          </h1>
          <p className="text-gray-600">
            No se pudo procesar tu pago
          </p>
        </motion.div>

        {/* Información del intento de pago */}
        {paymentData && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Detalles del problema
                </h3>
                <p className="text-sm text-gray-700">
                  Tu pago fue rechazado por el procesador de pagos. Esto puede deberse a:
                </p>
              </div>
            </div>
            
            <ul className="space-y-2 text-sm text-gray-700 ml-9">
              <li>• Fondos insuficientes en la tarjeta</li>
              <li>• Datos de tarjeta incorrectos</li>
              <li>• La tarjeta está vencida o bloqueada</li>
              <li>• Límite de compras excedido</li>
              <li>• Restricciones del banco emisor</li>
            </ul>

            {paymentData.intPedido && (
              <div className="mt-4 pt-4 border-t border-red-200">
                <p className="text-sm text-gray-600">
                  Número de pedido: <span className="font-bold">#{paymentData.intPedido}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Monto: <span className="font-bold">${paymentData.dblMonto?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recomendaciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            ¿Qué puedes hacer?
          </h3>
          
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">1.</span>
              <span>Verifica que los datos de tu tarjeta sean correctos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">2.</span>
              <span>Asegúrate de tener fondos suficientes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">3.</span>
              <span>Contacta a tu banco si el problema persiste</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">4.</span>
              <span>Intenta con otra tarjeta o método de pago</span>
            </li>
          </ol>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push("/processBuy")}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Intentar de nuevo
          </button>
          <button
            onClick={() => router.push("/cart")}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al carrito
          </button>
        </div>

        {/* Link de ayuda */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Necesitas ayuda?{" "}
            <button
              onClick={() => router.push("/quejas")}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Contacta con soporte
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function FailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <FailureContent />
    </Suspense>
  );
}
