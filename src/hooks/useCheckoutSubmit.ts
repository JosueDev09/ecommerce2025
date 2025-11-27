import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTienda } from "@/context/TiendaContext";
import { useRouter } from "next/navigation";

interface CheckoutData {
  // Información de contacto
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  
  // Dirección
  calle: string;
  numeroExterior: string;
  numeroInterior: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  referencias: string;
  
  // Método de envío
  metodoEnvio: string;
  
  // Método de pago
  metodoPago: string;
  numeroTarjeta?: string;
  nombreTarjeta?: string;
  fechaExpiracion?: string;
  cvv?: string;
  tipoTarjeta?: string;
  mesesSinIntereses?: string;
}

export const useCheckoutSubmit = () => {
  const { user, isGuest, token } = useAuth();
  const { carrito } = useTienda();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * PASO 1: Crear o actualizar cliente (si es invitado)
   */
  const crearClienteInvitado = async (formData: CheckoutData) => {
    try {
      const response = await fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation CrearClienteInvitado($data: ClienteInvitadoInput!) {
              crearClienteInvitado(data: $data) {
                intCliente
                strNombre
                strEmail
                strTelefono
              }
            }
          `,
          variables: {
            data: {
              strNombre: `${formData.nombre} ${formData.apellido}`,
              strEmail: formData.email,
              strTelefono: formData.telefono,
              strUsuario: formData.email, // Email como usuario para invitados
              strContra: Math.random().toString(36).slice(-8), // Contraseña temporal
            },
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data.crearClienteInvitado.intCliente;
    } catch (error: any) {
      console.error("Error al crear cliente invitado:", error);
      throw error;
    }
  };

  /**
   * PASO 2: Guardar dirección
   */
  const guardarDireccion = async (intCliente: number, formData: CheckoutData) => {
    try {
      const response = await fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CrearDireccion($data: DireccionInput!) {
              crearDireccion(data: $data) {
                intDireccion
              }
            }
          `,
          variables: {
            data: {
              intCliente,
              strCalle: formData.calle,
              strNumeroExterior: formData.numeroExterior,
              strNumeroInterior: formData.numeroInterior || "",
              strColonia: formData.colonia,
              strCiudad: formData.ciudad,
              strEstado: formData.estado,
              strCP: formData.codigoPostal,
              strPais: "México",
              strReferencias: formData.referencias || "",
            },
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data.crearDireccion.intDireccion;
    } catch (error: any) {
      console.error("Error al guardar dirección:", error);
      throw error;
    }
  };

  /**
   * PASO 3: Crear pedido con items, dirección y método de envío
   */
  const crearPedido = async (
    intCliente: number, 
    intDireccion: number | null,
    formData: CheckoutData,
    subtotal: number,
    costoEnvio: number,
    total: number
  ) => {
    try {
      // Construir items del pedido desde el carrito
      const items = carrito.map((item) => ({
        intProducto: item.id,
        intCantidad: item.cantidad,
        dblSubtotal: (item.tieneDescuento && item.precioDescuento 
          ? item.precioDescuento 
          : item.precio) * item.cantidad,
      }));

      const response = await fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CrearPedido($data: PedidoInput!) {
              crearPedido(data: $data) {
                intPedido
                dblSubtotal
                dblCostoEnvio
                dblTotal
                strEstado
                strMetodoEnvio
              }
            }
          `,
          variables: {
            data: {
              intCliente,
              intDireccion,
              dblSubtotal: subtotal,
              dblCostoEnvio: costoEnvio,
              dblTotal: total,
              strMetodoEnvio: formData.metodoEnvio,
              strNotasEnvio: formData.referencias || null,
              items,
            },
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data.crearPedido.intPedido;
    } catch (error: any) {
      console.error("Error al crear pedido:", error);
      throw error;
    }
  };

  /**
   * PASO 4: Iniciar pago con MercadoPago
   */
  const iniciarPagoMercadoPago = async (
    intPedido: number,
    intCliente: number,
    intDireccion: number | null,
    formData: CheckoutData,
    subtotal: number,
    costoEnvio: number,
    total: number
  ) => {
    try {
      console.log("🔵 Preparando datos para MercadoPago...");

      // Construir items para MercadoPago desde el carrito
      const items = carrito.map((item) => ({
        id: item.id.toString(),
        title: item.nombre,
        description: item.nombre,
        picture_url: item.imagen || "",
        category_id: "others",
        quantity: item.cantidad,
        unit_price: item.tieneDescuento && item.precioDescuento 
          ? item.precioDescuento 
          : item.precio,
      }));

      // Construir datos de envío si aplica
      const shipments = formData.metodoEnvio !== "recoger" ? {
        cost: costoEnvio,
        mode: formData.metodoEnvio === "express" ? "express" : "standard",
        receiver_address: {
          zip_code: formData.codigoPostal,
          street_name: formData.calle,
          street_number: formData.numeroExterior,
          floor: formData.numeroInterior || "",
          apartment: "",
          city_name: formData.ciudad,
          state_name: formData.estado,
          country_name: "México",
        },
      } : null;

      // Datos del comprador
      const payer = {
        name: formData.nombre,
        surname: formData.apellido || "",
        email: formData.email,
        phone: {
          number: formData.telefono,
        },
        address: formData.metodoEnvio !== "recoger" ? {
          zip_code: formData.codigoPostal,
          street_name: formData.calle,
          street_number: formData.numeroExterior,
        } : undefined,
      };

      // Payload completo para enviar al backend (con formato str* que espera el backend)
      const payloadParaBackend = {
        intPedido,
        intCliente,
        intDireccion,
        formData: {
          strNombre: formData.nombre,
          strApellido: formData.apellido || "",
          strEmail: formData.email,
          strTelefono: formData.telefono,
          strCalle: formData.calle,
          strNumeroExterior: formData.numeroExterior,
          strNumeroInterior: formData.numeroInterior || "",
          strColonia: formData.colonia,
          strCiudad: formData.ciudad,
          strEstado: formData.estado,
          strCodigoPostal: formData.codigoPostal,
          strReferencias: formData.referencias || "",
          strMetodoEnvio: formData.metodoEnvio,
          strMetodoPago: formData.metodoPago,
          strNumeroTarjetaUltimos4: formData.numeroTarjeta?.replace(/\s/g, '').slice(-4),
          strNombreTarjeta: formData.nombreTarjeta || "",
          strTipoTarjeta: formData.tipoTarjeta || "",
          strFechaExpiracion: formData.fechaExpiracion || "",
          intMesesSinIntereses: formData.mesesSinIntereses || "1",
        },
        montos: {
          subtotal,
          costoEnvio,
          total,
        },
        items,
        payer,
        shipments,
        metadata: {
          pedido_id: intPedido,
          cliente_id: intCliente,
          metodo_envio: formData.metodoEnvio,
          metodo_pago: formData.metodoPago,
          meses_sin_intereses: formData.mesesSinIntereses || 1,
        },
      };

      console.log("📦 Payload para backend:", {
        pedidoId: intPedido,
        itemsCount: items.length,
        total,
        metodoPago: formData.metodoPago,
      });

      // Enviar al backend GraphQL para crear preferencia de MercadoPago
      const response = await fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CrearPreferenciaMercadoPago($data: PreferenciaMercadoPagoInput!) {
              crearPreferenciaMercadoPago(data: $data) {
                intPago
                strPreferenciaId
                strInitPoint
                strEstado
              }
            }
          `,
          variables: {
            data: payloadParaBackend,
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const pagoData = result.data.crearPreferenciaMercadoPago;
      
      console.log("✅ Preferencia de MercadoPago creada:", pagoData.strPreferenciaId);
      
      // Redirigir a MercadoPago Checkout
      if (pagoData.strInitPoint) {
        console.log("🔵 Redirigiendo a MercadoPago...");
        window.location.href = pagoData.strInitPoint;
      }

      return pagoData;
    } catch (error: any) {
      console.error("❌ Error al iniciar pago con MercadoPago:", error);
      throw error;
    }
  };

  /**
   * FUNCIÓN PRINCIPAL: Procesar toda la compra
   */
  const finalizarCompra = async (formData: CheckoutData, subtotal: number, costoEnvio: number, total: number) => {
    setIsProcessing(true);
    setError(null);

    try {
      // PASO 1: Obtener o crear cliente
      let intCliente: number;
      
      if (isGuest) {
        console.log("👤 Creando cliente invitado...");
        intCliente = await crearClienteInvitado(formData);
      } else {
        // Cliente ya existe, obtener su ID
        intCliente = user?.intCliente || 0;
        
        if (!intCliente) {
          throw new Error("No se pudo obtener el ID del cliente");
        }
      }

      console.log("✅ Cliente ID:", intCliente);

      // PASO 2: Guardar dirección (solo si no es "recoger en tienda")
      let intDireccion: number | null = null;
      
      if (formData.metodoEnvio !== "recoger") {
        console.log("📍 Guardando dirección...");
        intDireccion = await guardarDireccion(intCliente, formData);
        console.log("✅ Dirección guardada:", intDireccion);
      } else {
        console.log("🏪 Pedido para recoger en tienda, sin dirección de envío");
      }

      // PASO 3: Crear pedido con método de envío
      console.log("🛒 Creando pedido...");
      const intPedido = await crearPedido(intCliente, intDireccion, formData, subtotal, costoEnvio, total);
      console.log("✅ Pedido creado:", intPedido);

      // PASO 4: Iniciar pago con MercadoPago
      console.log("💳 Iniciando pago con MercadoPago...");
      const pago = await iniciarPagoMercadoPago(
        intPedido, 
        intCliente, 
        intDireccion, 
        formData, 
        subtotal, 
        costoEnvio, 
        total
      );
      console.log("✅ Pago iniciado:", pago);

      // TODO: Limpiar carrito después de compra exitosa
      // clearCarrito();

      // Redirigir a página de confirmación
      router.push(`/pedido/confirmacion/${intPedido}`);

      return {
        success: true,
        intPedido,
        intPago: pago.intPago,
      };
    } catch (error: any) {
      console.error("❌ Error al finalizar compra:", error);
      setError(error.message || "Error al procesar la compra");
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    finalizarCompra,
    isProcessing,
    error,
  };
};
