# 🧪 Testing de Tokenización - Tarjetas de Prueba

## ❌ Problema Detectado

Estás intentando pagar con una **tarjeta guardada** pero el sistema no puede tokenizarla porque:
- `usandoTarjetaGuardada: true`
- `numeroTarjeta: '****8376'` (solo últimos 4 dígitos)

**El SDK de MercadoPago necesita el número completo para tokenizar.**

---

## ✅ Solución Inmediata: Usar Tarjeta Nueva

### Paso 1: Desmarcar "Usar tarjeta guardada"
En el formulario de pago, asegúrate de que **NO** esté seleccionada una tarjeta guardada.

### Paso 2: Ingresar Tarjeta de Prueba Completa

**Tarjeta Aprobada (Visa):**
```
Número: 4509 9535 6623 3704
Nombre: APRO
Fecha: 11/25
CVV: 123
```

**Tarjeta Rechazada (Visa):**
```
Número: 4000 0000 0000 0002
Nombre: OTHE
Fecha: 11/25
CVV: 123
```

---

## 🔍 Logs Esperados

### Con Tarjeta Nueva (Correcto):
```
💳 Iniciando proceso de tokenización...
📋 Datos de formulario: {
  usandoTarjetaGuardada: false,          ← FALSE
  numeroTarjeta: '4509953566233704',      ← Número completo
  nombreTarjeta: 'APRO',
  fechaExpiracion: '11/25',
  cvv: '***'
}
🔑 Clave pública cargada: APP_USR-5709eb0a-019...
📅 Fecha parseada - Mes: 11 Año: 25
🔍 ¿Tarjeta guardada?: false              ← FALSE
🔍 ¿Tiene número de tarjeta?: true        ← TRUE
🔐 Creando token con MercadoPago SDK...
✅ Token de tarjeta generado exitosamente: card_token_xxx
🎫 Token final antes de enviar: card_token_xxx
```

### Con Tarjeta Guardada (Actual - No Tokeniza):
```
💳 Iniciando proceso de tokenización...
📋 Datos de formulario: {
  usandoTarjetaGuardada: true,           ← TRUE
  numeroTarjeta: '****8376',              ← Solo últimos 4
  ...
}
🔍 ¿Tarjeta guardada?: true               ← TRUE
🔍 ¿Tiene número de tarjeta?: false       ← FALSE
⚠️ No se generó token - Tarjeta guardada: true - Número presente: false
🎫 Token final antes de enviar: No generado
```

---

## 🔧 Si Quieres Usar Tarjetas Guardadas

Para usar tarjetas guardadas, necesitas:

### Opción A: Guardar el Token (No el Número)
Cuando el usuario guarda una tarjeta por primera vez:

```javascript
// Al guardar tarjeta nueva
const cardToken = await mp.createCardToken({ ... });

// Guardar en BD:
{
  strTokenMercadoPago: cardToken.id,  // ← Token guardado
  strUltimos4Digitos: "8376",
  strNombreTitular: "JOSUE FLORES",
  strFechaExpiracion: "11/30",
  // NO guardar: CVV, número completo
}
```

Luego, al usar esa tarjeta guardada:

```javascript
// En el backend
if (usandoTarjetaGuardada) {
  const tarjetaGuardada = await obtenerTarjetaGuardada(idTarjeta);
  
  // Usar el token guardado
  const payment = await mercadopago.payment.create({
    token: tarjetaGuardada.strTokenMercadoPago, // ← Token guardado
    transaction_amount: total,
    // ...
  });
}
```

### Opción B: MercadoPago Customer & Cards
Usar el sistema de clientes y tarjetas de MercadoPago:

```javascript
// 1. Crear customer en MercadoPago
const customer = await mercadopago.customers.create({
  email: "cliente@ejemplo.com"
});

// 2. Guardar tarjeta del customer
const card = await mercadopago.customers.cards.create(customer.id, {
  token: cardToken.id
});

// 3. Al pagar, usar la tarjeta guardada
const payment = await mercadopago.payment.create({
  customer_id: customer.id,
  card_id: card.id, // ← ID de tarjeta guardada
  transaction_amount: total,
  // ...
});
```

---

## 📋 Checklist para Testing

### Test 1: Tarjeta Nueva (Lo que debes probar ahora)
- [ ] Desmarcar "Usar tarjeta guardada"
- [ ] Ingresar número completo: `4509 9535 6623 3704`
- [ ] Nombre: `APRO`
- [ ] Fecha: `11/25`
- [ ] CVV: `123`
- [ ] Click en "Finalizar Compra"
- [ ] Verificar logs: Token generado ✅
- [ ] Verificar: NO redirige a MercadoPago (después de implementar backend)

### Test 2: Tarjeta Rechazada
- [ ] Número: `4000 0000 0000 0002`
- [ ] Nombre: `OTHE`
- [ ] Fecha: `11/25`
- [ ] CVV: `123`
- [ ] Verificar: Token generado pero pago rechazado

### Test 3: Tarjeta Guardada (Requiere implementación)
- [ ] Implementar guardado de tokens en BD
- [ ] O implementar MercadoPago Customers
- [ ] Seleccionar tarjeta guardada
- [ ] El backend debe usar el token guardado

---

## 🚨 Importante: Seguridad

### ✅ LO QUE DEBES GUARDAR:
- Token de MercadoPago (`card_token_xxx`)
- Últimos 4 dígitos
- Nombre del titular
- Fecha de expiración
- Tipo de tarjeta (Visa, Mastercard, etc.)

### ❌ NUNCA GUARDES:
- Número completo de tarjeta
- CVV
- CVC

**El token de MercadoPago puede ser reutilizado para pagos futuros sin exponer los datos de la tarjeta.**

---

## 🔄 Flujo Completo Recomendado

### Primera Vez (Guardar Tarjeta):
```
Usuario ingresa tarjeta completa
         ↓
Frontend tokeniza con SDK
         ↓
Token: card_token_xxx
         ↓
Backend procesa pago CON el token
         ↓
Backend guarda token en BD (opcional)
         ↓
Usuario puede reutilizar esta tarjeta
```

### Pagos Futuros (Tarjeta Guardada):
```
Usuario selecciona tarjeta guardada
         ↓
Frontend envía: idTarjetaGuardada
         ↓
Backend obtiene token guardado de BD
         ↓
Backend procesa pago CON token guardado
         ↓
NO necesita tokenizar de nuevo
```

---

## 📚 Documentación MercadoPago

- **Customers API**: https://www.mercadopago.com.mx/developers/es/reference/customers/_customers/post
- **Cards API**: https://www.mercadopago.com.mx/developers/es/reference/cards/_customers_customer_id_cards/post
- **Tokens**: https://www.mercadopago.com.mx/developers/es/docs/checkout-api/integration-configuration/card-configuration

---

## ✅ Solución Rápida (Ahora)

1. **NO selecciones una tarjeta guardada**
2. **Ingresa la tarjeta de prueba completa**: `4509 9535 6623 3704`
3. **Nombre**: `APRO`
4. **Fecha**: `11/25`
5. **CVV**: `123`
6. **Click en Finalizar Compra**

Verás en los logs:
```
✅ Token de tarjeta generado exitosamente: card_token_xxx
```

Y cuando implementes el backend correctamente:
```
✅ Checkout API - Pago procesado directamente
```

---

¡Prueba con una tarjeta nueva y verás que el token se genera correctamente! 🚀
