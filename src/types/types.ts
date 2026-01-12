export interface ProductoVariante {
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

export interface Productos{
  intProducto: number;
  strNombre: string;
  strSKU?: string;
  strMarca?: string;
  strDescripcion: string;
  strDescripcionLarga: string;
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
  intStock: number; // 👈 Stock disponible
  variantes: ProductoVariante[]; // 👈 NUEVO: Array de variantes desde la tabla
  datCreacion: string;
  datActualizacion?: string;
  tbCategoria: {
    intCategoria: number;
    strNombre: string;
  };
   tbProductoVariantes: ProductoVariante[]; // 👈 nombre real
 
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
