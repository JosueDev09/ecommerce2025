"use client";
import React from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Productos } from "@/types/types"; // si tienes tipos definidos
import { useTienda } from "@/context/TiendaContext";
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";

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
  const pathname = usePathname();

  // Cargar auth y tienda solo si está montado
  const authContext = useAuth();
  const tiendaContext = useTienda();

  const { isAuthenticated, isGuest,user } = authContext;
  const {
    carrito = [],
    aumentarCantidad,
    disminuirCantidad,
    eliminarDelCarrito
  } = tiendaContext;

  // Calcular cantidad total de productos en el carrito
  const cantidadCarrito = mounted ? carrito.reduce((acc, p) => acc + p.cantidad, 0) : 0;

  // Establecer mounted cuando el componente esté en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Función para manejar click en el icono de usuario
  const handleUserClick = () => {
    if (isAuthenticated && !isGuest) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };
   
  useEffect(() => {
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
      {/* 🔹 Navbar Desktop - Estilo Luxury (AURA) */}
      <header
        className={`hidden md:flex fixed left-0 right-0 top-0 h-[60px] items-center justify-between z-50 px-8 md:px-16 lg:px-20
        transition-all duration-300 ease-out
        ${pathname === '/cart' 
          ? "bg-white shadow-sm" 
          : scroll
            ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg"
            : "bg-transparent"
        }`}
      >
        {/* Logo izquierda */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img 
              src="/assets/img/logo.png" 
              alt="ESYMBEL Logo" 
              className="h-10 w-auto object-contain"
            />
          </button>
        </div>

        {/* Links centrados */}
        <nav className="flex items-center gap-9">
          {nav.slice(0, -1).map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleSmoothScroll(e, item.href)}
              className={`text-sm font-medium leading-normal hover:opacity-70 transition-opacity duration-200 cursor-pointer ${pathname === '/cart' ? 'text-black' : 'text-white'}`}
               style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Icons derecha */}
        <div className="flex items-center gap-2">
          {/* Búsqueda */}
          {/* <button className={`flex max-w-[480px] cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-transparent transition-all duration-200 ${pathname === '/cart' ? 'text-black hover:bg-black/10' : 'text-white hover:bg-white/10'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button> */}

          {/* Carrito */}
          <button
            onClick={() => setCartOpen(true)}
            className={`flex max-w-[480px] cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-transparent transition-all duration-200 relative ${pathname === '/cart'  ? 'text-black hover:bg-black/10' : 'text-white hover:bg-white/10'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {cantidadCarrito > 0 && (
              <span className={`absolute -top-1 -right-1 text-[10px] font-semibold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center ${pathname === '/cart' ? 'bg-black text-white' : 'bg-white text-[#2C3E50]'}`}>
                {cantidadCarrito}
              </span>
            )}
          </button>

          {/* Usuario */}
          <button
            onClick={handleUserClick}
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 hover:opacity-80 transition-opacity cursor-pointer"
            style={{
              backgroundImage: isAuthenticated && !isGuest && user?.strNombre
                ? `url("https://ui-avatars.com/api/?name=${encodeURIComponent(user.strNombre)}&background=${pathname === '/cart' || pathname === '/products' ? '000000' : 'ffffff'}&color=${pathname === '/cart' || pathname === '/products' ? 'ffffff' : '2C3E50'}&size=128")`
                : `url("https://ui-avatars.com/api/?name=User&background=${pathname === '/cart' || pathname === '/products' ? '000000' : 'ffffff'}&color=${pathname === '/cart' || pathname === '/products' ? 'ffffff' : '2C3E50'}&size=128")`
            }}
            title={isAuthenticated && !isGuest ? `Hola, ${user?.strNombre || ""}` : "Iniciar sesión"}
          />
        </div>
      </header>

     {/* 🔹 Sidebar del carrito */}
      <AnimatePresence>
        {cartOpen && (
          <>
            {/* Fondo oscuro con efecto blur */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setCartOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />

            {/* Panel lateral - Luxury Design */}
            <motion.aside
              className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {/* Header minimalista */}
              <div className="relative px-8 pt-10 pb-6">
                <button
                  onClick={() => setCartOpen(false)}
                  className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black transition-colors duration-300"
                  aria-label="Cerrar carrito"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-black tracking-tight">
                  Tu Carrito
                </h2>
                <p className="font-[family-name:var(--font-inter)] text-sm text-gray-500 mt-2 tracking-wide">
                  {cantidadCarrito} {cantidadCarrito === 1 ? 'producto' : 'productos'}
                </p>
              </div>

              {/* Contenido del carrito - diseño minimalista */}
              <div className="flex-1 overflow-y-auto px-8 py-2">
                {cantidadCarrito > 0 ? (
                  <div className="space-y-6">
                    {carrito.map((p, index) => (
                      <motion.div
                        key={`${p.id}-${p.color}-${p.talla}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        className="flex gap-5 pb-6 border-b border-gray-100 last:border-b-0 group"
                      >
                        {/* Imagen del producto */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={p.imagen}
                            alt={p.nombre}
                            className="w-28 h-28 object-cover bg-gray-50"
                          />
                        </div>
                        
                        {/* Detalles del producto */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h3 className="font-[family-name:var(--font-inter)] text-sm font-medium text-black tracking-wide leading-tight pr-4">
                              {p.nombre}
                            </h3>
                            
                            <div className="mt-2 space-y-0.5">
                              {p.color && (
                                <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 tracking-wide">
                                  Color: {p.color}
                                </p>
                              )}
                              {p.talla && (
                                <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 tracking-wide">
                                  Talla: {p.talla}
                                </p>
                              )}
                              <p className="font-[family-name:var(--font-inter)] text-xs text-gray-500 tracking-wide">
                                Cantidad: {p.cantidad}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-end justify-between mt-3">
                            {/* Precio */}
                            <div>
                              <p className="font-[family-name:var(--font-inter)] text-base font-medium text-black tracking-wide">
                                ${(p.tieneDescuento && p.precioDescuento ? p.precioDescuento * p.cantidad : p.precio * p.cantidad).toFixed(2)}
                              </p>
                              {p.tieneDescuento && p.precioDescuento && (
                                <p className="font-[family-name:var(--font-inter)] text-xs text-gray-400 line-through tracking-wide">
                                  ${(p.precio * p.cantidad).toFixed(2)}
                                </p>
                              )}
                            </div>
                            
                            {/* Controles sutiles */}
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => disminuirCantidad(p.id, p.color || null, p.talla || null)}
                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-black transition-colors duration-200"
                                aria-label="Disminuir cantidad"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                </svg>
                              </button>
                              
                              <span className="font-[family-name:var(--font-inter)] text-sm text-black min-w-[20px] text-center">
                                {p.cantidad}
                              </span>
                              
                              <button 
                                onClick={() => aumentarCantidad(p.id, p.color || null, p.talla || null)}
                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-black transition-colors duration-200"
                                aria-label="Aumentar cantidad"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                                </svg>
                              </button>
                              
                              <button 
                                onClick={() => eliminarDelCarrito(p.id, p.color || null, p.talla || null)}
                                className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-black transition-colors duration-200 ml-2"
                                aria-label="Eliminar producto"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-16 h-16 flex items-center justify-center mb-6">
                      <svg className="w-full h-full text-gray-300" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <p className="font-[family-name:var(--font-inter)] text-gray-400 font-light text-sm tracking-wide">
                      Tu carrito está vacío
                    </p>
                  </div>
                )}
              </div>

              {/* Footer minimalista con totales y CTA */}
              {carrito.length > 0 && (
                <div className="px-8 py-8 border-t border-gray-100">
                  {/* Resumen de costos con líneas limpias */}
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center">
                      <span className="font-[family-name:var(--font-inter)] text-sm text-gray-600 tracking-wide">
                        Subtotal
                      </span>
                      <span className="font-[family-name:var(--font-inter)] text-sm text-black tracking-wide">
                        ${carrito.reduce((acc, p) => {
                          const precio = p.tieneDescuento && p.precioDescuento ? p.precioDescuento : p.precio;
                          return acc + (precio * p.cantidad);
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-[family-name:var(--font-inter)] text-sm text-gray-600 tracking-wide">
                        Envío
                      </span>
                      <span className="font-[family-name:var(--font-inter)] text-sm text-black tracking-wide">
                        Complementario
                      </span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                      <span className="font-[family-name:var(--font-inter)] text-base font-medium text-black tracking-wide">
                        Total
                      </span>
                      <span className="font-[family-name:var(--font-inter)] text-lg font-medium text-black tracking-wide">
                        ${carrito.reduce((acc, p) => {
                          const precio = p.tieneDescuento && p.precioDescuento ? p.precioDescuento : p.precio;
                          return acc + (precio * p.cantidad);
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Botón de checkout elegante y sutil */}
                  <a 
                    href="/cart"
                    className="block w-full py-4 bg-black text-white text-center font-[family-name:var(--font-inter)] text-sm font-medium tracking-widest uppercase
                    hover:bg-gray-900 transition-colors duration-300 cursor-pointer"
                  >
                    Proceder al Pago
                  </a>
                  
                  {/* Mensaje de seguridad discreto */}
                  <p className="font-[family-name:var(--font-inter)] text-xs text-center text-gray-400 mt-6 tracking-wide">
                    Procesamiento de pago seguro
                  </p>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 🔹 Navbar Mobile - Estilo Apple */}
      <header className="md:hidden fixed left-0 right-0 top-0 z-50 bg-[rgba(255,255,255,0.72)] backdrop-blur-[20px] shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between h-[44px] px-4">
          {/* Logo */}
          <a 
            href="/" 
            className="flex items-center gap-2"
          >
            <img 
              src="/assets/img/logo.png" 
              alt="ESYMBEL" 
              className="h-7 w-auto object-contain"
            />
          </a>
          
          {/* Iconos a la derecha */}
          <div className="flex items-center gap-5">
            <button
              onClick={handleUserClick}
              className="text-[#1d1d1f]"
            >
              <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </button>
            
            <button
              onClick={() => setCartOpen(true)}
              className="relative text-[#1d1d1f]"
            >
              <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cantidadCarrito > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0071e3] text-white text-[9px] font-semibold px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center">
                  {cantidadCarrito}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 🔹 Bottom Tab Menu (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[rgba(255,255,255,0.72)] backdrop-blur-[20px] border-t border-[rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-[49px] px-2">
          {nav.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleSmoothScroll(e, item.href)}
              className="flex flex-col items-center justify-center min-w-[60px] py-1"
               style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="text-[10px] text-[#1d1d1f] font-normal leading-tight">{item.name}</span>
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}