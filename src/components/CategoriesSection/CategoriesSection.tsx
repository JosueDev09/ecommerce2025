"use client";
import { motion } from "framer-motion";
import { useRef } from "react";

const categories = [
  {
    name: "Electrónica",
    image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=800",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    count: 245,
  },
  {
    name: "Moda",
    image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    count: 380,
  },
  // {
  //   name: "Hogar",
  //   image: "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800",
  //   icon: (
  //     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  //     </svg>
  //   ),
  //   count: 156,
  // },
  {
    name: "Deportes",
    image: "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=800",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    count: 198,
  },
  // {
  //   name: "Libros",
  //   image: "https://images.pexels.com/photos/1301585/pexels-photo-1301585.jpeg?auto=compress&cs=tinysrgb&w=800",
  //   icon: (
  //     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  //     </svg>
  //   ),
  //   count: 423,
  // },
  // {
  //   name: "Juguetes",
  //   image: "https://images.pexels.com/photos/163696/toy-car-bus-toy-red-163696.jpeg?auto=compress&cs=tinysrgb&w=800",
  //   icon: (
  //     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  //     </svg>
  //   ),
  //   count: 287,
  // },
];

export default function Categories() {
  const ref = useRef<HTMLDivElement>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.8, 0.25, 1] as any,
      },
    },
  };
  

  return (
    <section
      ref={ref}
      className="relative w-full py-20 md:py-28 bg-gradient-to-b from-[#FFFFFF] to-[#F5F5F5] overflow-hidden"
    >
      {/* 🔹 Decoraciones de fondo */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#E6C89C]/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#3A6EA5]/15 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* 🔹 Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Explora por{" "}
            <span className="bg-gradient-to-r from-[#3A6EA5] via-[#8BAAAD] to-[#E6C89C] bg-clip-text text-transparent">
              Categorías
            </span>
          </h2>
          <p className="text-[#1A1A1A]/70 text-lg max-w-2xl mx-auto">
            Encuentra exactamente lo que buscas en nuestras categorías cuidadosamente seleccionadas
          </p>
        </motion.div>

        {/* 🔹 Grid de categorías */}
        <motion.div
          variants={containerVariants || {}}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {categories.map((category, idx) => (
            <motion.a
              key={idx}
              href={`/category/${category.name.toLowerCase()}`}
              variants={itemVariants}   
              whileHover={{ scale: 1.03, y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(58,110,165,0.15)] transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
            >
              {/* Imagen de fondo */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-[#1A1A1A]/40 to-transparent" />
                
                {/* Icono flotante */}
                <div className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-sm text-[#3A6EA5] shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2 group-hover:text-[#3A6EA5] transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-[#1A1A1A]/60 text-sm">
                  {category.count} productos disponibles
                </p>

                {/* Indicador hover */}
                <div className="mt-4 flex items-center text-[#3A6EA5] font-medium text-sm opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
                  Explorar categoría
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Borde animado */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#3A6EA5]/30 transition-all duration-500" />
            </motion.a>
          ))}
        </motion.div>

        {/* 🔹 CTA adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <a
            href="/categories"
            className="inline-flex items-center px-8 py-3 rounded-full border border-[#3A6EA5] text-[#3A6EA5] font-medium hover:bg-[#3A6EA5] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Ver todas las categorías
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}