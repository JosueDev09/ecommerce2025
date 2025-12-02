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

    if (loading) return <p>Cargando productos...</p>;


  

  return (
    <section className="w-full">
      <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        { productos.map((product) => (
        <div key={product.intProducto} className="w-full flex flex-col items-center text-center bg-[#f5f5f7] p-10">

          {/* Título */}
          <h2 className="text-5xl font-semibold mt-6">{product.strNombre}</h2>

          {/* Subtítulo */}
          <p className="text-gray-600 text-xl mt-3 leading-snug">
            {product.strDescripcion}
          </p>

          {/* Botones */}
          <div className="flex gap-4 mt-6">
            <Link
              href="#"
              className="px-6 py-2 bg-[#0071e3] text-white rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              Ver Más
            </Link>

            <Link
              href="#"
              className="px-6 py-2 border border-[#0071e3] text-[#0071e3] rounded-full text-sm font-medium hover:bg-[#0071e3] hover:text-white transition"
            >
              Comprar
            </Link>
          </div>

          {/* Imagen */}
          <div className="relative w-full max-w-3xl mx-auto mt-10">
            <img
              src={product.strImagen}
              alt={product.strNombre}
              width={1500}
              height={900}
              className="object-contain mx-auto select-none pointer-events-none"
            />
          </div>

        </div>
        ))}

       

      </div>


    </section>
  );
}