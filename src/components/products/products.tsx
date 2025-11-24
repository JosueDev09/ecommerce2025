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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3A6EA5] mx-auto mb-4"></div>
          <p className="text-[#1A1A1A]/70">Cargando productos...</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-b py-8 px-4 md:px-6">
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

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-2">
            Nuestros{" "}
            <span className="bg-gradient-to-r from-[#3A6EA5] via-[#8BAAAD] to-[#E6C89C] bg-clip-text text-transparent">
              Productos
            </span>
          </h1>
          <p className="text-[#1A1A1A]/70">
            Descubre nuestra colección completa de productos premium
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] mb-8"
        >
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A1A]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/20 bg-[#F5F5F5]/50"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/20 bg-[#F5F5F5]/50 cursor-pointer"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-3 rounded-xl bg-[#3A6EA5] text-white font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </button>
          </div>
        </motion.div>

        <div className="flex gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`${
              showFilters ? "block" : "hidden"
            } md:block w-full md:w-64 flex-shrink-0`}
          >
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] sticky top-6">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-6">Filtros</h3>

              <div className="mb-8">
                <h4 className="text-sm font-semibold text-[#1A1A1A] mb-3">Categorías</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${
                        selectedCategory === category
                          ? "bg-[#3A6EA5] text-white font-medium"
                          : "bg-[#F5F5F5]/50 text-[#1A1A1A]/70 hover:bg-[#F5F5F5]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-semibold text-[#1A1A1A] mb-3">
                  Rango de Precio
                </h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-[#3A6EA5]"
                  />
                  <div className="flex justify-between text-sm text-[#1A1A1A]/70">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory("Todos");
                  setPriceRange([0, 50000]);
                  setSearchQuery("");
                }}
                className="w-full mt-6 px-4 py-2.5 rounded-lg border border-[#3A6EA5] text-[#3A6EA5] font-medium hover:bg-[#3A6EA5] hover:text-white transition-all"
              >
                Limpiar filtros
              </button>
            </div>
          </motion.aside>

          <div className="flex-1 min-h-[600px]">
            <div className="mb-4 text-sm text-[#1A1A1A]/70">
              Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </div>

            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center min-h-[500px]"
              >
                <div className="text-center py-12 max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#3A6EA5]/10 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-[#3A6EA5]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                    No se encontraron productos
                  </h3>

                  <p className="text-[#1A1A1A]/60 mb-8 text-base">
                    Intenta ajustar tus filtros o búsqueda para encontrar lo que buscas.
                  </p>

                  <button
                    onClick={() => {
                      setSelectedCategory("Todos");
                      setPriceRange([0, 50000]);
                      setSearchQuery("");
                      setSortBy("featured");
                    }}
                    className="px-8 py-3 rounded-xl bg-[#3A6EA5] text-white font-medium hover:bg-[#2E5A8C] transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-6"
                  }
                >
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.intProducto}
                      variants={itemVariants}
                      layout
                      className={`group bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(58,110,165,0.15)] transition-all duration-500 ${
                        viewMode === "list" ? "flex gap-6" : ""
                      }`}
                    >
                      <div className={`relative overflow-hidden bg-[#F5F5F5] ${
                        viewMode === "list" ? "w-48 flex-shrink-0" : "h-64"
                      }`}>
                        {product.strEtiquetas && (
                          <div className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                            product.strEtiquetas === "Nuevo"
                              ? "bg-[#3A6EA5] text-white"
                              : product.strEtiquetas === "oferta"
                              ? "bg-[#E6C89C] text-[#1A1A1A]"
                              : "bg-[#8BAAAD] text-white"
                          }`}>
                            {product.strEtiquetas}
                          </div>
                        )}

                        <button
                          onClick={() => toggleFavorite(product.intProducto)}
                          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-md hover:scale-110"
                        >
                          <svg
                            className={`w-5 h-5 transition-colors ${
                              favorites.includes(product.intProducto)
                                ? "text-red-500 fill-red-500"
                                : "text-[#1A1A1A]/60"
                            }`}
                            fill={favorites.includes(product.intProducto) ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>

                        <img
                          src={product.jsonImagenes}
                          alt={product.strNombre}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-[#1A1A1A]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Link href={`/producto/${createProductSlug(product.strNombre)}`}>
                            <button className="px-6 py-2.5 rounded-full bg-white text-[#3A6EA5] font-medium hover:bg-[#3A6EA5] hover:text-white transition-all duration-300 transform scale-90 group-hover:scale-100">
                              Ver detalles
                            </button>
                          </Link>
                        </div>
                      </div>

                      <div className="p-5 flex-1">
                        <p className="text-xs text-[#3A6EA5] font-medium mb-2">{product.tbCategoria.strNombre}</p>
                        <Link href={`/producto/${createProductSlug(product.strNombre)}`}>
                          <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 line-clamp-2 group-hover:text-[#3A6EA5] transition-colors duration-300 cursor-pointer">
                            {product.strNombre}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < 4 ? "text-[#E6C89C]" : "text-[#1A1A1A]/20"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-[#1A1A1A]/60">(0)</span>
                        </div>
                       
                        {product.jsonVariantes && (
                          <VariantesSelector 
                            product={product} 
                            onVariantChange={(color, talla) => handleVariantChange(product.intProducto, color, talla)}
                          />
                        )}

                        <div className="flex items-baseline gap-2 mb-4">
                          {esDescuentoActivo(product) ? (
                            <>
                              <span className="text-2xl font-bold text-[#1A1A1A]">
                                ${product.dblPrecioDescuento?.toLocaleString()}
                              </span>
                              <span className="text-sm text-[#1A1A1A]/40 line-through">
                                ${product.dblPrecio.toLocaleString()}
                              </span>
                              {product.intPorcentajeDescuento && (
                                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500 text-white font-semibold">
                                  -{product.intPorcentajeDescuento}%
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-[#1A1A1A]">
                              ${product.dblPrecio.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleAgregarCarrito(product)}
                          className="w-full py-2.5 rounded-xl bg-[#3A6EA5] text-white font-medium hover:bg-[#2E5A8C] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8h14m-10 0a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                          </svg>
                          Agregar al carrito
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}