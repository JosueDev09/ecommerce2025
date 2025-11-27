# 🔄 BACKEND: Migrar de Checkout Pro a Checkout API

## ⚠️ Problema Actual

El backend sigue usando **Checkout Pro** (preferences) que redirige al usuario a MercadoPago, en lugar de usar **Checkout API** (payment) que procesa el pago directamente con el token.

---

## 🎯 Solución: Detectar Token y Usar Payment API

### 📝 Código Actual del Backend (Checkout Pro)

```javascript
// ❌ ESTO ES LO QUE TIENES AHORA
const crearPreferenciaMercadoPago = async (parent, { data }, context) => {
  const preference = await mercadopago.preferences.create({
    items: data.items.map(item => ({
      title: item.strTitulo,
      quantity: item.intCantidad,
      unit_price: item.dblPrecioUnitario,
    })),
    payer: {
      name: data.payer.strNombre,
      email: data.payer.strEmail,
    },
    back_urls: {
      success: "http://localhost:3001/checkout/success",
      failure: "http://localhost:3001/checkout/failure",
      pending: "http://localhost:3001/checkout/pending"
    },
    auto_return: "approved",
  });

  return {
    intPago: preference.id,
    strPreferenciaId: preference.id,
    strInitPoint: preference.init_point, // ← Esto causa la redirección
    strEstado: "pending"
  };
};
```

---

## ✅ Código Actualizado (Con Checkout API)

```javascript
const crearPreferenciaMercadoPago = async (parent, { data }, context) => {
  try {
    // 1. Parsear metadata para obtener el token
    const metadata = JSON.parse(data.metadata || "{}");
    const tokenTarjeta = metadata.token_tarjeta;

    console.log("🔍 Token de tarjeta:", tokenTarjeta ? "Presente" : "No presente");

    // 2. DECISIÓN: ¿Usar Checkout API o Checkout Pro?
    if (tokenTarjeta && tokenTarjeta !== "") {
      // ✅ CHECKOUT API - Pago directo con token
      console.log("💳 Usando Checkout API (pago directo)");
      
      const payment = await mercadopago.payment.create({
        token: tokenTarjeta,
        transaction_amount: data.montos.dblTotal,
        installments: data.formData.intMesesSinIntereses || 1,
        payment_method_id: detectarMetodoPago(data.formData.strTipoTarjeta),
        payer: {
          email: data.payer.strEmail,
          identification: {
            type: "RFC",
            number: "XAXX010101000"
          }
        },
        metadata: {
          pedido_id: metadata.pedido_id,
          cliente_id: metadata.cliente_id,
        }
      });

      console.log("✅ Pago procesado:", payment.id, "- Estado:", payment.status);

      // Guardar en tu BD
      await guardarPagoEnBD({
        intPago: payment.id,
        intPedido: data.intPedido,
        strEstado: payment.status,
        dblMonto: payment.transaction_amount,
        strMetodoPago: payment.payment_method_id,
      });

      return {
        intPago: payment.id,
        strPreferenciaId: payment.id.toString(),
        strInitPoint: null, // ← NO hay redirect con Checkout API
        strEstado: payment.status, // approved, rejected, pending
      };
    } else {
      // 🔵 CHECKOUT PRO - Redirect a MercadoPago (flujo anterior)
      console.log("🔵 Usando Checkout Pro (redirect)");
      
      const preference = await mercadopago.preferences.create({
        items: data.items.map(item => ({
          title: item.strTitulo,
          quantity: item.intCantidad,
          unit_price: item.dblPrecioUnitario,
        })),
        payer: {
          name: data.payer.strNombre,
          email: data.payer.strEmail,
        },
        back_urls: {
          success: "http://localhost:3001/checkout/success",
          failure: "http://localhost:3001/checkout/failure",
          pending: "http://localhost:3001/checkout/pending"
        },
        auto_return: "approved",
        metadata: {
          pedido_id: data.intPedido,
          cliente_id: data.intCliente,
        }
      });

      return {
        intPago: preference.id,
        strPreferenciaId: preference.id,
        strInitPoint: preference.init_point,
        strEstado: "pending"
      };
    }
  } catch (error) {
    console.error("❌ Error al procesar pago:", error);
    throw new Error("Error al procesar el pago con MercadoPago");
  }
};
```

---

## 🔧 Función Auxiliar: Detectar Método de Pago

```javascript
function detectarMetodoPago(tipoTarjeta) {
  // Mapeo de tipos de tarjeta a payment_method_id de MercadoPago
  const mapa = {
    'visa': 'visa',
    'mastercard': 'master',
    'american express': 'amex',
    'amex': 'amex',
    'credito': 'visa', // Default para crédito
    'debito': 'debito', // Default para débito
  };

  const tipo = tipoTarjeta?.toLowerCase() || 'visa';
  return mapa[tipo] || 'visa';
}
```

---

## 📊 Comparación de Flujos

### Checkout Pro (Con Redirect)
```
Frontend → Backend → MercadoPago Preferences API
                  ↓
            strInitPoint (URL)
                  ↓
        window.location.href
                  ↓
          Usuario va a MercadoPago
                  ↓
        Usuario completa el pago
                  ↓
          Redirect a success/failure
```

### Checkout API (Sin Redirect) ✅
```
Frontend → Tokeniza tarjeta con SDK
                  ↓
            Envía token a backend
                  ↓
Backend → MercadoPago Payment API con token
                  ↓
         Respuesta inmediata (approved/rejected)
                  ↓
    Frontend muestra resultado directamente
```

---

## 🎨 Estados de Pago de MercadoPago

```javascript
// Estados posibles que puede devolver payment.status
const estadosPago = {
  'approved': 'Pago aprobado',
  'pending': 'Pago pendiente (esperando confirmación)',
  'in_process': 'En proceso (puede tardar días)',
  'rejected': 'Pago rechazado',
  'cancelled': 'Pago cancelado',
  'refunded': 'Pago reembolsado',
  'charged_back': 'Contracargo (chargeback)',
};
```

---

## 📋 Checklist de Migración Backend

- [ ] Agregar función `detectarMetodoPago()`
- [ ] Modificar resolver `crearPreferenciaMercadoPago`:
  - [ ] Parsear `metadata` para obtener `token_tarjeta`
  - [ ] Agregar condicional: si hay token, usar Payment API
  - [ ] Si no hay token, mantener Checkout Pro
- [ ] Probar con tarjeta de prueba:
  - [ ] 4509 9535 6623 3704 (debe aprobar sin redirect)
  - [ ] 4000 0000 0000 0002 (debe rechazar sin redirect)
- [ ] Verificar que `strInitPoint` sea `null` cuando hay token
- [ ] Guardar resultado del pago en tu BD
- [ ] Actualizar estado del pedido según `payment.status`

---

## 🧪 Testing

### Prueba 1: Pago Aprobado (Checkout API)
```bash
# Token presente → Payment API
Request: { metadata: { token_tarjeta: "tok_xxx" } }
Response: { strInitPoint: null, strEstado: "approved" }
✅ No debe redirigir
```

### Prueba 2: Pago Rechazado (Checkout API)
```bash
# Tarjeta de prueba rechazada
Response: { strInitPoint: null, strEstado: "rejected" }
✅ No debe redirigir, mostrar error en el sitio
```

### Prueba 3: Checkout Pro (sin token)
```bash
# Sin token → Preferences API
Request: { metadata: { token_tarjeta: "" } }
Response: { strInitPoint: "https://...", strEstado: "pending" }
✅ Debe redirigir a MercadoPago
```

---

## 🚨 Manejo de Errores

```javascript
try {
  const payment = await mercadopago.payment.create({ ... });
  
  if (payment.status === 'rejected') {
    // El pago fue rechazado, pero no es un error del sistema
    console.log("⚠️ Pago rechazado:", payment.status_detail);
    
    return {
      intPago: payment.id,
      strPreferenciaId: payment.id.toString(),
      strInitPoint: null,
      strEstado: 'rejected',
      strMensajeError: obtenerMensajeRechazo(payment.status_detail)
    };
  }
  
} catch (error) {
  // Error del sistema (token inválido, configuración incorrecta, etc.)
  console.error("❌ Error al procesar pago:", error);
  throw new Error("Error al procesar el pago. Intenta nuevamente.");
}
```

### Función para mensajes de rechazo:

```javascript
function obtenerMensajeRechazo(statusDetail) {
  const mensajes = {
    'cc_rejected_insufficient_amount': 'Fondos insuficientes',
    'cc_rejected_bad_filled_card_number': 'Número de tarjeta inválido',
    'cc_rejected_bad_filled_date': 'Fecha de expiración inválida',
    'cc_rejected_bad_filled_security_code': 'CVV inválido',
    'cc_rejected_call_for_authorize': 'Debes autorizar el pago con tu banco',
    'cc_rejected_high_risk': 'Pago rechazado por riesgo',
    'cc_rejected_blacklist': 'Tarjeta bloqueada',
  };
  
  return mensajes[statusDetail] || 'Pago rechazado. Intenta con otra tarjeta.';
}
```

---

## 📚 Documentación Oficial

- **Payment API**: https://www.mercadopago.com.mx/developers/es/reference/payments/_payments/post
- **Status Details**: https://www.mercadopago.com.mx/developers/es/docs/checkout-api/response-handling
- **Testing Cards**: https://www.mercadopago.com.mx/developers/es/docs/checkout-api/testing

---

## ✅ Resultado Final

Después de implementar estos cambios:

1. ✅ Usuario ingresa tarjeta en tu sitio
2. ✅ Frontend tokeniza con MercadoPago SDK
3. ✅ Token se envía al backend
4. ✅ Backend procesa pago con Payment API
5. ✅ Respuesta inmediata (aprobado/rechazado)
6. ✅ **NO HAY REDIRECT** - Todo pasa en tu sitio
7. ✅ Loading steps completan automáticamente
8. ✅ Usuario ve confirmación en tu página

---

¡Tu checkout ahora será 100% en tu sitio sin salir a MercadoPago! 🚀✨
