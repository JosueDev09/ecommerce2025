"use client";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, Home } from "lucide-react";

interface OrderStatusTimelineProps {
  currentStatus: "confirmado" | "preparacion" | "enviado" | "entregado";
}

export default function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  const steps = [
    {
      id: "confirmado",
      label: "Pedido Confirmado",
      icon: CheckCircle,
      description: "Tu pedido ha sido recibido",
    },
    {
      id: "preparacion",
      label: "En Preparación",
      icon: Package,
      description: "Estamos preparando tu pedido",
    },
    {
      id: "enviado",
      label: "En Camino",
      icon: Truck,
      description: "Tu pedido está en tránsito",
    },
    {
      id: "entregado",
      label: "Entregado",
      icon: Home,
      description: "Tu pedido ha sido entregado",
    },
  ];

  const statusIndex = {
    confirmado: 0,
    preparacion: 1,
    enviado: 2,
    entregado: 3,
  }[currentStatus];

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCompleted = index <= statusIndex;
        const isCurrent = index === statusIndex;
        const Icon = step.icon;

        return (
          <div key={step.id} className="relative flex items-start gap-4">
            {/* Línea vertical */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-5 top-12 w-0.5 h-16 ${
                  isCompleted ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}

            {/* Icono */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isCompleted
                  ? "bg-green-500 border-green-500"
                  : isCurrent
                  ? "bg-white border-[#3A6EA5]"
                  : "bg-white border-gray-300"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isCompleted
                    ? "text-white"
                    : isCurrent
                    ? "text-[#3A6EA5]"
                    : "text-gray-400"
                }`}
              />
            </motion.div>

            {/* Información */}
            <div className="flex-1 pt-1">
              <h4
                className={`font-semibold ${
                  isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {step.label}
              </h4>
              <p className="text-sm text-gray-600">{step.description}</p>
              {isCurrent && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                >
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                  Estado actual
                </motion.div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
