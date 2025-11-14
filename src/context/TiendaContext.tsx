"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Productos, ItemCarrito } from "@/types/types";

interface TiendaContextType {
  productos: Productos[];
  carrito: ItemCarrito[];
  loading: boolean;
  selectedVariants: Record<number, { color: string | null; talla: string | null }>;
  agregarCarrito: (producto: Productos) => void;
  eliminarDelCarrito: (id: number, color: string | null, talla: string | null) => void;
  aumentarCantidad: (id: number, color: string | null, talla: string | null) => void;
  disminuirCantidad: (id: number, color: string | null, talla: string | null) => void;
  handleVariantChange: (productId: number, color: string | null, talla: string | null) => void;
  getCantidadPorProducto: (id: number) => number;
  getResumenCarrito: () => Array<{ nombre: string; cantidad: number; color: string | null; talla: string | null }>;
}

const TiendaContext = createContext<TiendaContextType | undefined>(undefined);

export function TiendaProvider({ children }: { children: React.ReactNode }) {
  const [productos, setProductos] = useState<Productos[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<number, { color: string | null; talla: string | null }>>({});
  const [carrito, setCarrito] = useState<ItemCarrito[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const guardado = localStorage.getItem("carrito");
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

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
       // console.log("📦 Productos cargados:", data.data.obtenerProductos);
        setProductos(data.data.obtenerProductos);
      } catch (error) {
        console.error("❌ Error al obtener productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // 💾 Guardar carrito cada vez que cambia
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("carrito", JSON.stringify(carrito));
     // console.log("🛒 Carrito actualizado en localStorage:", carrito);
    }
  }, [carrito]);

  // 🎨 Manejo de variantes (color/talla)
  const handleVariantChange = (productId: number, color: string | null, talla: string | null) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: { color, talla },
    }));
  };

  // 🛍️ Agregar producto al carrito
  const agregarCarrito = (producto: Productos) => {
    const variants = selectedVariants[producto.intProducto] || {};
    const colorSeleccionado = variants.color || null;
    const tallaSeleccionada = variants.talla || null;

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

    setCarrito((prev) => {
      const existe = prev.find(
        (p) =>
          p.id === itemCarrito.id &&
          p.color === itemCarrito.color &&
          p.talla === itemCarrito.talla
      );

      if (existe) {
        console.log(`✅ Producto "${producto.strNombre}" cantidad aumentada`);
        return prev.map((p) =>
          p.id === itemCarrito.id &&
          p.color === itemCarrito.color &&
          p.talla === itemCarrito.talla
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      } else {
        console.log(`✅ Producto "${producto.strNombre}" agregado al carrito`);
        return [...prev, itemCarrito];
      }
    });
  };

  // ❌ Eliminar del carrito (por ID + variantes)
  const eliminarDelCarrito = (id: number, color: string | null, talla: string | null) => {
    setCarrito((prev) =>
      prev.filter(
        (p) => !(p.id === id && p.color === color && p.talla === talla)
      )
    );
  };

  // ➕ Aumentar cantidad de un producto en el carrito
  const aumentarCantidad = (id: number, color: string | null, talla: string | null) => {
    setCarrito((prev) =>
      prev.map((p) =>
        p.id === id && p.color === color && p.talla === talla
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
      )
    );
   // console.log(`➕ Cantidad aumentada para producto ID: ${id}`);
  };

  // ➖ Disminuir cantidad de un producto en el carrito
  const disminuirCantidad = (id: number, color: string | null, talla: string | null) => {
    setCarrito((prev) =>
      prev.map((p) => {
        if (p.id === id && p.color === color && p.talla === talla) {
          // Si la cantidad es 1, eliminamos el producto
          if (p.cantidad === 1) {
            console.log(`🗑️ Producto eliminado (cantidad llegó a 0)`);
            return null;
          }
          return { ...p, cantidad: p.cantidad - 1 };
        }
        return p;
      }).filter((p) => p !== null) as ItemCarrito[]
    );
   // console.log(`➖ Cantidad disminuida para producto ID: ${id}`);
  };

  // 📊 Obtener cantidad por producto
  const getCantidadPorProducto = (id: number) => {
    const producto = carrito.find((p) => p.id === id);
    return producto ? producto.cantidad : 0;
  };

  // 📦 Obtener todos los productos con su cantidad
  const getResumenCarrito = () => {
    return carrito.map((p) => ({
      nombre: p.nombre,
      cantidad: p.cantidad,
      color: p.color || null,
      talla: p.talla || null,
    }));
  };




  return (
    <TiendaContext.Provider
      value={{
        productos,
        carrito,
        loading,
        selectedVariants,
        agregarCarrito,
        eliminarDelCarrito,
        aumentarCantidad,
        disminuirCantidad,
        handleVariantChange,
        getCantidadPorProducto,
        getResumenCarrito,
      }}
    >
      {children}
    </TiendaContext.Provider>
  );
}

export function useTienda() {
  const context = useContext(TiendaContext);
  if (context === undefined) {
    throw new Error("useTienda debe ser usado dentro de TiendaProvider");
  }
  return context;
}
