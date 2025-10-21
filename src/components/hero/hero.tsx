"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const images = [
  "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800",
  "/assets/imgConvertidas/shoes.webp",
  "/assets/imgConvertidas/shoes1.webp",
];

export default function Hero() {
  const [index, setIndex] = useState(0); 
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Movimiento y opacidad en scroll
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

   // Auto-slide cada 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  
    // Animaciones Framer
  const variants = {
    enter: { opacity: 0, scale: 0.95, x: 100 },
    center: { opacity: 1, scale: 1, x: 0 },
    exit: { opacity: 0, scale: 0.95, x: -100 },
  };

  return (
    <section
      ref={ref}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#F5F5F5] to-[#FFFFFF]"
    >
      {/* 🔹 Decoraciones de fondo */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#3A6EA5]/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#E6C89C]/30 rounded-full blur-[120px]" />

      {/* 🔹 Contenido principal */}
      <motion.div
        style={{ y, opacity }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.25, 0.8, 0.25, 1] }}
        className="relative max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12"
      >
        {/* Texto */}
        <div className="text-center md:text-left flex-1">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-[#1A1A1A] mb-6">
         
            <span className="bg-gradient-to-r from-[#3A6EA5] via-[#8BAAAD] to-[#E6C89C] bg-clip-text text-transparent">
              Esymbel Store
            </span>
          </h1>
          <p className="text-[#1A1A1A]/70 text-lg md:text-xl max-w-lg mx-auto md:mx-0 mb-8">
            E-commerce profesional, adaptable a cualquier tipo de negocio.  
            Rápido, escalable y con un diseño limpio y elegante.
          </p>
          <div className="flex flex-col sm:flex-row items-center md:items-start gap-4">
            <a
              href="#productos"
              className="px-8 py-3 rounded-full bg-[#3A6EA5] text-white font-medium shadow-md hover:bg-[#2E5A8C] transition-all duration-300"
            >
              Ver productos
            </a>
            <a
              href="#contacto"
              className="px-8 py-3 rounded-full border border-[#3A6EA5] text-[#3A6EA5] font-medium hover:bg-[#3A6EA5] hover:text-white transition-all duration-300"
            >
              Contáctanos
            </a>
          </div>
        </div>

        {/* Imagen */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className="absolute -top-8 -right-8 w-64 h-64 bg-[#8BAAAD]/20 rounded-full blur-[100px]" />
          <motion.img
            key={index}
            src={images[index]}
            variants={variants}
            alt="Ecommerce Hero"
            className="relative w-[320px] md:w-[400px] rounded-2xl shadow-[0_20px_60px_rgba(58,110,165,0.2)]"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
             {/* 🔹 Indicadores */}
      <div className="absolute bottom-4 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === index
                ? "bg-[#3A6EA5]"
                : "bg-[#8BAAAD]/40 hover:bg-[#8BAAAD]/70"
            }`}
          ></button>
        ))}
      </div>
        </div>   
      </motion.div>
      
    </section>
  );
}
