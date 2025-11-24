# Checkout Process - Estructura Modular

## 📁 Estructura de Archivos

### Hooks Personalizados (`src/hooks/`)

#### `useCheckoutForm.ts`
Maneja todo el estado y lógica del formulario de checkout:
- Datos del formulario (contacto, dirección, envío, pago, tarjeta)
- Detección del tipo de tarjeta (Visa, Mastercard, Amex)
- Validación de elegibilidad para MSI (Meses Sin Intereses)
- Formateo automático de inputs (tarjeta, fecha, CVV)
- Sincronización con datos del usuario autenticado

**Exports:**
- `formData`: Estado del formulario completo
- `setFormData`: Setter del formulario
- `cardType`: Tipo de tarjeta detectado
- `esTarjetaElegibleMSI`: Boolean de elegibilidad para MSI
- `handleInputChange`: Manejador de cambios con formateo automático

#### `useCheckoutCalculations.ts`
Realiza todos los cálculos relacionados con precios y totales:
- Cálculo de subtotal
- Descuentos por productos
- Descuentos por código promocional
- Cálculo de envío según método seleccionado
- Total final

**Exports:**
- `subtotal`: Suma de productos
- `descuentoProductos`: Descuento por productos en oferta
- `descuentoCodigo`: Descuento por código promocional
- `envio`: Costo de envío
- `total`: Total final
- `obtenerPrecioFinal`: Función helper para obtener precio con/sin descuento

#### `useCheckoutSections.ts`
Controla el estado de las secciones del acordeón:
- Sección abierta actual
- Secciones completadas
- Toggle de secciones
- Completar sección y abrir siguiente

**Exports:**
- `openSection`: Número de sección abierta (1-4)
- `completedSections`: Array de secciones completadas
- `toggleSection`: Función para abrir/cerrar sección
- `handleSectionComplete`: Marca sección como completada y abre siguiente

### Componentes (`src/components/checkout/`)

#### `ContactInfoSection.tsx`
**Sección 1: Información de Contacto**
- Campos: Nombre, Apellido, Email, Teléfono
- Validación requerida en todos los campos
- Iconos: User, Mail, Phone
- Animación de acordeón

**Props:**
- `formData`, `handleInputChange`
- `openSection`, `completedSections`
- `toggleSection`, `handleSectionComplete`

#### `ShippingAddressSection.tsx`
**Sección 2: Dirección de Envío**
- Campos: Calle, Núm. Ext/Int, Colonia, CP, Ciudad, Estado, Referencias
- Grid responsive (2-3 columnas)
- Validación de campos requeridos
- Campo opcional: Referencias

**Props:**
- Mismas que ContactInfoSection

#### `ShippingMethodSection.tsx`
**Sección 3: Método de Envío**
- 3 opciones de envío:
  - **Express**: $299 - 24 horas
  - **Estándar**: $150 (gratis >$5,000) - 3-5 días
  - **Recoger en tienda**: Gratis - 24 horas
- Cálculo dinámico de envío gratis
- Iconos: Truck, Clock, Package

**Props:**
- Mismas + `subtotal` para calcular envío gratis

#### `PaymentMethodSection.tsx`
**Sección 4: Método de Pago**
- 3 métodos de pago:
  - Tarjeta de crédito/débito
  - PayPal
  - Pago contra entrega
- Muestra formulario de tarjeta si se selecciona
- Integra `CreditCardForm`

**Props:**
- Mismas + `cardType`, `esTarjetaElegibleMSI`, `total`

#### `CreditCardForm.tsx`
**Formulario de Tarjeta de Crédito**
- Visualización de tarjeta 3D
- Campos: Número, Titular, Tipo (Crédito/Débito), Fecha, CVV
- Selector de MSI (solo tarjetas de crédito)
- Cálculo de pago mensual
- Mensaje de seguridad SSL

**Props:**
- `formData`, `handleInputChange`
- `cardType`, `esTarjetaElegibleMSI`, `total`

#### `CreditCardVisualization.tsx`
**Visualización 3D de Tarjeta**
- Diseño realista con chip, número, titular, expiración
- Logo dinámico según tipo (Visa/Mastercard/Amex)
- Actualización en tiempo real
- Gradiente azul profesional

**Props:**
- `formData`, `cardType`

#### `OrderSummary.tsx`
**Sidebar - Resumen del Pedido**
- Lista de productos del carrito con imágenes
- Entrada de código promocional
- Desglose de precios:
  - Subtotal
  - Descuento por productos
  - Descuento por código
  - Envío
  - **Total**
- Notificaciones de éxito/error en códigos
- Sticky sidebar

**Props:**
- `carrito`, cálculos (`subtotal`, `descuentos`, `envio`, `total`)
- `obtenerPrecioFinal`
- Estados de código promocional

### Página Principal (`src/app/processBuy/page.tsx`)

**Arquitectura Limpia:**
```tsx
export default function ProcessBuyPage() {
  // 🎣 Hooks
  const { carrito } = useTienda();
  const { formData, cardType, ... } = useCheckoutForm();
  const { openSection, ... } = useCheckoutSections();
  const { promoCode, ... } = aplicarPromocion();
  const { subtotal, total, ... } = useCheckoutCalculations(...);

  // 🎯 Lógica
  - Validación de carrito vacío
  - handleFinalizarCompra

  // 🎨 Render
  return (
    <ContactInfoSection {...props} />
    <ShippingAddressSection {...props} />
    <ShippingMethodSection {...props} />
    <PaymentMethodSection {...props} />
    <OrderSummary {...props} />
  );
}
```

## 🎯 Flujo de Datos

```
page.tsx (State Management)
    ↓
useCheckoutForm → formData, handleInputChange
useCheckoutSections → navigation logic
useCheckoutCalculations → price calculations
aplicarPromocion → promo code logic
    ↓
Components (Presentational)
    ↓
User Actions → Events → State Updates → Re-render
```

## ✨ Características

### 🔒 Seguridad
- Validación en cada sección
- Progresión secuencial (no puedes saltar pasos)
- Encriptación SSL mencionada

### 💳 Meses Sin Intereses
- Solo para tarjetas de crédito
- Solo Visa y Mastercard
- Opciones: 3, 6, 9, 12 meses
- Cálculo automático de pago mensual

### 💰 Descuentos
- Por producto (con fechas y horarios)
- Por código promocional (con validación API)
- Desglose claro en resumen

### 📦 Envío
- Express: $299 fijo
- Estándar: $150 (gratis >$5,000)
- Recoger: Gratis

### 🎨 UX/UI
- Acordeón animado con Framer Motion
- Iconos descriptivos (Lucide React)
- Estados visuales (completado, activo, pendiente)
- Responsive design
- Notificaciones toast
- Sticky sidebar

## 🛠️ Tecnologías

- **React 18**: Hooks, Context
- **Next.js 14**: App Router, Client Components
- **TypeScript**: Tipado estricto
- **Framer Motion**: Animaciones fluidas
- **TailwindCSS**: Estilos utility-first
- **Lucide React**: Iconos SVG

## 📝 Notas de Desarrollo

### Ventajas de la Modularización:
- ✅ Código más limpio y mantenible
- ✅ Componentes reutilizables
- ✅ Lógica separada de la presentación
- ✅ Fácil testing unitario
- ✅ Hooks personalizados reutilizables
- ✅ Reducción de prop drilling

### Posibles Mejoras Futuras:
- Agregar Zod/Yup para validación de esquemas
- Implementar React Hook Form
- Agregar tests con Jest/Vitest
- Crear Storybook para componentes
- Agregar logging de errores (Sentry)
- Implementar guardado automático en localStorage
