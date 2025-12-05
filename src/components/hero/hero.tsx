"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

// Imágenes de alta calidad para el hero
const heroMedia = [
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=2400&auto=format&fit=crop",
    alt: "Luxury minimalist design"
  },
  {
    type: "image", 
    src: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2400&auto=format&fit=crop",
    alt: "Premium craftsmanship"
  },
  {
    type: "video",
    src: "https://assets.mixkit.co/videos/preview/mixkit-elegant-luxury-product-showcase-29685-large.mp4",
    alt: "Luxury product showcase"
  }
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auto-cambio cada 8 segundos para mantener la elegancia
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroMedia.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const currentMedia = heroMedia[currentIndex];

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#2C3E50] dark:bg-[#1a1a1a]">
      
      {/* Fondo de imagen o video */}
      <div className="absolute inset-0 w-full h-full">
        {currentMedia.type === "video" ? (
          <video
            key={currentMedia.src}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          >
            <source src={currentMedia.src} type="video/mp4" />
          </video>
        ) : (
          <motion.div
            key={currentMedia.src}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${currentMedia.src})` }}
          />
        )}
        
        {/* Overlay sutil con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Contenido centrado */}
      <div className="relative z-10 h-full flex items-center justify-center px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Headline elegante */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-6 tracking-tight leading-[1.1]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Timeless by Design
          </motion.h1>

          {/* Subtítulo refinado */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto font-light leading-relaxed tracking-wide"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Explore the new Fall/Winter 2024 Collection, where classic elegance meets modern craftsmanship.
          </motion.p>

          {/* CTA discreto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <Link href="/products">
              <button className="group relative px-10 py-4 border border-white/30 text-white text-sm font-light tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 hover:border-white/60">
                <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                  Discover the Collection
                </span>
                <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </button>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Indicadores minimalistas */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {heroMedia.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-500 ${
              index === currentIndex
                ? 'w-12 h-[2px] bg-white'
                : 'w-8 h-[1px] bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        {/* <div className="flex flex-col items-center gap-2">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-white/60 text-xs uppercase tracking-[0.2em] rotate-90 origin-center mt-4"
          >
            Scroll
          </motion.div>
        </div> */}
      </motion.div>

      {/* Logo minimalista (opcional) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute top-8 left-8 z-20"
      >
        {/* <Link href="/">
          <h2 className="text-2xl font-light text-white tracking-[0.3em] uppercase">
            ESYMBEL
          </h2>
        </Link> */}
      </motion.div>

    </section>
  );
}
