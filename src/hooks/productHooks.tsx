"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react"; 
import { Productos } from "../types/types";
import { s } from "framer-motion/client";


export function useProductFilters() {
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [sortBy, setSortBy] = useState("featured");
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [favorites, setFavorites] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);
     const [productos, setProductos] = useState<Productos[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVariants, setSelectedVariants] = useState<{ [key: number]: { color: string | null; talla: string | null } }>({});

      // 🛒 Cargar productos desde GraphQL
      useEffect(() => {
        const fetchProductos = async () => {
          try {
            const response = await fetch("http://localhost:3000/api/graphql", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
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
                      intStock
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
    
            if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
    
            const data = await response.json();
          //  console.log("📦 Productos cargados:", data.data.obtenerProductos);
            setProductos(data.data.obtenerProductos);
          } catch (error) {
            console.error("❌ Error al obtener productos:", error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchProductos();
      }, []);

  // 🎨 Manejo de variantes (color/talla)
  const handleVariantChange = (productId: number, color: string | null, talla: string | null) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: { color, talla },
    }));
  };
    const categories = ["Todos", "Electrónica", "Deportes", "Hogar", "Moda"];


    const sortOptions = [
    { value: "featured", label: "Destacados" },
    { value: "price-asc", label: "Precio: Menor a Mayor" },
    { value: "price-desc", label: "Precio: Mayor a Menor" },
    { value: "rating", label: "Mejor Calificación" },
    { value: "newest", label: "Más Nuevos" },
    ];


    const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

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

   // Filtrado y ordenamiento
  let filteredProducts = productos.filter(product => {
    const matchesCategory = selectedCategory === "Todos" || product.tbCategoria?.strNombre === selectedCategory;
    const matchesPrice = product.dblPrecio >= priceRange[0] && product.dblPrecio <= priceRange[1];
    const matchesSearch = product.strNombre.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesPrice && matchesSearch;
  });

  // Ordenamiento
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.dblPrecio - b.dblPrecio;
      case "price-desc":
        return b.dblPrecio - a.dblPrecio;
    //   case "rating":
    //     return b.rating - a.rating;
    //   case "newest":
    //     return b.id - a.id;
      default:
        return 0;
    }
  });



    return { categories, sortOptions,toggleFavorite, containerVariants, itemVariants, 
      filteredProducts, loading,handleVariantChange, selectedVariants, 
      setSelectedCategory, setSortBy, setPriceRange, setSearchQuery, setViewMode, 
      setShowFilters,viewMode, showFilters, favorites,sortBy,priceRange,selectedCategory,
      searchQuery,productos,setProductos

    };
}