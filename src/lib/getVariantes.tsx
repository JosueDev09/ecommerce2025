// 📁 src/lib/getVariantes.tsx
"use client";
import React, { useState } from "react";

interface Variante {
  nombre: string;
  valor: string | string[];
}

interface Producto {
  jsonVariantes?: string;
  tbCategoria?: { strNombre: string };
}

interface VariantesComponentProps {
  product: Producto;
  onVariantChange?: (selectedColor: string | null, selectedTalla: string | null) => void;
}

export function VariantesSelector({ product, onVariantChange }: VariantesComponentProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);

  try {
    const variantes: Variante[] = JSON.parse(product.jsonVariantes || "[]");

    const categoria = product.tbCategoria?.strNombre?.toLowerCase() || "";
    const isRopa =
      categoria.includes("ropa") ||
      categoria.includes("moda") ||
      categoria.includes("vestimenta");

    // Buscar variantes de color y talla
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

    // Parsear valores
    const colores = coloresVariante
      ? Array.isArray(coloresVariante.valor)
        ? coloresVariante.valor
        : coloresVariante.valor.split(",").map((c) => c.trim())
      : [];

    const tallas = tallasVariante
      ? Array.isArray(tallasVariante.valor)
        ? tallasVariante.valor
        : tallasVariante.valor.split(",").map((t) => t.trim())
      : [];

    const handleColorClick = (color: string) => {
      setSelectedColor(color);
      if (onVariantChange) {
        onVariantChange(color, selectedTalla);
      }
    };

    const handleTallaClick = (talla: string) => {
      setSelectedTalla(talla);
      if (onVariantChange) {
        onVariantChange(selectedColor, talla);
      }
    };

    return (
      <div className="mb-3 space-y-2">
        {/* 🎨 Colores */}
        {colores.length > 0 && (
          <div>
            <p className="text-xs text-[#1A1A1A]/60 mb-1">
              Color: {selectedColor && <span className="font-semibold text-[#3A6EA5]">{selectedColor}</span>}
            </p>
            <div className="flex gap-2 flex-wrap">
              {colores.slice(0, 4).map((color, idx) => (
                <div
                  key={idx}
                  onClick={() => handleColorClick(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                    selectedColor === color 
                      ? "border-[#3A6EA5] ring-2 ring-[#3A6EA5] ring-offset-1 scale-110" 
                      : "border-[#1A1A1A]/20 hover:border-[#3A6EA5]"
                  }`}
                  style={{
                    backgroundColor: color.startsWith("#")
                      ? color
                      : getHexColor(color),
                  }}
                  title={color}
                />
              ))}
              {colores.length > 4 && (
                <span className="text-xs text-[#1A1A1A]/60 self-center">
                  +{colores.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 👕 Tallas (solo ropa) */}
        {isRopa && tallas.length > 0 && (
          <div>
            <p className="text-xs text-[#1A1A1A]/60 mb-1">
              Talla: {selectedTalla && <span className="font-semibold text-[#3A6EA5]">{selectedTalla}</span>}
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {tallas.slice(0, 5).map((talla, idx) => (
                <span
                  key={idx}
                  onClick={() => handleTallaClick(talla)}
                  className={`px-2 py-0.5 text-xs border rounded transition-all cursor-pointer ${
                    selectedTalla === talla
                      ? "border-[#3A6EA5] text-[#3A6EA5] bg-[#3A6EA5]/10 font-semibold"
                      : "border-[#1A1A1A]/20 hover:border-[#3A6EA5] hover:text-[#3A6EA5]"
                  }`}
                >
                  {talla}
                </span>
              ))}
              {tallas.length > 5 && (
                <span className="text-xs text-[#1A1A1A]/60 self-center">
                  +{tallas.length - 5}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  } catch {
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
