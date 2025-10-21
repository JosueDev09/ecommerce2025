"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const products = [
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
//   {
//     id: 4,
//     name: "Lámpara Minimalista LED",
//     category: "Hogar",
//     price: 1299,
//     originalPrice: 1899,
//     image: "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800",
//     rating: 4.6,
//     reviews: 156,
//     badge: null,
//     inStock: true,
//   },
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
//   {
//     id: 7,
//     name: "Set de Té Premium",
//     category: "Hogar",
//     price: 899,
//     originalPrice: 1299,
//     image: "https://images.pexels.com/photos/1879306/pexels-photo-1879306.jpeg?auto=compress&cs=tinysrgb&w=800",
//     rating: 4.8,
//     reviews: 145,
//     badge: null,
//     inStock: true,
//   },
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
];

export default function Products() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const filters = ["Todos", "Electrónica", "Deportes", "Moda"];

  const filteredProducts = activeFilter === "Todos" 
    ? products 
    : products.filter(p => p.category === activeFilter);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.8, 0.25, 1] as any,
      },
    },
  };

  return (
    <section className="relative w-full py-20 md:py-28 bg-gradient-to-b from-[#F5F5F5] to-[#FFFFFF] overflow-hidden">
      {/* 🔹 Decoraciones de fondo */}
      <div className="absolute top-32 right-20 w-96 h-96 bg-[#3A6EA5]/15 rounded-full blur-[140px]" />
      <div className="absolute bottom-40 left-20 w-80 h-80 bg-[#E6C89C]/25 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* 🔹 Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Productos{" "}
            <span className="bg-gradient-to-r from-[#3A6EA5] via-[#8BAAAD] to-[#E6C89C] bg-clip-text text-transparent">
              Destacados
            </span>
          </h2>
          <p className="text-[#1A1A1A]/70 text-lg max-w-2xl mx-auto">
            Los favoritos de nuestros clientes con ofertas exclusivas
          </p>
        </motion.div>

        {/* 🔹 Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                activeFilter === filter
                  ? "bg-[#3A6EA5] text-white shadow-[0_4px_15px_rgba(58,110,165,0.3)]"
                  : "bg-white text-[#1A1A1A]/70 hover:bg-[#F5F5F5] hover:text-[#3A6EA5] border border-[#F5F5F5]"
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        {/* 🔹 Grid de productos */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={activeFilter}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(58,110,165,0.15)] transition-all duration-500"
            >
              {/* Badge */}
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

              {/* Botón de favorito */}
              <button className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-md hover:scale-110">
                <svg className="w-5 h-5 text-[#1A1A1A]/60 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Imagen */}
              <div className="relative h-64 overflow-hidden bg-[#F5F5F5]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay con botón de vista rápida */}
                <div className="absolute inset-0 bg-[#1A1A1A]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button className="px-6 py-2.5 rounded-full bg-white text-[#3A6EA5] font-medium hover:bg-[#3A6EA5] hover:text-white transition-all duration-300 transform scale-90 group-hover:scale-100">
                    Vista rápida
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5">
                <p className="text-xs text-[#3A6EA5] font-medium mb-2">{product.category}</p>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 line-clamp-2 group-hover:text-[#3A6EA5] transition-colors duration-300">
                  {product.name}
                </h3>

                {/* Rating */}
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

                {/* Precio */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-[#1A1A1A]">
                    ${product.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-[#1A1A1A]/40 line-through">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                </div>

                {/* Botón agregar al carrito */}
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

        {/* 🔹 CTA Ver más */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-16"
        >
          <a
            href="/products"
            className="inline-flex items-center px-8 py-3 rounded-full bg-[#3A6EA5] text-white font-medium hover:bg-[#2E5A8C] transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Ver todos los productos
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}