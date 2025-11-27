# 🔐 IMPLEMENTACIÓN DE TOKENIZACIÓN DE TARJETAS - MERCADOPAGO

## ✅ Cambios Implementados

### 1. **SDK de MercadoPago Instalado**
```bash
pnpm add @mercadopago/sdk-js
```

### 2. **Tokenización Automática de Tarjetas**

Ahora cuando el usuario finaliza una compra con tarjeta:

1. **Se tokeniza la tarjeta** con el SDK de MercadoPago antes de enviar al backend
2. **El token seguro** se envía en lugar del número de tarjeta completo
3. **El backend recibe** el `strTokenTarjeta` para procesar el pago

### 3. **Flujo de Tokenización**

```
Usuario ingresa datos de tarjeta
         ↓
Frontend tokeniza con MercadoPago SDK
         ↓
Se genera token seguro (strTokenTarjeta)
         ↓
Token se envía al backend
         ↓
Backend usa token para procesar pago
```

---

## 🔧 Configuración Necesaria

### 1. **Variable de Entorno**

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Obtener la clave:**
- Sandbox (pruebas): https://www.mercadopago.com.mx/developers/panel/credentials
- Producción: https://www.mercadopago.com.mx/credentials

### 2. **Código Implementado**

En `src/hooks/useCheckoutSubmit.ts`:

```typescript
// 🔐 Tokenizar la tarjeta antes de enviar
await loadMercadoPago();
const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);

const cardToken = await mp.createCardToken({
  cardNumber: numeroTarjeta,
  cardholderName: formData.nombreTarjeta,
  cardExpirationMonth: mes,
  cardExpirationYear: anio,
  securityCode: formData.cvv,
  identificationType: "RFC",
  identificationNumber: "XAXX010101000"
});

const strTokenTarjeta = cardToken.id;
```

---

## 📦 Payload Actualizado

El payload enviado al backend ahora incluye:

```typescript
{
  intPedido,
  intCliente,
  intDireccion,
  strTokenTarjeta, // ← 🔐 NUEVO: Token seguro de la tarjeta
  formData: { ... },
  montos: { ... },
  items: [ ... ],
  payer: { ... },
  shipments: { ... },
  metadata: "..."
}
```

---

## 🔄 Diferencias entre Checkout Pro y Checkout API

### **Checkout Pro (Anterior)**
- ❌ Redirige a página de MercadoPago
- ❌ Usuario sale de tu sitio
- ❌ Menos control sobre el flujo

### **Checkout API (Nuevo)** ✅
- ✅ Pago directo en tu sitio
- ✅ Usuario nunca sale
- ✅ Tokenización segura de tarjetas
- ✅ Más control sobre UX
- ✅ Personalización completa

---

## 🎯 Uso según Tipo de Tarjeta

### **Tarjeta Nueva**
```typescript
if (!formData.usandoTarjetaGuardada && numeroTarjeta) {
  // Se tokeniza la tarjeta
  const cardToken = await mp.createCardToken({ ... });
  strTokenTarjeta = cardToken.id;
}
```

### **Tarjeta Guardada**
```typescript
if (formData.usandoTarjetaGuardada) {
  // No se tokeniza, el backend usa el token guardado
  strTokenTarjeta = "";
}
```

---

## 🔐 Seguridad

### ✅ Lo que SÍ se envía:
- Token de tarjeta (`strTokenTarjeta`)
- Últimos 4 dígitos
- Nombre del titular
- Tipo de tarjeta
- Fecha de expiración
- CVV (solo para validación, no se guarda)

### ❌ Lo que NUNCA se envía:
- Número completo de tarjeta
- CVV al backend (solo se usa para tokenizar)

---

## 🧪 Testing

### Tarjetas de Prueba (Sandbox)

**Tarjeta Aprobada:**
```
Número: 4509 9535 6623 3704
Nombre: APRO
CVV: 123
Fecha: 11/25
RFC: XAXX010101000
```

**Tarjeta Rechazada:**
```
Número: 4000 0000 0000 0002
Nombre: OTHE
CVV: 123
Fecha: 11/25
RFC: XAXX010101000
```

---

## 📋 Backend - Actualización del Schema

Actualiza tu `PreferenciaMercadoPagoInput`:

```graphql
input PreferenciaMercadoPagoInput {
  intPedido: Int!
  intCliente: Int!
  intDireccion: Int
  strTokenTarjeta: String!  # ← 🔐 NUEVO CAMPO
  formData: FormDataInput!
  montos: MontosInput!
  items: [ItemMercadoPagoInput!]!
  payer: PayerInput!
  shipments: ShipmentsInput
  metadata: String
}
```

---

## 🔧 Backend - Uso del Token

En tu resolver, usa el token para crear el pago:

```javascript
const payment = await mercadopago.payment.create({
  token: data.strTokenTarjeta, // ← Token desde el frontend
  transaction_amount: data.montos.dblTotal,
  installments: data.formData.intMesesSinIntereses,
  payment_method_id: "visa", // Detectar desde tipo de tarjeta
  payer: {
    email: data.payer.strEmail,
    identification: {
      type: "RFC",
      number: "XAXX010101000"
    }
  }
});
```

---

## ⚠️ Errores Comunes

### 1. "MercadoPago is not defined"
**Solución:** Verifica que la variable de entorno esté configurada:
```env
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-...
```

### 2. "Invalid card number"
**Solución:** Usa tarjetas de prueba válidas de MercadoPago

### 3. "Token creation failed"
**Solución:** Verifica que todos los datos sean correctos:
- Número de tarjeta (sin espacios)
- Mes y año válidos
- CVV correcto

---

## 📚 Documentación Oficial

- **SDK JS**: https://github.com/mercadopago/sdk-js
- **Checkout API**: https://www.mercadopago.com.mx/developers/es/docs/checkout-api/landing
- **Tokenization**: https://www.mercadopago.com.mx/developers/es/docs/checkout-api/integration-configuration/card-configuration

---

## ✅ Checklist de Implementación

- [x] Instalar `@mercadopago/sdk-js`
- [x] Agregar tokenización en `useCheckoutSubmit.ts`
- [x] Agregar `strTokenTarjeta` al payload
- [ ] Configurar `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` en `.env.local`
- [ ] Actualizar schema GraphQL del backend
- [ ] Actualizar resolver para usar el token
- [ ] Probar con tarjetas de prueba
- [ ] Verificar que el pago se procese correctamente

---

¡Ahora tu checkout usa **Checkout API** con tokenización segura de tarjetas! 🚀🔐
