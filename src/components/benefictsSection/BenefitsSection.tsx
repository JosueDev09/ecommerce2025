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
      className="relative w-full py-20 md:py-32 bg-black overflow-hidden"
    >
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
            className="inline-block mb-8"
          >
            <span className="text-white/50 font-[family-name:var(--font-inter)] text-xs tracking-[0.2em] uppercase">
              Excellence
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-[family-name:var(--font-playfair)] text-white mb-6 leading-tight tracking-tight">
            La Excelencia{" "}
            <span className="text-white/60">
              en Cada Detalle
            </span>
          </h2>
          <p className="text-white/60 font-[family-name:var(--font-inter)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Compromiso inquebrantable con la calidad, el servicio y la experiencia excepcional.
          </p>
        </motion.div>

        {/* 🔹 Grid de características */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/10 mb-20"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group relative bg-black p-8 md:p-10 hover:bg-white/5 transition-colors duration-500"
            >
              {/* Icono minimalista */}
              <div className="mb-8">
                <div className="text-white group-hover:scale-110 transition-transform duration-300 inline-block">
                  {feature.icon}
                </div>
              </div>

              {/* Contenido */}
              <h3 className="text-xl font-[family-name:var(--font-playfair)] text-white mb-4 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-white/60 font-[family-name:var(--font-inter)] text-sm leading-relaxed mb-8">
                {feature.description}
              </p>

              {/* Estadística */}
              <div className="flex items-baseline gap-2 pt-6 border-t border-white/10">
                <span className="text-2xl font-[family-name:var(--font-playfair)] text-white">
                  {feature.stat}
                </span>
                <span className="text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white/50">
                  {feature.statLabel}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 🔹 Sección de estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-12 md:p-16 overflow-hidden"
        >
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="text-center border-r border-white/10 last:border-r-0"
              >
                <div className="text-3xl md:text-5xl font-[family-name:var(--font-playfair)] text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/60 font-[family-name:var(--font-inter)] text-xs md:text-sm tracking-[0.1em] uppercase">
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
          className="text-center mt-20"
        >
          <p className="text-white/60 font-[family-name:var(--font-inter)] text-sm md:text-base mb-8 tracking-wide">
            Únete a miles de clientes que confían en nosotros
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/products"
              className="px-10 py-4 bg-white text-black font-[family-name:var(--font-inter)] text-xs tracking-[0.15em] uppercase font-medium hover:bg-white/90 transition-all duration-300"
            >
              Explorar productos
            </a>
            <a
              href="/about"
              className="px-10 py-4 border border-white/20 text-white font-[family-name:var(--font-inter)] text-xs tracking-[0.15em] uppercase font-medium hover:bg-white/10 transition-all duration-300"
            >
              Sobre Nosotros
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}