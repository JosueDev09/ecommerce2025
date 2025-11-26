# 📦 Actualización del Schema de Prisma - Método de Envío y Tarjetas

## 1️⃣ Actualizar `schema.prisma`

### A) Modelo de Pedidos

Agrega los siguientes campos a tu modelo `tbPedidos`:

```prisma
model tbPedidos {
  intPedido        Int          @id @default(autoincrement())
  intCliente       Int
  intDireccion     Int?         // ✨ NUEVO: Relación con dirección de envío
  dblTotal         Float        @default(0)
  dblSubtotal      Float        @default(0)  // ✨ NUEVO: Subtotal sin envío
  dblCostoEnvio    Float        @default(0)  // ✨ NUEVO: Costo del envío
  strEstado        EstadoPedido @default(PENDIENTE)
  strMetodoEnvio   String?      // ✨ NUEVO: express, estandar, recoger
  strNotasEnvio    String?      // ✨ NUEVO: Notas adicionales de envío
  datPedido        DateTime     @default(now())
  datActualizacion DateTime     @updatedAt

  tbCliente   tbClientes       @relation(fields: [intCliente], references: [intCliente])
  tbDireccion tbDirecciones?   @relation(fields: [intDireccion], references: [intDireccion]) // ✨ NUEVO
  tbItems     tbPedidosItems[]
  tbPago      tbPagos?
}
```

### B) Modelo de Direcciones

Asegúrate de que tbDirecciones tenga esta relación inversa:

```prisma
model tbDirecciones {
  intDireccion      Int      @id @default(autoincrement())
  intCliente        Int
  strCalle          String
  strNumeroExterior String
  strNumeroInterior String?
  strColonia        String
  strCP             String
  strCiudad         String
  strEstado         String
  strPais           String   @default("México")
  strReferencias    String?
  datCreacion       DateTime @default(now())
  datActualizacion  DateTime @updatedAt

  tbCliente tbClientes  @relation(fields: [intCliente], references: [intCliente])
  tbPedidos tbPedidos[] // ✨ NUEVO: Relación inversa
}
```

### C) Modelo de Tarjetas (NUEVO) 💳

```prisma
model tbTarjetas {
  intTarjeta         Int      @id @default(autoincrement())
  intCliente         Int
  strNumeroTarjeta   String   // Solo últimos 4 dígitos
  strNombreTarjeta   String
  strTipoTarjeta     String   // visa, mastercard, amex
  strFechaExpiracion String   // MM/YY
  datCreacion        DateTime @default(now())
  datActualizacion   DateTime @updatedAt

  tbCliente tbClientes @relation(fields: [intCliente], references: [intCliente])

  @@index([intCliente])
}
```

### D) Actualizar tbClientes

Agregar relación con tarjetas:

```prisma
model tbClientes {
  // ... campos existentes ...
  
  tbDirecciones tbDirecciones[]
  tbPedidos     tbPedidos[]
  tbTarjetas    tbTarjetas[]    // ✨ NUEVO
}
```

## 2️⃣ Ejecutar Migraciones

Después de actualizar el schema, ejecuta:

```bash
npx prisma migrate dev --name agregar_metodo_envio
npx prisma generate
```

## 3️⃣ Actualizar Input de GraphQL

Actualiza el `PedidoInput` en tu backend:

```graphql
input PedidoInput {
  intCliente: Int!
  intDireccion: Int              # ✨ NUEVO
  dblSubtotal: Float!            # ✨ NUEVO
  dblCostoEnvio: Float!          # ✨ NUEVO
  dblTotal: Float!
  strMetodoEnvio: String!        # ✨ NUEVO: "express" | "estandar" | "recoger"
  strNotasEnvio: String          # ✨ NUEVO
  items: [PedidoItemInput!]!
}
```

## 4️⃣ Actualizar Resolver `crearPedido`

```typescript
async crearPedido(
  _: any,
  { data }: { data: PedidoInput },
  context: any
) {
  try {
    // Validar cliente
    const cliente = await context.prisma.tbClientes.findUnique({
      where: { intCliente: data.intCliente },
    });

    if (!cliente) {
      throw new Error("Cliente no encontrado");
    }

    // Validar dirección si el método requiere envío
    if (data.strMetodoEnvio !== "recoger" && !data.intDireccion) {
      throw new Error("Se requiere una dirección de envío");
    }

    // Iniciar transacción
    const pedido = await context.prisma.$transaction(async (prisma: any) => {
      // 1. Validar stock de productos
      for (const item of data.items) {
        const producto = await prisma.tbProductos.findUnique({
          where: { intProducto: item.intProducto },
        });

        if (!producto) {
          throw new Error(`Producto ${item.intProducto} no encontrado`);
        }

        if (producto.intStock < item.intCantidad) {
          throw new Error(`Stock insuficiente para ${producto.strNombre}`);
        }
      }

      // 2. Crear el pedido con información de envío
      const nuevoPedido = await prisma.tbPedidos.create({
        data: {
          intCliente: data.intCliente,
          intDireccion: data.intDireccion,        // ✨ NUEVO
          dblSubtotal: data.dblSubtotal,          // ✨ NUEVO
          dblCostoEnvio: data.dblCostoEnvio,      // ✨ NUEVO
          dblTotal: data.dblTotal,
          strMetodoEnvio: data.strMetodoEnvio,    // ✨ NUEVO
          strNotasEnvio: data.strNotasEnvio,      // ✨ NUEVO
          strEstado: "PENDIENTE",
        },
      });

      // 3. Crear items del pedido
      for (const item of data.items) {
        await prisma.tbPedidosItems.create({
          data: {
            intPedido: nuevoPedido.intPedido,
            intProducto: item.intProducto,
            intCantidad: item.intCantidad,
            dblPrecioUnitario: item.dblSubtotal / item.intCantidad,
            dblSubtotal: item.dblSubtotal,
          },
        });

        // 4. Actualizar stock
        await prisma.tbProductos.update({
          where: { intProducto: item.intProducto },
          data: {
            intStock: {
              decrement: item.intCantidad,
            },
          },
        });
      }

      return nuevoPedido;
    });

    // 5. Retornar pedido con relaciones
    return await context.prisma.tbPedidos.findUnique({
      where: { intPedido: pedido.intPedido },
      include: {
        tbCliente: true,
        tbDireccion: true,  // ✨ NUEVO
        tbItems: {
          include: {
            tbProducto: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    throw error;
  }
}
```

## 5️⃣ Tipo de Retorno Actualizado

```graphql
type Pedido {
  intPedido: Int!
  intCliente: Int!
  intDireccion: Int
  dblSubtotal: Float!      # ✨ NUEVO
  dblCostoEnvio: Float!    # ✨ NUEVO
  dblTotal: Float!
  strEstado: String!
  strMetodoEnvio: String   # ✨ NUEVO
  strNotasEnvio: String    # ✨ NUEVO
  datPedido: String!
  tbCliente: Cliente!
  tbDireccion: Direccion   # ✨ NUEVO
  tbItems: [PedidoItem!]!
  tbPago: Pago
}
```

## 📊 Lógica de Costos de Envío

```typescript
// En el frontend ya está implementado:
const calcularCostoEnvio = (metodo: string, subtotal: number): number => {
  switch (metodo) {
    case "express":
      return 299;
    case "estandar":
      return subtotal > 5000 ? 0 : 150;
    case "recoger":
      return 0;
    default:
      return 0;
  }
};
```

## 🎯 Beneficios de esta Estructura

✅ **Historial completo**: Cada pedido guarda su método y costo de envío
✅ **Relación con dirección**: Sabes exactamente dónde se envió cada pedido
✅ **Separación de costos**: `dblSubtotal` + `dblCostoEnvio` = `dblTotal`
✅ **Trazabilidad**: Puedes hacer reportes por método de envío
✅ **Escalabilidad**: Fácil agregar más métodos o modificar costos

## ⚠️ Consideraciones

- El campo `intDireccion` es **opcional** (nullable) porque "recoger" no necesita dirección
- Valida que si `strMetodoEnvio !== "recoger"`, entonces `intDireccion` debe existir
- Los costos de envío pueden cambiar en el futuro, pero cada pedido guarda el costo que pagó

---

# 💳 SISTEMA DE TARJETAS GUARDADAS

## 6️⃣ Inputs GraphQL para Tarjetas

```graphql
# Input para crear tarjeta
input TarjetaInput {
  intCliente: Int!
  strNumeroTarjeta: String!   # Solo últimos 4 dígitos
  strNombreTarjeta: String!
  strTipoTarjeta: String!     # visa, mastercard, amex
  strFechaExpiracion: String! # MM/YY
}
```

## 7️⃣ Queries y Mutations de Tarjetas

```graphql
type Query {
  obtenerTarjetasCliente(intCliente: Int!): [Tarjeta!]!
}

type Mutation {
  crearTarjeta(data: TarjetaInput!): Tarjeta!
  eliminarTarjeta(intTarjeta: Int!): Boolean!
}

type Tarjeta {
  intTarjeta: Int!
  intCliente: Int!
  strNumeroTarjeta: String!   # Solo últimos 4 dígitos
  strNombreTarjeta: String!
  strTipoTarjeta: String!
  strFechaExpiracion: String!
  datCreacion: String!
}
```

## 8️⃣ Resolvers de Tarjetas

```typescript
// QUERY: Obtener todas las tarjetas de un cliente
async obtenerTarjetasCliente(
  _: any,
  { intCliente }: { intCliente: number },
  context: any
) {
  try {
    const tarjetas = await context.prisma.tbTarjetas.findMany({
      where: { intCliente },
      orderBy: { datCreacion: 'desc' } // Las más recientes primero
    });

    return tarjetas;
  } catch (error) {
    console.error("Error al obtener tarjetas:", error);
    throw new Error("Error al cargar las tarjetas del cliente");
  }
}

// MUTATION: Crear tarjeta
async crearTarjeta(
  _: any,
  { data }: { data: TarjetaInput },
  context: any
) {
  try {
    // Verificar que el cliente existe
    const cliente = await context.prisma.tbClientes.findUnique({
      where: { intCliente: data.intCliente },
    });

    if (!cliente) {
      throw new Error("Cliente no encontrado");
    }

    // Verificar que solo guarda últimos 4 dígitos (seguridad)
    if (data.strNumeroTarjeta.length > 4) {
      throw new Error("Solo se deben guardar los últimos 4 dígitos de la tarjeta");
    }

    // Crear la tarjeta
    const nuevaTarjeta = await context.prisma.tbTarjetas.create({
      data: {
        intCliente: data.intCliente,
        strNumeroTarjeta: data.strNumeroTarjeta,
        strNombreTarjeta: data.strNombreTarjeta,
        strTipoTarjeta: data.strTipoTarjeta,
        strFechaExpiracion: data.strFechaExpiracion,
      },
    });

    return nuevaTarjeta;
  } catch (error) {
    console.error("Error al crear tarjeta:", error);
    throw error;
  }
}

// MUTATION: Eliminar tarjeta
async eliminarTarjeta(
  _: any,
  { intTarjeta }: { intTarjeta: number },
  context: any
) {
  try {
    await context.prisma.tbTarjetas.delete({
      where: { intTarjeta },
    });

    return true;
  } catch (error) {
    console.error("Error al eliminar tarjeta:", error);
    throw new Error("Error al eliminar la tarjeta");
  }
}
```

## 🔒 Consideraciones de Seguridad para Tarjetas

⚠️ **IMPORTANTE - SEGURIDAD PCI DSS**:

1. **NUNCA guardes**:
   - Número completo de tarjeta
   - CVV/CVC
   - Datos de banda magnética

2. **Solo guarda**:
   - Últimos 4 dígitos del número
   - Nombre del titular
   - Tipo de tarjeta (Visa, Mastercard, etc.)
   - Fecha de expiración

3. **Para procesar pagos**:
   - Usa MercadoPago, Stripe, o similar
   - Ellos manejan la tokenización segura
   - Guarda el token del proveedor, no los datos reales

4. **El CVV siempre**:
   - Se solicita en cada transacción
   - NUNCA se guarda en base de datos
   - Solo se envía directamente al procesador de pagos

## 📋 Flujo de Pago con Tarjeta Guardada

```
1. Usuario selecciona tarjeta guardada
2. Se muestra: "Visa •••• 1234"
3. Se solicita CVV para completar pago
4. CVV se envía directamente a MercadoPago (no al backend)
5. MercadoPago procesa y retorna resultado
6. Backend guarda el estado del pago
```

## ✨ Beneficios del Sistema de Tarjetas

✅ **UX mejorada**: Checkout rápido con tarjetas guardadas
✅ **Seguridad**: Solo se guardan datos no sensibles
✅ **Gestión**: Usuario puede eliminar tarjetas viejas
✅ **Múltiples tarjetas**: Puede guardar varias y elegir
✅ **Sin CVV almacenado**: Cumple con estándares PCI DSS

