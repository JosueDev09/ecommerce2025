"use client"
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Diamond, Truck, Check, ArrowRight } from "lucide-react";

// Imágenes de alta calidad para el hero
const heroMedia = [
  {
    type: "image", 
    src: "https://www.gymshark.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fwl6q2in9o7k3%2F61jgq09grDzH0pYJfxm9yP%2Fd283273c3570ebd1601ff1240aecb5a8%2FHeadless_Desktop_-_25268218.jpeg&w=1920&q=85",
    alt: "Premium craftsmanship"
  },
];

export default function AboutUs() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [email, setEmail] = useState("");

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

    const handleSubscribe = (e: React.FormEvent) => {
      e.preventDefault();
      console.log("Subscribed:", email);
      setEmail("");
    };
  
    return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
    <section className="relative w-full h-screen overflow-hidden bg-[#2C3E50]">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      <div className="relative z-10 h-full flex items-center justify-center px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-6 tracking-tight leading-[1.1]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Es un estilo de vida basado en disciplina y constancia.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <Link href="/products">
              <button className="group relative px-10 py-4 border border-white/30 text-white text-sm font-light tracking-[0.2em] uppercase overflow-hidden transition-all duration-500 hover:border-white/60">
                <span className="relative z-10 group-hover:text-black transition-colors duration-500">
                 Descubre nuestros <span className="font-semibold">DROPS</span>
                </span>
                <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

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
    </section>

    {/* Our Mission Section */}
    <section className="max-w-[1440px] mx-auto px-8 md:px-16 py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="lg:col-span-5"
      >
        <h2 className="text-4xl font-bold mb-8 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          Nuestra Misión
        </h2>
        <p className="text-lg font-light leading-relaxed mb-8 opacity-80">
          Fundada con el principio de lujo sin fronteras, ESYMBEL sirve como el conducto definitivo 
          entre las marcas estadounidenses más buscadas y el exigente mercado mexicano.
        </p>
        <p className="text-lg font-light leading-relaxed opacity-80 mb-12">
          Curamos más que productos; curamos una experiencia perfecta de herencia, estilo y 
          autenticidad que antes era inaccesible.
        </p>
        <div className="flex flex-col gap-6">
          <div className="border-t border-white/20 pt-6">
            <span className="text-[10px] uppercase tracking-[0.4em] block mb-2 opacity-50 font-bold">
              Procedencia
            </span>
            <p className="text-sm font-medium tracking-wide">
              Obtenido directamente de showrooms insignia de Manhattan y Los Ángeles.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="lg:col-span-7 flex justify-end"
      >
        <div className="w-full max-w-2xl aspect-[4/5] bg-gray-100 overflow-hidden relative group">
          <img 
            alt="Modern minimalist storefront window" 
            className="w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-700" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz1Wirsy8O-E52QS0pHceiV-Y5gWfqbDlRjqvnQg0Clt6VBpYGDkbi_3WaZmSQ6_LzZwnENK3D-COnIdSuVR3aWtp2d-HpFSwZqVuJlbtdsIkQP_wzNKYqGfO8hlJLwNNRZdzUIkFcg3gM8IKqv5FjDGFR0JQ6Wm1tGZu18HkgtZyGabn9pRZjFNn2yURcuLvsv_e7IzkTPu6Z9Vf7GRR436P0fUKZe2w99U9UfawAkOQx3AaTCSHYEGS7T0q4rIH-afN4585B0S-p"
          />
        </div>
      </motion.div>
    </section>

    {/* Our Selection Section */}
    <section className="max-w-[1440px] mx-auto px-8 md:px-16 py-32 border-t border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="order-2 lg:order-1"
        >
          <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
            <img 
              alt="Editorial fashion photography" 
              className="w-full h-full object-cover grayscale hover:scale-105 transition-transform duration-1000" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm7VSYfbm8DCRfK_0V9GDpJGTI7mM9zHALgQjPhXPzXha5g1VV9diPpDTjHmZn5cVDnc7YgDQJkj_kUMve_EHl2GgzVJPngXVoMqZ6hI_pQzBuh7_Q4ZSifuZqPfTq6et838BhVuXMkgDGlR8O6gLduOB9bFwnV2KjtJNRiXSekZ564DRm6jg2dxuNAWFAIMq0TwFzBwRPj_qqdGTvWbYCvXsHMNT3dy_tXlKyuAHvWWwAm07vxSgSrtl-huiTnBCqJu-Dc533ZDU8"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="order-1 lg:order-2"
        >
          <h3 className="text-[10px] uppercase tracking-[0.4em] mb-6 font-bold opacity-50">
            Curación
          </h3>
          <h2 className="text-5xl font-bold mb-10 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Nuestra Selección
          </h2>
          <div className="h-px w-16 bg-white mb-10"></div>
          <p className="text-lg font-light leading-relaxed opacity-80 mb-8">
            Nos especializamos en lo no disponible. Nuestro portafolio está meticulosamente curado 
            para incluir marcas estadounidenses exclusivas que evitan los canales minoristas mexicanos tradicionales.
          </p>
          <p className="text-lg font-light leading-relaxed opacity-80">
            Desde etiquetas vanguardistas de Nueva York hasta casas de lujo establecidas de la Costa Oeste, 
            proporcionamos una puerta de entrada a piezas que definen la sofisticación moderna.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Direct-to-Consumer Section */}
    <section className="max-w-[1440px] mx-auto px-8 md:px-16 py-32 border-t border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-4"
        >
          <h3 className="text-[10px] uppercase tracking-[0.4em] mb-6 font-bold opacity-50">
            Eficiencia
          </h3>
          <h2 className="text-5xl font-bold mb-10 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Directo al Consumidor
          </h2>
          <p className="text-lg font-light leading-relaxed opacity-80">
            Al eliminar distribuidores locales y márgenes minoristas tradicionales, 
            hemos refinado el modelo de importación.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-8"
        >
          <div className="aspect-video bg-gray-100 overflow-hidden mb-12">
            <img 
              alt="Minimalist interior architecture" 
              className="w-full h-full object-cover grayscale contrast-125" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0JcN97Yz0Hpf-QpwOzj9RoCjFHchxqnB7IK_Cd6n_3WU6NweXT6beh4rOHVSpX--AU42uLjre9KvdinIb9_N6fCDiFuHLDva4adQq_IS_JGkXA-UCvj17p5gXdYlHGLun5u86G-zUa-3rhzcuHFHZoS0yCNm9XvTznOfw7b6Az2Hcs2mUyuMflMvuXQR6dnP8gmCXTziNuV48eWon0VbKF1PhXaO0pwEhvFdgdGDWsrFj-yFrQYBtaVJ1ROufVe_4wbTczJ4XUtcw"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="pt-8 border-t border-white/10">
              <h4 className="text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Sin Intermediarios
              </h4>
              <p className="text-sm font-light leading-relaxed opacity-70">
                Nuestra red logística conecta directamente showrooms estadounidenses con nuestro 
                centro de distribución mexicano, eliminando costos innecesarios.
              </p>
            </div>
            <div className="pt-8 border-t border-white/10">
              <h4 className="text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Valor Transparente
              </h4>
              <p className="text-sm font-light leading-relaxed opacity-70">
                Experimenta lujo premium a precios que reflejan el valor real del artículo, 
                no los costos generales de una boutique física.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Authenticity Guaranteed Section */}
    <section className="bg-[#2C3E50] text-white py-40 px-8 md:px-16 overflow-hidden">
      <div className="max-w-[1440px] mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <h3 className="text-[10px] uppercase tracking-[0.4em] mb-6 font-bold opacity-40">
              Integridad
            </h3>
            <h2 className="text-5xl md:text-7xl font-bold mb-12 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Autenticidad Garantizada
            </h2>
            <div className="space-y-12">
              <div className="group">
                <div className="flex items-start gap-6">
                  <Check className="w-10 h-10 text-white flex-shrink-0" />
                  <div>
                    <h4 className="text-2xl mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Origen Original
                    </h4>
                    <p className="text-white/60 font-light leading-relaxed max-w-md">
                      Cada prenda y accesorio proviene directamente de tiendas insignia autorizadas 
                      o distribuidores de lujo verificados en EE.UU.
                    </p>
                  </div>
                </div>
              </div>
              <div className="group">
                <div className="flex items-start gap-6">
                  <Shield className="w-10 h-10 text-white flex-shrink-0" />
                  <div>
                    <h4 className="text-2xl mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Inspección Rigurosa
                    </h4>
                    <p className="text-white/60 font-light leading-relaxed max-w-md">
                      Nuestro equipo especializado realiza un proceso de autenticación multipunto 
                      en cada artículo antes de que salga de nuestro hub en Nueva York.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] border border-white/10 p-4">
              <img 
                alt="Luxury accessory detail" 
                className="w-full h-full object-cover grayscale brightness-75" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuASdfSTcvkzlss1OafmVt32rp6eWZzEqweBsnl5c_t8iTKQ-cW6qwjhYHf3L55GP0DuZPLBis6xoeFULV0OpDMLC1V0PGA62hVy5la9h9ARjARBKiRzAzf98leGdaq0UkCoY0Z5ZDaq4FCDhfxASb-h7ybVLmZZ4QYADcAdSKcEXBT57GR5A1ie5-ArQqbaq3VqkLXs8qiDSbDLELsCpWSIQoP1xFPEkHkmR2tZh-EATMfUNgTjcb1yiTJZZtqbIxm5vCBz4wTd4MES"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white text-[#2C3E50] p-10 hidden xl:block">
              <p className="text-4xl font-bold italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                100%
              </p>
              <p className="text-[10px] uppercase tracking-widest mt-2">
                Certificado Original
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Key Pillars Section */}
    <section className="bg-black text-white py-32 px-8 md:px-16 border-t border-white/5">
      <div className="max-w-[1440px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8"
        >
          <h2 className="text-5xl md:text-6xl font-bold max-w-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Pilares Clave
          </h2>
          <p className="text-xs uppercase tracking-[0.4em] opacity-50 font-bold">
            Estándar de Excelencia
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border-t border-white/20 pt-10 group"
          >
            <Shield className="w-8 h-8 mb-8 block text-white" />
            <h3 className="text-2xl font-bold mb-4 uppercase tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
              Autenticidad
            </h3>
            <p className="text-sm font-light leading-loose opacity-70">
              Procedencia garantizada a través de inspección rigurosa y relaciones directas con marcas.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="border-t border-white/20 pt-10 group"
          >
            <Diamond className="w-8 h-8 mb-8 block text-white" />
            <h3 className="text-2xl font-bold mb-4 uppercase tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
              Exclusividad
            </h3>
            <p className="text-sm font-light leading-loose opacity-70">
              Acceso inmediato a marcas previamente no disponibles en el mercado minorista mexicano.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border-t border-white/20 pt-10 group"
          >
            <Truck className="w-8 h-8 mb-8 block text-white" />
            <h3 className="text-2xl font-bold mb-4 uppercase tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>
              Logística
            </h3>
            <p className="text-sm font-light leading-loose opacity-70">
              Redes propietarias que eliminan la fricción aduanera y proporcionan precios competitivos.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Seamless Flow Section */}
    <section className="py-32 px-8 md:px-16 max-w-[1440px] mx-auto border-t border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-8 order-2 lg:order-1"
        >
          <div className="aspect-video bg-gray-100 overflow-hidden relative">
            <img 
              alt="Sleek modern warehouse interior" 
              className="w-full h-full object-cover grayscale contrast-125" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaClcvRWLnmSSyY5P4qsxCwKio_uj-pcRvrotues1wuvRgYgDpTidn15h0yta9D4sta2nk-vkPDLuub5_YGAhAjqqDpOo5GepCHF5CiL-BZeLdF8omqOfbDxpa_uYdZnmoMH4Gy6fMlTGQ8adFJvPvDF3UajaEzkg3CMDN6kmqZd-Vv5m08jbpN-GUuRSOFtku6FXS2a_QwlUuMAKUz4hY5dBCi32pD8-lE5v6vOGHUMQPx_tbXrrt-hNWAoX84p9SH8kTct1vWzLf"
            />
            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm p-6 max-w-xs text-black">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
                Centro de Tránsito
              </p>
              <p className="text-xs font-light leading-relaxed">
                Nuestro flujo optimizado conecta NY y LA directamente a tu puerta en Ciudad de México 
                en 5 días hábiles.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-4 order-1 lg:order-2"
        >
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Flujo Perfecto
          </h2>
          <p className="text-base font-light leading-relaxed mb-8 opacity-80">
            Nuestra arquitectura logística está diseñada para reflejar la elegancia de los productos 
            que llevamos. Minimalista en ejecución, máxima en eficiencia.
          </p>
          <button className="group flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-bold hover:opacity-70 transition-opacity">
            Conoce el proceso
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>

    {/* Newsletter Section */}
    <section className="border-y border-white/10 py-24 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto px-8"
      >
        <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Mantente Informado
        </h3>
        <p className="text-sm font-light tracking-wide mb-10 opacity-60">
          Únete a nuestro círculo interno para acceso exclusivo anticipado a drops de marcas estadounidenses.
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-4">
          <input 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent border-white/20 border-b border-x-0 border-t-0 focus:ring-0 focus:border-white px-0 text-sm tracking-widest placeholder:text-white/30" 
            placeholder="CORREO ELECTRÓNICO" 
            type="email"
            required
          />
          <button 
            type="submit"
            className="bg-white text-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:opacity-90 transition-opacity"
          >
            Suscribirse
          </button>
        </form>
      </motion.div>
    </section>
    </div>
    );
}