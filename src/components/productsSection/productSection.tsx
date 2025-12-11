"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { VariantesSelector } from "@/lib/getVariantes";
import { useTienda } from "@/context/TiendaContext";
import { pre } from "framer-motion/client";
import { Check } from "lucide-react";
import { createProductSlug } from "@/lib/slugify";
import { formatFecha } from "@/utils/formatearFechas";


export default function Products() {
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    productos,
    agregarCarrito,
    handleVariantChange,
    getCantidadPorProducto,
    loading,
  } = useTienda();

  //console.log("Productos en ProductsSection:", productos);
  // Función para validar si el descuento está activo
  const esDescuentoActivo = (product: any) => {
    if (
      !product.bolTieneDescuento ||
      !product.datInicioDescuento ||
      !product.datFinDescuento
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

    // Ocultar el mensaje después de 3 segundos
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




  return (
    <section className="w-full bg-white">
      <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-white/10">


        {productos.filter(product => product.bolActivo).map((product, index) => (
            
              <motion.div 
                key={product.intProducto} 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="w-full flex flex-col items-center text-center bg-white/80 p-10 md:p-16 hover:bg-black/10 transition-colors duration-500"
              >

                {/* Título */}
                <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-black mt-6 tracking-tight">
                  {product.strNombre}
                </h2>

                {/* Subtítulo */}
                <p className="font-[family-name:var(--font-inter)] text-black/60 text-base md:text-lg mt-4 leading-relaxed max-w-2xl">
                  {product.strDescripcion}
                </p>

                {/* Botones */}
                <div className="flex gap-4 mt-8">
                  <Link
                    href={`/producto/${createProductSlug(product.strNombre)}`}
                    className="px-8 py-3  border border-black  text-black font-[family-name:var(--font-inter)] text-xs tracking-[0.15em] uppercase font-medium hover:bg-white/90 transition-all duration-300"
                  >
                    Ver Más
                  </Link>

                  <Link
                    href={`/producto/${createProductSlug(product.strNombre)}`}
                    className="px-8 py-3 bg-black border border-black text-white font-[family-name:var(--font-inter)] text-xs tracking-[0.15em] uppercase font-medium transition-all duration-300"
                  >
                    Comprar
                  </Link>
                </div>

                {/* Imagen */}
                <div className="relative w-full flex-1 mx-auto mt-12 min-h-[400px]">
                  <img
                    src={product.strImagen}
                    alt={product.strNombre}
                    className="w-full h-full object-cover mx-auto select-none pointer-events-none"
                  />
                </div>

              </motion.div>
        ))}



      </div>


    </section>
  );
}