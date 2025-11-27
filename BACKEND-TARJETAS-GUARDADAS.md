# 💳 Backend: Implementación de Tarjetas Guardadas con Tokens

## ✅ Cambios Implementados en el Frontend

### 1. **Al Guardar una Tarjeta Nueva**
Ahora cuando el usuario guarda una tarjeta:
1. Se tokeniza con MercadoPago SDK
2. Se guarda el token en la base de datos
3. Solo se guardan los últimos 4 dígitos del número

### 2. **Al Usar una Tarjeta Guardada**
Cuando el usuario selecciona una tarjeta guardada:
1. Solo pide el CVV por seguridad
2. Envía `"USAR_TOKEN_GUARDADO"` en `token_tarjeta`
3. Envía el `id_tarjeta_guardada` en metadata

---

## 🗄️ Schema de Base de Datos

### Actualiza tu tabla de tarjetas para incluir el token:

```sql
-- PostgreSQL
ALTER TABLE tarjetas 
ADD COLUMN strTokenMercadoPago VARCHAR(255);

-- O si es nueva tabla:
CREATE TABLE tarjetas (
  intTarjeta SERIAL PRIMARY KEY,
  intCliente INT NOT NULL,
  strNumeroTarjeta VARCHAR(4) NOT NULL,  -- Solo últimos 4 dígitos
  strNombreTarjeta VARCHAR(255) NOT NULL,
  strTipoTarjeta VARCHAR(50) NOT NULL,
  strFechaExpiracion VARCHAR(7) NOT NULL,
  strTokenMercadoPago VARCHAR(255),  -- ← NUEVO: Token de MercadoPago
  dteFechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dteFechaActualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bolActivo BOOLEAN DEFAULT TRUE
);
```

---

## 📝 GraphQL Schema

### Actualiza tu tipo TarjetaInput:

```graphql
input TarjetaInput {
  strNumeroTarjeta: String!      # Solo últimos 4 dígitos
  strNombreTarjeta: String!
  strTipoTarjeta: String!
  strFechaExpiracion: String!
  strTokenMercadoPago: String    # ← NUEVO: Token de MercadoPago
}

type Tarjeta {
  intTarjeta: Int!
  intCliente: Int!
  strNumeroTarjeta: String!
  strNombreTarjeta: String!
  strTipoTarjeta: String!
  strFechaExpiracion: String!
  strTokenMercadoPago: String    # ← NUEVO
  dteFechaCreacion: String
  bolActivo: Boolean
}
```

---

## 🔧 Resolver: Guardar Tarjeta con Token

```javascript
const guardarTarjeta = async (parent, { data }, context) => {
  const { intCliente } = context.user; // Obtener cliente autenticado

  try {
    const nuevaTarjeta = await db.tarjetas.create({
      data: {
        intCliente,
        strNumeroTarjeta: data.strNumeroTarjeta, // Solo últimos 4
        strNombreTarjeta: data.strNombreTarjeta,
        strTipoTarjeta: data.strTipoTarjeta,
        strFechaExpiracion: data.strFechaExpiracion,
        strTokenMercadoPago: data.strTokenMercadoPago, // ← Guardar token
        bolActivo: true,
      }
    });

    console.log("✅ Tarjeta guardada con token:", nuevaTarjeta.intTarjeta);

    return nuevaTarjeta;
  } catch (error) {
    console.error("❌ Error al guardar tarjeta:", error);
    throw new Error("Error al guardar la tarjeta");
  }
};
```

---

## 💳 Resolver: Procesar Pago con Tarjeta Guardada

```javascript
const crearPreferenciaMercadoPago = async (parent, { data }, context) => {
  try {
    // 1. Parsear metadata
    const metadata = JSON.parse(data.metadata || "{}");
    const tokenTarjeta = metadata.token_tarjeta;
    const idTarjetaGuardada = metadata.id_tarjeta_guardada;
    const usandoTarjetaGuardada = metadata.usando_tarjeta_guardada;

    console.log("🔍 Metadata recibido:", {
      tokenTarjeta: tokenTarjeta === "USAR_TOKEN_GUARDADO" ? "USAR_TOKEN_GUARDADO" : tokenTarjeta?.substring(0, 20) + "...",
      idTarjetaGuardada,
      usandoTarjetaGuardada
    });

    // 2. Determinar qué token usar
    let tokenParaPago = tokenTarjeta;

    if (tokenTarjeta === "USAR_TOKEN_GUARDADO" && idTarjetaGuardada) {
      // Obtener token guardado de la BD
      console.log("💳 Buscando token guardado para tarjeta:", idTarjetaGuardada);
      
      const tarjetaGuardada = await db.tarjetas.findUnique({
        where: { intTarjeta: idTarjetaGuardada }
      });

      if (!tarjetaGuardada || !tarjetaGuardada.strTokenMercadoPago) {
        throw new Error("Token de tarjeta guardada no encontrado");
      }

      tokenParaPago = tarjetaGuardada.strTokenMercadoPago;
      console.log("✅ Token guardado encontrado");
    }

    // 3. Procesar pago con Checkout API si hay token
    if (tokenParaPago && tokenParaPago !== "" && tokenParaPago !== "USAR_TOKEN_GUARDADO") {
      console.log("💳 Procesando pago con Checkout API (con token)");

      const payment = await mercadopago.payment.create({
        token: tokenParaPago,
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
          usando_tarjeta_guardada: usandoTarjetaGuardada,
        }
      });

      console.log("✅ Pago procesado:", payment.id, "- Estado:", payment.status);

      // Guardar pago en BD
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
        strInitPoint: null, // ← NO hay redirect
        strEstado: payment.status,
      };
    } else {
      // 4. Fallback a Checkout Pro (sin token)
      console.log("🔵 Sin token disponible, usando Checkout Pro");
      
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
          success: process.env.URL_SUCCESS,
          failure: process.env.URL_FAILURE,
          pending: process.env.URL_PENDING
        },
        auto_return: "approved",
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
    throw new Error(error.message || "Error al procesar el pago");
  }
};

// Función auxiliar
function detectarMetodoPago(tipoTarjeta) {
  const mapa = {
    'visa': 'visa',
    'mastercard': 'master',
    'amex': 'amex',
    'credito': 'visa',
    'debito': 'debito',
  };
  return mapa[tipoTarjeta?.toLowerCase()] || 'visa';
}
```

---

## 🔐 Seguridad: Validaciones Importantes

### 1. **Validar Propiedad de la Tarjeta**

```javascript
const tarjetaGuardada = await db.tarjetas.findFirst({
  where: {
    intTarjeta: idTarjetaGuardada,
    intCliente: context.user.intCliente, // ← Verificar que pertenece al cliente
    bolActivo: true,
  }
});

if (!tarjetaGuardada) {
  throw new Error("Tarjeta no encontrada o no autorizada");
}
```

### 2. **Validar Token No Expirado**

Los tokens de MercadoPago pueden expirar. Considera:

```javascript
// Opción 1: Guardar fecha de creación del token
const tokenEdad = Date.now() - new Date(tarjetaGuardada.dteFechaTokenCreado).getTime();
const tokenExpirado = tokenEdad > 7 * 24 * 60 * 60 * 1000; // 7 días

if (tokenExpirado) {
  throw new Error("Token expirado. Por favor vuelve a guardar tu tarjeta.");
}

// Opción 2: Siempre crear un nuevo token (más seguro)
// En este caso, no guardes el token, solo la referencia
```

### 3. **Cifrar Tokens en BD (Recomendado)**

```javascript
const crypto = require('crypto');

// Al guardar
const tokenCifrado = cifrar(data.strTokenMercadoPago);
await db.tarjetas.create({
  // ...
  strTokenMercadoPago: tokenCifrado,
});

// Al usar
const tokenDescifrado = descifrar(tarjetaGuardada.strTokenMercadoPago);

function cifrar(texto) {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.SECRET_KEY);
  let cifrado = cipher.update(texto, 'utf8', 'hex');
  cifrado += cipher.final('hex');
  return cifrado;
}

function descifrar(textoCifrado) {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.SECRET_KEY);
  let descifrado = decipher.update(textoCifrado, 'hex', 'utf8');
  descifrado += decipher.final('utf8');
  return descifrado;
}
```

---

## 📊 Flujo Completo

### Guardar Tarjeta Nueva:
```
Usuario ingresa tarjeta completa
         ↓
Frontend tokeniza con MercadoPago SDK
         ↓
Token: card_token_xxx
         ↓
Frontend envía a backend: {
  strNumeroTarjeta: "8376",
  strTokenMercadoPago: "card_token_xxx",
  ...
}
         ↓
Backend guarda en BD (token cifrado)
         ↓
Usuario puede reutilizar esta tarjeta
```

### Pagar con Tarjeta Guardada:
```
Usuario selecciona tarjeta guardada
         ↓
Frontend envía: {
  token_tarjeta: "USAR_TOKEN_GUARDADO",
  id_tarjeta_guardada: 123,
  ...
}
         ↓
Backend busca tarjeta en BD
         ↓
Backend obtiene token guardado
         ↓
Backend procesa pago con token
         ↓
Pago aprobado/rechazado sin redirect
```

---

## ✅ Checklist de Implementación

### Base de Datos:
- [ ] Agregar campo `strTokenMercadoPago` a tabla tarjetas
- [ ] Migrar base de datos
- [ ] Agregar índice a `intCliente` para mejor performance

### GraphQL:
- [ ] Actualizar `TarjetaInput` para aceptar `strTokenMercadoPago`
- [ ] Actualizar tipo `Tarjeta` para devolver token (si es necesario)
- [ ] Actualizar resolver `guardarTarjeta`

### Lógica de Pago:
- [ ] Detectar cuando `token_tarjeta === "USAR_TOKEN_GUARDADO"`
- [ ] Buscar token guardado en BD por `id_tarjeta_guardada`
- [ ] Validar que la tarjeta pertenece al cliente
- [ ] Usar token guardado para crear el pago
- [ ] Manejar errores (token inválido, tarjeta eliminada, etc.)

### Seguridad:
- [ ] Validar propiedad de la tarjeta
- [ ] Cifrar tokens en BD (opcional pero recomendado)
- [ ] Validar CVV adicional (si lo requieres)
- [ ] Logs de auditoría para uso de tarjetas

### Testing:
- [ ] Probar guardar tarjeta con token
- [ ] Probar pago con tarjeta guardada
- [ ] Probar con tarjeta que no pertenece al usuario
- [ ] Probar con tarjeta eliminada
- [ ] Probar con token inválido

---

## 🧪 Testing en Frontend

### 1. **Guardar Nueva Tarjeta**:
```
1. Click en "Nueva tarjeta"
2. Ingresar: 4509 9535 6623 3704
3. Nombre: APRO
4. Fecha: 11/30
5. CVV: 123
6. Click "Guardar y continuar"
```

**Logs esperados**:
```
🔐 Tokenizando tarjeta para guardar...
✅ Token generado para guardar: card_token_xxx
💾 Guardando tarjeta con token...
✅ Tarjeta y token guardados exitosamente
```

### 2. **Pagar con Tarjeta Guardada**:
```
1. Seleccionar tarjeta guardada
2. Ingresar CVV: 123
3. Click "Finalizar compra"
```

**Logs esperados**:
```
💳 Usando tarjeta guardada - El backend usará el token almacenado
🎫 Token final antes de enviar: USAR_TOKEN_GUARDADO
```

**Backend debe recibir**:
```json
{
  "metadata": {
    "token_tarjeta": "USAR_TOKEN_GUARDADO",
    "id_tarjeta_guardada": 123,
    "usando_tarjeta_guardada": true
  }
}
```

---

## 📚 Referencias

- **MercadoPago Payment API**: https://www.mercadopago.com.mx/developers/es/reference/payments/_payments/post
- **Tokenization**: https://www.mercadopago.com.mx/developers/es/docs/checkout-api/integration-configuration/card-configuration
- **Security Best Practices**: https://www.mercadopago.com.mx/developers/es/docs/security/pci

---

¡Con esto tendrás un sistema completo de tarjetas guardadas con tokens seguros! 🚀💳
