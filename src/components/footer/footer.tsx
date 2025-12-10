"use client";
import { useState } from "react";

const footerLinks = {
  company: [
    { name: "Sobre Nosotros", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
  ],
  help: [
    { name: "Ayuda", href: "/help" },
    { name: "Envío", href: "/shipping" },
    { name: "Devoluciones", href: "/returns" },
    { name: "Seguimiento de Pedido", href: "/tracking" },
  ],
  legal: [
    { name: "Términos y Condiciones", href: "/terms" },
    { name: "Política de Privacidad", href: "/privacy" },
    { name: "Servicio al Cliente", href: "/quejas" },
  ],
};

const socialLinks = [
  {
    name: "Facebook",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    href: "#",
  },
  {
    name: "Instagram",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
      </svg>
    ),
    href: "#",
  },
  {
    name: "Twitter",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
    href: "#",
  },
];

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log("Suscrito:", email);
      // Aquí puedes agregar tu lógica de suscripción
      setEmail("");
    }
  };

  return(
    <footer className="relative bg-black text-white">
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
          {/* Newsletter */}
          <div className="border-b border-white/10 pb-12 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-white mb-3 tracking-tight">
                  Unete a nuestra Newsletter
                </h3>
                <p className="font-[family-name:var(--font-inter)] text-white/60 text-sm tracking-wide">
                  Suscribite y recibe ofertas exclusivas y actualizaciones
                </p>
              </div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-0 py-3 bg-transparent border-b border-white/20 text-white font-[family-name:var(--font-inter)] text-sm tracking-wide focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/30"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-black font-[family-name:var(--font-inter)] text-xs tracking-[0.15em] uppercase font-medium hover:bg-white/90 transition-all duration-300 whitespace-nowrap"
                >
                  Suscribite
                </button>
              </form>
            </div>
          </div>

          {/* Links del footer */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 mb-12">
            {/* Logo y descripción */}
            <div className="col-span-2 md:col-span-2">
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-white mb-4 tracking-tight">
                ESYMBEL
              </h2>
              <p className="font-[family-name:var(--font-inter)] text-white/60 text-sm tracking-wide mb-6 max-w-xs">
               Donde el lujo se encuentra con la artesanía. Experimenta la mejor selección de productos premium.
              </p>
              {/* Redes sociales */}
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-white/60 hover:text-white transition-colors duration-300"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Columna Empresa */}
            <div>
              <h4 className="font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.15em] uppercase mb-4">Empresa</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="font-[family-name:var(--font-inter)] text-white/70 hover:text-white transition-colors duration-300 text-sm tracking-wide"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna Ayuda */}
            <div>
              <h4 className="font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.15em] uppercase mb-4">Ayuda</h4>
              <ul className="space-y-3">
                {footerLinks.help.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="font-[family-name:var(--font-inter)] text-white/70 hover:text-white transition-colors duration-300 text-sm tracking-wide"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna Legal */}
            <div>
              <h4 className="font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.15em] uppercase mb-4">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="font-[family-name:var(--font-inter)] text-white/70 hover:text-white transition-colors duration-300 text-sm tracking-wide"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Métodos de pago */}
          <div className="border-t border-white/10 pt-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <span className="font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.15em] uppercase">Métodos de Pago</span>
              <div className="flex gap-4">
                {["Visa", "Mastercard", "PayPal", "Amex"].map((method) => (
                  <div
                    key={method}
                    className="px-4 py-2 border border-white/20 text-white/60 font-[family-name:var(--font-inter)] text-xs tracking-wide"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="font-[family-name:var(--font-inter)] text-white/40 text-xs tracking-wide">
              © 2025 ESYMBEL. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}