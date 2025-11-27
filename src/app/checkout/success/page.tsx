"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, ShoppingBag } from "lucide-react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentId = searchParams.get("payment_id");
  const preferenceId = searchParams.get("preference_id");
  const status = searchParams.get("status");

  useEffect(() => {
    const verificarPago = async () => {
      try {
        console.log("🔍 Verificando estado del pago...");
        console.log("Payment ID:", paymentId);
        console.log("Preference ID:", preferenceId);
        console.log("Status:", status);

        // Llamar al backend para verificar el estado del pago
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
                  strMercadoPagoId
                  datCreacion
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

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        setPaymentData(result.data.obtenerEstadoPago);
        setLoading(false);
      } catch (error: any) {
        console.error("❌ Error al verificar pago:", error);
        setError(error.message || "Error al verificar el estado del pago");
        setLoading(false);
      }
    };

    if (preferenceId) {
      verificarPago();
    } else {
      setError("No se encontró información del pago");
      setLoading(false);
    }
  }, [paymentId, preferenceId, status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md"
        >
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Círculo exterior animado */}
            <motion.div
              className="absolute inset-0 border-4 border-green-200 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Círculo medio animado */}
            <motion.div
              className="absolute inset-2 border-4 border-green-300 rounded-full"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.7, 0.3, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
            
            {/* Ícono central */}
            <motion.div
              className="absolute inset-4 bg-green-500 rounded-full flex items-center justify-center"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Package className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          <motion.h2
            className="text-2xl font-bold text-gray-800 mb-3"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Validando tu pago...
          </motion.h2>
          
          <p className="text-gray-600 mb-6">
            Estamos verificando el estado de tu transacción con MercadoPago
          </p>

          <div className="flex items-center justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-green-500 rounded-full"
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="mt-8 space-y-2 text-sm text-gray-500">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              ✓ Conectando con MercadoPago
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              ✓ Verificando estado del pago
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
            >
              ⏳ Actualizando pedido...
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Error al verificar pago
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/cart")}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Volver al carrito
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
      >
        {/* Cabecera con animación de éxito */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-600">
            Tu compra ha sido procesada correctamente
          </p>
        </motion.div>

        {/* Información del pedido */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Número de pedido</p>
              <p className="text-lg font-bold text-gray-800">
                #{paymentData?.intPedido}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total pagado</p>
              <p className="text-lg font-bold text-green-600">
                ${paymentData?.dblMonto?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Estado del pago:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                Aprobado
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estado del pedido:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {paymentData?.tbPedido?.strEstado}
              </span>
            </div>
          </div>
        </div>

        {/* Próximos pasos */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            ¿Qué sigue?
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Confirmación por correo</p>
                <p className="text-sm text-gray-600">
                  Te enviaremos los detalles de tu pedido al correo registrado
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Preparación del pedido</p>
                <p className="text-sm text-gray-600">
                  Comenzaremos a preparar tu pedido de inmediato
                </p>
              </div>
            </div>

            {paymentData?.tbPedido?.strMetodoEnvio !== "recoger" && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Envío a domicilio</p>
                  <p className="text-sm text-gray-600">
                    Te notificaremos cuando tu pedido sea enviado
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

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
            <ShoppingBag className="w-5 h-5" />
            Seguir comprando
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
