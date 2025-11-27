# 📧 Implementar Envío de Emails en Backend

## 🎯 Estado Actual

El frontend muestra 3 pasos:
1. ✅ **Procesando Pago** - Ya conectado (MercadoPago)
2. ✅ **Guardando Pedido** - Ya conectado (BD GraphQL)
3. ⚠️ **Enviando Confirmación** - Simulado (necesita implementación real)

---

## 🔧 Qué Implementar en Backend

### Opción 1: Enviar Emails desde el Resolver (Recomendado)

Después de crear el pedido, envía emails automáticamente:

```javascript
// En tu resolver crearPreferenciaMercadoPago o crearPedido

const crearPedido = async (parent, { data }, context) => {
  try {
    // 1. Crear el pedido en la BD
    const pedido = await db.pedidos.create({
      data: {
        intCliente: data.intCliente,
        dblTotal: data.dblTotal,
        // ... resto de campos
      }
    });

    // 2. Enviar emails de confirmación
    await enviarEmailsConfirmacion(pedido);

    return pedido;
  } catch (error) {
    console.error("Error al crear pedido:", error);
    throw error;
  }
};

// Función para enviar emails
async function enviarEmailsConfirmacion(pedido) {
  try {
    // Email al cliente
    await enviarEmailCliente({
      to: pedido.email,
      subject: "Confirmación de Pedido #" + pedido.intPedido,
      html: `
        <h1>¡Gracias por tu compra!</h1>
        <p>Tu pedido #${pedido.intPedido} ha sido confirmado.</p>
        <p>Total: $${pedido.dblTotal}</p>
        <a href="https://tusitioweb.com/pedido/${pedido.intPedido}">Ver detalles</a>
      `
    });

    // Email al administrador
    await enviarEmailAdmin({
      to: "admin@tusitioweb.com",
      subject: "Nuevo Pedido #" + pedido.intPedido,
      html: `
        <h1>Nuevo Pedido Recibido</h1>
        <p>Cliente: ${pedido.nombreCliente}</p>
        <p>Total: $${pedido.dblTotal}</p>
        <a href="https://tusitioweb.com/admin/pedidos/${pedido.intPedido}">Ver pedido</a>
      `
    });

    console.log("✅ Emails enviados exitosamente");
    return true;
  } catch (error) {
    console.error("❌ Error al enviar emails:", error);
    // No lanzar error para no fallar el pedido si falla el email
    return false;
  }
}
```

---

## 📮 Servicios de Email Recomendados

### 1. **Nodemailer** (Gratis con tu servidor SMTP)

```bash
npm install nodemailer
```

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function enviarEmailCliente({ to, subject, html }) {
  await transporter.sendMail({
    from: '"Tu Tienda" <noreply@tutienda.com>',
    to,
    subject,
    html,
  });
}
```

### 2. **SendGrid** (Gratis hasta 100 emails/día)

```bash
npm install @sendgrid/mail
```

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function enviarEmailCliente({ to, subject, html }) {
  await sgMail.send({
    to,
    from: 'noreply@tutienda.com',
    subject,
    html,
  });
}
```

### 3. **Resend** (Moderno y fácil, 3,000 emails/mes gratis)

```bash
npm install resend
```

```javascript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

async function enviarEmailCliente({ to, subject, html }) {
  await resend.emails.send({
    from: 'Tu Tienda <onboarding@resend.dev>',
    to,
    subject,
    html,
  });
}
```

---

## 🔄 Opción 2: Webhook de MercadoPago

En lugar de enviar desde el frontend, escucha los eventos de MercadoPago:

```javascript
// Endpoint webhook
app.post('/api/mercadopago/webhook', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'payment') {
    const paymentId = data.id;
    
    // Obtener detalles del pago
    const payment = await mercadopago.payment.get(paymentId);
    
    if (payment.status === 'approved') {
      // Obtener pedido asociado
      const pedidoId = payment.metadata.pedido_id;
      const pedido = await obtenerPedido(pedidoId);
      
      // Enviar emails
      await enviarEmailsConfirmacion(pedido);
    }
  }

  res.status(200).send('OK');
});
```

**Configurar webhook en MercadoPago:**
1. Ve a https://www.mercadopago.com.mx/developers/panel/webhooks
2. Agrega URL: `https://tudominio.com/api/mercadopago/webhook`
3. Selecciona eventos: `payment`

---

## 🎨 Template de Email HTML

```javascript
function templateEmailCliente(pedido) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3A6EA5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background: #3A6EA5; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
        }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Gracias por tu compra!</h1>
        </div>
        <div class="content">
          <h2>Pedido #${pedido.intPedido}</h2>
          <p>Hola ${pedido.nombreCliente},</p>
          <p>Tu pedido ha sido confirmado y está siendo procesado.</p>
          
          <h3>Resumen del Pedido:</h3>
          <ul>
            ${pedido.items.map(item => `
              <li>${item.nombre} x${item.cantidad} - $${item.precio}</li>
            `).join('')}
          </ul>
          
          <p><strong>Total: $${pedido.dblTotal} MXN</strong></p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://tutienda.com/pedido/${pedido.intPedido}" class="button">
              Ver Detalles del Pedido
            </a>
          </p>
        </div>
        <div class="footer">
          <p>© 2025 Tu Tienda. Todos los derechos reservados.</p>
          <p>Si tienes dudas, contáctanos a soporte@tutienda.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
```

---

## 🔧 Actualizar Frontend (Si implementas respuesta del backend)

Si tu backend devuelve el estado del envío de email:

```graphql
type PagoMercadoPago {
  intPago: Int!
  strPreferenciaId: String!
  strInitPoint: String
  strEstado: String!
  bolEmailEnviado: Boolean  # ← Nuevo campo
}
```

Entonces actualiza el frontend:

```typescript
// En useCheckoutSubmit.ts
const pago = await iniciarPagoMercadoPago(...);
setLoaderStates(prev => ({ ...prev, isProcessing: false }));

// Si el backend devuelve el estado del email
if (pago.bolEmailEnviado) {
  setLoaderStates(prev => ({ ...prev, sendingMails: false }));
} else {
  // Si no se pudo enviar, aún marcar como completado
  setTimeout(() => {
    setLoaderStates(prev => ({ ...prev, sendingMails: false }));
  }, 1000);
}
```

---

## ✅ Checklist de Implementación Backend

- [ ] Elegir servicio de email (Nodemailer/SendGrid/Resend)
- [ ] Instalar dependencias
- [ ] Configurar variables de entorno (API keys, SMTP)
- [ ] Crear función `enviarEmailCliente()`
- [ ] Crear función `enviarEmailAdmin()`
- [ ] Crear templates HTML para emails
- [ ] Integrar envío en resolver de pedidos
- [ ] Probar envío con email real
- [ ] Configurar webhook de MercadoPago (opcional)
- [ ] Agregar campo `bolEmailEnviado` al schema (opcional)

---

## 🚀 Próximos Pasos

1. **Ahora**: El sistema funciona con simulación (1.5 seg)
2. **Implementa backend**: Sigue esta guía para envío real
3. **Prueba**: Verifica que los emails lleguen
4. **Mejora**: Agrega templates profesionales con React Email

---

## 📚 Recursos

- **Nodemailer**: https://nodemailer.com/
- **SendGrid**: https://sendgrid.com/
- **Resend**: https://resend.com/
- **React Email**: https://react.email/ (para templates modernos)
- **MercadoPago Webhooks**: https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks

---

¡Con esto tendrás un sistema completo de confirmación por email! 📧✨
