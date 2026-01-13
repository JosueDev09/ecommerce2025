"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Productos } from "@/types/types";
import { useTienda } from "@/context/TiendaContext";
import { useAuth } from "@/context/AuthContext";
import { VariantesSelector } from "@/lib/getVariantes";
import { createProductSlug } from "@/lib/slugify";
import { 
  Check, ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, 
  ChevronRight, MapPin, CreditCard, Award, MessageCircle, Store,
  Clock, Lock, Tag, Share2, AlertCircle,X
} from "lucide-react";

export default function ProductoDetalle() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { agregarCarrito, handleVariantChange: updateContextVariant, productos } = useTienda();
  const { user, token } = useAuth();


  const [producto, setProducto] = useState<Productos | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<any>(null);
  const [cantidad, setCantidad] = useState(1);
  const [talla, setTalla] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [imagenActual, setImagenActual] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sugerenciasIndex, setSugerenciasIndex] = useState(0);
  
  // Estados para sistema de calificación rápida
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  
  // Estados para sección de comentarios
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newCommentRating, setNewCommentRating] = useState(0);
  const [hoverCommentRating, setHoverCommentRating] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [reviewsFilter, setReviewsFilter] = useState<"all" | 5 | 4 | 3 | 2 | 1>("all");
  
  const ratingPromedioNumber =
  producto?.tbProducto_Reviews?.length
    ? Number(
        (producto.tbProducto_Reviews.reduce(
          (acc, review) => acc + review.intCalificacion,
          0
        ) / producto.tbProducto_Reviews.length
      ).toFixed(1))
    : 0; // ej. 4.3 como número
  const totalReviews = producto?.tbProducto_Reviews?.length ?? 0;


  //console.log("🔍 Producto actual:", producto?.tbProducto_Reviews);

  //Manejo de stock por talla y color 
 
      const stockDisponible = useMemo(() => {
        // console.log("🟡 useMemo ejecutado", {
        //   talla,
        //   color,
        //   variantes: producto?.tbProductoVariantes
        // });

        if (!talla || !color || !producto?.tbProductoVariantes) return 0;

        const variante = producto.tbProductoVariantes.find(
          v => v.strTalla === talla && v.strColor === color
        );

        //console.log("🔍 Variante encontrada:", variante);
        return variante?.intStock ?? 0;
      }, [talla, color, producto]);

  useEffect(() => {
            if (
              producto?.tbProductoVariantes?.length &&
              !talla &&
              !color
            ) {
              const primeraDisponible = producto.tbProductoVariantes.find(
                v => v.intStock > 0
              );

              if (primeraDisponible) {
                setTalla(primeraDisponible.strTalla);
                setColor(primeraDisponible.strColor);
              }
            }
          }, [producto]);
  // Callback para manejar cambios de variantes
  const handleVariantChange = (
    color: string | null, 
    talla: string | null, 
    varianteCompleta?: any
  ) => {
    setSelectedColor(color);
    setSelectedTalla(talla);
    setVarianteSeleccionada(varianteCompleta || null);
    
    // Actualizar el contexto global
    if (producto) {
      updateContextVariant(producto.intProducto, color, talla, varianteCompleta);
    }
    
    // Si la variante tiene imagen propia, cambiar la imagen actual
    if (varianteCompleta?.strImagen) {
      setImagenActual(varianteCompleta.strImagen);
    }

    // console.log('✅ Variante cambiada:', {
    //   color,
    //   talla,
    //   stock: varianteCompleta?.intStock,
    //   precioAdicional: varianteCompleta?.dblPrecioAdicional
    // });
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

  // Función para cargar producto (reutilizable)
  const fetchProducto = async () => {
    try {
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
                strDescripcionLarga
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
                datActualizacion,
                intStock
                tbCategoria {
                  intCategoria
                  strNombre
                }
                tbProductoVariantes {
                  intVariante
                  intProducto
                  strTalla
                  strColor
                  intStock
                  strSKU
                  dblPrecioAdicional
                  strImagen
                  bolActivo
                  datCreacion
                  datActualizacion
                }
                tbProducto_Reviews {
                  intReview     
                  intProducto   
                  intCliente    
                  intCalificacion 
                  strComentario   
                  datCreacion    
                }
              }
            }
          `,
           variables: { strNombre: slug },
           
        }),
      });
     
      const data = await response.json();
      const producto = data.data.obtenerProducto;
      console.log("🔍 Producto cargado:", producto);

      if (producto) {
        setProducto(producto);
        setImagenActual(producto.strImagen);
        
        // Parsear variantes y establecer valores por defecto
        if (producto.jsonVariantes) {
          try {
            const variantes = JSON.parse(producto.jsonVariantes);
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

  // Cargar producto al montar
  useEffect(() => {
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
    if(selectedTalla === null || selectedColor === null){
      alert("Por favor selecciona talla y color");
      return;
    }
    // Agregar el producto la cantidad de veces especificada
    for (let i = 0; i < cantidad; i++) {
      agregarCarrito(producto);
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Manejar calificación rápida (solo estrellas, sin comentario obligatorio)
  const handleQuickRating = async (rating: number) => {
    if (!producto) return;
    
    // Verificar que el usuario esté logueado
    if (!user || !user.intCliente) {
      alert("Debes iniciar sesión para calificar este producto");
      router.push("/login");
      return;
    }
    
    setUserRating(rating);
    setIsSubmittingRating(true);

    try {
      const response = await fetch("http://localhost:3000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CrearReviewRapida($intProducto: Int!, $intCliente: Int!, $intCalificacion: Int!, $strComentario: String) {
              crearReview(
                intProducto: $intProducto
                intCliente: $intCliente
                intCalificacion: $intCalificacion
                strComentario: $strComentario
              ) {
                intReview
                intCalificacion
                strComentario
              }
            }
          `,
          variables: {
            intProducto: producto.intProducto,
            intCliente: user.intCliente,
            intCalificacion: rating,
            strComentario: reviewComment || null,
          },
        }),
      });

      const data = await response.json();

      if (data.data?.crearReview) {
        setRatingSuccess(true);
        
        // Recargar el producto para obtener las reviews actualizadas
        await fetchProducto();
        
        setTimeout(() => {
          setRatingSuccess(false);
          setShowReviewForm(false);
          setReviewComment("");
        }, 2000);
      }
    } catch (error) {
      console.error("Error al enviar calificación:", error);
      alert("Hubo un error al enviar tu calificación. Intenta de nuevo.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Manejar envío de comentario completo desde la sección de comentarios
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!producto || !newComment.trim() || newCommentRating === 0) {
      alert("Por favor completa la calificación y el comentario");
      return;
    }

    // Verificar que el usuario esté logueado
    if (!user || !user.intCliente) {
      alert("Debes iniciar sesión para dejar un comentario");
      router.push("/login");
      return;
    }

    setIsSubmittingComment(true);

    try {
      const response = await fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation crearReviewProducto($data: ProductoReviewInput!) {
              crearReviewProducto(data:$data) {
                  intReview
                  intCalificacion
                  strComentario
                  intCliente
                  intProducto
              }
            }
          `,
          variables: { data: {
            intProducto: producto.intProducto,
            intCliente: user.intCliente,
            intCalificacion: newCommentRating,
            strComentario: newComment
               }
          },
        }),
      });

      
      const data = await response.json();
      console.log("Respuesta al enviar comentario:", data);
      
      if (data.data?.crearReviewProducto) {
        setCommentSuccess(true);
        setNewComment("");
        setNewCommentRating(0);
        
        // Recargar el producto para obtener las reviews actualizadas
        await fetchProducto();
        
        setTimeout(() => {
          setCommentSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      alert("Hubo un error al enviar tu comentario. Intenta de nuevo.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="font-[family-name:var(--font-inter)] text-white/70 text-sm tracking-wide">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-white mb-2">Producto no encontrado</h2>
          <p className="font-[family-name:var(--font-inter)] text-white/70 text-sm">El producto que buscas no existe.</p>
        </div>
      </div>
    );
  }

  const imagenesAdicionales = getImagenes();
  //console.log("🔍 Todas las imágenes del producto:", imagenesAdicionales);
  // const todasLasImagenes = [producto.strImagen, ...imagenesAdicionales];
  
  const todasLasImagenes = Array.from(
  new Set([
    producto.strImagen,
    ...(imagenesAdicionales ?? [])
  ])
);

  //console.log("🔍 Todas las imágenes del producto:", todasLasImagenes);

  return (
    <div className="min-h-screen bg-black py-6 px-4 md:px-6 pt-[100px]">
      {/* Toast de éxito */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-8 right-8 z-[9999] bg-black/95 backdrop-blur-xl border border-white/20 shadow-2xl p-6 min-w-[320px]"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 border border-white/30 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="font-[family-name:var(--font-playfair)] text-white text-base mb-1 tracking-tight">
                Agregado al carrito
              </p>
              <p className="font-[family-name:var(--font-inter)] text-xs text-white/60 tracking-wide">
                El producto ha sido agregado exitosamente
              </p>
            </div>
            <button 
              onClick={() => setShowSuccess(false)} 
              className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Línea de progreso */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 3, ease: "linear" }}
            className="absolute bottom-0 left-0 h-[1px] bg-white/30"
          />
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8 text-white/60">
          <button onClick={() => router.push('/')} className="font-[family-name:var(--font-inter)] text-xs tracking-wide hover:text-white transition-colors uppercase">
            Inicio
          </button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => router.push('/products')} className="font-[family-name:var(--font-inter)] text-xs tracking-wide hover:text-white transition-colors uppercase">
            Productos
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="font-[family-name:var(--font-inter)] text-xs tracking-wide text-white/80 uppercase">{producto?.tbCategoria.strNombre}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="font-[family-name:var(--font-inter)] text-xs tracking-wide text-white uppercase truncate max-w-[200px]">{producto?.strNombre}</span>
        </div>
        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Columna izquierda: Galería + Detalles */}
          <div className="space-y-4">
            {/* Galería de imágenes - Estilo Apple Store con Slider */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden"
            >
              {/* Slider de imágenes principales */}
              <div className="relative aspect-square overflow-hidden bg-black group">
                {producto.strEtiquetas && (
                  <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase backdrop-blur-md ${
                    producto.strEtiquetas === "Nuevo"
                      ? "bg-white/90 text-black"
                      : producto.strEtiquetas === "Oferta"
                      ? "bg-red-500/90 text-white"
                      : "bg-white/90 text-black"
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
                    className="p-2.5 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all border border-white/20"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFavorite ? "text-red-500 fill-red-500" : "text-white"
                      }`}
                    />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2.5 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all border border-white/20"
                  >
                    <Share2 className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Slider Container */}
                <div className="relative w-full h-full overflow-hidden">
                  <motion.div
                    className="flex h-full"
                    animate={{ x: `-${currentImageIndex * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {todasLasImagenes.map((img, idx) => (
                      <div key={idx} className="min-w-full h-full flex items-center justify-center">
                        <motion.img
                          src={img}
                          alt={`${producto.strNombre} ${idx + 1}`}
                          className="w-full h-full object-cover cursor-zoom-in"
                          onClick={() => setShowImageZoom(true)}
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Botones de navegación - Estilo Apple */}
                {todasLasImagenes.length > 0 && (
                  <>
                    {/* Botón Anterior */}
                    <button
                      onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                      disabled={currentImageIndex === 0}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all ${
                        currentImageIndex === 0
                          ? "opacity-0 pointer-events-none"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <ChevronRight className="w-5 h-5 text-white rotate-180" />
                    </button>

                    {/* Botón Siguiente */}
                    <button
                      onClick={() => setCurrentImageIndex(Math.min(todasLasImagenes.length - 1, currentImageIndex + 1))}
                      disabled={currentImageIndex === todasLasImagenes.length - 1}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all ${
                        currentImageIndex === todasLasImagenes.length - 1
                          ? "opacity-0 pointer-events-none"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>

                    {/* Indicadores de puntos */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                      {todasLasImagenes.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`transition-all ${
                            idx === currentImageIndex
                              ? "w-8 h-[2px] bg-white"
                              : "w-8 h-[2px] bg-white/30 hover:bg-white/60"
                          }`}
                          aria-label={`Ir a imagen ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Miniaturas - Estilo Apple */}
              {todasLasImagenes.length > 0 && (
                <div className="p-4 bg-white/5 border-t border-white/10">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {todasLasImagenes.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setImagenActual(img);
                          setCurrentImageIndex(idx);
                        }}
                        className={`relative flex-shrink-0 w-16 h-16 overflow-hidden transition-all ${
                          currentImageIndex === idx
                            ? "border-2 border-white scale-105"
                            : "border border-white/20 hover:border-white/60 hover:scale-105"
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`${producto.strNombre} ${idx + 1}`} 
                          className="w-full h-full object-cover bg-black" 
                        />
                        {currentImageIndex === idx && (
                          <motion.div
                            layoutId="thumbnail-indicator"
                            className="absolute inset-0 border-2 border-white"
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
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6"
            >
              {/* <h2 className="text-xl font-[family-name:var(--font-playfair)] text-white mb-4">Descripción</h2>
              <p className="text-white/80 font-[family-name:var(--font-inter)] leading-relaxed mb-4">{producto.strDescripcionLarga}</p>
               */}
               <div className="text-white/80 font-[family-name:var(--font-inter)] leading-relaxed space-y-2">
                {producto.strDescripcionLarga 
                  .split('\n')
                  .map((linea, i) =>
                    linea.trim() === '' ? (
                      <div key={i} className="h-2" />
                    ) : (
                      <p key={i}>{linea}</p>
                    )
                  )}
              </div>
              
              {/* Características */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-[family-name:var(--font-playfair)] text-white mb-3">Características principales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {producto.strMarca && (
                    <div className="flex items-start gap-2">
                      <Tag className="w-4 h-4 text-white mt-0.5" />
                      <div>
                        <p className="text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white/60">Marca</p>
                        <p className="text-sm font-[family-name:var(--font-inter)] text-white">{producto.strMarca}</p>
                      </div>
                    </div>
                  )}
                  {producto.strSKU && (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-white mt-0.5" />
                      <div>
                        <p className="text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white/60">SKU</p>
                        <p className="text-sm font-[family-name:var(--font-inter)] text-white">{producto.strSKU}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-white mt-0.5" />
                    <div>
                      <p className="text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white/60">Garantía</p>
                      <p className="text-sm font-[family-name:var(--font-inter)] text-white">1 año</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Store className="w-4 h-4 text-white mt-0.5" />
                    <div>
                      <p className="text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white/60">Vendido por</p>
                      <p className="text-sm font-[family-name:var(--font-inter)] text-white">ESYMBEL</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Preguntas frecuentes */}
            {/* Preguntas y respuestas */}
           
          </div>

          {/* Columna derecha: Panel de compra sticky */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 space-y-5"
            >
              {/* Nuevo/Usado Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white/60">
                  {producto.strEstado || 'Nuevo'}
                </span>
                <span className="text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white bg-white/10 px-2 py-1">
                  {producto.tbCategoria.strNombre}
                </span>
              </div>

              {/* Título */}
              <h1 className="text-xl font-[family-name:var(--font-playfair)] text-white leading-tight">
                {producto.strNombre}
              </h1>

              {/* Rating */}
            <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => {
                    const starValue = i + 1;
                    const isFull = ratingPromedioNumber >= starValue;
                    const isHalf =
                      ratingPromedioNumber >= starValue - 0.5 &&
                      ratingPromedioNumber < starValue;

                    return (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          isFull
                            ? "text-white fill-white"
                            : isHalf
                            ? "text-white fill-white/50"
                            : "text-white/30"
                        }`}
                      />
                    );
                  })}
                </div>

                <span className="text-xs font-[family-name:var(--font-inter)] text-white/60">
                  {totalReviews > 0 ? `(${totalReviews})` : "(Sea el primero en calificar.)"}
                </span>
              </div>



              {/* Precio */}
              <div className="space-y-1">
                {esDescuentoActivo(producto) ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-[family-name:var(--font-playfair)] text-white">
                        ${(
                          (producto.dblPrecioDescuento || 0) + 
                          (varianteSeleccionada?.dblPrecioAdicional || 0)
                        ).toLocaleString()}
                      </span>
                      {producto.intPorcentajeDescuento && (
                        <span className="px-2 py-0.5 bg-white text-black text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase">
                          {producto.intPorcentajeDescuento}% OFF
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-[family-name:var(--font-inter)] text-white/50 line-through">
                      ${(
                        producto.dblPrecio + 
                        (varianteSeleccionada?.dblPrecioAdicional || 0)
                      ).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-[family-name:var(--font-playfair)] text-white">
                    ${(
                      producto.dblPrecio + 
                      (varianteSeleccionada?.dblPrecioAdicional || 0)
                    ).toLocaleString()}
                  </span>
                )}
                {varianteSeleccionada?.dblPrecioAdicional && varianteSeleccionada.dblPrecioAdicional > 0 && (
                  <p className="text-xs font-[family-name:var(--font-inter)] text-white/80">
                    +${varianteSeleccionada.dblPrecioAdicional.toLocaleString()} por esta variante
                  </p>
                )}
                <p className="text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white/80">Envío gratis a todo el país</p>
              </div>

              {/* Disponibilidad */}
           {producto.intStock >= 10 && (
                <div className="flex items-start gap-2 p-3 bg-green-900 border border-white/20">
                  <Check className="w-5 h-5 text-white mt-0.5" />
                  <div>
                    <p className="text-sm font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white">
                      Stock disponible
                    </p>
                  </div>
                </div>
              )}

              {producto.intStock > 0 && producto.intStock < 6 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-900 border border-white/20">
                  <Check className="w-5 h-5 text-white mt-0.5" />
                  <div>
                    <p className="text-sm font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white">
                      Últimas piezas
                    </p>
                    <p className="text-xs font-[family-name:var(--font-inter)] text-white/70">
                      Date prisa, se está agotando
                    </p>
                  </div>
                </div>
              )}

              {producto.intStock === 0 && (
                <div className="flex items-start gap-2 p-3 bg-red-900 border border-white/20">
                  <X className="w-5 h-5 text-white mt-0.5" />
                  <div>
                    <p className="text-sm font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white">
                      Agotado
                    </p>
                  </div>
                </div>
              )}


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
                  <h3 className="text-sm font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white">
                    Cantidad:
                  </h3>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                      disabled={cantidad <= 1}
                      className="w-8 h-8 border border-white/20 hover:bg-white/10 disabled:opacity-40 text-white transition-all"
                    >
                      -
                    </button>

                    <span className="text-lg text-white w-8 text-center">
                      {cantidad}
                    </span>

                    <button
                      onClick={() =>
                        setCantidad(prev => Math.min(stockDisponible, prev + 1))
                      }
                      disabled={cantidad >= stockDisponible}
                      className="w-8 h-8 border border-white/20 hover:bg-white/10 disabled:opacity-40 text-white transition-all"
                    >
                      +
                    </button>

                    <span className="text-xs text-white/60 ml-2">
                      ({cantidad} {cantidad === 1 ? 'unidad' : 'unidades'})
                    </span>
                  </div>

                  {stockDisponible === 0 && (
                    <p className="text-xs text-red-400">
                      No disponible para esta combinación
                    </p>
                  )}

                  {stockDisponible > 0 && stockDisponible <= 10 && (
                    <p className="text-xs text-yellow-400">
                      Últimas {stockDisponible} piezas
                    </p>
                  )}
                </div>

              {/* Botones de acción */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <button
                  onClick={handleAgregarCarrito}
                  className="w-full py-3 bg-white text-black text-sm font-[family-name:var(--font-inter)] tracking-[0.15em] uppercase hover:bg-white/90 transition-all"
                >
                  Comprar ahora
                </button>
                <button
                  onClick={handleAgregarCarrito}
                  className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-[family-name:var(--font-inter)] tracking-[0.15em] uppercase hover:bg-white/20 transition-all"
                >
                  Agregar al carrito
                </button>
              </div>

              {/* Garantías y Beneficios */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white mb-2">Lo que tienes que saber</h3>
                
                <div className="flex items-start gap-3 p-3 bg-white/10 border border-white/20">
                  <Shield className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white">Compra Protegida</p>
                    <p className="text-xs font-[family-name:var(--font-inter)] text-white/70">Recibe el producto que esperabas o te devolvemos tu dinero</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white/10 border border-white/20">
                  <Truck className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white">Envío gratis</p>
                    <p className="text-xs font-[family-name:var(--font-inter)] text-white/70">Conoce los tiempos y formas de envío</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white/10 border border-white/20">
                  <RotateCcw className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white">Devolución gratis</p>
                    <p className="text-xs font-[family-name:var(--font-inter)] text-white/70">Tenés 30 días desde que lo recibís</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Lock className="w-4 h-4 text-white" />
                  <span className="text-xs font-[family-name:var(--font-inter)] text-white/70">Compra protegida</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-white" />
                  <span className="text-xs font-[family-name:var(--font-inter)] text-white/70">12 meses de garantía de fábrica</span>
                </div>
              </div>

              {/* Medios de pago */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white mb-2">Medios de pago</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase text-white/70 mb-2">Tarjetas de crédito y débito</p>
                    <div className="flex gap-2 flex-wrap">
                      {/* Visa */}
                      <div className="w-12 h-8 bg-white/10 border border-white/20 flex items-center justify-center p-1">
                         <img 
                          src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg" 
                          alt="Mercado Pago" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Mastercard */}
                      <div className="w-12 h-8 bg-white/10 border border-white/20 flex items-center justify-center p-1">
                         <img 
                          src="https://http2.mlstatic.com/storage/logos-api-admin/9cf818e0-723a-11f0-a459-cf21d0937aeb-m.svg" 
                          alt="Mercado Pago" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* American Express */}
                      <div className="w-12 h-8 bg-white/10 border border-white/20 flex items-center justify-center p-1">
                        <svg viewBox="0 0 48 32" className="w-full h-full">
                          <rect width="48" height="32" rx="2" fill="#006FCF"/>
                          <text x="24" y="20" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Arial">AMEX</text>
                        </svg>
                      </div>

                      
                      {/* Mercado Pago */}
                      <div className="w-12 h-8 bg-white/10 border border-white/20 flex items-center justify-center p-1">
                        <img 
                          src="https://http2.mlstatic.com/storage/logos-api-admin/f3e8e940-f549-11ef-bad6-e9962bcd76e5-m.svg" 
                          alt="Mercado Pago" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <button className="flex items-center gap-2 text-xs text-white font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase hover:opacity-70 transition-opacity">
                    <CreditCard className="w-4 h-4" />
                    Ver todos los medios de pago
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sección de Sugerencias - Carrusel Manual - Ancho Completo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-playfair)] text-white tracking-tight">
              También te puede interesar
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSugerenciasIndex(Math.max(0, sugerenciasIndex - 1))}
                disabled={sugerenciasIndex === 0}
                className={`w-12 h-12 border border-white/20 flex items-center justify-center transition-all ${
                  sugerenciasIndex === 0
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-white/10"
                }`}
              >
                <ChevronRight className="w-6 h-6 text-white rotate-180" />
              </button>
              <button
                onClick={() => setSugerenciasIndex(Math.min(productos.filter(p => p.intProducto !== producto?.intProducto && p.bolActivo && p.tbCategoria.intCategoria === producto?.tbCategoria.intCategoria).length - 5, sugerenciasIndex + 1))}
                disabled={sugerenciasIndex >= productos.filter(p => p.intProducto !== producto?.intProducto && p.bolActivo && p.tbCategoria.intCategoria === producto?.tbCategoria.intCategoria).length - 5}
                className={`w-12 h-12 border border-white/20 flex items-center justify-center transition-all ${
                  sugerenciasIndex >= productos.filter(p => p.intProducto !== producto?.intProducto && p.bolActivo && p.tbCategoria.intCategoria === producto?.tbCategoria.intCategoria).length - 5
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-white/10"
                }`}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

         <div className="overflow-hidden">
          <motion.div className="flex gap-4 overflow-x-auto lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible scrollbar-hide">
            {productos
              .filter(
                p =>
                  p.intProducto !== producto?.intProducto &&
                  p.bolActivo &&
                  p.tbCategoria.intCategoria === producto?.tbCategoria.intCategoria
              )
              .slice(0, 5)
              .map(sugerencia => (
                <motion.div
                  key={sugerencia.intProducto}
                  className="min-w-[80%] sm:min-w-[45%] lg:min-w-0 group cursor-pointer"
                  onClick={() =>
                    router.push(`/producto/${createProductSlug(sugerencia.strNombre)}`)
                  }
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative w-full h-[260px] lg:h-[300px] overflow-hidden bg-white/5 border border-white/10 mb-4">
                    <img
                      src={sugerencia.strImagen}
                      alt={sugerencia.strNombre}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <h3 className="font-[family-name:var(--font-playfair)] text-white text-sm lg:text-base mb-2 line-clamp-2">
                    {sugerencia.strNombre}
                  </h3>

                  <p className="font-[family-name:var(--font-inter)] text-white/60 text-sm tracking-wide">
                    ${sugerencia.dblPrecio.toLocaleString()}
                  </p>
                </motion.div>
              ))}
          </motion.div>
        </div>

        </motion.div>
           
         <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 mt-10"
            >
              <h2 className="text-xl font-[family-name:var(--font-playfair)] text-white mb-4">Preguntas y respuestas</h2>
              
              <div className="space-y-3 mb-4">
                <div className="border-b border-white/10 pb-3">
                  <p className="text-sm font-[family-name:var(--font-inter)] text-white mb-1">¿Cuánto tarda el envío?</p>
                  <p className="text-xs font-[family-name:var(--font-inter)] text-white/70">El tiempo de entrega es de 3 a 5 días hábiles.</p>
                </div>
                <div className="border-b border-white/10 pb-3">
                  <p className="text-sm font-[family-name:var(--font-inter)] text-white mb-1">¿Tiene garantía?</p>
                  <p className="text-xs font-[family-name:var(--font-inter)] text-white/70">Sí, todos nuestros productos cuentan con 1 año de garantía.</p>
                </div>
              </div>

              <button className="flex items-center gap-2 text-sm text-white font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase hover:opacity-70 transition-opacity">
                <MessageCircle className="w-4 h-4" />
                Hacer una pregunta
              </button>
            </motion.div>

            {/* Sección de Calificación Rápida */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 mt-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-[family-name:var(--font-playfair)] text-white">
                  Califica este producto
                </h2>
                {ratingSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-green-400 text-sm"
                  >
                    <Check className="w-5 h-5" />
                    <span>¡Gracias por tu calificación!</span>
                  </motion.div>
                )}
              </div>

              {/* Estadísticas de calificación */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                <div className="text-center">
                  <div className="text-4xl font-light text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {ratingPromedioNumber > 0 ? ratingPromedioNumber.toFixed(1) : "—"}
                  </div>
                  <div className="flex items-center gap-1 justify-center mb-1">
                    {[...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      const isFull = ratingPromedioNumber >= starValue;
                      const isHalf =
                        ratingPromedioNumber >= starValue - 0.5 &&
                        ratingPromedioNumber < starValue;

                      return (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            isFull
                              ? "text-yellow-400 fill-yellow-400"
                              : isHalf
                              ? "text-yellow-400 fill-yellow-400/50"
                              : "text-white/20"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-white/60">
                    {totalReviews} {totalReviews === 1 ? "calificación" : "calificaciones"}
                  </p>
                </div>

                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = producto?.tbProducto_Reviews?.filter(
                      (r) => r.intCalificacion === stars
                    ).length || 0;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="text-white/60 w-8">{stars}★</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-white/60 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sistema de calificación rápida */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/80 mb-3">
                    {userRating > 0 
                      ? "¡Gracias! ¿Quieres agregar un comentario?" 
                      : "Haz clic en las estrellas para calificar"}
                  </p>
                  
                  {/* Estrellas clickeables */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleQuickRating(star)}
                        disabled={isSubmittingRating}
                        className="cursor-pointer disabled:cursor-wait transition-all"
                      >
                        <Star
                          className={`w-8 h-8 transition-all ${
                            star <= (hoverRating || userRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-white/30 hover:text-yellow-400/50"
                          }`}
                        />
                      </motion.button>
                    ))}
                    {userRating > 0 && !isSubmittingRating && (
                      <span className="ml-2 text-sm text-white/60">
                        {userRating === 5 && "¡Excelente!"}
                        {userRating === 4 && "Muy bueno"}
                        {userRating === 3 && "Bueno"}
                        {userRating === 2 && "Regular"}
                        {userRating === 1 && "Mejorable"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Formulario opcional de comentario */}
                {userRating > 0 && !ratingSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2"
                    >
                      {showReviewForm ? "Cancelar comentario" : "+ Agregar comentario (opcional)"}
                    </button>

                    {showReviewForm && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Cuéntanos tu experiencia con este producto..."
                          rows={4}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-none text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors resize-none"
                        />
                        <button
                          onClick={() => handleQuickRating(userRating)}
                          disabled={isSubmittingRating}
                          className="px-6 py-2 bg-white text-black text-sm font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-wait"
                        >
                          {isSubmittingRating ? "Enviando..." : "Enviar calificación"}
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {isSubmittingRating && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Guardando tu calificación...</span>
                  </div>
                )}
              </div>

              {/* Lista de reseñas existentes */}
              {/* {totalReviews > 0 && (
                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                  <h3 className="text-lg font-[family-name:var(--font-playfair)] text-white mb-4">
                    Opiniones de otros compradores
                  </h3>
                  {producto?.tbProducto_Reviews?.slice(0, 3).map((review) => (
                    <div
                      key={review.intReview}
                      className="bg-white/5 border border-white/10 p-4 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.intCalificacion
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-white/20"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-white/60">
                          {new Date(review.datCreacion).toLocaleDateString()}
                        </span>
                      </div>
                      {review.strComentario && (
                        <p className="text-sm text-white/80 leading-relaxed">
                          {review.strComentario}
                        </p>
                      )}
                    </div>
                  ))}
                  {totalReviews > 3 && (
                    <button 
                      onClick={() => setShowAllReviews(true)}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      Ver todas las {totalReviews} opiniones →
                    </button>
                  )}
                </div>
              )} */}
            </motion.div>

            {/* Sección Completa de Comentarios y Opiniones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 mt-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-[family-name:var(--font-playfair)] text-white">
                  Opiniones del Producto
                </h2>
                <div className="text-right">
                  <div className="text-3xl font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {ratingPromedioNumber > 0 ? ratingPromedioNumber.toFixed(1) : "—"}
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    {[...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      const isFull = ratingPromedioNumber >= starValue;
                      return (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            isFull ? "text-yellow-400 fill-yellow-400" : "text-white/20"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {totalReviews} {totalReviews === 1 ? "opinión" : "opiniones"}
                  </p>
                </div>
              </div>

              {/* Formulario para dejar comentario */}
              <div className="bg-white/10 border border-white/20 p-6 mb-8">
                <h3 className="text-lg font-[family-name:var(--font-inter)] text-white mb-4 tracking-wide">
                  Comparte tu opinión
                </h3>
                
                {commentSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-400" />
                    </div>
                    <h4 className="text-xl font-[family-name:var(--font-playfair)] text-white mb-2">
                      ¡Gracias por tu opinión!
                    </h4>
                    <p className="text-sm text-white/60">
                      Tu comentario ha sido publicado correctamente
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    {/* Selector de calificación */}
                    <div>
                      <label className="block text-sm text-white/80 mb-2">
                        Tu calificación *
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onMouseEnter={() => setHoverCommentRating(star)}
                            onMouseLeave={() => setHoverCommentRating(0)}
                            onClick={() => setNewCommentRating(star)}
                            className="cursor-pointer transition-all"
                          >
                            <Star
                              className={`w-10 h-10 transition-all ${
                                star <= (hoverCommentRating || newCommentRating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-white/30 hover:text-yellow-400/50"
                              }`}
                            />
                          </motion.button>
                        ))}
                        {newCommentRating > 0 && (
                          <span className="ml-3 text-sm text-white/70">
                            {newCommentRating === 5 && "⭐ ¡Excelente!"}
                            {newCommentRating === 4 && "👍 Muy bueno"}
                            {newCommentRating === 3 && "👌 Bueno"}
                            {newCommentRating === 2 && "😐 Regular"}
                            {newCommentRating === 1 && "👎 Mejorable"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Campo de comentario */}
                    <div>
                      <label htmlFor="comment" className="block text-sm text-white/80 mb-2">
                        Tu opinión *
                      </label>
                      <textarea
                        id="comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Cuéntanos qué te pareció este producto. ¿Qué te gustó? ¿Qué mejorarías?"
                        rows={5}
                        className="w-full px-4 py-3 bg-black/30 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors resize-none rounded-none"
                        required
                      />
                      <p className="text-xs text-white/50 mt-1">
                        Mínimo 10 caracteres ({newComment.length}/10)
                      </p>
                    </div>

                    {/* Botón de envío */}
                    <div className="flex items-center gap-3">
                      <motion.button
                        type="submit"
                        disabled={isSubmittingComment || newComment.length < 10 || newCommentRating === 0}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-3 bg-white text-black text-sm font-[family-name:var(--font-inter)] tracking-[0.15em] uppercase hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmittingComment ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4" />
                            Publicar opinión
                          </>
                        )}
                      </motion.button>
                      
                      {(newComment || newCommentRating > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewComment("");
                            setNewCommentRating(0);
                          }}
                          className="text-sm text-white/60 hover:text-white transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-white/50">
                      * Campos obligatorios
                    </p>
                  </form>
                )}
              </div>

              {/* Filtros de opiniones */}
              {totalReviews > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10 overflow-x-auto">
                    <span className="text-sm text-white/60 whitespace-nowrap">Filtrar por:</span>
                    <button
                      onClick={() => setReviewsFilter("all")}
                      className={`px-4 py-2 text-sm rounded-none transition-all whitespace-nowrap ${
                        reviewsFilter === "all"
                          ? "bg-white text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      Todas ({totalReviews})
                    </button>
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = producto?.tbProducto_Reviews?.filter(
                        (r) => r.intCalificacion === stars
                      ).length || 0;
                      if (count === 0) return null;
                      
                      return (
                        <button
                          key={stars}
                          onClick={() => setReviewsFilter(stars as 5 | 4 | 3 | 2 | 1)}
                          className={`px-4 py-2 text-sm rounded-none transition-all whitespace-nowrap flex items-center gap-1 ${
                            reviewsFilter === stars
                              ? "bg-white text-black"
                              : "bg-white/10 text-white hover:bg-white/20"
                          }`}
                        >
                          {stars} <Star className="w-3 h-3 fill-current" /> ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Lista de comentarios */}
                  <div className="space-y-4">
                    {producto?.tbProducto_Reviews
                      ?.filter((review) => reviewsFilter === "all" || review.intCalificacion === reviewsFilter)
                      .slice(0, showAllReviews ? undefined : 5)
                      .map((review, index) => (
                        <motion.div
                          key={review.intReview}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-black/30 border border-white/10 p-6 space-y-3 hover:border-white/20 transition-colors"
                        >
                          {/* Header del comentario */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {/* Avatar placeholder */}
                              <div className="w-10 h-10 bg-white/10 border border-white/20 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {review.intCliente ? `U${review.intCliente}` : "A"}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {review.intCliente ? `Usuario #${review.intCliente}` : "Comprador Verificado"}
                                </p>
                                <p className="text-xs text-white/60">
                                  {new Date(review.datCreacion).toLocaleDateString("es-MX", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Calificación */}
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.intCalificacion
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-white/20"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Comentario */}
                          {review.strComentario && (
                            <p className="text-sm text-white/90 leading-relaxed">
                              {review.strComentario}
                            </p>
                          )}

                          {/* Badge de compra verificada (opcional) */}
                          <div className="flex items-center gap-2 pt-2">
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-green-400">Compra verificada</span>
                          </div>
                        </motion.div>
                      ))}
                  </div>

                  {/* Botón ver más/menos */}
                  {producto?.tbProducto_Reviews && 
                   producto.tbProducto_Reviews.filter((review) => 
                     reviewsFilter === "all" || review.intCalificacion === reviewsFilter
                   ).length > 5 && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="px-6 py-3 bg-white/10 border border-white/20 text-white text-sm font-[family-name:var(--font-inter)] tracking-[0.1em] uppercase hover:bg-white/20 transition-all"
                      >
                        {showAllReviews ? "Ver menos opiniones" : `Ver todas las opiniones (${totalReviews})`}
                      </button>
                    </div>
                  )}

                  {/* Empty state si no hay reviews con el filtro actual */}
                  {producto?.tbProducto_Reviews?.filter((review) => 
                    reviewsFilter === "all" || review.intCalificacion === reviewsFilter
                  ).length === 0 && (
                    <div className="text-center py-12">
                      <Star className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/60">
                        No hay opiniones con esta calificación
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Empty state si no hay comentarios */}
              {totalReviews === 0 && (
                <div className="text-center py-12 border-t border-white/10">
                  <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h4 className="text-lg font-[family-name:var(--font-playfair)] text-white mb-2">
                    Sé el primero en opinar
                  </h4>
                  <p className="text-sm text-white/60">
                    Comparte tu experiencia con este producto
                  </p>
                </div>
              )}
            </motion.div>
      </div>
    </div>
  );
}
