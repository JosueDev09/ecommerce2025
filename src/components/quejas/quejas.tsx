"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const contactMethods = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: "Telefono",
    contact: "+52 123 456 7890",
    href: "tel:+521234567890",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Correo",
    contact: "clientservices@esymbel.com",
    href: "mailto:clientservices@esymbel.com",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Boutique",
    contact: "Av. Principal 123, Celaya",
    href: "#",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      }, 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black w-full pt-[60px]">
      {/* Hero Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl lg:text-7xl text-white mb-6 tracking-tight">
              Servicio al Cliente
            </h1>
            <p className="font-[family-name:var(--font-inter)] text-white/60 text-sm md:text-base tracking-[0.2em] uppercase">
              Estamos a su servicio
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {contactMethods.map((method, idx) => (
              <motion.a
                key={idx}
                href={method.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 mb-6 text-white/80 group-hover:text-white transition-colors duration-300">
                  {method.icon}
                </div>
                <h3 className="font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.2em] uppercase mb-3">
                  {method.title}
                </h3>
                <p className="font-[family-name:var(--font-inter)] text-white text-sm tracking-wide group-hover:underline">
                  {method.contact}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-white mb-3 text-center">
            Envíanos un mensaje
          </h2>
          <p className="font-[family-name:var(--font-inter)] text-white/60 text-sm text-center mb-12 tracking-wide">
            Nuestro equipo responderá en 24 horas
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 mx-auto mb-6 border border-white/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-white mb-3">
                Mensaje Enviado
              </h3>
              <p className="font-[family-name:var(--font-inter)] text-white/60 text-sm tracking-wide">
                Gracias por contactarnos
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="font-[family-name:var(--font-inter)] block text-white/50 text-xs tracking-[0.2em] uppercase mb-3">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white font-[family-name:var(--font-inter)] text-sm tracking-wide focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/30"
                  placeholder="Escribe tu nombre completo"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="font-[family-name:var(--font-inter)] block text-white/50 text-xs tracking-[0.2em] uppercase mb-3">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white font-[family-name:var(--font-inter)] text-sm tracking-wide focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/30"
                  placeholder="tu@correo.com"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="font-[family-name:var(--font-inter)] block text-white/50 text-xs tracking-[0.2em] uppercase mb-3">
                  Número de Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white font-[family-name:var(--font-inter)] text-sm tracking-wide focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/30"
                  placeholder="+52 123 456 7890"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="font-[family-name:var(--font-inter)] block text-white/50 text-xs tracking-[0.2em] uppercase mb-3">
                  Asunto *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white font-[family-name:var(--font-inter)] text-sm tracking-wide focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/30"
                  placeholder="¿Cómo podemos ayudarte?"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="font-[family-name:var(--font-inter)] block text-white/50 text-xs tracking-[0.2em] uppercase mb-3">
                  Mensaje *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white font-[family-name:var(--font-inter)] text-sm tracking-wide focus:outline-none focus:border-white/60 transition-colors resize-none placeholder:text-white/30"
                  placeholder="Escribe tu mensaje aquí..."
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-white text-black font-[family-name:var(--font-inter)] text-xs tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                </button>
              </div>

              {/* Privacy Note */}
              <p className="font-[family-name:var(--font-inter)] text-white/40 text-xs text-center tracking-wide pt-4">
                Al enviar este formulario, usted acepta nuestra{" "}
                <a href="/privacy" className="text-white/60 hover:text-white underline">
                  Política de Privacidad
                </a>
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Hours Section */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            <div>
              <h3 className="font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.2em] uppercase mb-3">
               Servicio al Cliente
              </h3>
              <p className="font-[family-name:var(--font-inter)] text-white text-sm tracking-wide">
                Lunes - Viernes
              </p>
              <p className="font-[family-name:var(--font-inter)] text-white text-sm tracking-wide">
                9:00 AM - 6:00 PM
              </p>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.2em] uppercase mb-3">
                Horario de la Boutique
              </h3>
              <p className="font-[family-name:var(--font-inter)] text-white text-sm tracking-wide">
                Lunes - Sábado
              </p>
              <p className="font-[family-name:var(--font-inter)] text-white text-sm tracking-wide">
                10:00 AM - 8:00 PM
              </p>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.2em] uppercase mb-3">
                Tiempo de Respuesta
              </h3>
              <p className="font-[family-name:var(--font-inter)] text-white text-sm tracking-wide">
                Dentro de 24 horas
              </p>
              <p className="font-[family-name:var(--font-inter)] text-white text-sm tracking-wide">
                en días hábiles
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
