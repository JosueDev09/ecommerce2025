"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { VariantesSelector } from "@/lib/getVariantes";
import { Producto, ItemCarrito } from "@/types/types"; // si tienes tipos definidos

interface Productos{
  intProducto: number;
  strNombre: string;
  strSKU?: string;
  strMarca?: string;
  strDescripcion: string;
  dblPrecio: number;
  strImagen: string;
  bolActivo: boolean;
  bolDestacado?: boolean;
  strEstado?: string;
  bolTieneDescuento?: boolean;
  dblPrecioDescuento?: number;
  intPorcentajeDescuento?: number;
  datInicioDescuento?: string;
  datFinDescuento?: string;
  strEtiquetas?: string;
  jsonVariantes?: string;
  jsonImagenes?: string;
  datCreacion: string;
  datActualizacion?: string;
  tbCategoria: {
    intCategoria: number;
    strNombre: string;
  };
 
}



export default function Products() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [productos, setProductos] = useState<Productos[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<number, { color: string | null; talla: string | null }>>({});
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  // const filters = ["Todos", "Electrónica", "Deportes", "Moda"];

    useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/graphql', { 
          method: 'POST',
          headers: {
            
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                obtenerProductos {
                  intProducto
                  strNombre
                  strSKU
                  strMarca
                  strDescripcion
                  dblPrecio
                  strImagen
                  bolActivo
                  bolDestacado
                  strEstado
                  bolTieneDescuento
                  dblPrecioDescuento
                  intPorcentajeDescuento
                  datInicioDescuento
                  datFinDescuento
                  strEtiquetas
                  jsonVariantes
                  jsonImagenes
                  datCreacion
                  datActualizacion
                  tbCategoria {
                    intCategoria
                    strNombre
                  }
                }
              }
            `,
          }),
        });
        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched products:', data.data.obtenerProductos);
        setProductos(data.data.obtenerProductos);
      } catch (error) {
        console.error('Error fetching products:', error);
      } 
    };

    fetchProductos().then(() => setLoading(false));
  }, []);

  const handleVariantChange = (productId: number, color: string | null, talla: string | null) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: { color, talla }
    }));
  };

  const agregarCarrito = (producto: Productos) => {
  const variants = selectedVariants[producto.intProducto];

  // Datos seleccionados por el usuario
  const colorSeleccionado = variants?.color || null;
  const tallaSeleccionada = variants?.talla || null;

  // Construyes el objeto limpio para el carrito
  const itemCarrito: ItemCarrito = {
    id: producto.intProducto,
    nombre: producto.strNombre,
    precio: producto.dblPrecio,
    precioDescuento: producto.dblPrecioDescuento || null,
    tieneDescuento: producto.bolTieneDescuento || false,
    color: colorSeleccionado,
    talla: tallaSeleccionada,
    imagen: producto.strImagen,
    categoria: producto.tbCategoria?.strNombre || "",
    cantidad: 1,
  };
  // Agregas al carrito (depende de cómo lo manejes: localStorage, Zustand, Redux, etc.)
  setCarrito((prev) => {
    // Verifica si ya existe el producto (por id, color, talla)
    const existe = prev.find(
      (p) =>
        p.id === itemCarrito.id &&
        p.color === itemCarrito.color &&
        p.talla === itemCarrito.talla
    );

    if (existe) {
      // Si ya existe, aumenta cantidad
      return prev.map((p) =>
        p.id === itemCarrito.id &&
        p.color === itemCarrito.color &&
        p.talla === itemCarrito.talla
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
      );
    } else {
      // Si no existe, lo agrega
      return [...prev, itemCarrito];
    }
  });
};
  
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
          {/* {filters.map((filter) => (
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
          ))} */}
        </motion.div>

        {/* 🔹 Grid de productos */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {productos.map((product) => (
            <motion.div
              key={product.intProducto}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(58,110,165,0.15)] transition-all duration-500"
            >
              {/* Badge */}
              {product.strEtiquetas  && (
                <div className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                  product.strEtiquetas === "nuevo" 
                    ? "bg-[#3A6EA5] text-white" 
                    : product.strEtiquetas === "oferta"
                    ? "bg-[#E6C89C] text-[#1A1A1A]"
                    : "bg-[#8BAAAD] text-white"
                }`}>
                  {product.strEtiquetas}
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
                  src="https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-17-pro-model-unselect-gallery-2-202509_GEO_MX?wid=5120&hei=2880&fmt=webp&qlt=90&.v=dU9qRExIQUlQTzVKeDd1V1dtUE1MUWFRQXQ2R0JQTk5udUZxTkR3ZVlpTEJBSVhDREVhQVF4eThVb2E3Y2VibTYrcU5CYm51V0Nra1JFSWxzZmF3NEE3b3pFWnhZZ2g0M0pRR0pEdHVSRUVtYkFqYmVJbENIK1gycDVvVjJtTEZhNHNsSjNVUDRGQ01ucUJrbVdONTBR&traceId=1"
                  alt={product.strNombre}
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
                <p className="text-xs text-[#3A6EA5] font-medium mb-2">{product.tbCategoria.strNombre}</p>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 line-clamp-2 group-hover:text-[#3A6EA5] transition-colors duration-300">
                  {product.strNombre}
                </h3>

                {/* Rating */}
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

                {/* Variantes */}
                {product.jsonVariantes && (
                  <VariantesSelector 
                    product={product} 
                    onVariantChange={(color: string | null, talla: string | null) => handleVariantChange(product.intProducto, color, talla)}
                  />
                )}
                
                {/* Precio */}
              <div className="flex items-baseline gap-2 mb-4">
                {product.bolTieneDescuento ? (
                  <>
                    <span className="text-2xl font-bold text-[#1A1A1A]">
                      ${product.dblPrecioDescuento?.toLocaleString()}
                    </span>
                    <span className="text-sm text-[#1A1A1A]/40 line-through">
                      ${product.dblPrecio.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-[#1A1A1A]">
                    ${product.dblPrecio.toLocaleString()}
                  </span>
                )}
              </div>

                {/* Botón agregar al carrito */}
                <button className="w-full py-2.5 rounded-xl bg-[#3A6EA5] text-white font-medium hover:bg-[#2E5A8C] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                   onClick={() => agregarCarrito(product)}>
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