"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Productos } from "@/types/types";
import { useTienda } from "@/context/TiendaContext";
import { VariantesSelector } from "@/lib/getVariantes";
import { 
  Check, ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, 
  ChevronRight, MapPin, CreditCard, Award, MessageCircle, Store,
  Clock, Lock, Tag, Share2, AlertCircle
} from "lucide-react";

export default function ProductoDetalle() {
  const params = useParams();
  const router = useRouter();
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
  const [showImageZoom, setShowImageZoom] = useState(false);

  // Callback para manejar cambios de variantes
  const handleVariantChange = (color: string | null, talla: string | null) => {
    setSelectedColor(color);
    setSelectedTalla(talla);
  };

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
            try {
              const variantes = JSON.parse(productoEncontrado.jsonVariantes);
              const colorObj = variantes.find((v: any) => 
                v.nombre?.toLowerCase() === "color" || v.nombre?.toLowerCase() === "colores"
              );
              const tallaObj = variantes.find((v: any) => 
                v.nombre?.toLowerCase() === "talla" || v.nombre?.toLowerCase() === "tallas"
              );
              
              if (colorObj) {
                const colores = Array.isArray(colorObj.valor) 
                  ? colorObj.valor 
                  : colorObj.valor.split(",").map((c: string) => c.trim());
                setSelectedColor(colores[0]);
              }
              if (tallaObj) {
                const tallas = Array.isArray(tallaObj.valor) 
                  ? tallaObj.valor 
                  : tallaObj.valor.split(",").map((t: string) => t.trim());
                setSelectedTalla(tallas[0]);
              }
            } catch (error) {
              console.error("Error al parsear variantes:", error);
            }
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

  const imagenesAdicionales = getImagenes();
  const todasLasImagenes = [producto.strImagen, ...imagenesAdicionales];

  return (
    <div className="min-h-screen  py-6 px-4 md:px-6 mt-[100px]">
      {/* Toast de éxito */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="fixed top-6 right-6 z-[9999] bg-white border-l-4 border-emerald-500 rounded-md shadow-lg p-4 flex items-center gap-3"
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-4 text-[#1A1A1A]/60">
          <button onClick={() => router.push('/')} className="hover:text-[#3A6EA5] transition-colors">
            Inicio
          </button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => router.push('/products')} className="hover:text-[#3A6EA5] transition-colors">
            Productos
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1A1A1A]/80">{producto?.tbCategoria.strNombre}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1A1A1A] font-medium truncate max-w-[200px]">{producto?.strNombre}</span>
        </div>
        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Columna izquierda: Galería + Detalles */}
          <div className="space-y-4">
            {/* Galería de imágenes - Estilo Apple Store */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Imagen principal */}
              <div className="relative aspect-square overflow-hidden bg-[#FAFAFA]"
                   onClick={() => setShowImageZoom(true)}>
                {producto.strEtiquetas && (
                  <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${
                    producto.strEtiquetas === "Nuevo"
                      ? "bg-black/80 text-white"
                      : producto.strEtiquetas === "Oferta"
                      ? "bg-red-500/90 text-white"
                      : "bg-orange-500/90 text-white"
                  }`}>
                    {producto.strEtiquetas}
                  </div>
                )}
                
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFavorite(!isFavorite);
                    }}
                    className="p-2.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white hover:scale-110 transition-all shadow-sm"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFavorite ? "text-red-500 fill-red-500" : "text-[#1A1A1A]/70"
                      }`}
                    />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2.5 rounded-full bg-white/95 backdrop-blur-md hover:bg-white hover:scale-110 transition-all shadow-sm"
                  >
                    <Share2 className="w-5 h-5 text-[#1A1A1A]/70" />
                  </button>
                </div>

                <motion.img
                  key={imagenActual}
                  src={imagenActual}
                  alt={producto.strNombre}
                  className="w-full h-full object-cover cursor-zoom-in"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>

              {/* Miniaturas - Estilo Apple */}
              {todasLasImagenes.length > 1 && (
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {todasLasImagenes.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setImagenActual(img)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all ${
                          imagenActual === img
                            ? "ring-2 ring-[#0071e3] ring-offset-2 scale-105"
                            : "ring-1 ring-gray-200 hover:ring-gray-300 hover:scale-105"
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`${producto.strNombre} ${idx + 1}`} 
                          className="w-full h-full object-cover bg-[#FAFAFA]" 
                        />
                        {imagenActual === img && (
                          <motion.div
                            layoutId="thumbnail-indicator"
                            className="absolute inset-0 border-2 border-[#0071e3] rounded-xl"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Descripción del producto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-md shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Descripción</h2>
              <p className="text-[#1A1A1A]/80 leading-relaxed mb-4">{producto.strDescripcion}</p>
              
              {/* Características */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Características principales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {producto.strMarca && (
                    <div className="flex items-start gap-2">
                      <Tag className="w-4 h-4 text-[#3A6EA5] mt-0.5" />
                      <div>
                        <p className="text-xs text-[#1A1A1A]/60">Marca</p>
                        <p className="text-sm font-medium text-[#1A1A1A]">{producto.strMarca}</p>
                      </div>
                    </div>
                  )}
                  {producto.strSKU && (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[#3A6EA5] mt-0.5" />
                      <div>
                        <p className="text-xs text-[#1A1A1A]/60">SKU</p>
                        <p className="text-sm font-medium text-[#1A1A1A]">{producto.strSKU}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-[#3A6EA5] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#1A1A1A]/60">Garantía</p>
                      <p className="text-sm font-medium text-[#1A1A1A]">1 año</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Store className="w-4 h-4 text-[#3A6EA5] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#1A1A1A]/60">Vendido por</p>
                      <p className="text-sm font-medium text-[#3A6EA5]">ESYMBEL</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            

            {/* Preguntas frecuentes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-white rounded-md shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Preguntas y respuestas</h2>
              
              <div className="space-y-3 mb-4">
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm font-medium text-[#1A1A1A] mb-1">¿Cuánto tarda el envío?</p>
                  <p className="text-xs text-[#1A1A1A]/70">El tiempo de entrega es de 3 a 5 días hábiles.</p>
                </div>
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm font-medium text-[#1A1A1A] mb-1">¿Tiene garantía?</p>
                  <p className="text-xs text-[#1A1A1A]/70">Sí, todos nuestros productos cuentan con 1 año de garantía.</p>
                </div>
              </div>

              <button className="flex items-center gap-2 text-sm text-[#3A6EA5] font-medium hover:underline">
                <MessageCircle className="w-4 h-4" />
                Hacer una pregunta
              </button>
            </motion.div>
          </div>

          {/* Columna derecha: Panel de compra sticky */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="bg-white rounded-md shadow-sm p-6 space-y-5"
            >
              {/* Nuevo/Usado Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#1A1A1A]/60">
                  {producto.strEstado || 'Nuevo'} | +100 vendidos
                </span>
                <span className="text-xs font-semibold text-[#3A6EA5] bg-[#3A6EA5]/10 px-2 py-1 rounded">
                  {producto.tbCategoria.strNombre}
                </span>
              </div>

              {/* Título */}
              <h1 className="text-xl font-normal text-[#1A1A1A] leading-tight">
                {producto.strNombre}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? "text-[#FFD700] fill-[#FFD700]" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#1A1A1A]/60">(0)</span>
              </div>

              {/* Precio */}
              <div className="space-y-1">
                {esDescuentoActivo(producto) ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-light text-[#1A1A1A]">
                        ${producto.dblPrecioDescuento?.toLocaleString()}
                      </span>
                      {producto.intPorcentajeDescuento && (
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">
                          {producto.intPorcentajeDescuento}% OFF
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-[#1A1A1A]/50 line-through">
                      ${producto.dblPrecio.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-light text-[#1A1A1A]">
                    ${producto.dblPrecio.toLocaleString()}
                  </span>
                )}
                <p className="text-xs text-green-600 font-medium">Envío gratis a todo el país</p>
              </div>

              {/* Disponibilidad */}
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-md">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-700">Stock disponible</p>
                  <p className="text-xs text-[#1A1A1A]/70">Última disponible</p>
                </div>
              </div>

              {/* Ubicación de envío */}
              {/* <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[#1A1A1A]/60" />
                <span className="text-[#1A1A1A]/80">Llega gratis mañana</span>
              </div> */}

              {/* Llega hoy si compras en... */}
              {/* <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-700 font-medium">
                  Comprando ahora lo recibís el lunes
                </span>
                </div> */}

              {/* Selector de Variantes (Color y Talla) */}
              <VariantesSelector 
                product={producto} 
                onVariantChange={handleVariantChange}
              />

              {/* Cantidad */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[#1A1A1A]">Cantidad:</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 text-[#1A1A1A] font-medium transition-all"
                  >
                    -
                  </button>
                  <span className="text-lg font-normal text-[#1A1A1A] w-8 text-center">{cantidad}</span>
                  <button
                    onClick={() => setCantidad(cantidad + 1)}
                    className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 text-[#1A1A1A] font-medium transition-all"
                  >
                    +
                  </button>
                  <span className="text-xs text-[#1A1A1A]/60 ml-2">({cantidad} {cantidad === 1 ? 'unidad' : 'unidades'})</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleAgregarCarrito}
                  className="w-full py-3 rounded bg-[#3483FA] text-white text-sm font-semibold hover:bg-[#2968C8] transition-all"
                >
                  Comprar ahora
                </button>
                <button
                  onClick={handleAgregarCarrito}
                  className="w-full py-3 rounded bg-[#E6F2FF] text-[#3483FA] text-sm font-semibold hover:bg-[#D6E9FF] transition-all"
                >
                  Agregar al carrito
                </button>
              </div>

              {/* Garantías y Beneficios */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Lo que tienes que saber</h3>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#1A1A1A]">Compra Protegida</p>
                    <p className="text-xs text-[#1A1A1A]/70">Recibe el producto que esperabas o te devolvemos tu dinero</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#1A1A1A]">Envío gratis</p>
                    <p className="text-xs text-[#1A1A1A]/70">Conoce los tiempos y formas de envío</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-md">
                  <RotateCcw className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#1A1A1A]">Devolución gratis</p>
                    <p className="text-xs text-[#1A1A1A]/70">Tenés 30 días desde que lo recibís</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-[#1A1A1A]/70">Compra protegida</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-[#1A1A1A]/70">12 meses de garantía de fábrica</span>
                </div>
              </div>

              {/* Medios de pago */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Medios de pago</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#1A1A1A]/70 mb-2">Tarjetas de crédito y débito</p>
                    <div className="flex gap-2 flex-wrap">
                      {/* Visa */}
                      <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center p-1">
                         <img 
                          src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg" 
                          alt="Mercado Pago" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Mastercard */}
                      <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center p-1">
                         <img 
                          src="https://http2.mlstatic.com/storage/logos-api-admin/9cf818e0-723a-11f0-a459-cf21d0937aeb-m.svg" 
                          alt="Mercado Pago" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* American Express */}
                      <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center p-1">
                        <svg viewBox="0 0 48 32" className="w-full h-full">
                          <rect width="48" height="32" rx="2" fill="#006FCF"/>
                          <text x="24" y="20" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Arial">AMEX</text>
                        </svg>
                      </div>

                      
                      {/* Mercado Pago */}
                      <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center p-1">
                        <img 
                          src="https://http2.mlstatic.com/storage/logos-api-admin/f3e8e940-f549-11ef-bad6-e9962bcd76e5-m.svg" 
                          alt="Mercado Pago" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <button className="flex items-center gap-2 text-xs text-[#3A6EA5] font-medium hover:underline">
                    <CreditCard className="w-4 h-4" />
                    Ver todos los medios de pago
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
