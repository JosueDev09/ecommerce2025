"use client";
import React from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Productos } from "@/types/types"; // si tienes tipos definidos
import { useTienda } from "@/context/TiendaContext";
import { useRouter } from 'next/navigation';

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
  const [mounted, setMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const router = useRouter();
  const {
    productos,
    agregarCarrito,
    handleVariantChange,
    getCantidadPorProducto,
    getResumenCarrito,
    carrito,
    loading,
    aumentarCantidad,
    disminuirCantidad,
    eliminarDelCarrito
  } = useTienda();
  
  // Calcular cantidad total de productos en el carrito ANTES del return
  const cantidadCarrito = carrito.reduce((acc, p) => acc + p.cantidad, 0);
   
    useEffect(() => {
        setMounted(true); // 🔹 asegura render solo en cliente

        const handleScroll = () => setScroll(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
      }, []);

      if (!mounted) return null; // evita SSR mismatch

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
      
      //console.log('Cantidad en carrito:', getResumenCarrito());
     
      //console.log('Cantidad en carrito:', cantidadCarrito);
  return (
    <>
      {/* 🔹 Navbar Desktop */}
      <header
        className={`hidden md:flex fixed left-1/4 w-[45%] h-[60px] items-center justify-between rounded-2xl z-50 px-6
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
        {/* 👤 Usuario / Iniciar Sesión */}
          <a
            href="/login"
            className="relative p-2 left-[37px] top-[2px] rounded-xl hover:bg-[#3A6EA5]/10 transition-all duration-300"
            title="Iniciar sesión"
          >
            <svg
              className="w-8 h-8  text-[#3A6EA5]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M12 12a4 4 0 100-8 4 4 0 000 8z"
              />
            </svg>

          </a>
        

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
            {cantidadCarrito}
          </span>
        </button>
      </header>

     {/* 🔹 Sidebar del carrito */}
      <AnimatePresence>
        {cartOpen && (
          <>
            {/* Fondo oscuro */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
              onClick={() => setCartOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Panel lateral */}
            <motion.aside
              className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-gradient-to-br from-white via-[#FAFAFA] to-[#F5F5F5] z-50 shadow-2xl flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Header del carrito */}
              <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] bg-clip-text text-transparent">
                      Tu Carrito
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{cantidadCarrito} productos</p>
                  </div>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-[#3A6EA5] transition-all duration-300 flex items-center justify-center group"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenido del carrito */}
              <div className="flex-1 overflow-y-auto p-6">
                {cantidadCarrito > 0 ? (
                  <div className="space-y-4">
                    {carrito.map((p, index) => (
                      <motion.div
                        key={`${p.id}-${p.color}-${p.talla}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group"
                      >
                        <div className="flex gap-4">
                          <div className="relative">
                            <img
                              src={p.imagen}
                              alt={p.nombre}
                              className="w-24 h-24 rounded-xl object-cover"
                            />
                            <div className="absolute -top-2 -right-2 bg-[#E6C89C] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                             {p.cantidad}
                            </div>
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div>
                                <p className="font-semibold text-[#1A1A1A] line-clamp-1">{p.nombre}</p>
                                {p.color && (
                                  <p className="text-xs text-gray-500">Color: {p.color}</p>
                                )}
                                {p.talla && (
                                  <p className="text-xs text-gray-500">Talla: {p.talla}</p>
                                )}
                                {p.tieneDescuento && p.precioDescuento && (
                                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-semibold">
                                    Descuento
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-bold text-[#3A6EA5]">
                                ${p.tieneDescuento && p.precioDescuento ? p.precioDescuento * p.cantidad : p.precio * p.cantidad}
                              </p>
                              
                              {/* Controles de cantidad */}
                              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                <button 
                                  onClick={() => disminuirCantidad(p.id, p.color || null, p.talla || null)}
                                  className="w-7 h-7 rounded-md bg-white hover:bg-[#3A6EA5] hover:text-white transition-all duration-300 flex items-center justify-center text-gray-600 font-bold shadow-sm"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center font-semibold text-sm">{p.cantidad}</span>
                                <button 
                                  onClick={() => aumentarCantidad(p.id, p.color || null, p.talla || null)}
                                  className="w-7 h-7 rounded-md bg-white hover:bg-[#3A6EA5] hover:text-white transition-all duration-300 flex items-center justify-center text-gray-600 font-bold shadow-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Botón eliminar */}
                          <button 
                            onClick={() => eliminarDelCarrito(p.id, p.color || null, p.talla || null)}
                            className="self-start p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all duration-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8h14m-10 0a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
                    <p className="text-sm text-gray-400 mt-2">Agrega productos para comenzar</p>
                  </div>
                )}
              </div>

              {/* Footer con totales y botón */}
              {carrito.length > 0 && (
                <div className="bg-white border-t border-gray-200 p-6 shadow-lg">
                  {/* Resumen de costos */}
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        ${carrito.reduce((acc, p) => {
                          const precio = p.tieneDescuento && p.precioDescuento ? p.precioDescuento : p.precio;
                          return acc + (precio * p.cantidad);
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío</span>
                      <span className="font-medium text-green-600">Gratis</span>
                    </div>
                    <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-[#1A1A1A]">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] bg-clip-text text-transparent">
                        ${carrito.reduce((acc, p) => {
                          const precio = p.tieneDescuento && p.precioDescuento ? p.precioDescuento : p.precio;
                          return acc + (precio * p.cantidad);
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Botón de finalizar compra */}
                  <a 
                  href="/cart"
                  className="w-full py-4 bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] text-white rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] 
                  active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer">
                    <span>Finalizar Compra</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                  
                  {/* Mensaje de seguridad */}
                  <p className="text-xs text-center text-gray-500 mt-3 flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Pago 100% seguro
                  </p>
                </div>
              )}
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