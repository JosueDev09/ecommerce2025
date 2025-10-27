"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const contactMethods = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: "Teléfono",
    description: "Lun - Vie, 9:00 AM - 6:00 PM",
    contact: "+52 (123) 456-7890",
    href: "tel:+521234567890",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Email",
    description: "Respuesta en 24 horas",
    contact: "soporte@ecommerce.com",
    href: "mailto:soporte@ecommerce.com",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Dirección",
    description: "Visítanos en persona",
    contact: "Av. Principal 123, Celaya, GTO",
    href: "#",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Chat en Vivo",
    description: "Disponible ahora",
    contact: "Chatear con soporte",
    href: "#",
  },
];

const faqItems = [
  {
    question: "¿Cuál es el tiempo de respuesta?",
    answer: "Nuestro equipo responde en un máximo de 24 horas hábiles a través de email y en tiempo real por chat.",
  },
  {
    question: "¿Cómo puedo hacer seguimiento de mi queja?",
    answer: "Recibirás un número de ticket por email. Podrás consultar el estado en cualquier momento.",
  },
  {
    question: "¿Qué información debo incluir en mi mensaje?",
    answer: "Incluye tu número de pedido, descripción detallada del problema y cualquier foto relevante.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    type: "consulta",
    orderNumber: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          type: "consulta",
          orderNumber: "",
          message: "",
        });
      }, 5000);
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F5] to-[#FFFFFF] py-12 px-4 md:px-6">
      {/* Decoraciones de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3A6EA5]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-[#E6C89C]/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-4 px-6 py-2 rounded-full bg-[#3A6EA5]/10 border border-[#3A6EA5]/20 mt-[60px]"
          >
            <span className="text-[#3A6EA5] font-semibold text-sm tracking-wide uppercase">
              Estamos Aquí Para Ti
            </span>
          </motion.div>

          <h1 className="text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Contacto y{" "}
            <span className="bg-gradient-to-r from-[#3A6EA5] via-[#8BAAAD] to-[#E6C89C] bg-clip-text text-transparent">
              Soporte
            </span>
          </h1>
          <p className="text-[#1A1A1A]/70 text-lg max-w-2xl mx-auto">
            ¿Tienes alguna pregunta, sugerencia o queja? Estamos aquí para ayudarte. Tu opinión es importante para nosotros.
          </p>
        </motion.div>

        {/* Métodos de contacto */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {contactMethods.map((method, idx) => (
            <motion.a
              key={idx}
              href={method.href}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(58,110,165,0.15)] transition-all duration-500"
            >
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-[#3A6EA5]/10 to-[#8BAAAD]/10 text-[#3A6EA5] mb-4 group-hover:scale-110 transition-transform duration-300">
                {method.icon}
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 group-hover:text-[#3A6EA5] transition-colors">
                {method.title}
              </h3>
              <p className="text-sm text-[#1A1A1A]/60 mb-2">{method.description}</p>
              <p className="text-sm font-medium text-[#3A6EA5]">{method.contact}</p>
            </motion.a>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
          >
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Envíanos un Mensaje</h2>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">¡Mensaje Enviado!</h3>
                <p className="text-[#1A1A1A]/70 mb-2">
                  Gracias por contactarnos. Hemos recibido tu mensaje.
                </p>
                <p className="text-sm text-[#3A6EA5]">
                  Número de ticket: #TK-{Math.floor(Math.random() * 10000)}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Tipo de mensaje */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Tipo de Mensaje *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/20 bg-[#F5F5F5]/50"
                  >
                    <option value="consulta">Consulta General</option>
                    <option value="queja">Queja o Reclamo</option>
                    <option value="sugerencia">Sugerencia</option>
                    <option value="devolucion">Devolución</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {/* Nombre y Email */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Juan Pérez"
                      className="w-full px-4 py-3 rounded-xl border border-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/20 bg-[#F5F5F5]/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/20 bg-[#F5F5F5]/50"
                      required
                    />
                  </div>
                </div>

                {/* Teléfono y Orden */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+52 123 456 7890"
                      className="w-full px-4 py-3 rounded-xl border border-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/20 bg-[#F5F5F5]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                      Número de Pedido
                    </label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      placeholder="#12345"
                      className="w-full px-4 py-3 rounded-xl border border-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/20 bg-[#F5F5F5]/50"
                    />
                  </div>
                </div>

                {/* Asunto */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Describe brevemente tu consulta"
                    className="w-full px-4 py-3 rounded-xl border border-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/20 bg-[#F5F5F5]/50"
                    required
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Describe tu consulta, queja o sugerencia de manera detallada..."
                    className="w-full px-4 py-3 rounded-xl border border-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/20 bg-[#F5F5F5]/50 resize-none"
                    required
                  />
                  <p className="text-xs text-[#1A1A1A]/50 mt-2">
                    Mínimo 20 caracteres
                  </p>
                </div>

                {/* Checkbox de términos */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 w-4 h-4 rounded border-[#F5F5F5] text-[#3A6EA5] focus:ring-[#3A6EA5]/20"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-[#1A1A1A]/70">
                    Acepto los{" "}
                    <a href="/terms" className="text-[#3A6EA5] hover:underline">
                      términos y condiciones
                    </a>{" "}
                    y la{" "}
                    <a href="/privacy" className="text-[#3A6EA5] hover:underline">
                      política de privacidad
                    </a>
                  </label>
                </div>

                {/* Botón submit */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] text-white font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Mensaje
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* Sidebar con FAQs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Horarios */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Horario de Atención</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#1A1A1A]/70">Lunes - Viernes</span>
                  <span className="font-medium text-[#1A1A1A]">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1A1A1A]/70">Sábados</span>
                  <span className="font-medium text-[#1A1A1A]">10:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1A1A1A]/70">Domingos</span>
                  <span className="font-medium text-red-500">Cerrado</span>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Preguntas Frecuentes</h3>
              <div className="space-y-4">
                {faqItems.map((item, idx) => (
                  <div key={idx} className="pb-4 border-b border-[#F5F5F5] last:border-0 last:pb-0">
                    <h4 className="text-sm font-semibold text-[#1A1A1A] mb-2">
                      {item.question}
                    </h4>
                    <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Redes sociales */}
            <div className="bg-gradient-to-br from-[#3A6EA5] to-[#8BAAAD] rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-3">Síguenos</h3>
              <p className="text-white/80 text-sm mb-4">
                Mantente al día con nuestras novedades y ofertas
              </p>
              <div className="flex gap-3">
                {["Facebook", "Instagram", "Twitter", "LinkedIn"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label={social}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mapa (opcional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
        >
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Nuestra Ubicación</h2>
          <div className="w-full h-80 bg-[#F5F5F5] rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-[#3A6EA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-[#1A1A1A]/70">
                Av. Principal 123, Celaya, Guanajuato, México
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}