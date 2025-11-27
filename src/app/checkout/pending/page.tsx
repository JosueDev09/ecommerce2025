"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, Package, AlertCircle, Home, ShoppingBag } from "lucide-react";

function PendingContent() {
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
        console.log("🔍 Verificando estado del pago pendiente...");
        
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
                      strMetodoEnvio
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
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando estado del pago...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
      >
        {/* Cabecera con ícono de pendiente */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4"
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Clock className="w-16 h-16 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Pago Pendiente
          </h1>
          <p className="text-gray-600">
            Tu pago está siendo procesado
          </p>
        </motion.div>

        {/* Información del pedido */}
        {paymentData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Número de pedido</p>
                <p className="text-lg font-bold text-gray-800">
                  #{paymentData.intPedido}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monto</p>
                <p className="text-lg font-bold text-yellow-600">
                  ${paymentData.dblMonto?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="border-t border-yellow-200 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="font-semibold text-gray-800">
                  Estado del pago: Pendiente
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Estamos esperando la confirmación del pago
              </p>
            </div>
          </div>
        )}

        {/* Información importante */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            ¿Por qué está pendiente?
          </h3>
          
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              Tu pago puede estar pendiente por varios motivos:
            </p>
            <ul className="space-y-2 ml-4">
              <li>• Estamos esperando confirmación del banco</li>
              <li>• El pago está siendo verificado por seguridad</li>
              <li>• Elegiste un método de pago que requiere aprobación manual</li>
              <li>• Pagaste en efectivo y aún no se ha acreditado</li>
            </ul>
          </div>
        </div>

        {/* Próximos pasos */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            ¿Qué pasa ahora?
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Te notificaremos por correo
                </p>
                <p className="text-sm text-gray-600">
                  Cuando el pago sea confirmado te enviaremos un correo con los detalles
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Revisa el estado en "Mis pedidos"
                </p>
                <p className="text-sm text-gray-600">
                  Puedes consultar el estado actualizado en tu cuenta
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Preparamos tu pedido
                </p>
                <p className="text-sm text-gray-600">
                  Una vez confirmado, comenzaremos a preparar tu envío
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tiempo estimado */}
        <motion.div
          className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 mb-6 text-center"
          animate={{
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <p className="text-sm font-semibold text-gray-800">
            ⏱️ Tiempo estimado de confirmación: 24-48 horas
          </p>
        </motion.div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push(`/pedido/${paymentData?.intPedido}`)}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Ver mi pedido
          </button>
          <button
            onClick={() => router.push("/inicio")}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Volver al inicio
          </button>
        </div>

        {/* Link de ayuda */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Tienes dudas?{" "}
            <button
              onClick={() => router.push("/quejas")}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Contáctanos
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function PendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <PendingContent />
    </Suspense>
  );
}
