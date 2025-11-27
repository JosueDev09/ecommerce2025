# 🔧 ACTUALIZACIÓN BACKEND - Agregar Token de Tarjeta

## ⚠️ Cambio Temporal Aplicado

Por ahora, el token de tarjeta (`strTokenTarjeta`) se está enviando dentro del campo `metadata` como `token_tarjeta`:

```json
{
  "metadata": "{\"pedido_id\":1,\"token_tarjeta\":\"tok_xxxxxxxxxxxx\",...}"
}
```

## 🎯 Actualización Requerida en Backend

Para usar el token correctamente, necesitas actualizar tu backend GraphQL:

---

## 1️⃣ Actualizar Schema GraphQL

En tu archivo `schema.graphql` o donde definas `PreferenciaMercadoPagoInput`:

```graphql
input PreferenciaMercadoPagoInput {
  intPedido: Int!
  intCliente: Int!
  intDireccion: Int
  strTokenTarjeta: String  # ← 🆕 AGREGAR ESTE CAMPO (opcional por ahora)
  formData: FormDataInput!
  montos: MontosInput!
  items: [ItemMercadoPagoInput!]!
  payer: PayerInput!
  shipments: ShipmentsInput
  metadata: String
}
```

---

## 2️⃣ Actualizar Resolver

### **Opción A: Usar el token desde metadata (actual)**

En tu resolver `crearPreferenciaMercadoPago`:

```javascript
const crearPreferenciaMercadoPago = async (parent, { data }, context) => {
  // Parsear metadata para obtener el token
  const metadata = JSON.parse(data.metadata || "{}");
  const tokenTarjeta = metadata.token_tarjeta;
  
  console.log("🔐 Token de tarjeta:", tokenTarjeta);
  
  // Si hay token, procesarlo...
  if (tokenTarjeta && tokenTarjeta !== "") {
    // Usar Checkout API con el token
    const payment = await mercadopago.payment.create({
      token: tokenTarjeta,
      transaction_amount: data.montos.dblTotal,
      installments: data.formData.intMesesSinIntereses,
      payment_method_id: detectarMetodoPago(data.formData.strTipoTarjeta),
      payer: {
        email: data.payer.strEmail,
        identification: {
          type: "RFC",
          number: "XAXX010101000"
        }
      }
    });
    
    return {
      intPago: payment.id,
      strEstado: payment.status,
      // ...
    };
  } else {
    // Flujo anterior (Checkout Pro con preferencias)
    const preference = await mercadopago.preferences.create({
      // ... tu código actual
    });
  }
};
```

### **Opción B: Usar strTokenTarjeta directamente (después de actualizar schema)**

Después de agregar el campo al schema:

```javascript
const crearPreferenciaMercadoPago = async (parent, { data }, context) => {
  const { strTokenTarjeta } = data;
  
  console.log("🔐 Token de tarjeta:", strTokenTarjeta);
  
  if (strTokenTarjeta && strTokenTarjeta !== "") {
    // Crear pago directo con el token
    const payment = await mercadopago.payment.create({
      token: strTokenTarjeta,
      transaction_amount: data.montos.dblTotal,
      installments: data.formData.intMesesSinIntereses,
      payment_method_id: detectarMetodoPago(data.formData.strTipoTarjeta),
      payer: {
        email: data.payer.strEmail,
        identification: {
          type: "RFC",
          number: "XAXX010101000"
        }
      }
    });
    
    return {
      intPago: payment.id,
      strPreferenciaId: payment.id.toString(),
      strInitPoint: null, // No hay redirect con Checkout API
      strEstado: payment.status
    };
  }
  
  // Flujo sin token (Checkout Pro)
  // ...
};
```

---

## 3️⃣ Detectar Método de Pago

Función auxiliar para convertir tipo de tarjeta a `payment_method_id`:

```javascript
function detectarMetodoPago(tipoTarjeta) {
  // Mapeo básico, puedes mejorarlo
  const mapa = {
    'visa': 'visa',
    'mastercard': 'master',
    'amex': 'amex',
    'credito': 'visa', // Por defecto
    'debito': 'debito'
  };
  
  return mapa[tipoTarjeta?.toLowerCase()] || 'visa';
}
```

---

## 4️⃣ Descomentar en Frontend

Una vez que actualices el backend, descomenta esta línea en `useCheckoutSubmit.ts`:

```typescript
const payloadParaBackend = {
  intPedido,
  intCliente,
  intDireccion,
  strTokenTarjeta, // ← Descomentar esta línea
  formData: {
    // ...
  }
};
```

Y **elimina** el `token_tarjeta` de metadata ya que estará en su propio campo.

---

## 📊 Flujo Completo

```
Frontend
  ↓
Tokeniza tarjeta con MercadoPago SDK
  ↓
Obtiene token (tok_xxxxxxxxxxxx)
  ↓
Envía a backend en metadata.token_tarjeta (ACTUAL)
o strTokenTarjeta (DESPUÉS DE ACTUALIZAR)
  ↓
Backend
  ↓
Usa token para crear pago directo
  ↓
mercadopago.payment.create({ token, ... })
  ↓
Retorna resultado del pago
```

---

## 🔐 Diferencias Clave

### Checkout Pro (Anterior)
```javascript
// Crea preferencia → Redirect → Usuario paga en MP
const preference = await mercadopago.preferences.create({
  items: [...],
  payer: {...},
  back_urls: {...}
});
// Retorna: preference.id y init_point (URL)
```

### Checkout API (Nuevo con Token)
```javascript
// Pago directo en tu sitio con token
const payment = await mercadopago.payment.create({
  token: "tok_xxxx", // ← Token del frontend
  transaction_amount: 1000,
  installments: 1,
  payment_method_id: "visa"
});
// Retorna: payment.id y status
```

---

## ✅ Checklist Backend

- [ ] Agregar `strTokenTarjeta: String` a `PreferenciaMercadoPagoInput`
- [ ] Actualizar resolver para leer el token (de metadata o del campo directo)
- [ ] Implementar `mercadopago.payment.create()` con el token
- [ ] Probar con tarjetas de prueba de MercadoPago
- [ ] Descomentar `strTokenTarjeta` en el frontend
- [ ] Eliminar `token_tarjeta` de metadata (opcional, después de migrar)

---

## 🧪 Tarjetas de Prueba

**Aprobada:**
```
4509 9535 6623 3704
Nombre: APRO
CVV: 123
Fecha: 11/25
```

**Rechazada:**
```
4000 0000 0000 0002
Nombre: OTHE
CVV: 123
Fecha: 11/25
```

---

## 📚 Referencias

- **MercadoPago Checkout API**: https://www.mercadopago.com.mx/developers/es/docs/checkout-api/landing
- **Payment API**: https://www.mercadopago.com.mx/developers/es/reference/payments/_payments/post
- **Tokenization**: https://www.mercadopago.com.mx/developers/es/docs/checkout-api/integration-configuration/card-configuration

---

¡Con estos cambios tendrás pagos directos sin salir de tu sitio! 🚀
