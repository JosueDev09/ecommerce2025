"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useProductFilters } from "../../hooks/productHooks";
import { VariantesSelector } from "@/lib/getVariantes";
import { useTienda } from "@/context/TiendaContext";
import { Check } from "lucide-react";
import { createProductSlug } from "@/lib/slugify";
import { formatFecha } from "@/utils/formatearFechas";

export default function ProductsPage() {
   const [showSuccess, setShowSuccess] = useState(false);
   const { productos,agregarCarrito } = useTienda();

  const{
    categories,sortOptions,toggleFavorite, containerVariants, itemVariants, filteredProducts, loading,
    handleVariantChange, selectedVariants, setSelectedCategory, setSortBy, setPriceRange, 
    setSearchQuery, setViewMode, setShowFilters,viewMode, showFilters, favorites,sortBy,
    priceRange,selectedCategory,searchQuery
  } = useProductFilters();

  // Función para validar si el descuento está activo
    const esDescuentoActivo = (product: any) => {

      if (
        !product.bolTieneDescuento || !product.datInicioDescuento || !product.datFinDescuento
      ) {
        return false;
      }

      const ahora = Date.now(); // número
      const inicio = Number(product.datInicioDescuento); // número
      const fin = Number(product.datFinDescuento);       // número

      // Solo para ver las fechas formateadas en consola (opcional)
      // console.log("Fecha inicio:", formatFecha(inicio));
      // console.log("Fecha fin:", formatFecha(fin));

      return formatFecha(ahora) >= formatFecha(inicio) && formatFecha(ahora) <= formatFecha(fin);
    };

  const handleAgregarCarrito = (product: any) => {
    agregarCarrito(product);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black w-full pt-[60px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Cargando productos...</p>
        </div>
      </div>
    );
  }

  // Agrupar productos por categoría
  const productsByCategory = filteredProducts.reduce((acc: any, product: any) => {
    const categoryName = product.tbCategoria?.strNombre || 'Sin categoría';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {});

  // Patrones de grid basados en la cantidad de productos en la categoría
  const getGridPattern = (idx: number, total: number) => {
    if (total === 1) {
      return "col-span-12 row-span-6"; // Un solo producto ocupa todo
    } else if (total === 2) {
      return idx === 0 
        ? "col-span-12 md:col-span-7 row-span-6" // Primer producto grande
        : "col-span-12 md:col-span-5 row-span-6"; // Segundo producto mediano
    } else if (total === 3) {
      return idx === 0
        ? "col-span-12 md:col-span-7 row-span-4" // Grande izquierda
        : "col-span-12 md:col-span-5 row-span-2"; // Pequeños derecha
    } else if (total === 4) {
      return idx === 0
        ? "col-span-12 md:col-span-7 row-span-4" // Grande izquierda
        : idx === 1
        ? "col-span-12 md:col-span-5 row-span-2" // Pequeño derecha arriba
        : "col-span-12 md:col-span-6 row-span-2"; // Medianos abajo
    } else {
      // Para 5 o más productos
      const patterns = [
        "col-span-12 md:col-span-7 row-span-4", // Grande izquierda
        "col-span-12 md:col-span-5 row-span-2", // Pequeño derecha arriba
        "col-span-12 md:col-span-5 row-span-2", // Pequeño izquierda
        "col-span-12 md:col-span-4 row-span-2", // Mediano
        "col-span-12 md:col-span-8 row-span-2", // Grande abajo
      ];
      return patterns[idx % patterns.length] || "col-span-12 md:col-span-4 row-span-2";
    }
  };

  // Función para renderizar un producto
  const renderProduct = (product: any, index: number, totalInCategory: number) => {
    const gridClass = getGridPattern(index, totalInCategory);

    return (
      <Link
        key={product.intProducto}
        href={`/producto/${createProductSlug(product.strNombre)}`}
        className={`${gridClass} relative group rounded-xl overflow-hidden`}
      >
        <div
          className="bg-cover bg-center w-full h-full"
          style={{
            backgroundImage: `url(${product.strImagen})`,
          }}
        ></div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/90 p-4 rounded">
            <p className="text-white text-lg font-bold">{product.strNombre}</p>
            <div className="flex items-center gap-2">
              {esDescuentoActivo(product) && product.dblPrecioDescuento ? (
                <>
                  <p className="text-white/80 text-sm">
                    ${product.dblPrecioDescuento.toFixed(2)}
                  </p>
                  <p className="text-white/50 text-xs line-through">
                    ${product.dblPrecio.toFixed(2)}
                  </p>
                  <span className="text-xs px-2 py-1 bg-red-500 text-white rounded">
                    VENTA
                  </span>
                </>
              ) : (
                <p className="text-white/80 text-sm">
                  ${product.dblPrecio.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };
 
  return (
    <div className="bg-white w-full min-h-screen">
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-6 right-6 z-[9999] bg-white border-l-4 border-emerald-500 rounded-xl shadow-2xl p-4 flex items-center gap-3 max-w-md"
        >
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-emerald-900 text-base">¡Producto agregado!</p>
            <p className="text-sm text-emerald-700">Se ha añadido al carrito exitosamente</p>
          </div>
          <button 
            onClick={() => setShowSuccess(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Hero Video Section */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Video de fondo */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/assets/video/hero-video.mp4" type="video/mp4" />
          {/* Fallback para navegadores que no soportan video */}
          Tu navegador no soporta el elemento de video.
        </video>

        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/90"></div>

        {/* Contenido del hero */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl lg:text-8xl text-white mb-6 tracking-tight">
              ESYMBEL
            </h1>
            <p className="font-[family-name:var(--font-inter)] text-white/90 text-lg md:text-xl lg:text-2xl mb-8 tracking-[0.2em] uppercase">
              Colección 2025
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            >
              <Link
                href="#colecciones"
                className="inline-block px-10 py-4 bg-white text-black font-[family-name:var(--font-inter)] text-xs tracking-[0.15em] uppercase font-medium hover:bg-white/90 transition-all duration-300"
              >
                Explorar Colección
              </Link>
            </motion.div>
          </motion.div>

          {/* Indicador de scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="font-[family-name:var(--font-inter)] text-white/60 text-xs tracking-[0.2em] uppercase">
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-[1px] h-12 bg-white/40"
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sección de colecciones */}
      <div id="colecciones" className="pt-16">
        <motion.h1 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-black tracking-tight text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-playfair)] leading-tight px-4 text-center pb-8"
        >
          Nuestras Colecciones
        </motion.h1>
      </div>

      {/* Renderizar cada categoría con su propio grid */}
      {Object.entries(productsByCategory).map(([categoryName, categoryProducts]: [string, any], categoryIndex: number) => (
        <motion.div 
          key={categoryName} 
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.7, 
            delay: categoryIndex * 0.2,
            ease: "easeOut" 
          }}
        >
          {/* Título de la categoría */}
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: categoryIndex * 0.2 + 0.2,
              ease: "easeOut" 
            }}
            className="text-black text-2xl md:text-3xl font-bold px-4 md:px-8 mb-6"
          >
            {categoryName}
            <span className="text-black/50 text-lg ml-3">({categoryProducts.length})</span>
          </motion.h2>

          {/* Grid de productos de esta categoría */}
          <div className="grid grid-cols-12 auto-rows-fr gap-2 min-h-[80vh] w-full px-2">
            {categoryProducts.map((product: any, index: number) => (
              <motion.div
                key={product.intProducto}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: categoryIndex * 0.2 + 0.3 + (index * 0.05),
                  ease: "easeOut" 
                }}
                className={getGridPattern(index, categoryProducts.length)}
              >
                <Link
                  href={`/producto/${createProductSlug(product.strNombre)}`}
                  className="relative group rounded-xl overflow-hidden block w-full h-full"
                >
                  <div
                    className="bg-cover bg-center w-full h-full"
                    style={{
                      backgroundImage: `url(${product.strImagen})`,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/90 p-4 rounded">
                      <p className="text-white text-lg font-bold">{product.strNombre}</p>
                      <div className="flex items-center gap-2">
                        {esDescuentoActivo(product) && product.dblPrecioDescuento ? (
                          <>
                            <p className="text-white/80 text-sm">
                              ${product.dblPrecioDescuento.toFixed(2)}
                            </p>
                            <p className="text-white/50 text-xs line-through">
                              ${product.dblPrecio.toFixed(2)}
                            </p>
                            <span className="text-xs px-2 py-1 bg-red-500 text-black rounded">
                              VENTA
                            </span>
                          </>
                        ) : (
                          <p className="text-white/80 text-sm">
                            ${product.dblPrecio.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}

      <div className="flex px-4 py-16 justify-center">
        <Link href="/products">
          {/* <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-white text-black text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
            <span className="truncate">Discover the Collection</span>
          </button> */}
        </Link>
      </div>
    </div>
  );
}

       