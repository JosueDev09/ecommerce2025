import { useMemo } from "react";

interface CartItem {
  precio: number;
  precioDescuento?: number;
  tieneDescuento?: boolean;
  cantidad: number;
}

interface FormData {
  metodoEnvio: string;
}

export const useCheckoutCalculations = (
  carrito: CartItem[],
  formData: FormData,
  discount: number
) => {
  // Función para obtener el precio final de un producto (con o sin descuento)
  const obtenerPrecioFinal = (item: CartItem) => {
    if (item.tieneDescuento && item.precioDescuento) {
      return item.precioDescuento;
    }
    return item.precio;
  };

  const calculations = useMemo(() => {
    const subtotal = carrito.reduce((sum, item) => sum + obtenerPrecioFinal(item) * item.cantidad, 0);
    
    // Calcular descuento por productos con precio especial
    const descuentoProductos = carrito.reduce((sum, item) => {
      if (item.tieneDescuento && item.precioDescuento) {
        return sum + ((item.precio - item.precioDescuento) * item.cantidad);
      }
      return sum;
    }, 0);

    // Calcular descuento por código promocional
    const descuentoCodigo = subtotal * discount;
    
    // Calcular envío según método seleccionado
    let envio = 0;
    if (formData.metodoEnvio === "express") {
      envio = 299;
    } else if (formData.metodoEnvio === "estandar") {
      envio = subtotal > 5000 ? 0 : 150;
    } else if (formData.metodoEnvio === "recoger") {
      envio = 0;
    }
    
    const total = subtotal - descuentoCodigo + envio;

    return {
      subtotal,
      descuentoProductos,
      descuentoCodigo,
      envio,
      total,
      obtenerPrecioFinal,
    };
  }, [carrito, formData.metodoEnvio, discount]);

  return calculations;
};
