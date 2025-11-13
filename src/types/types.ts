export interface Producto {
  intProducto: number;
  strNombre: string;
  strImagen: string;
  dblPrecio: number;
  dblPrecioDescuento?: number | null;
  bolTieneDescuento: boolean;
  tbCategoria?: { strNombre: string };
}

export interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  precioDescuento?: number | null;
  tieneDescuento: boolean;
  color?: string | null;
  talla?: string | null;
  imagen: string;
  categoria?: string;
  cantidad: number;
}
