# Ejemplo de Query GraphQL con Variantes

## 1. Query para obtener productos con sus variantes

```graphql
query ObtenerProductosConVariantes {
  productos {
    intProducto
    strNombre
    strSKU
    strMarca
    strDescripcion
    dblPrecio
    strImagen
    bolActivo
    bolDestacado
    bolTieneDescuento
    dblPrecioDescuento
    intPorcentajeDescuento
    datInicioDescuento
    datFinDescuento
    intStock
    jsonVariantes
    jsonImagenes
    datCreacion
    datActualizacion
    
    tbCategoria {
      intCategoria
      strNombre
    }
    
    # 🆕 Agregar las variantes desde la tabla
    variantes {
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
  }
}
```

## 2. Query para un producto específico con variantes

```graphql
query ObtenerProductoPorSlug($slug: String!) {
  productoPorSlug(slug: $slug) {
    intProducto
    strNombre
    strDescripcion
    dblPrecio
    strImagen
    bolTieneDescuento
    dblPrecioDescuento
    jsonImagenes
    
    tbCategoria {
      intCategoria
      strNombre
    }
    
    # Variantes desde la tabla
    variantes {
      intVariante
      strTalla
      strColor
      intStock
      strSKU
      dblPrecioAdicional
      strImagen
      bolActivo
    }
  }
}
```

## 3. Estructura del Resolver en el Backend (Ejemplo)

```javascript
// Ejemplo de cómo debería verse tu resolver en el backend

const resolvers = {
  Query: {
    productos: async () => {
      const productos = await db.Producto.findAll({
        include: [
          {
            model: db.Categoria,
            as: 'tbCategoria'
          },
          {
            model: db.ProductoVariante,
            as: 'variantes',
            where: { bolActivo: true }, // Solo variantes activas
            required: false
          }
        ]
      });
      return productos;
    }
  }
};
```

## 4. Uso en el Frontend

El componente `VariantesSelector` ahora detecta automáticamente si el producto tiene variantes:

```tsx
// Ejemplo de uso en un componente
import { VariantesSelector } from "@/lib/getVariantes";

function ProductoDetalle({ producto }) {
  const handleVariantChange = (color, talla, varianteSeleccionada) => {
    console.log("Color:", color);
    console.log("Talla:", talla);
    
    if (varianteSeleccionada) {
      console.log("SKU:", varianteSeleccionada.strSKU);
      console.log("Stock:", varianteSeleccionada.intStock);
      console.log("Precio adicional:", varianteSeleccionada.dblPrecioAdicional);
    }
  };

  return (
    <div>
      <h1>{producto.strNombre}</h1>
      
      <VariantesSelector 
        product={producto}
        onVariantChange={handleVariantChange}
      />
      
      {/* Mostrar precio con adicional si aplica */}
      <p>Precio: ${producto.dblPrecio}</p>
    </div>
  );
}
```

## 5. Características Implementadas

✅ **Compatibilidad hacia atrás**: Si no hay `variantes[]`, usa `jsonVariantes` (método antiguo)
✅ **Control de stock**: Muestra visualmente qué variantes tienen stock
✅ **Indicadores visuales**: 
   - Colores sin stock aparecen tachados y deshabilitados
   - Tallas sin stock se muestran con opacidad reducida
✅ **Información detallada**: Muestra SKU, stock disponible y precio adicional
✅ **Callback mejorado**: Devuelve el objeto completo de la variante seleccionada
✅ **Validación en tiempo real**: Solo permite seleccionar combinaciones con stock

## 6. Migración desde jsonVariantes

Si tienes productos con el sistema antiguo (`jsonVariantes`), el componente seguirá funcionando:

```typescript
// Sistema ANTIGUO (aún funciona)
{
  strNombre: "Camiseta",
  jsonVariantes: '[{"nombre":"color","valor":["rojo","azul"]},{"nombre":"talla","valor":["S","M","L"]}]'
}

// Sistema NUEVO (recomendado)
{
  strNombre: "Camiseta",
  variantes: [
    { strColor: "rojo", strTalla: "S", intStock: 10, dblPrecioAdicional: 0 },
    { strColor: "rojo", strTalla: "M", intStock: 5, dblPrecioAdicional: 0 },
    { strColor: "azul", strTalla: "L", intStock: 0, dblPrecioAdicional: 2.50 }
  ]
}
```

## 7. Próximos Pasos

1. Actualiza tus queries de GraphQL para incluir el campo `variantes`
2. Asegúrate de que tu resolver esté devolviendo las variantes desde la tabla
3. El componente detectará automáticamente las variantes y las renderizará con control de stock
4. Puedes mantener `jsonVariantes` para productos sin variantes complejas
