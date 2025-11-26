# 🔧 MUTACIONES NECESARIAS PARA EL CHECKOUT

## 📋 INPUTS (Types) a Definir

```graphql
# Input para crear cliente invitado
input ClienteInvitadoInput {
  strNombre: String!
  strEmail: String!
  strTelefono: String
  strUsuario: String!
  strContra: String!
}

# Input para crear dirección
input DireccionInput {
  intCliente: Int!
  strCalle: String!
  strNumeroExterior: String!
  strNumeroInterior: String
  strColonia: String!
  strCiudad: String!
  strEstado: String!
  strCP: String!
  strPais: String
  strReferencias: String
}

# Input para items del pedido
input PedidoItemInput {
  intProducto: Int!
  intCantidad: Int!
  dblSubtotal: Float!
}

# Input para crear pedido
input PedidoInput {
  intCliente: Int!
  dblTotal: Float!
  items: [PedidoItemInput!]!
}

# Input para crear pago
input PagoInput {
  intPedido: Int!
  strMetodoPago: String!
  dblMonto: Float!
  intCuotas: Int
  jsonDetallesPago: String
}
```

---

## 1️⃣ MUTACIÓN: Crear Cliente Invitado

```graphql
type Mutation {
  crearClienteInvitado(data: ClienteInvitadoInput!): Cliente!
}
```

### Implementación (Resolver):

```typescript
// En tu archivo de resolvers (ej: mutations.ts o clientes.resolver.ts)

async crearClienteInvitado(
  _: any,
  { data }: { data: ClienteInvitadoInput },
  context: any
) {
  try {
    // Verificar si el email ya existe
    const clienteExistente = await context.prisma.tbClientes.findUnique({
      where: { strEmail: data.strEmail },
    });

    if (clienteExistente) {
      throw new Error("El email ya está registrado");
    }

    // Hash de la contraseña
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(data.strContra, 10);

    // Crear el cliente
    const nuevoCliente = await context.prisma.tbClientes.create({
      data: {
        strNombre: data.strNombre,
        strEmail: data.strEmail,
        strTelefono: data.strTelefono || "",
        strUsuario: data.strUsuario,
        strContra: hashedPassword,
        bolActivo: true,
      },
    });

    return nuevoCliente;
  } catch (error) {
    console.error("Error al crear cliente invitado:", error);
    throw new Error("No se pudo crear el cliente");
  }
}
```

---

## 2️⃣ MUTACIÓN: Crear Dirección

```graphql
type Query {
  obtenerDireccionesCliente(intCliente: Int!): [Direccion!]!
}

type Mutation {
  crearDireccion(data: DireccionInput!): Direccion!
  actualizarDireccion(intDireccion: Int!, data: DireccionInput!): Direccion!
}

type Direccion {
  intDireccion: Int!
  intCliente: Int!
  strCalle: String!
  strNumeroExterior: String!
  strNumeroInterior: String
  strColonia: String!
  strCiudad: String!
  strEstado: String!
  strCP: String!
  strPais: String!
  strReferencias: String
}
```

### Implementación (Resolvers):

```typescript
// QUERY: Obtener todas las direcciones de un cliente
async obtenerDireccionesCliente(
  _: any,
  { intCliente }: { intCliente: number },
  context: any
) {
  try {
    const direcciones = await context.prisma.tbDirecciones.findMany({
      where: { intCliente },
      orderBy: { intDireccion: 'desc' } // Las más recientes primero
    });

    return direcciones;
  } catch (error) {
    console.error("Error al obtener direcciones:", error);
    throw new Error("Error al cargar las direcciones del cliente");
  }
}

// MUTATION: Crear dirección
async crearDireccion(
  _: any,
  { data }: { data: DireccionInput },
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

    // Crear la dirección
    const nuevaDireccion = await context.prisma.tbDirecciones.create({
      data: {
        intCliente: data.intCliente,
        strCalle: data.strCalle,
        strNumeroExterior: data.strNumeroExterior,
        strNumeroInterior: data.strNumeroInterior || "",
        strColonia: data.strColonia,
        strCiudad: data.strCiudad,
        strEstado: data.strEstado,
        strCP: data.strCP,
        strPais: data.strPais || "México",
        strReferencias: data.strReferencias || "",
      },
    });

    return nuevaDireccion;
  } catch (error) {
    console.error("Error al crear dirección:", error);
    throw new Error("Error al guardar la dirección");
  }
}

// MUTATION: Actualizar dirección
async actualizarDireccion(
  _: any,
  { intDireccion, data }: { intDireccion: number; data: DireccionInput },
  context: any
) {
  try {
    const direccionActualizada = await context.prisma.tbDirecciones.update({
      where: { intDireccion },
      data: {
        strCalle: data.strCalle,
        strNumeroExterior: data.strNumeroExterior,
        strNumeroInterior: data.strNumeroInterior || "",
        strColonia: data.strColonia,
        strCiudad: data.strCiudad,
        strEstado: data.strEstado,
        strCP: data.strCP,
        strPais: data.strPais || "México",
        strReferencias: data.strReferencias || "",
      },
    });

    return direccionActualizada;
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    throw new Error("Error al actualizar la dirección");
  }
}
    });

    return nuevaDireccion;
  } catch (error) {
    console.error("Error al crear dirección:", error);
    throw new Error("No se pudo guardar la dirección");
  }
}
```

---

## 3️⃣ MUTACIÓN: Crear Pedido con Items

```graphql
type Mutation {
  crearPedido(data: PedidoInput!): Pedido!
}

type Pedido {
  intPedido: Int!
  intCliente: Int!
  dblTotal: Float!
  strEstado: EstadoPedido!
  datPedido: String!
  items: [PedidoItem!]!
}

type PedidoItem {
  intPedidoItem: Int!
  intProducto: Int!
  intCantidad: Int!
  dblSubtotal: Float!
}
```

### Implementación (Resolver):

```typescript
async crearPedido(
  _: any,
  { data }: { data: PedidoInput },
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

    // Validar que todos los productos existen y tienen stock
    for (const item of data.items) {
      const producto = await context.prisma.tbProductos.findUnique({
        where: { intProducto: item.intProducto },
      });

      if (!producto) {
        throw new Error(`Producto ${item.intProducto} no encontrado`);
      }

      if (producto.intStock < item.intCantidad) {
        throw new Error(
          `Stock insuficiente para el producto: ${producto.strNombre}`
        );
      }
    }

    // Crear el pedido con sus items usando una transacción
    const nuevoPedido = await context.prisma.$transaction(async (prisma: any) => {
      // Crear el pedido
      const pedido = await prisma.tbPedidos.create({
        data: {
          intCliente: data.intCliente,
          dblTotal: data.dblTotal,
          strEstado: "PENDIENTE",
        },
      });

      // Crear los items del pedido
      const itemsCreados = await Promise.all(
        data.items.map((item: any) =>
          prisma.tbPedidosItems.create({
            data: {
              intPedido: pedido.intPedido,
              intProducto: item.intProducto,
              intCantidad: item.intCantidad,
              dblSubtotal: item.dblSubtotal,
            },
          })
        )
      );

      // Actualizar el stock de cada producto
      await Promise.all(
        data.items.map((item: any) =>
          prisma.tbProductos.update({
            where: { intProducto: item.intProducto },
            data: {
              intStock: {
                decrement: item.intCantidad,
              },
            },
          })
        )
      );

      return {
        ...pedido,
        items: itemsCreados,
      };
    });

    return nuevoPedido;
  } catch (error) {
    console.error("Error al crear pedido:", error);
    throw new Error(error.message || "No se pudo crear el pedido");
  }
}
```

---

## 4️⃣ MUTACIÓN: Crear Pago

```graphql
type Mutation {
  crearPago(data: PagoInput!): Pago!
}

type Pago {
  intPago: Int!
  intPedido: Int!
  strMercadoPagoId: String!
  strMetodoPago: String!
  strEstado: EstadoPago!
  dblMonto: Float!
  intCuotas: Int
  jsonDetallesPago: String
  datCreacion: String!
}
```

### Implementación (Resolver):

```typescript
async crearPago(
  _: any,
  { data }: { data: PagoInput },
  context: any
) {
  try {
    // Verificar que el pedido existe
    const pedido = await context.prisma.tbPedidos.findUnique({
      where: { intPedido: data.intPedido },
    });

    if (!pedido) {
      throw new Error("Pedido no encontrado");
    }

    // Verificar que no exista ya un pago para este pedido
    const pagoExistente = await context.prisma.tbPagos.findUnique({
      where: { intPedido: data.intPedido },
    });

    if (pagoExistente) {
      throw new Error("Ya existe un pago registrado para este pedido");
    }

    // Generar un ID temporal de MercadoPago (se actualizará después)
    const mercadoPagoIdTemporal = `MP-TEMP-${Date.now()}-${data.intPedido}`;

    // Crear el registro de pago
    const nuevoPago = await context.prisma.tbPagos.create({
      data: {
        intPedido: data.intPedido,
        strMercadoPagoId: mercadoPagoIdTemporal,
        strMetodoPago: data.strMetodoPago,
        strEstado: "PENDIENTE",
        dblMonto: data.dblMonto,
        intCuotas: data.intCuotas || null,
        jsonDetallesPago: data.jsonDetallesPago || null,
      },
    });

    // Actualizar el estado del pedido a EN_PROCESO
    await context.prisma.tbPedidos.update({
      where: { intPedido: data.intPedido },
      data: { strEstado: "EN_PROCESO" },
    });

    return nuevoPago;
  } catch (error) {
    console.error("Error al crear pago:", error);
    throw new Error(error.message || "No se pudo registrar el pago");
  }
}
```

---

## 5️⃣ MUTACIÓN EXTRA: Actualizar Pago (después de respuesta de MercadoPago)

```graphql
type Mutation {
  actualizarPago(intPago: Int!, strMercadoPagoId: String!, strEstado: EstadoPago!): Pago!
}
```

### Implementación (Resolver):

```typescript
async actualizarPago(
  _: any,
  { intPago, strMercadoPagoId, strEstado }: any,
  context: any
) {
  try {
    // Actualizar el pago con el ID real de MercadoPago
    const pagoActualizado = await context.prisma.tbPagos.update({
      where: { intPago },
      data: {
        strMercadoPagoId,
        strEstado,
      },
    });

    // Si el pago fue aprobado, actualizar el estado del pedido
    if (strEstado === "APROBADO") {
      await context.prisma.tbPedidos.update({
        where: { intPedido: pagoActualizado.intPedido },
        data: { strEstado: "PAGADO" },
      });
    }

    // Si el pago fue rechazado, cancelar el pedido y devolver el stock
    if (strEstado === "RECHAZADO" || strEstado === "CANCELADO") {
      const pedido = await context.prisma.tbPedidos.findUnique({
        where: { intPedido: pagoActualizado.intPedido },
        include: { tbItems: true },
      });

      // Devolver el stock
      if (pedido) {
        await Promise.all(
          pedido.tbItems.map((item: any) =>
            context.prisma.tbProductos.update({
              where: { intProducto: item.intProducto },
              data: {
                intStock: {
                  increment: item.intCantidad,
                },
              },
            })
          )
        );

        // Cancelar el pedido
        await context.prisma.tbPedidos.update({
          where: { intPedido: pagoActualizado.intPedido },
          data: { strEstado: "CANCELADO" },
        });
      }
    }

    return pagoActualizado;
  } catch (error) {
    console.error("Error al actualizar pago:", error);
    throw new Error("No se pudo actualizar el pago");
  }
}
```

---

## 📝 ARCHIVO COMPLETO DE RESOLVERS

Aquí está todo junto para que lo copies a tu archivo de resolvers:

```typescript
// archivo: src/graphql/resolvers/pedidos.resolver.ts (o donde tengas tus resolvers)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const pedidosResolvers = {
  Mutation: {
    // 1. Crear cliente invitado
    crearClienteInvitado: async (_: any, { data }: any) => {
      try {
        const clienteExistente = await prisma.tbClientes.findUnique({
          where: { strEmail: data.strEmail },
        });

        if (clienteExistente) {
          throw new Error("El email ya está registrado");
        }

        const hashedPassword = await bcrypt.hash(data.strContra, 10);

        const nuevoCliente = await prisma.tbClientes.create({
          data: {
            strNombre: data.strNombre,
            strEmail: data.strEmail,
            strTelefono: data.strTelefono || "",
            strUsuario: data.strUsuario,
            strContra: hashedPassword,
            bolActivo: true,
          },
        });

        return nuevoCliente;
      } catch (error: any) {
        throw new Error(error.message || "No se pudo crear el cliente");
      }
    },

    // 2. Crear dirección
    crearDireccion: async (_: any, { data }: any) => {
      try {
        const cliente = await prisma.tbClientes.findUnique({
          where: { intCliente: data.intCliente },
        });

        if (!cliente) {
          throw new Error("Cliente no encontrado");
        }

        const nuevaDireccion = await prisma.tbDirecciones.create({
          data: {
            intCliente: data.intCliente,
            strCalle: data.strCalle,
            strCiudad: data.strCiudad,
            strEstado: data.strEstado,
            strCP: data.strCP,
            strPais: data.strPais || "México",
          },
        });

        return nuevaDireccion;
      } catch (error: any) {
        throw new Error(error.message || "No se pudo guardar la dirección");
      }
    },

    // 3. Crear pedido con items
    crearPedido: async (_: any, { data }: any) => {
      try {
        const cliente = await prisma.tbClientes.findUnique({
          where: { intCliente: data.intCliente },
        });

        if (!cliente) {
          throw new Error("Cliente no encontrado");
        }

        // Validar stock
        for (const item of data.items) {
          const producto = await prisma.tbProductos.findUnique({
            where: { intProducto: item.intProducto },
          });

          if (!producto) {
            throw new Error(`Producto ${item.intProducto} no encontrado`);
          }

          if (producto.intStock < item.intCantidad) {
            throw new Error(
              `Stock insuficiente para: ${producto.strNombre}`
            );
          }
        }

        // Transacción para crear pedido e items
        const nuevoPedido = await prisma.$transaction(async (tx) => {
          const pedido = await tx.tbPedidos.create({
            data: {
              intCliente: data.intCliente,
              dblTotal: data.dblTotal,
              strEstado: "PENDIENTE",
            },
          });

          const itemsCreados = await Promise.all(
            data.items.map((item: any) =>
              tx.tbPedidosItems.create({
                data: {
                  intPedido: pedido.intPedido,
                  intProducto: item.intProducto,
                  intCantidad: item.intCantidad,
                  dblSubtotal: item.dblSubtotal,
                },
              })
            )
          );

          // Actualizar stock
          await Promise.all(
            data.items.map((item: any) =>
              tx.tbProductos.update({
                where: { intProducto: item.intProducto },
                data: {
                  intStock: {
                    decrement: item.intCantidad,
                  },
                },
              })
            )
          );

          return {
            ...pedido,
            items: itemsCreados,
          };
        });

        return nuevoPedido;
      } catch (error: any) {
        throw new Error(error.message || "No se pudo crear el pedido");
      }
    },

    // 4. Crear pago
    crearPago: async (_: any, { data }: any) => {
      try {
        const pedido = await prisma.tbPedidos.findUnique({
          where: { intPedido: data.intPedido },
        });

        if (!pedido) {
          throw new Error("Pedido no encontrado");
        }

        const pagoExistente = await prisma.tbPagos.findUnique({
          where: { intPedido: data.intPedido },
        });

        if (pagoExistente) {
          throw new Error("Ya existe un pago para este pedido");
        }

        const mercadoPagoIdTemporal = `MP-TEMP-${Date.now()}-${data.intPedido}`;

        const nuevoPago = await prisma.tbPagos.create({
          data: {
            intPedido: data.intPedido,
            strMercadoPagoId: mercadoPagoIdTemporal,
            strMetodoPago: data.strMetodoPago,
            strEstado: "PENDIENTE",
            dblMonto: data.dblMonto,
            intCuotas: data.intCuotas || null,
            jsonDetallesPago: data.jsonDetallesPago || null,
          },
        });

        await prisma.tbPedidos.update({
          where: { intPedido: data.intPedido },
          data: { strEstado: "EN_PROCESO" },
        });

        return nuevoPago;
      } catch (error: any) {
        throw new Error(error.message || "No se pudo registrar el pago");
      }
    },

    // 5. Actualizar pago (webhook de MercadoPago)
    actualizarPago: async (_: any, { intPago, strMercadoPagoId, strEstado }: any) => {
      try {
        const pagoActualizado = await prisma.tbPagos.update({
          where: { intPago },
          data: {
            strMercadoPagoId,
            strEstado,
          },
        });

        if (strEstado === "APROBADO") {
          await prisma.tbPedidos.update({
            where: { intPedido: pagoActualizado.intPedido },
            data: { strEstado: "PAGADO" },
          });
        }

        if (strEstado === "RECHAZADO" || strEstado === "CANCELADO") {
          const pedido = await prisma.tbPedidos.findUnique({
            where: { intPedido: pagoActualizado.intPedido },
            include: { tbItems: true },
          });

          if (pedido) {
            await Promise.all(
              pedido.tbItems.map((item: any) =>
                prisma.tbProductos.update({
                  where: { intProducto: item.intProducto },
                  data: {
                    intStock: { increment: item.intCantidad },
                  },
                })
              )
            );

            await prisma.tbPedidos.update({
              where: { intPedido: pagoActualizado.intPedido },
              data: { strEstado: "CANCELADO" },
            });
          }
        }

        return pagoActualizado;
      } catch (error: any) {
        throw new Error("No se pudo actualizar el pago");
      }
    },
  },
};
```

---

## 🚀 PRÓXIMOS PASOS

1. Copia los Types/Inputs al archivo de schema GraphQL
2. Copia los resolvers a tu archivo de resolvers
3. Prueba cada mutación con GraphQL Playground
4. Integra MercadoPago en el siguiente paso

¿Necesitas ayuda con la integración de MercadoPago?
