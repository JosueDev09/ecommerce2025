"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, CreditCard, Package, Mail, ArrowRight, XCircle, AlertCircle } from "lucide-react";

interface Step {
  text: string;
  afterText: string;
  icon: React.ReactNode;
  async?: boolean;
  duration?: number;
  action?: () => void;
}

interface PaymentLoadingStepsProps {
  isOpen: boolean;
  onComplete?: () => void;
  loaderStates: {
    isProcessing: boolean;
    isSavingOrder: boolean;
    sendingMails: boolean;
  };
  error?: string | null;
  onRetry?: () => void; // � Nueva prop para reintentar sin recargar
}

export default function PaymentLoadingSteps({ 
  isOpen, 
  onComplete,
  loaderStates,
  error,
  onRetry // � Recibir función de retry
}: PaymentLoadingStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [hasError, setHasError] = useState(false);
  
  // Usar ref para evitar dependencias circulares
  const completedStepsRef = useRef<number[]>([]);
  
  // Actualizar ref cuando completedSteps cambie
  useEffect(() => {
    completedStepsRef.current = completedSteps;
  }, [completedSteps]);

  // 🔴 Detectar errores
  useEffect(() => {
    if (error) {
      console.error("❌ Error detectado en PaymentLoadingSteps:", error);
      setHasError(true);
    }
  }, [error]);

  const steps: Step[] = [
    {
      text: "Procesando Pago",
      afterText: "Pago Verificado",
      icon: <CreditCard className="w-6 h-6" />,
      async: loaderStates.isProcessing,
    },
    {
      text: "Guardando Pedido",
      afterText: "Pedido Guardado",
      icon: <Package className="w-6 h-6" />,
      async: loaderStates.isSavingOrder,
    },
    {
      text: "Enviando Confirmación",
      afterText: "Email Enviado",
      icon: <Mail className="w-6 h-6" />,
      async: loaderStates.sendingMails,
    },
    {
      text: "Redirigiendo",
      afterText: "Completado",
      icon: <ArrowRight className="w-6 h-6" />,
      duration: 1000,
      action: onComplete,
    },
  ];

  // Monitorear cambios en los estados async
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    // Step 0: Processing payment
    if (currentStep === 0 && !loaderStates.isProcessing && !completedStepsRef.current.includes(0)) {
      setCompletedSteps(prev => [...prev, 0]);
      setTimeout(() => setCurrentStep(1), 800);
      return;
    }
    
    // Step 1: Saving order
    if (currentStep === 1 && !loaderStates.isSavingOrder && !completedStepsRef.current.includes(1)) {
      setCompletedSteps(prev => [...prev, 1]);
      setTimeout(() => setCurrentStep(2), 800);
      return;
    }
    
    // Step 2: Sending emails
    if (currentStep === 2 && !loaderStates.sendingMails && !completedStepsRef.current.includes(2)) {
      setCompletedSteps(prev => [...prev, 2]);
      setTimeout(() => setCurrentStep(3), 800);
      return;
    }
    
    // Step 3: Redirecting (final step)
    if (currentStep === 3 && !completedStepsRef.current.includes(3)) {
      setCompletedSteps(prev => [...prev, 3]);
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, loaderStates.isProcessing, loaderStates.isSavingOrder, loaderStates.sendingMails, isOpen]);

  if (!isOpen) return null;

  // 🔴 Mostrar pantalla de error si hay error
  if (hasError && error) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
          >
            {/* Error Icon */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
              >
                <XCircle className="w-10 h-10 text-red-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Pago Rechazado
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                No pudimos procesar tu pago
              </p>
            </div>

            {/* Error message */}
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">
                    Motivo del rechazo:
                  </p>
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>

            {/* Sugerencias */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                💡 Sugerencias:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Verifica que los datos de tu tarjeta sean correctos</li>
                <li>Asegúrate de tener fondos suficientes</li>
                <li>Intenta con otra tarjeta</li>
                <li>Contacta a tu banco si el problema persiste</li>
              </ul>
            </div>

            {/* Botón para cerrar */}
            <button
              onClick={() => {
                setHasError(false);
                if (onRetry) {
                  onRetry(); // Llamar función personalizada de retry
                } else {
                  window.location.reload(); // Fallback: recargar página
                }
              }}
              className="w-full py-3 bg-[#3A6EA5] text-white rounded-lg font-semibold hover:bg-[#2E5A8C] transition-colors"
            >
              Intentar nuevamente
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#3A6EA5] to-[#5A8EC8] rounded-full flex items-center justify-center"
            >
              <CreditCard className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Procesando tu Compra
            </h2>
            <p className="text-gray-600 text-sm">
              Por favor espera mientras confirmamos tu pedido
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isActive = currentStep === index;
              const isCompleted = completedSteps.includes(index);
              const isWaiting = currentStep < index;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl transition-all duration-300
                    ${isActive ? 'bg-blue-50 border-2 border-blue-200' : ''}
                    ${isCompleted ? 'bg-green-50 border-2 border-green-200' : ''}
                    ${isWaiting ? 'bg-gray-50 border-2 border-gray-200 opacity-50' : ''}
                  `}
                >
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive ? 'bg-blue-100 text-blue-600' : ''}
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isWaiting ? 'bg-gray-200 text-gray-400' : ''}
                  `}>
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      >
                        <CheckCircle className="w-6 h-6" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      step.icon
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <AnimatePresence mode="wait">
                      {isCompleted ? (
                        <motion.p
                          key="after"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="font-semibold text-green-700"
                        >
                          ✓ {step.afterText}
                        </motion.p>
                      ) : (
                        <motion.p
                          key="before"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`font-medium ${
                            isActive ? 'text-blue-700' : 'text-gray-600'
                          }`}
                        >
                          {step.text}
                          {isActive && <span className="ml-2 animate-pulse">...</span>}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Progress indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0"
                    >
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((completedSteps.length) / steps.length) * 100}%` 
                }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-[#3A6EA5] to-[#5A8EC8]"
              />
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              {completedSteps.length} de {steps.length} pasos completados
            </p>
          </div>

          {/* Info message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <p className="text-xs text-amber-800 text-center">
              <span className="font-semibold">⚠️ No cierres esta ventana</span>
              <br />
              Estamos procesando tu pago de forma segura
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
