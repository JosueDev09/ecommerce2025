// 📁 src/lib/getVariantes.tsx
"use client";
import React, { useState, useEffect } from "react";

interface Variante {
  nombre: string;
  valor: string | string[];
}

interface ProductoVariante {
  intVariante: number;
  intProducto: number;
  strTalla: string;
  strColor: string;
  intStock: number;
  strSKU?: string;
  dblPrecioAdicional?: number;
  strImagen?: string;
  bolActivo: boolean;
  datCreacion: string;
  datActualizacion: string;
}

interface Producto {
  strNombre?: string;
  jsonVariantes?: string;
  variantes?: ProductoVariante[]; // 👈 Nuevo: variantes desde la tabla
  tbCategoria?: { strNombre: string };
  tbProductoVariantes?: ProductoVariante[]; // 👈 Alternativa: variantes desde tabla
}

interface VariantesComponentProps {
  product: Producto;
  onVariantChange?: (
    selectedColor: string | null, 
    selectedTalla: string | null,
    varianteSeleccionada?: ProductoVariante | null
  ) => void;
}

export function VariantesSelector({ product, onVariantChange }: VariantesComponentProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);
  const [varianteActual, setVarianteActual] = useState<ProductoVariante | null>(null);

 // console.log("🎨 Variantes:", product);
  // 🆕 Priorizar variantes de la tabla sobre jsonVariantes
  const usarVariantesTabla = product.tbProductoVariantes && product.tbProductoVariantes.length > 0;

  //console.log("✅ Usando variantes de tabla:", usarVariantesTabla);
  // if (usarVariantesTabla) {
  //   console.log("🎨 Variantes:", product.tbProductoVariantes);
  // }

  useEffect(() => {
    if (usarVariantesTabla && product.tbProductoVariantes) {
      // Buscar la variante que coincida con color y talla seleccionados
     // console.log("Buscando variante para color:",usarVariantesTabla);
      const variante = product.tbProductoVariantes.find(
        (v) => 
          v.bolActivo &&
          (!selectedColor || v.strColor === selectedColor) &&
          (!selectedTalla || v.strTalla === selectedTalla)
      );
      setVarianteActual(variante || null);
      
      if (onVariantChange) {
        onVariantChange(selectedColor, selectedTalla, variante || null);
      }
    } else if (onVariantChange) {
      onVariantChange(selectedColor, selectedTalla, null);
    }
  }, [selectedColor, selectedTalla, product.variantes, usarVariantesTabla]);

  try {
    const categoria = product.tbCategoria?.strNombre?.toLowerCase() || "";
    const isRopa =
      categoria.includes("ropa") ||
      categoria.includes("moda") ||
      categoria.includes("vestimenta");

    let colores: string[] = [];
    let tallas: string[] = [];
    let variantesDisponibles: ProductoVariante[] = [];

    if (usarVariantesTabla && product.tbProductoVariantes) {
      // 🆕 Obtener colores y tallas desde la tabla de variantes
      variantesDisponibles = product.tbProductoVariantes.filter(v => v.bolActivo);
      
      // Extraer colores únicos
      colores = [...new Set(variantesDisponibles.map(v => v.strColor))].filter(Boolean);
      
      // Extraer tallas únicas
      tallas = [...new Set(variantesDisponibles.map(v => v.strTalla))].filter(Boolean);
      
    } else {
      // Fallback: usar jsonVariantes (método antiguo)
      const variantes: Variante[] = JSON.parse(product.jsonVariantes || "[]");

      const coloresVariante = variantes.find(
        (v) =>
          v.nombre?.toLowerCase() === "color" ||
          v.nombre?.toLowerCase() === "colores"
      );
      const tallasVariante = variantes.find(
        (v) =>
          v.nombre?.toLowerCase() === "talla" ||
          v.nombre?.toLowerCase() === "tallas"
      );

      colores = coloresVariante
        ? Array.isArray(coloresVariante.valor)
          ? coloresVariante.valor
          : coloresVariante.valor.split(",").map((c) => c.trim())
        : [];

      tallas = tallasVariante
        ? Array.isArray(tallasVariante.valor)
          ? tallasVariante.valor
          : tallasVariante.valor.split(",").map((t) => t.trim())
        : [];
    }

    const handleColorClick = (color: string) => {
      setSelectedColor(color);
    };

    const handleTallaClick = (talla: string) => {
      setSelectedTalla(talla);
    };

    // Función para verificar si una combinación tiene stock
    const tieneStock = (color: string, talla?: string | null): boolean => {
      if (!usarVariantesTabla) return true; // Si no usa tabla, asumir que hay stock
      
      const variante = variantesDisponibles.find(
        (v) => v.strColor === color && (!talla || v.strTalla === talla)
      );
      return variante ? variante.intStock > 0 : false;
    };

    // Función para obtener el stock de una variante
    const getStock = (color: string, talla?: string | null): number => {
      if (!usarVariantesTabla) return 0;
      
      const variante = variantesDisponibles.find(
        (v) => v.strColor === color && (!talla || v.strTalla === talla)
      );
      return variante?.intStock || 0;
    };
    //console.log("Colores disponibles:", colores);
    //console.log("Tallas disponibles:", tallas);

    return (
      <div className="mb-3 space-y-3">
        {/* 🎨 Colores */}
        {colores.length > 0 && (
          <div>
            <p className="text-sm text-[#1A1A1A]/80 mb-2 font-medium">
              Color: {selectedColor && <span className="text-[#3A6EA5]">{selectedColor}</span>}
              {usarVariantesTabla && selectedColor && (
                <span className="text-xs text-gray-500 ml-2">
                  {/* (Stock: {getStock(selectedColor, selectedTalla)}) */}
                </span>
              )}
            </p>
            <div className="flex gap-2 flex-wrap">
              {colores.map((color, idx) => {
                const sinStock = !tieneStock(color);
                return (
                  <div
                    key={idx}
                    onClick={() => !sinStock && handleColorClick(color)}
                    className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                      sinStock 
                        ? "opacity-30 cursor-not-allowed" 
                        : "cursor-pointer hover:scale-110"
                    } ${
                      selectedColor === color 
                        ? "border-[#3A6EA5] ring-2 ring-[#3A6EA5] ring-offset-2 scale-110" 
                        : "border-[#1A1A1A]/20 hover:border-[#3A6EA5]"
                    }`}
                    style={{
                      backgroundColor: color.startsWith("#")
                        ? color
                        : getHexColor(color),
                    }}
                    title={`${color}${sinStock ? " (Sin stock)" : ""}`}
                  >
                    {sinStock && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 👕 Tallas (solo ropa) */}
        {isRopa && tallas.length > 0 && (
          <div>
            <p className="text-sm text-[#1A1A1A]/80 mb-2 font-medium">
              Talla: {selectedTalla && <span className="text-[#3A6EA5]">{selectedTalla}</span>}
            </p>
            <div className="flex gap-2 flex-wrap">
              {tallas.map((talla, idx) => {
                const sinStock = selectedColor ? !tieneStock(selectedColor, talla) : false;
                return (
                  <button
                    key={idx}
                    onClick={() => !sinStock && handleTallaClick(talla)}
                    disabled={sinStock}
                    className={`px-3 py-1.5 text-sm border rounded-lg transition-all ${
                      sinStock
                        ? "opacity-30 cursor-not-allowed line-through"
                        : "cursor-pointer hover:scale-105"
                    } ${
                      selectedTalla === talla
                        ? "border-[#3A6EA5] text-white bg-[#3A6EA5] font-semibold shadow-md"
                        : "border-[#1A1A1A]/20 hover:border-[#3A6EA5] hover:text-[#3A6EA5]"
                    }`}
                  >
                    {talla}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 📊 Información de la variante seleccionada */}
        {usarVariantesTabla && varianteActual && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-1 text-xs">
              {varianteActual.strSKU && (
                <p className="text-gray-600">
                  <span className="font-semibold">SKU:</span> {varianteActual.strSKU}
                </p>
              )}
              {/* <p className="text-gray-600">
                <span className="font-semibold">Stock disponible:</span>{" "}
                <span className={varianteActual.intStock > 10 ? "text-green-600" : "text-orange-600"}>
                  {varianteActual.intStock} unidades
                </span>
              </p> */}
              {/* {varianteActual.dblPrecioAdicional && varianteActual.dblPrecioAdicional > 0 && (
                <p className="text-gray-600">
                  <span className="font-semibold">Precio adicional:</span>{" "}
                  <span className="text-[#3A6EA5] font-semibold">
                    +${varianteActual.dblPrecioAdicional.toFixed(2)}
                  </span>
                </p>
              )} */}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error al renderizar variantes:", error);
    return null;
  }
}

// Función legacy para compatibilidad (sin estado)
export function getVariantes(product: Producto) {
  return <VariantesSelector product={product} />;
}

// 🎨 Mapeo básico español → hex
const coloresHex: Record<string, string> = {
  negro: "#000000",
  blanco: "#FFFFFF",
  gris: "#808080",
  azul: "#007BFF",
  rojo: "#FF0000",
  verde: "#28A745",
  amarillo: "#FFC107",
  rosa: "#FF69B4",
  morado: "#800080",
  naranja: "#FFA500",
  marrón: "#8B4513",
  beige: "#F5F5DC",
  celeste: "#87CEEB",
  dorado: "#FFD700",
  plateado: "#C0C0C0",
};

function getHexColor(nombre: string): string {
  const key = nombre.trim().toLowerCase();
  return coloresHex[key] || "#CCCCCC"; // color por defecto
}
