export interface Productos{
  intProducto: number;
  strNombre: string;
  strSKU?: string;
  strMarca?: string;
  strDescripcion: string;
  dblPrecio: number;
  strImagen: string;
  bolActivo: boolean;
  bolDestacado?: boolean;
  strEstado?: string;
  bolTieneDescuento?: boolean;
  dblPrecioDescuento?: number;
  intPorcentajeDescuento?: number;
  datInicioDescuento?: string;
  datFinDescuento?: string;
  strEtiquetas?: string;
  jsonVariantes?: string;
  jsonImagenes?: string;
  intStock?: number; // 👈 AGREGADO: Stock disponible
  datCreacion: string;
  datActualizacion?: string;
  tbCategoria: {
    intCategoria: number;
    strNombre: string;
  };
 
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
  stock?: number; // 👈 AGREGADO: Stock disponible al momento de agregar
}
