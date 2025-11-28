"use client";
import React, { createContext, use, useContext, useEffect, useState } from "react";
import { Productos, ItemCarrito } from "@/types/types";
import { formatFecha } from "@/utils/formatearFechas";
import { useAuth } from "./AuthContext";

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
  limpiarCarrito: () => void;
}

const TiendaContext = createContext<TiendaContextType | undefined>(undefined);

export function TiendaProvider({ children }: { children: React.ReactNode }) {
  const [productos, setProductos] = useState<Productos[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<number, { color: string | null; talla: string | null }>>({});
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Cargar carrito desde localStorage solo en el cliente
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        // Obtener el usuario actual del localStorage
        const storedUser = localStorage.getItem("authUser");
        const userId = storedUser ? JSON.parse(storedUser).strUsuario : "guest";
        setCurrentUserId(userId);

        // Cargar el carrito específico del usuario
        const carritoKey = `carrito_${userId}`;
        const guardado = localStorage.getItem(carritoKey);
        if (guardado) {
          setCarrito(JSON.parse(guardado));
        } else {
          setCarrito([]); // Asegurar que esté vacío si no hay datos
        }
      } catch (error) {
        console.error("Error al cargar carrito:", error);
      }
    }
  }, []);

  // Detectar cambio de usuario y limpiar carrito (escuchar cambios en localStorage)
  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;

    const checkUserChange = () => {
      const storedUser = localStorage.getItem("authUser");
      const userId = storedUser ? JSON.parse(storedUser).strUsuario : "guest";

      // Si el usuario cambió, actualizar el carrito
      if (currentUserId && userId !== currentUserId) {
       // console.log(`👤 Usuario cambió de ${currentUserId} a ${userId}. Actualizando carrito...`);
        setCurrentUserId(userId);

        // Cargar el carrito del nuevo usuario
        const carritoKey = `carrito_${userId}`;
        const guardado = localStorage.getItem(carritoKey);
        if (guardado) {
          setCarrito(JSON.parse(guardado));
        } else {
          setCarrito([]); // Carrito vacío para el nuevo usuario
        }
      }
      
      // Si se eliminó el authUser (logout), limpiar carrito
      if (!storedUser && currentUserId !== "guest") {
       // console.log(`🚪 Usuario cerró sesión. Limpiando carrito...`);
        setCurrentUserId("guest");
        setCarrito([]);
      }
    };

    // Verificar cambios cada 500ms (detecta cambios de logout/login)
    const interval = setInterval(checkUserChange, 500);

    // También escuchar eventos de storage
    window.addEventListener("storage", checkUserChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkUserChange);
    };
  }, [mounted, currentUserId]);

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


  // 💾 Guardar carrito cada vez que cambia (asociado al usuario)
  useEffect(() => {
    // Solo guardar si el componente ya está montado y no es la carga inicial
    if (mounted && typeof window !== "undefined" && currentUserId) {
      const carritoKey = `carrito_${currentUserId}`;
      localStorage.setItem(carritoKey, JSON.stringify(carrito));
   //   console.log(`🛒 Carrito guardado para usuario ${currentUserId}:`, carrito.length, "items");
    }
  }, [carrito, mounted, currentUserId]);

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

    // Validar si el descuento está activo
    const esDescuentoActivo = () => {
      if (
              !producto.bolTieneDescuento ||
              !producto.datInicioDescuento ||
              !producto.datFinDescuento
            ) {
              return false;
            }
      
            const ahora = Date.now(); // número
            const inicio = Number(producto.datInicioDescuento); // número
            const fin = Number(producto.datFinDescuento);       // número
      
            // Solo para ver las fechas formateadas en consola (opcional)
            // console.log("Fecha inicio:", formatFecha(inicio));
            // console.log("Fecha fin:", formatFecha(fin));
      
            return formatFecha(ahora) >= formatFecha(inicio) && formatFecha(ahora) <= formatFecha(fin);
    };

    const descuentoActivo = esDescuentoActivo();

    //console.log("Agregar al carrito",itemCarrito)

    const itemCarrito: ItemCarrito = {
      id: producto.intProducto,
      nombre: producto.strNombre,
      precio: producto.dblPrecio,
      precioDescuento: descuentoActivo ? (producto.dblPrecioDescuento || null) : null,
      tieneDescuento: descuentoActivo,
      color: colorSeleccionado,
      talla: tallaSeleccionada,
      imagen: producto.jsonImagenes || "",
      categoria: producto.tbCategoria?.strNombre || "",
      cantidad: 1,
      stock: producto.intStock || 0, // 👈 AGREGADO: Incluir stock al agregar
    };

    setCarrito((prev) => {
      const existe = prev.find(
        (p) =>
          p.id === itemCarrito.id &&
          p.color === itemCarrito.color &&
          p.talla === itemCarrito.talla
      );

      if (existe) {
        // Validar que no exceda el stock
        if (existe.cantidad >= (existe.stock || 0)) {
          console.warn(`⚠️ Stock máximo alcanzado para "${producto.strNombre}"`);
          return prev; // No aumentar si ya llegó al límite
        }
        console.log(`✅ Producto "${producto.strNombre}" cantidad aumentada`);
        return prev.map((p) =>
          p.id === itemCarrito.id &&
          p.color === itemCarrito.color &&
          p.talla === itemCarrito.talla
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      } else {
       // console.log(`✅ Producto "${producto.strNombre}" agregado al carrito`);
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
      prev.map((p) => {
        if (p.id === id && p.color === color && p.talla === talla) {
          // Validar que no exceda el stock
          if (p.cantidad >= (p.stock || 0)) {
          //  console.warn(`⚠️ Stock máximo alcanzado para "${p.nombre}"`);
            return p; // No aumentar
          }
          if(p.cantidad < 3){
             return { ...p, cantidad: p.cantidad + 1 };
          } else {
            return p; // No aumentar si ya llegó al límite
          }
         
        }
        return p;
      })
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
           // console.log(`🗑️ Producto eliminado (cantidad llegó a 0)`);
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

  // 🧹 Limpiar carrito
  const limpiarCarrito = () => {
    setCarrito([]);
    if (typeof window !== "undefined" && currentUserId) {
      const carritoKey = `carrito_${currentUserId}`;
      localStorage.removeItem(carritoKey);
    }
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
        limpiarCarrito,
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
