"use client";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, Home } from "lucide-react";

interface OrderStatusTimelineProps {
  currentStatus: string;
}

export default function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  const steps = [
    {
      id: "Confirmado",
      label: "Orden Confirmada",
      icon: CheckCircle,
      description: "Su orden ha sido recibida",
    },
    {
      id: "Preparacion",
      label: "En Preparación",
      icon: Package,
      description: "Su orden está en preparación",
    },
    {
      id: "Enviado",
      label: "Enviado",
      icon: Truck,
      description: "Su orden está en tránsito",
    },
    {
      id: "Entregado",
      label: "Entregado",
      icon: Home,
      description: "Su orden ha sido entregada",
    },
  ];

  // Mapear el estado de la BD al índice del step
  const getStatusIndex = (status: string): number => {
    const statusMap: { [key: string]: number } = {
      "Confirmado": 0,
      "confirmado": 0,
      "CONFIRMADO": 0,
      "Preparacion": 1,
      "preparacion": 1,
      "PREPARACION": 1,
      "En Preparación": 1,
      "en preparacion": 1,
      "EN PREPARACION": 1,
      "Enviado": 2,
      "enviado": 2,
      "ENVIADO": 2,
      "En Camino": 2,
      "en camino": 2,
      "EN CAMINO": 2,
      "Entregado": 3,
      "entregado": 3,
      "ENTREGADO": 3,
    };
    
    return statusMap[status] ?? 0; // Default a 0 si no encuentra el estado
  };

  //console.log('Current Status in Timeline:', currentStatus);
  const statusIndex = getStatusIndex(currentStatus);

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const isCompleted = index < statusIndex;
        const isCurrent = index === statusIndex;
        const Icon = step.icon;

        return (
          <div key={step.id} className="relative flex items-start gap-4">
            {/* Línea vertical */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-5 top-12 w-[1px] h-12 transition-colors duration-500 ${
                  isCompleted ? "bg-white" : "bg-white/20"
                }`}
              />
            )}

            {/* Icono */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              className={`relative z-10 flex items-center justify-center w-10 h-10 border transition-all duration-500 ${
                isCompleted
                  ? "bg-white border-white"
                  : isCurrent
                  ? "bg-white/10 border-white"
                  : "bg-transparent border-white/30"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors duration-500 ${
                  isCompleted
                    ? "text-black"
                    : isCurrent
                    ? "text-white"
                    : "text-white/50"
                }`}
              />
            </motion.div>

            {/* Información */}
            <div className="flex-1 pt-1">
              <h4
                className={`font-[family-name:var(--font-playfair)] text-base tracking-tight transition-colors duration-500 ${
                  isCompleted || isCurrent ? "text-white" : "text-white/50"
                }`}
              >
                {step.label}
              </h4>
              <p className={`font-[family-name:var(--font-inter)] text-xs tracking-wide mt-1 transition-colors duration-500 ${
                isCompleted || isCurrent ? "text-white/70" : "text-white/40"
              }`}>
                {step.description}
              </p>
              {isCurrent && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 text-white text-xs font-[family-name:var(--font-inter)] tracking-wide"
                >
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse "></span>
                  Estatus Actual
                </motion.div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
