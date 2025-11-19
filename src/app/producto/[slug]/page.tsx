"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Productos } from "@/types/types";
import { useTienda } from "@/context/TiendaContext";
import { Check, ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from "lucide-react";

export default function ProductoDetalle() {
  const params = useParams();
  const slug = params.slug as string;
  const { agregarCarrito } = useTienda();

  const [producto, setProducto] = useState<Productos | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [imagenActual, setImagenActual] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Función para validar si el descuento está activo
  const esDescuentoActivo = (producto: Productos | null) => {
    if (!producto || !producto.bolTieneDescuento || !producto.datInicioDescuento || !producto.datFinDescuento) {
      return false;
    }

    const ahora = new Date();
    const fechaInicio = new Date(producto.datInicioDescuento);
    const fechaFin = new Date(producto.datFinDescuento);

    return ahora >= fechaInicio && ahora <= fechaFin;
  };

  // Cargar producto
  useEffect(() => {
    const fetchProducto = async () => {
      try {
      //  console.log("🔄 Cargando producto con slug:", slug);
        const response = await fetch("http://localhost:3000/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
               query ($strNombre: String!) {
                obtenerProducto(strNombre: $strNombre) {
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
             variables: { strNombre: slug },
             
          }),
        });
       
        const data = await response.json();
        // console.log("📦 Producto cargado:", data);
        const producto = data.data.obtenerProducto;

        //console.log("📦 Producto cargado:", producto);
        // Buscar el producto por slug (usando el ID del slug)
       // const productoId = parseInt(slug);
        //console.log("🔍 Buscando producto con ID:", productoId);
        const productoEncontrado = producto;
       // console.log("🔍 Producto encontrado:", productoEncontrado);
        if (productoEncontrado) {
          setProducto(productoEncontrado);
          setImagenActual(productoEncontrado.strImagen);
          
          // Parsear variantes y establecer valores por defecto
          if (productoEncontrado.jsonVariantes) {
            const variantes = JSON.parse(productoEncontrado.jsonVariantes);
            const colorObj = variantes.find((v: any) => v.nombre === "color");
            const tallaObj = variantes.find((v: any) => v.nombre === "talla");
            
            if (colorObj) setSelectedColor(colorObj.valor[0]);
            if (tallaObj) setSelectedTalla(tallaObj.valor[0]);
          }
        }
      } catch (error) {
        console.error("❌ Error al cargar producto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [slug]);

  // Parsear variantes
  const getVariantes = () => {
    if (!producto?.jsonVariantes) return { colores: [], tallas: [] };
    
    try {
      const variantes = JSON.parse(producto.jsonVariantes);
      const colorObj = variantes.find((v: any) => v.nombre === "color");
      const tallaObj = variantes.find((v: any) => v.nombre === "talla");
      
      return {
        colores: colorObj?.valor || [],
        tallas: tallaObj?.valor || [],
      };
    } catch {
      return { colores: [], tallas: [] };
    }
  };

  // Parsear imágenes adicionales
  const getImagenes = () => {
    if (!producto?.jsonImagenes) return [];
    
    try {
      return JSON.parse(producto.jsonImagenes);
    } catch {
      return [];
    }
  };

  const handleAgregarCarrito = () => {
    if (!producto) return;

    // Agregar el producto la cantidad de veces especificada
    for (let i = 0; i < cantidad; i++) {
      agregarCarrito(producto);
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3A6EA5] mx-auto mb-4"></div>
          <p className="text-[#1A1A1A]/70">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Producto no encontrado</h2>
          <p className="text-[#1A1A1A]/70">El producto que buscas no existe</p>
        </div>
      </div>
    );
  }

  const { colores, tallas } = getVariantes();
  const imagenesAdicionales = getImagenes();
  const todasLasImagenes = [producto.strImagen, ...imagenesAdicionales];
  const esElectronica = producto.tbCategoria.strNombre === "Electronica";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F5] to-[#FFFFFF] py-8 px-4 md:px-6 mt-[100px]">
      {/* Toast de éxito */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="fixed top-6 right-6 z-[9999] bg-white border-l-4 border-emerald-500 rounded-xl shadow-2xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-[#1A1A1A]">¡Agregado al carrito!</p>
            <p className="text-sm text-[#1A1A1A]/60">Producto agregado exitosamente</p>
          </div>
          <button onClick={() => setShowSuccess(false)} className="ml-4 text-[#1A1A1A]/40 hover:text-[#1A1A1A]">
            ✕
          </button>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Imagen principal */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-4 relative aspect-square">
              {producto.strEtiquetas && (
                <div className={`absolute top-4 left-4 z-10 px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                  producto.strEtiquetas === "Nuevo"
                    ? "bg-[#3A6EA5] text-white"
                    : producto.strEtiquetas === "Oferta"
                    ? "bg-[#E6C89C] text-[#1A1A1A]"
                    : "bg-[#8BAAAD] text-white"
                }`}>
                  {producto.strEtiquetas}
                </div>
              )}
              
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-lg hover:scale-110"
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    isFavorite ? "text-red-500 fill-red-500" : "text-[#1A1A1A]/60"
                  }`}
                />
              </button>

              <img
                src={imagenActual}
                alt={producto.strNombre}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Miniaturas */}
            {todasLasImagenes.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {todasLasImagenes.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImagenActual(img)}
                    className={`bg-white rounded-xl overflow-hidden aspect-square transition-all ${
                      imagenActual === img
                        ? "ring-4 ring-[#3A6EA5] shadow-lg"
                        : "hover:ring-2 ring-[#3A6EA5]/30"
                    }`}
                  >
                    <img src={img} alt={`${producto.strNombre} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Información del producto */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            {/* Categoría y SKU */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-semibold text-[#3A6EA5] bg-[#3A6EA5]/10 px-3 py-1 rounded-full">
                {producto.tbCategoria.strNombre}
              </span>
              {producto.strSKU && (
                <span className="text-sm text-[#1A1A1A]/40">SKU: {producto.strSKU}</span>
              )}
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              {producto.strNombre}
            </h1>

            {/* Marca */}
            {producto.strMarca && (
              <p className="text-lg text-[#1A1A1A]/60 mb-4">
                Por <span className="font-semibold text-[#3A6EA5]">{producto.strMarca}</span>
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < 4 ? "text-[#E6C89C] fill-[#E6C89C]" : "text-[#1A1A1A]/20"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-[#1A1A1A]/60">(0 reseñas)</span>
            </div>

            {/* Precio */}
            <div className="flex items-baseline gap-4 mb-6 pb-6 border-b border-[#F5F5F5]">
              {esDescuentoActivo(producto) ? (
                <>
                  <span className="text-4xl font-bold text-[#3A6EA5]">
                    ${producto.dblPrecioDescuento?.toLocaleString()}
                  </span>
                  <span className="text-2xl text-[#1A1A1A]/40 line-through">
                    ${producto.dblPrecio.toLocaleString()}
                  </span>
                  {producto.intPorcentajeDescuento && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-sm font-semibold">
                      -{producto.intPorcentajeDescuento}%
                    </span>
                  )}
                </>
              ) : (
                <span className="text-4xl font-bold text-[#3A6EA5]">
                  ${producto.dblPrecio.toLocaleString()}
                </span>
              )}
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Descripción</h3>
              <p className="text-[#1A1A1A]/70 leading-relaxed">{producto.strDescripcion}</p>
            </div>

            {/* Selector de Color */}
            {colores.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">
                  Color: <span className="font-normal text-[#3A6EA5]">{selectedColor}</span>
                </h3>
                <div className="flex gap-3">
                  {colores.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? "border-[#3A6EA5] ring-4 ring-[#3A6EA5]/20 scale-110"
                          : "border-[#F5F5F5] hover:border-[#3A6EA5]/50"
                      }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Selector de Talla (solo para ropa) */}
            {!esElectronica && tallas.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">
                  Talla: <span className="font-normal text-[#3A6EA5]">{selectedTalla}</span>
                </h3>
                <div className="flex gap-3">
                  {tallas.map((talla: string) => (
                    <button
                      key={talla}
                      onClick={() => setSelectedTalla(talla)}
                      className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                        selectedTalla === talla
                          ? "border-[#3A6EA5] bg-[#3A6EA5] text-white"
                          : "border-[#F5F5F5] bg-white text-[#1A1A1A] hover:border-[#3A6EA5]"
                      }`}
                    >
                      {talla}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cantidad */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Cantidad</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="w-12 h-12 rounded-lg bg-[#F5F5F5] hover:bg-[#E6C89C] text-[#1A1A1A] font-bold transition-all"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-[#1A1A1A] w-12 text-center">{cantidad}</span>
                <button
                  onClick={() => setCantidad(cantidad + 1)}
                  className="w-12 h-12 rounded-lg bg-[#F5F5F5] hover:bg-[#E6C89C] text-[#1A1A1A] font-bold transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAgregarCarrito}
                className="flex-1 py-4 rounded-xl bg-[#3A6EA5] text-white font-bold hover:bg-[#2E5A8C] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Agregar al carrito
              </button>
            </div>

            {/* Beneficios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F5F5F5]/50">
                <Truck className="w-6 h-6 text-[#3A6EA5]" />
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">Envío Gratis</p>
                  <p className="text-xs text-[#1A1A1A]/60">En compras +$500</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F5F5F5]/50">
                <Shield className="w-6 h-6 text-[#3A6EA5]" />
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">Garantía</p>
                  <p className="text-xs text-[#1A1A1A]/60">1 año de garantía</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F5F5F5]/50">
                <RotateCcw className="w-6 h-6 text-[#3A6EA5]" />
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">Devoluciones</p>
                  <p className="text-xs text-[#1A1A1A]/60">30 días</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
