# 🔵 BACKEND - INTEGRACIÓN MERCADOPAGO CON PRISMA Y GRAPHQL

## 📋 ÍNDICE
1. [Instalación de Dependencias](#1-instalación-de-dependencias)
2. [Variables de Entorno](#2-variables-de-entorno)
3. [Schema de Prisma](#3-schema-de-prisma)
4. [Types e Inputs GraphQL](#4-types-e-inputs-graphql)
5. [Mutation Resolver](#5-mutation-resolver)
6. [Webhook para Notificaciones](#6-webhook-para-notificaciones)
7. [Flujo Completo](#7-flujo-completo)

---

## 1️⃣ Instalación de Dependencias

```bash
npm install mercadopago
# o
pnpm add mercadopago
# o
yarn add mercadopago
```

---

## 2️⃣ Variables de Entorno

Crear o actualizar `.env`:

```env
# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=tu_public_key_aqui

# URLs de la aplicación
FRONTEND_URL=http://localhost:3000

# Base de datos
DATABASE_URL="tu_connection_string"
```

**Obtener credenciales:**
- Sandbox (pruebas): https://www.mercadopago.com.mx/developers/panel/credentials
- Producción: https://www.mercadopago.com.mx/credentials

---

## 3️⃣ Schema de Prisma

Actualizar `schema.prisma`:

```prisma
model tbPagos {
  intPago              Int      @id @default(autoincrement())
  intPedido            Int      @unique
  strMetodoPago        String   // tarjeta, paypal, efectivo
  dblMonto             Float
  strEstado            String   @default("PENDIENTE") // PENDIENTE, APROBADO, RECHAZADO
  strMercadoPagoId     String?  // ID del pago en MercadoPago
  strPreferenciaId     String?  // ID de la preferencia creada
  intCuotas            Int?     // Meses sin intereses
  jsonDetallesPago     String?  // JSON con detalles adicionales
  jsonRespuestaMercadoPago String? // Respuesta completa de MP
  datCreacion          DateTime @default(now())
  datActualizacion     DateTime @updatedAt

  tbPedido tbPedidos @relation(fields: [intPedido], references: [intPedido])

  @@index([intPedido])
  @@index([strMercadoPagoId])
  @@index([strPreferenciaId])
}

model tbPedidos {
  intPedido        Int          @id @default(autoincrement())
  intCliente       Int
  intDireccion     Int?
  dblSubtotal      Float        @default(0)
  dblCostoEnvio    Float        @default(0)
  dblTotal         Float        @default(0)
  strEstado        String       @default("PENDIENTE") // PENDIENTE, PROCESANDO, PAGADO, ENVIADO, ENTREGADO, CANCELADO
  strMetodoEnvio   String?
  strNotasEnvio    String?
  datPedido        DateTime     @default(now())
  datActualizacion DateTime     @updatedAt

  tbCliente   tbClientes        @relation(fields: [intCliente], references: [intCliente])
  tbDireccion tbDirecciones?    @relation(fields: [intDireccion], references: [intDireccion])
  tbItems     tbPedidosItems[]
  tbPago      tbPagos?

  @@index([intCliente])
  @@index([strEstado])
}
```

**Ejecutar migración:**

```bash
npx prisma migrate dev --name agregar_mercadopago
npx prisma generate
```

---

## 4️⃣ Types e Inputs GraphQL

Agregar al schema GraphQL:

```graphql
# ============================================
# INPUTS
# ============================================

input PreferenciaMercadoPagoInput {
  intPedido: Int!
  intCliente: Int!
  intDireccion: Int
  formData: FormDataInput!
  montos: MontosInput!
  items: [ItemMercadoPagoInput!]!
  payer: PayerInput!
  shipments: ShipmentsInput
  metadata: JSON
}

input FormDataInput {
  nombre: String!
  apellido: String
  email: String!
  telefono: String!
  calle: String
  numeroExterior: String
  numeroInterior: String
  colonia: String
  ciudad: String
  estado: String
  codigoPostal: String
  referencias: String
  metodoEnvio: String!
  metodoPago: String!
  numeroTarjetaUltimos4: String
  nombreTarjeta: String
  tipoTarjeta: String
  fechaExpiracion: String
  mesesSinIntereses: String
}

input MontosInput {
  subtotal: Float!
  costoEnvio: Float!
  total: Float!
}

input ItemMercadoPagoInput {
  id: String!
  title: String!
  description: String
  picture_url: String
  category_id: String
  quantity: Int!
  unit_price: Float!
}

input PayerInput {
  name: String!
  surname: String
  email: String!
  phone: PhoneInput!
  address: AddressInput
}

input PhoneInput {
  number: String!
}

input AddressInput {
  zip_code: String
  street_name: String
  street_number: String
}

input ShipmentsInput {
  cost: Float!
  mode: String!
  receiver_address: ReceiverAddressInput!
}

input ReceiverAddressInput {
  zip_code: String!
  street_name: String!
  street_number: String!
  floor: String
  apartment: String
  city_name: String
  state_name: String
  country_name: String
}

# ============================================
# TYPES
# ============================================

type PagoMercadoPago {
  intPago: Int!
  strPreferenciaId: String!
  strInitPoint: String!
  strEstado: String!
}

type PagoEstado {
  intPago: Int!
  intPedido: Int!
  dblMonto: Float!
  strEstado: String!
  strMercadoPagoId: String
  datCreacion: DateTime!
  tbPedido: Pedido!
}

type Pedido {
  intPedido: Int!
  dblTotal: Float!
  strEstado: String!
  strMetodoEnvio: String
}

# ============================================
# QUERIES
# ============================================

type Query {
  obtenerEstadoPago(strPreferenciaId: String!): PagoEstado!
}

# ============================================
# MUTATIONS
# ============================================

type Mutation {
  crearPreferenciaMercadoPago(data: PreferenciaMercadoPagoInput!): PagoMercadoPago!
  actualizarEstadoPago(
    strMercadoPagoId: String!
    strEstado: String!
    jsonRespuesta: String!
  ): Pago!
}
```

---

## 5️⃣ Mutation Resolver

Crear archivo `mercadopago.resolver.ts`:

```typescript
import mercadopago from "mercadopago";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Configurar MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});

export const mercadopagoResolvers = {
  Query: {
    /**
     * Obtener estado del pago por preference_id
     * Usado en las páginas de resultado (success/failure/pending)
     */
    obtenerEstadoPago: async (
      _: any,
      { strPreferenciaId }: { strPreferenciaId: string }
    ) => {
      try {
        console.log("🔍 Buscando pago con preferencia:", strPreferenciaId);

        const pago = await prisma.tbPagos.findFirst({
          where: { strPreferenciaId },
          include: {
            tbPedido: true,
          },
        });

        if (!pago) {
          throw new Error("Pago no encontrado");
        }

        console.log("✅ Pago encontrado:", {
          intPago: pago.intPago,
          estado: pago.strEstado,
          pedido: pago.intPedido,
        });

        return {
          intPago: pago.intPago,
          intPedido: pago.intPedido,
          dblMonto: pago.dblMonto,
          strEstado: pago.strEstado,
          strMercadoPagoId: pago.strMercadoPagoId,
          datCreacion: pago.datCreacion,
          tbPedido: {
            intPedido: pago.tbPedido.intPedido,
            dblTotal: pago.tbPedido.dblTotal,
            strEstado: pago.tbPedido.strEstado,
            strMetodoEnvio: pago.tbPedido.strMetodoEnvio,
          },
        };
      } catch (error: any) {
        console.error("❌ Error al obtener estado de pago:", error);
        throw error;
      }
    },
  },

  Mutation: {
    /**
     * Crear preferencia de MercadoPago y registrar pago en BD
     */
    crearPreferenciaMercadoPago: async (
      _: any,
      { data }: { data: any },
      context: any
    ) => {
      try {
        console.log("🔵 Creando preferencia de MercadoPago...");
        console.log("📦 Pedido ID:", data.intPedido);
        console.log("👤 Cliente ID:", data.intCliente);
        console.log("💰 Total:", data.montos.total);

        // Validar que el pedido existe
        const pedido = await prisma.tbPedidos.findUnique({
          where: { intPedido: data.intPedido },
          include: {
            tbCliente: true,
            tbDireccion: true,
          },
        });

        if (!pedido) {
          throw new Error("Pedido no encontrado");
        }

        // Construir la preferencia de MercadoPago
        const preference = {
          items: data.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description || item.title,
            picture_url: item.picture_url,
            category_id: item.category_id || "others",
            quantity: item.quantity,
            currency_id: "MXN",
            unit_price: parseFloat(item.unit_price),
          })),

          payer: {
            name: data.payer.name,
            surname: data.payer.surname || "",
            email: data.payer.email,
            phone: {
              area_code: "52",
              number: data.payer.phone.number,
            },
            address: data.payer.address
              ? {
                  zip_code: data.payer.address.zip_code,
                  street_name: data.payer.address.street_name,
                  street_number: data.payer.address.street_number,
                }
              : undefined,
          },

          // Configuración de envío
          shipments: data.shipments
            ? {
                cost: parseFloat(data.shipments.cost),
                mode: data.shipments.mode,
                receiver_address: {
                  zip_code: data.shipments.receiver_address.zip_code,
                  street_name: data.shipments.receiver_address.street_name,
                  street_number: data.shipments.receiver_address.street_number,
                  floor: data.shipments.receiver_address.floor || "",
                  apartment: data.shipments.receiver_address.apartment || "",
                  city_name: data.shipments.receiver_address.city_name,
                  state_name: data.shipments.receiver_address.state_name,
                  country_name: data.shipments.receiver_address.country_name || "México",
                },
              }
            : undefined,

          // URLs de retorno
          back_urls: {
            success: `${process.env.FRONTEND_URL}/checkout/success`,
            failure: `${process.env.FRONTEND_URL}/checkout/failure`,
            pending: `${process.env.FRONTEND_URL}/checkout/pending`,
          },

          // URL de notificación (webhook)
          notification_url: `${process.env.BACKEND_URL}/webhook/mercadopago`,

          // Configuración adicional
          auto_return: "approved",
          binary_mode: false,
          statement_descriptor: "ESYMBEL STORE",

          // Referencia externa
          external_reference: data.intPedido.toString(),

          // Metadata
          metadata: {
            pedido_id: data.intPedido,
            cliente_id: data.intCliente,
            ...data.metadata,
          },

          // Configuración de cuotas (MSI)
          payment_methods: {
            installments: data.metadata?.meses_sin_intereses || 12,
            default_installments: parseInt(data.formData.mesesSinIntereses || "1"),
          },
        };

        // Crear la preferencia en MercadoPago
        const mpResponse = await mercadopago.preferences.create(preference);

        console.log("✅ Preferencia creada:", mpResponse.body.id);

        // Guardar el pago en la base de datos
        const nuevoPago = await prisma.tbPagos.create({
          data: {
            intPedido: data.intPedido,
            strMetodoPago: data.formData.metodoPago,
            dblMonto: data.montos.total,
            strEstado: "PENDIENTE",
            strPreferenciaId: mpResponse.body.id,
            intCuotas: parseInt(data.formData.mesesSinIntereses || "1"),
            jsonDetallesPago: JSON.stringify({
              subtotal: data.montos.subtotal,
              costoEnvio: data.montos.costoEnvio,
              metodoEnvio: data.formData.metodoEnvio,
              numeroTarjetaUltimos4: data.formData.numeroTarjetaUltimos4,
              nombreTarjeta: data.formData.nombreTarjeta,
              tipoTarjeta: data.formData.tipoTarjeta,
            }),
            jsonRespuestaMercadoPago: JSON.stringify(mpResponse.body),
          },
        });

        // Actualizar estado del pedido
        await prisma.tbPedidos.update({
          where: { intPedido: data.intPedido },
          data: {
            strEstado: "PROCESANDO",
          },
        });

        console.log("💾 Pago guardado en BD:", nuevoPago.intPago);

        return {
          intPago: nuevoPago.intPago,
          strPreferenciaId: mpResponse.body.id,
          strInitPoint: mpResponse.body.init_point,
          strEstado: nuevoPago.strEstado,
        };
      } catch (error: any) {
        console.error("❌ Error al crear preferencia:", error);
        throw new Error(`Error al procesar el pago: ${error.message}`);
      }
    },

    /**
     * Actualizar estado del pago desde webhook
     */
    actualizarEstadoPago: async (
      _: any,
      { strMercadoPagoId, strEstado, jsonRespuesta }: any
    ) => {
      try {
        console.log("🔔 Actualizando estado de pago:", strMercadoPagoId);

        const pago = await prisma.tbPagos.findFirst({
          where: { strMercadoPagoId },
          include: { tbPedido: true },
        });

        if (!pago) {
          throw new Error("Pago no encontrado");
        }

        // Actualizar pago
        const pagoActualizado = await prisma.tbPagos.update({
          where: { intPago: pago.intPago },
          data: {
            strEstado,
            jsonRespuestaMercadoPago: jsonRespuesta,
          },
        });

        // Actualizar estado del pedido según el estado del pago
        let estadoPedido = "PROCESANDO";
        if (strEstado === "APROBADO" || strEstado === "approved") {
          estadoPedido = "PAGADO";
        } else if (strEstado === "RECHAZADO" || strEstado === "rejected") {
          estadoPedido = "CANCELADO";
        }

        await prisma.tbPedidos.update({
          where: { intPedido: pago.intPedido },
          data: { strEstado: estadoPedido },
        });

        console.log("✅ Estado actualizado:", strEstado);

        return pagoActualizado;
      } catch (error: any) {
        console.error("❌ Error al actualizar estado:", error);
        throw error;
      }
    },
  },
};
```

---

## 6️⃣ Webhook para Notificaciones

Crear endpoint REST para recibir notificaciones de MercadoPago:

```typescript
// webhook.controller.ts o similar

import { Request, Response } from "express";
import mercadopago from "mercadopago";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});

export async function mercadopagoWebhook(req: Request, res: Response) {
  try {
    console.log("🔔 Webhook recibido de MercadoPago");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("Query:", req.query);

    const { type, data } = req.body;

    // Responder inmediatamente a MercadoPago
    res.status(200).send("OK");

    // Procesar la notificación de forma asíncrona
    if (type === "payment") {
      const paymentId = data.id;

      // Obtener información del pago desde MercadoPago
      const payment = await mercadopago.payment.get(paymentId);
      const paymentData = payment.body;

      console.log("💳 Estado del pago:", paymentData.status);
      console.log("📋 External reference:", paymentData.external_reference);

      // Buscar el pago en la BD por preferencia_id
      const pago = await prisma.tbPagos.findFirst({
        where: {
          strPreferenciaId: paymentData.preference_id,
        },
      });

      if (pago) {
        // Actualizar el pago
        await prisma.tbPagos.update({
          where: { intPago: pago.intPago },
          data: {
            strMercadoPagoId: paymentId.toString(),
            strEstado: mapearEstadoMercadoPago(paymentData.status),
            jsonRespuestaMercadoPago: JSON.stringify(paymentData),
          },
        });

        // Actualizar el pedido
        const estadoPedido = mapearEstadoPedido(paymentData.status);
        await prisma.tbPedidos.update({
          where: { intPedido: pago.intPedido },
          data: { strEstado: estadoPedido },
        });

        console.log("✅ Pago y pedido actualizados correctamente");
      } else {
        console.warn("⚠️ Pago no encontrado en BD");
      }
    }
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    // No lanzar error para no reintentos innecesarios de MP
  }
}

// Mapear estados de MercadoPago a estados propios
function mapearEstadoMercadoPago(status: string): string {
  const mapa: Record<string, string> = {
    approved: "APROBADO",
    pending: "PENDIENTE",
    in_process: "PROCESANDO",
    rejected: "RECHAZADO",
    cancelled: "CANCELADO",
    refunded: "REEMBOLSADO",
    charged_back: "CONTRACARGO",
  };
  return mapa[status] || "PENDIENTE";
}

function mapearEstadoPedido(paymentStatus: string): string {
  const mapa: Record<string, string> = {
    approved: "PAGADO",
    pending: "PROCESANDO",
    in_process: "PROCESANDO",
    rejected: "CANCELADO",
    cancelled: "CANCELADO",
  };
  return mapa[paymentStatus] || "PENDIENTE";
}
```

**Registrar la ruta:**

```typescript
// En tu archivo de rutas principal
app.post("/webhook/mercadopago", mercadopagoWebhook);
```

---

## 7️⃣ Flujo Completo

### Paso a Paso:

```
1. 🛒 Usuario completa checkout en frontend
   └─> Click en "Finalizar compra"

2. 📤 Frontend envía mutation crearPreferenciaMercadoPago
   └─> Incluye: pedido, items, montos, datos del comprador

3. 🔵 Backend crea preferencia en MercadoPago
   └─> mercadopago.preferences.create()
   
4. 💾 Backend guarda pago en tbPagos
   └─> Estado: PENDIENTE
   └─> Guarda: strPreferenciaId, intPedido, dblMonto

5. 📝 Backend actualiza pedido
   └─> Estado: PROCESANDO

6. 🔙 Backend retorna strInitPoint
   └─> URL del checkout de MercadoPago

7. 🌐 Frontend redirige a MercadoPago
   └─> window.location.href = strInitPoint

8. 💳 Usuario completa pago en MercadoPago
   └─> Ingresa datos de tarjeta
   └─> MercadoPago procesa el pago

9. 🔔 MercadoPago envía notificación a webhook
   └─> POST /webhook/mercadopago
   └─> Incluye payment.id y status

10. 📥 Backend procesa webhook
    └─> Obtiene payment de MercadoPago API
    └─> Actualiza tbPagos: strMercadoPagoId, strEstado
    └─> Actualiza tbPedidos: strEstado (PAGADO/CANCELADO)

11. ↩️ Usuario es redirigido según resultado
    ├─> Éxito: /checkout/success?payment_id=xxx
    ├─> Fallo: /checkout/failure
    └─> Pendiente: /checkout/pending

12. ✅ Frontend muestra página de confirmación
    └─> Lee payment_id de URL
    └─> Muestra detalles del pedido
```

---

## 8️⃣ Estados de Pago y Pedido

### Estados de Pago (tbPagos.strEstado):

| Estado | Descripción |
|--------|-------------|
| PENDIENTE | Pago iniciado, esperando confirmación |
| PROCESANDO | MercadoPago está procesando |
| APROBADO | Pago aprobado exitosamente |
| RECHAZADO | Pago rechazado por MP |
| CANCELADO | Usuario canceló el pago |
| REEMBOLSADO | Pago reembolsado |

### Estados de Pedido (tbPedidos.strEstado):

| Estado | Descripción |
|--------|-------------|
| PENDIENTE | Pedido creado, sin iniciar pago |
| PROCESANDO | Pago en proceso en MercadoPago |
| PAGADO | Pago confirmado, listo para envío |
| ENVIADO | Pedido en camino |
| ENTREGADO | Pedido entregado al cliente |
| CANCELADO | Pedido/pago cancelado |

---

## 9️⃣ Testing

### Tarjetas de Prueba (Sandbox):

```
VISA Aprobada:
  Número: 4509 9535 6623 3704
  CVV: 123
  Fecha: 11/25

Mastercard Aprobada:
  Número: 5031 7557 3453 0604
  CVV: 123
  Fecha: 11/25

Tarjeta Rechazada:
  Número: 4000 0000 0000 0002
  CVV: 123
  Fecha: 11/25
```

### Probar Webhook Local:

```bash
# Usar ngrok para exponer localhost
ngrok http 4000

# Configurar URL en MercadoPago:
# https://tu-url.ngrok.io/webhook/mercadopago
```

---

## 🔟 Consideraciones de Seguridad

1. **Nunca exponer Access Token en frontend**
2. **Validar firma de webhook** (opcional pero recomendado)
3. **Usar HTTPS en producción**
4. **No guardar CVV ni número completo de tarjeta**
5. **Validar montos en backend antes de crear preferencia**
6. **Verificar que el pedido pertenece al cliente**
7. **Log de todas las transacciones**

---

## ✅ Checklist de Implementación

- [ ] Instalar dependencia `mercadopago`
- [ ] Configurar variables de entorno
- [ ] Actualizar schema de Prisma
- [ ] Ejecutar migración
- [ ] Agregar types e inputs a GraphQL
- [ ] Crear resolver `crearPreferenciaMercadoPago`
- [ ] Crear endpoint webhook REST
- [ ] Registrar webhook en MercadoPago dashboard
- [ ] Crear páginas de resultado (success/failure/pending)
- [ ] Probar con tarjetas de prueba
- [ ] Verificar logs de webhook
- [ ] Validar estados de pago y pedido

---

## 📚 Documentación Oficial

- **MercadoPago Developers**: https://www.mercadopago.com.mx/developers
- **Checkout API**: https://www.mercadopago.com.mx/developers/es/docs/checkout-api/landing
- **Webhooks**: https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks
- **SDK Node.js**: https://github.com/mercadopago/sdk-nodejs

---

¡Listo! Con esta implementación tienes todo lo necesario para integrar MercadoPago en tu backend. 🚀
