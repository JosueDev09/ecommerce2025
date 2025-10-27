"use client";
import React from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const nav = [
  {
    name: "Inicio",
    href: "/",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    name: "Acerca de",
    href: "/about",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m-3-3H9m3-4a4 4 0 100-8 4 4 0 000 8z"
        />
      </svg>
    ),
  },
  {
    name: "Productos",
    href: "/products",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10a2 2 0 01-1.105 1.789l-6.79 3.394a2 2 0 01-1.79 0l-6.79-3.394A2 2 0 014 17V7m8 4v10"
        />
      </svg>
    ),
  },
 
  {
    name: "Contacto",
    href: "/quejas",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M22 6l-10 7L2 6"
        />
      </svg>
    ),
  },
   {
    name: "Carrito",
    href: "/cart",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8h14m-10 0a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z"
        />
      </svg>
    ),
  },
];

export default function Menu() {
  const [scroll, setScroll] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const productos = [
    { id: 1, name: "Playera Oversized", price: 399, image: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { id: 2, name: "Sudadera Minimal", price: 699, image: "https://images.pexels.com/photos/5650048/pexels-photo-5650048.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { id: 3, name: "Gorra Classic", price: 249, image: "https://images.pexels.com/photos/9985212/pexels-photo-9985212.jpeg?auto=compress&cs=tinysrgb&w=800" },
  ];

  useEffect(() => {
    const handleScroll = () => setScroll(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.getElementById(href.substring(1));
      if (target) {
        const offset = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: offset, behavior: "smooth" });
      }
    }
  };

  return (
    <>
      {/* 🔹 Navbar Desktop */}
      <header
        className={`hidden md:flex fixed left-1/4 w-[45%] items-center justify-between rounded-2xl z-50 px-6
        transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        ${scroll
          ? "top-3 bg-white/90 border border-[#F5F5F5] shadow-[0_4px_25px_rgba(58,110,165,0.15)] backdrop-blur-md"
          : "top-6 bg-transparent border border-transparent"
        }`}
      >
        {/* Logo */}
        <div className="text-2xl font-bold bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] bg-clip-text text-transparent">
          <a href="/" className="font-bold tracking-tight">Ecommerce</a>
        </div>

        {/* Links */}
        <nav className="flex items-center space-x-6">
          {nav.slice(0, -1).map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleSmoothScroll(e, item.href)}
              className="relative px-3 py-2 rounded-xl text-[15px] font-medium tracking-wide
                text-[#1A1A1A]/90 transition-all duration-500
                hover:text-[#3A6EA5] hover:scale-[1.05]
                before:absolute before:inset-0 before:rounded-xl
                before:bg-[#3A6EA5]/10 before:opacity-0 hover:before:opacity-100
                before:transition-all before:duration-500"
            >
              <span className="relative z-10">{item.name}</span>
            </a>
          ))}
        </nav>

        {/* 🛒 Carrito Icon */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative p-2 rounded-xl hover:bg-[#3A6EA5]/10 transition-all duration-300"
        >
          <svg
            className="w-6 h-6 text-[#3A6EA5]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8h14m-10 0a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 bg-[#E6C89C] text-xs px-1.5 py-0.5 rounded-full text-black font-bold">
            {productos.length}
          </span>
        </button>
      </header>

      {/* 🔹 Sidebar del carrito */}
      <AnimatePresence>
        {cartOpen && (
          <>
            {/* Fondo oscuro */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setCartOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel lateral */}
            <motion.aside
              className="fixed top-0 right-0 h-full w-[400px] bg-white z-50 shadow-2xl p-6 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#1A1A1A]">Tu Carrito</h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-[#3A6EA5] hover:text-[#1A1A1A]"
                >
                  ✕
                </button>
              </div>

              {productos.length > 0 ? (
                <div className="space-y-4">
                  {productos.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 border-b border-gray-100 pb-4">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-[#1A1A1A]">{p.name}</h3>
                        <p className="text-sm text-gray-600">${p.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-10">Tu carrito está vacío</p>
              )}

              <div className="mt-8 border-t pt-4 flex justify-between items-center">
                <span className="font-semibold text-lg text-[#1A1A1A]">
                  Total: ${productos.reduce((acc, p) => acc + p.price, 0)}
                </span>
                <button className="px-5 py-2 bg-[#3A6EA5] text-white rounded-xl font-medium hover:bg-[#2f5888] transition-all">
                  Finalizar compra
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 🔹 Navbar Mobile */}
      <header className="md:hidden fixed left-2 right-2 w-auto rounded-2xl z-50 top-1.5 px-4 py-3 bg-transparent">
        <div className="flex justify-center text-xl font-bold bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] bg-clip-text text-transparent">
          <a href="/" className="tracking-tight">Ecommerce</a>
        </div>
      </header>

      {/* 🔹 Bottom Tab Menu (Mobile) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-[#FFFFFF]/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-[#F5F5F5]">
          <div className="flex justify-around items-center py-3">
            {nav.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className="flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-[#F5F5F5]"
              >
                <span className="text-[#3A6EA5] text-[13px] font-medium">{item.name}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}