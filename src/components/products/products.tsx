"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const allProducts = [
  {
    id: 1,
    name: "Auriculares Inalámbricos Pro",
    category: "Electrónica",
    price: 2499,
    originalPrice: 3299,
    image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    reviews: 234,
    badge: "Más vendido",
    inStock: true,
  },
  {
    id: 2,
    name: "Smartwatch Fitness Edition",
    category: "Deportes",
    price: 4999,
    originalPrice: 6499,
    image: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    reviews: 189,
    badge: "Nuevo",
    inStock: true,
  },
  {
    id: 3,
    name: "Zapatillas Running Elite",
    category: "Deportes",
    price: 3799,
    originalPrice: 4999,
    image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.7,
    reviews: 412,
    badge: "Oferta",
    inStock: true,
  },
  {
    id: 4,
    name: "Lámpara Minimalista LED",
    category: "Hogar",
    price: 1299,
    originalPrice: 1899,
    image: "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.6,
    reviews: 156,
    badge: null,
    inStock: true,
  },
  {
    id: 5,
    name: "Mochila Urbana Impermeable",
    category: "Moda",
    price: 1899,
    originalPrice: 2499,
    image: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.5,
    reviews: 203,
    badge: null,
    inStock: true,
  },
  {
    id: 6,
    name: "Cámara Instantánea Retro",
    category: "Electrónica",
    price: 3499,
    originalPrice: 4299,
    image: "https://images.pexels.com/photos/225157/pexels-photo-225157.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.7,
    reviews: 178,
    badge: "Más vendido",
    inStock: true,
  },
  {
    id: 7,
    name: "Set de Té Premium",
    category: "Hogar",
    price: 899,
    originalPrice: 1299,
    image: "https://images.pexels.com/photos/1879306/pexels-photo-1879306.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    reviews: 145,
    badge: null,
    inStock: true,
  },
  {
    id: 8,
    name: "Gafas de Sol Polarizadas",
    category: "Moda",
    price: 1599,
    originalPrice: 2199,
    image: "https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.6,
    reviews: 267,
    badge: "Nuevo",
    inStock: true,
  },
  {
    id: 9,
    name: "Teclado Mecánico RGB",
    category: "Electrónica",
    price: 2799,
    originalPrice: 3499,
    image: "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    reviews: 321,
    badge: "Más vendido",
    inStock: true,
  },
  {
    id: 10,
    name: "Yoga Mat Premium",
    category: "Deportes",
    price: 799,
    originalPrice: 1199,
    image: "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.7,
    reviews: 198,
    badge: "Oferta",
    inStock: true,
  },
  {
    id: 11,
    name: "Cafetera Espresso",
    category: "Hogar",
    price: 3299,
    originalPrice: 4299,
    image: "https://images.pexels.com/photos/6231818/pexels-photo-6231818.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    reviews: 287,
    badge: null,
    inStock: true,
  },
  {
    id: 12,
    name: "Reloj Análogo Clásico",
    category: "Moda",
    price: 2199,
    originalPrice: 2999,
    image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.6,
    reviews: 234,
    badge: null,
    inStock: true,
  },
];

const categories = ["Todos", "Electrónica", "Deportes", "Hogar", "Moda"];
const sortOptions = [
  { value: "featured", label: "Destacados" },
  { value: "price-asc", label: "Precio: Menor a Mayor" },
  { value: "price-desc", label: "Precio: Mayor a Menor" },
  { value: "rating", label: "Mejor Calificación" },
  { value: "newest", label: "Más Nuevos" },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  // Filtrado y ordenamiento
  let filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  // Ordenamiento
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return b.id - a.id;
      default:
        return 0;
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F5] to-[#FFFFFF] py-8 px-4 md:px-6">
      {/* Decoraciones de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3A6EA5]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-[#E6C89C]/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
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

        {/* Barra de búsqueda y controles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
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

            {/* Ordenar */}
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

            {/* Vista grid/list */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-[#3A6EA5] text-white"
                    : "bg-[#F5F5F5]/50 text-[#1A1A1A]/60 hover:bg-[#F5F5F5]"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "list"
                    ? "bg-[#3A6EA5] text-white"
                    : "bg-[#F5F5F5]/50 text-[#1A1A1A]/60 hover:bg-[#F5F5F5]"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Botón filtros (mobile) */}
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
          {/* Sidebar de filtros */}
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

              {/* Categorías */}
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

              {/* Rango de precio */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-[#1A1A1A] mb-3">
                  Rango de Precio
                </h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
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

              {/* Rating */}
              <div>
                <h4 className="text-sm font-semibold text-[#1A1A1A] mb-3">Calificación</h4>
                <div className="space-y-2">
                  {[5, 4, 3].map(stars => (
                    <button
                      key={stars}
                      className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F5F5F5]/50 hover:bg-[#F5F5F5] transition-all text-sm"
                    >
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < stars ? "text-[#E6C89C]" : "text-[#1A1A1A]/20"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[#1A1A1A]/70">y más</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setSelectedCategory("Todos");
                  setPriceRange([0, 10000]);
                  setSearchQuery("");
                }}
                className="w-full mt-6 px-4 py-2.5 rounded-lg border border-[#3A6EA5] text-[#3A6EA5] font-medium hover:bg-[#3A6EA5] hover:text-white transition-all"
              >
                Limpiar filtros
              </button>
            </div>
          </motion.aside>

          {/* Grid de productos */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-[#1A1A1A]/70">
              Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </div>

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
                    key={product.id}
                    variants={itemVariants}
                    layout
                    className={`group bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(58,110,165,0.15)] transition-all duration-500 ${
                      viewMode === "list" ? "flex gap-6" : ""
                    }`}
                  >
                    {/* Imagen */}
                    <div className={`relative overflow-hidden bg-[#F5F5F5] ${
                      viewMode === "list" ? "w-48 flex-shrink-0" : "h-64"
                    }`}>
                      {product.badge && (
                        <div className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                          product.badge === "Nuevo"
                            ? "bg-[#3A6EA5] text-white"
                            : product.badge === "Oferta"
                            ? "bg-[#E6C89C] text-[#1A1A1A]"
                            : "bg-[#8BAAAD] text-white"
                        }`}>
                          {product.badge}
                        </div>
                      )}

                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-md hover:scale-110"
                      >
                        <svg
                          className={`w-5 h-5 transition-colors ${
                            favorites.includes(product.id)
                              ? "text-red-500 fill-red-500"
                              : "text-[#1A1A1A]/60"
                          }`}
                          fill={favorites.includes(product.id) ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>

                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-[#1A1A1A]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="px-6 py-2.5 rounded-full bg-white text-[#3A6EA5] font-medium hover:bg-[#3A6EA5] hover:text-white transition-all duration-300 transform scale-90 group-hover:scale-100">
                          Vista rápida
                        </button>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-5 flex-1">
                      <p className="text-xs text-[#3A6EA5] font-medium mb-2">{product.category}</p>
                      <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 line-clamp-2 group-hover:text-[#3A6EA5] transition-colors duration-300">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating)
                                  ? "text-[#E6C89C]"
                                  : "text-[#1A1A1A]/20"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-[#1A1A1A]/60">({product.reviews})</span>
                      </div>

                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-bold text-[#1A1A1A]">
                          ${product.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-[#1A1A1A]/40 line-through">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      </div>

                      <button className="w-full py-2.5 rounded-xl bg-[#3A6EA5] text-white font-medium hover:bg-[#2E5A8C] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
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

              {/* 🔹 Resultado vacío */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
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

            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
              No se encontraron productos
            </h3>

            <p className="text-[#1A1A1A]/60 mb-6">
              Intenta ajustar tus filtros o búsqueda.
            </p>

            <button
              onClick={() => {
                setSelectedCategory("Todos");
                setPriceRange([0, 10000]);
                setSearchQuery("");
                setSortBy("featured");
              }}
              className="px-6 py-2.5 rounded-lg bg-[#3A6EA5] text-white font-medium hover:bg-[#2E5A8C] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Limpiar filtros
            </button>
          </motion.div>
        )}
      </div>
    </div>
    </div>
   </div>          
  )
  }