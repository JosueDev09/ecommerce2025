"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const steps = [
  {
    number: "01",
    title: "Explora y Elige",
    description: "Navega por nuestro catálogo y encuentra los productos que necesitas. Usa nuestros filtros para facilitar tu búsqueda.",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Agrega al Carrito",
    description: "Selecciona tus productos favoritos y agrégalos a tu carrito. Puedes modificar cantidades en cualquier momento.",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8h14m-10 0a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Realiza el Pago",
    description: "Completa tu compra de forma segura con nuestros métodos de pago. Aceptamos tarjetas, PayPal y transferencias.",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Recibe tu Pedido",
    description: "Relájate mientras preparamos tu pedido. Lo recibirás en la puerta de tu casa en tiempo récord.",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
];



export default function ProcessBuy() {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.8, 0.25, 1] as any,
      },
    },
  };

  return (
    <>
      {/* 🔹 SECCIÓN PROCESO DE COMPRA */}
      <section className="relative w-full py-20 md:py-28 bg-gradient-to-b from-[#FFFFFF] to-[#F5F5F5] overflow-hidden">
        {/* Decoraciones de fondo */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#8BAAAD]/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#E6C89C]/20 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Encabezado */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-4 px-6 py-2 rounded-full bg-[#3A6EA5]/10 border border-[#3A6EA5]/20"
            >
              <span className="text-[#3A6EA5] font-semibold text-sm tracking-wide uppercase">
                Simple y Rápido
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Proceso de Compra{" "}
              <span className="bg-gradient-to-r from-[#3A6EA5] via-[#8BAAAD] to-[#E6C89C] bg-clip-text text-transparent">
                en 4 Pasos
              </span>
            </h2>
            <p className="text-[#1A1A1A]/70 text-lg max-w-2xl mx-auto">
              Comprar nunca fue tan fácil. Sigue estos simples pasos y recibe tus productos en tiempo récord.
            </p>
          </motion.div>

          {/* Timeline de pasos */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative"
          >
            {/* Línea conectora (desktop) */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-[#3A6EA5] via-[#8BAAAD] to-[#E6C89C] opacity-20" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative group"
                >
                  {/* Card */}
                  <div className="relative bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(58,110,165,0.15)] transition-all duration-500 h-full">
                    {/* Número de paso */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#3A6EA5] to-[#8BAAAD] flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">{step.number}</span>
                    </div>

                    {/* Icono */}
                    <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-[#3A6EA5]/10 to-[#8BAAAD]/10 text-[#3A6EA5] group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>

                    {/* Contenido */}
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-3 group-hover:text-[#3A6EA5] transition-colors duration-300" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {step.title}
                    </h3>
                    <p className="text-[#1A1A1A]/70 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Borde animado */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#3A6EA5]/20 transition-all duration-500" />
                  </div>

                  {/* Flecha conectora (desktop) */}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-20 -right-8 z-10">
                      <svg className="w-16 h-8 text-[#3A6EA5]/30" fill="none" viewBox="0 0 64 32">
                        <path d="M0 16h58m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mt-16"
          >
            <a
              href="/products"
              className="inline-flex items-center px-8 py-3 rounded-full bg-[#3A6EA5] text-white font-medium hover:bg-[#2E5A8C] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Comenzar a comprar
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>

     
    </>
  );
}