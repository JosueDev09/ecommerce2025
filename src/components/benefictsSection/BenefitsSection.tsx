"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    title: "Calidad Garantizada",
    description: "Todos nuestros productos pasan rigurosos controles de calidad para asegurar tu satisfacción.",
    stat: "99.8%",
    statLabel: "Satisfacción",
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Envío Rápido",
    description: "Entrega express en 24-48 horas en pedidos seleccionados. Tu compra llega cuando la necesitas.",
    stat: "24h",
    statLabel: "Entrega",
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Compra Segura",
    description: "Protección total en tus transacciones con encriptación de última generación y garantía de reembolso.",
    stat: "100%",
    statLabel: "Seguro",
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Mejores Precios",
    description: "Ofertas exclusivas y precios competitivos. Si encuentras un precio mejor, lo igualamos.",
    stat: "30%",
    statLabel: "Descuento",
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Soporte 24/7",
    description: "Nuestro equipo está disponible las 24 horas para resolver cualquier duda o problema que tengas.",
    stat: "24/7",
    statLabel: "Disponible",
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "Devoluciones Fáciles",
    description: "30 días para devolver tu producto sin preguntas. Tu satisfacción es nuestra prioridad.",
    stat: "30",
    statLabel: "Días",
  },
];

const stats = [
  { value: "50K+", label: "Clientes Felices" },
  { value: "200K+", label: "Productos Vendidos" },
  { value: "4.9/5", label: "Calificación" },
  { value: "99%", label: "Recomendación" },
];

export default function WhyChooseUs() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.8, 0.25, 1] as any,
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative w-full py-20 md:py-32 bg-gradient-to-b from-[#FFFFFF] via-[#F5F5F5] to-[#FFFFFF] overflow-hidden"
    >
      {/* 🔹 Decoraciones de fondo animadas */}
      <motion.div
        style={{ y }}
        className="absolute top-40 -right-20 w-[500px] h-[500px] bg-[#3A6EA5]/10 rounded-full blur-[150px]"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-50, 50]) }}
        className="absolute bottom-20 -left-20 w-[400px] h-[400px] bg-[#E6C89C]/20 rounded-full blur-[130px]"
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* 🔹 Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-4 px-6 py-2 rounded-full bg-[#3A6EA5]/10 border border-[#3A6EA5]/20"
          >
            <span className="text-[#3A6EA5] font-semibold text-sm tracking-wide uppercase">
              ¿Por qué nosotros?
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-[#1A1A1A] mb-6 leading-tight">
            La mejor experiencia{" "}
            <span className="bg-gradient-to-r from-[#3A6EA5] via-[#8BAAAD] to-[#E6C89C] bg-clip-text text-transparent">
              de compra online
            </span>
          </h2>
          <p className="text-[#1A1A1A]/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Nos dedicamos a brindarte el mejor servicio, calidad y atención personalizada.
            Tu satisfacción es nuestra prioridad número uno.
          </p>
        </motion.div>

        {/* 🔹 Grid de características */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -8 }}
              className="group relative bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(58,110,165,0.15)] transition-all duration-500"
            >
              {/* Icono con fondo degradado */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3A6EA5] to-[#8BAAAD] rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#3A6EA5] to-[#8BAAAD] text-white group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
              </div>

              {/* Contenido */}
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3 group-hover:text-[#3A6EA5] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-6">
                {feature.description}
              </p>

              {/* Estadística */}
              <div className="flex items-baseline gap-2 pt-4 border-t border-[#F5F5F5]">
                <span className="text-3xl font-bold bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] bg-clip-text text-transparent">
                  {feature.stat}
                </span>
                <span className="text-sm text-[#1A1A1A]/60 font-medium">
                  {feature.statLabel}
                </span>
              </div>

              {/* Borde animado */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#3A6EA5]/20 transition-all duration-500" />
            </motion.div>
          ))}
        </motion.div>

        {/* 🔹 Sección de estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative bg-gradient-to-br from-[#3A6EA5] via-[#8BAAAD] to-[#3A6EA5] rounded-3xl p-8 md:p-12 shadow-[0_20px_60px_rgba(58,110,165,0.3)] overflow-hidden"
        >
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E6C89C]/20 rounded-full blur-[100px]" />

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/80 text-sm md:text-base font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 🔹 CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-[#1A1A1A]/70 text-lg mb-6">
            Únete a miles de clientes satisfechos que confían en nosotros
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/products"
              className="px-8 py-3 rounded-full bg-[#3A6EA5] text-white font-medium hover:bg-[#2E5A8C] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Explorar productos
            </a>
            <a
              href="/about"
              className="px-8 py-3 rounded-full border-2 border-[#3A6EA5] text-[#3A6EA5] font-medium hover:bg-[#3A6EA5] hover:text-white transition-all duration-300"
            >
              Conoce más sobre nosotros
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}