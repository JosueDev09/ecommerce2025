"use client";
import React from "react";
import { useEffect, useState } from "react";

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
    href: "/contact",
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

  useEffect(() => {
    const handleScroll = () => setScroll(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll suave para anclas internas
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
        className={`hidden md:flex fixed left-1/4 w-[45%] items-center justify-center rounded-2xl z-50
        transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        ${scroll
          ? "top-3 bg-white/90 border border-[#F5F5F5] shadow-[0_4px_25px_rgba(58,110,165,0.15)] backdrop-blur-md"
          : "top-6 bg-transparent border border-transparent"
        }`}
      >
        <nav className="flex items-center justify-center w-full">
          {/* 🔸 Logo */}
          <div className="flex-shrink-0 mr-10 text-2xl font-bold bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] bg-clip-text text-transparent">
            <a href="/" className="font-bold tracking-tight">Ecommerce</a>
          </div>

          {/* 🔸 Links */}
          <div className="flex items-center space-x-6">
            {nav.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className={`relative px-4 py-2 rounded-xl text-[15px] font-medium tracking-wide
                  text-[#1A1A1A]/90 transition-all duration-500
                  hover:text-[#3A6EA5] hover:scale-[1.05]
                  hover:shadow-[0_0_15px_rgba(230,200,156,0.25)]
                  before:absolute before:inset-0 before:rounded-xl
                  before:bg-[#3A6EA5]/10 before:opacity-0 hover:before:opacity-100
                  before:transition-all before:duration-500 before:ease-[cubic-bezier(0.25,0.8,0.25,1)]`}
              >
                <span className="relative z-10">{item.name}</span>
              </a>
            ))}
          </div>
        </nav>
      </header>

      {/* 🔹 Navbar Mobile - Solo Logo */}
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
                <div className="text-[#3A6EA5] hover:text-[#E6C89C] transition-colors duration-300">
                  {item.icon}
                </div>
                <span className="text-[11px] text-[#1A1A1A]/80 hover:text-[#3A6EA5] font-medium transition-colors duration-300">
                  {item.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}