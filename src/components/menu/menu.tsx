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
          <div className="w-8 h-8">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill={pathname === '/cart' ? 'black' : 'white'} />
            </svg>
          </div>
          <button
            onClick={() => router.push('/')}
            className={`text-xl font-bold leading-tight tracking-[-0.015em] hover:opacity-80 transition-opacity cursor-pointer ${pathname === '/cart'? 'text-black' : 'text-white'}`}
          >
            ESYMBEL
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
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Icons derecha */}
        <div className="flex items-center gap-2">
          {/* Búsqueda */}
          <button className={`flex max-w-[480px] cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-transparent transition-all duration-200 ${pathname === '/cart' ? 'text-black hover:bg-black/10' : 'text-white hover:bg-white/10'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

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
            className="text-[17px] font-semibold text-[#1d1d1f]"
          >
            <svg className="w-4 h-4" viewBox="0 0 17 48" fill="currentColor">
              <path d="M15.5752 19.0792C15.3895 19.0792 15.2038 19.0792 15.0181 19.0792C14.3762 19.0792 13.7343 19.1667 13.0924 19.2542C12.4505 19.3417 11.8086 19.5167 11.1667 19.6917C10.5248 19.8667 9.88291 20.1292 9.32481 20.3917C8.7667 20.6542 8.2086 21.0042 7.73529 21.3542C7.26198 21.7042 6.87626 22.0542 6.49055 22.4042C6.10484 22.7542 5.80673 23.1042 5.50862 23.4542C5.2105 23.8042 4.91239 24.2417 4.70187 24.6792C4.49136 25.1167 4.28084 25.5542 4.15791 26.0792C4.03498 26.6042 3.91205 27.1292 3.87683 27.6542C3.84161 28.1792 3.80639 28.6167 3.77117 29.0542C3.73595 29.4917 3.70073 29.9292 3.70073 30.3667C3.70073 30.8042 3.70073 31.2417 3.70073 31.6792C3.70073 32.1167 3.77117 32.5542 3.84161 32.9917C3.91205 33.4292 4.06771 33.8667 4.22337 34.3042C4.37903 34.7417 4.62228 35.1792 4.86553 35.6167C5.10878 36.0542 5.43963 36.4042 5.77047 36.7542C6.10132 37.1042 6.52456 37.4542 6.94781 37.7167C7.37105 37.9792 7.8819 38.2417 8.39275 38.4167C8.90359 38.5917 9.50203 38.7667 10.1005 38.8542C10.699 38.9417 11.3856 39.0292 12.0722 39.0292C12.7588 39.0292 13.5334 38.9417 14.308 38.8542C15.0827 38.7667 15.8573 38.5917 16.632 38.4167C17.4066 38.2417 18.0933 37.9792 18.7799 37.7167C19.4665 37.4542 20.0649 37.1042 20.6634 36.7542C21.2618 36.4042 21.7727 35.9667 22.2835 35.5292C22.7944 35.0917 23.2172 34.5667 23.64 34.0417C24.0627 33.5167 24.3936 32.9042 24.7244 32.2917C25.0553 31.6792 25.2991 30.9792 25.5429 30.2792C25.7867 29.5792 25.9424 28.8792 26.098 28.0917C26.2537 27.3042 26.3213 26.5167 26.3213 25.6417C26.3213 24.7667 26.2537 23.8917 26.098 23.0167C25.9424 22.1417 25.6986 21.2667 25.3677 20.3917C25.0369 19.5167 24.5936 18.7292 24.0627 17.9417C23.5319 17.1542 22.9134 16.4542 22.1968 15.8417C21.4801 15.2292 20.6634 14.7917 19.7587 14.4417C18.8539 14.0917 17.8612 13.8292 16.8685 13.7417C15.8758 13.6542 14.883 13.6542 13.8903 13.7417C12.8976 13.8292 11.9929 14.0042 11.0881 14.2667C10.1834 14.5292 9.36669 14.8792 8.54998 15.3167C7.73327 15.7542 7.00415 16.2792 6.36263 16.8917C5.7211 17.5042 5.16299 18.2042 4.69968 18.9917C4.23636 19.7792 3.86065 20.6542 3.57254 21.6167C3.28443 22.5792 3.08391 23.6292 2.97098 24.7667C2.85805 25.9042 2.8457 27.1292 2.8457 28.3542C2.8457 29.5792 2.85805 30.8917 2.97098 32.1167C3.08391 33.3417 3.28443 34.4792 3.57254 35.5292C3.86065 36.5792 4.23636 37.5417 4.69968 38.4167C5.16299 39.2917 5.7211 40.0792 6.36263 40.7792C7.00415 41.4792 7.73327 42.0917 8.54998 42.5292C9.36669 42.9667 10.2714 43.3167 11.2641 43.5792C12.2568 43.8417 13.3375 44.0167 14.4182 44.1042C15.4989 44.1917 16.6676 44.1917 17.7483 44.1042C18.829 44.0167 19.9097 43.8417 20.9024 43.5792C21.8951 43.3167 22.8879 42.9667 23.7926 42.5292C24.6974 42.0917 25.5141 41.5667 26.2427 40.9542C26.9713 40.3417 27.6119 39.6417 28.1647 38.8542C28.7176 38.0667 29.1809 37.1917 29.5557 36.2292C29.9305 35.2667 30.1309 34.2167 30.3314 33.0792C30.5318 31.9417 30.6447 30.8042 30.6447 29.5792C30.6447 28.3542 30.5318 27.1292 30.3314 25.9917C30.1309 24.8542 29.8425 23.8042 29.4677 22.8417C29.0929 21.8792 28.6297 21.0042 28.0768 20.2167C27.5239 19.4292 26.8833 18.7292 26.1547 18.1167C25.4261 17.5042 24.6094 16.9792 23.7046 16.5417C22.7998 16.1042 21.8071 15.7542 20.7264 15.4917C19.6457 15.2292 18.4769 15.0542 17.3083 14.9667C16.1396 14.8792 14.883 14.8792 13.7143 14.9667C12.5456 15.0542 11.3769 15.2292 10.2082 15.4917C9.03952 15.7542 7.95843 16.1042 6.96114 16.5417C5.96385 16.9792 5.14714 17.5042 4.41802 18.1167C3.68891 18.7292 3.04739 19.4292 2.49448 20.2167C1.94158 21.0042 1.47827 21.8792 1.10256 22.8417C0.726842 23.8042 0.438733 24.8542 0.238211 25.9917C0.037688 27.1292 -0.0747681 28.3542 -0.0747681 29.5792C-0.0747681 30.8042 0.037688 32.1167 0.238211 33.3417C0.438733 34.5667 0.726842 35.7042 1.10256 36.7542C1.47827 37.8042 1.94158 38.7667 2.49448 39.6417C3.04739 40.5167 3.68891 41.3042 4.41802 42.0042C5.14714 42.7042 5.96385 43.3167 6.96114 43.7542C7.95843 44.1917 9.03952 44.5417 10.2082 44.8042C11.3769 45.0667 12.6336 45.2417 13.8903 45.3292C15.147 45.4167 16.4917 45.4167 17.7483 45.3292C19.005 45.2417 20.2617 45.0667 21.4304 44.8042C22.5991 44.5417 23.6798 44.1917 24.6771 43.7542C25.6744 43.3167 26.5791 42.7917 27.3958 42.1792C28.2125 41.5667 28.9416 40.8667 29.5831 40.0792C30.2247 39.2917 30.778 38.4167 31.1537 37.4542C31.5294 36.4917 31.8178 35.4417 32.0183 34.3042C32.2187 33.1667 32.3316 32.0292 32.3316 30.8042C32.3316 29.5792 32.2187 28.4417 32.0183 27.3917C31.8178 26.3417 31.5294 25.3792 31.1537 24.5042C30.778 23.6292 30.3147 22.8417 29.7618 22.1417C29.2089 21.4417 28.5683 20.8292 27.8397 20.3042C27.1111 19.7792 26.2944 19.3417 25.3897 18.9917C24.4849 18.6417 23.4922 18.3792 22.4115 18.2042C21.3308 18.0292 20.1621 17.9417 18.9054 17.9417C17.6488 17.9417 16.6 17.9417 15.5752 19.0792Z"></path>
            </svg>
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
            >
              <span className="text-[10px] text-[#1d1d1f] font-normal leading-tight">{item.name}</span>
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}