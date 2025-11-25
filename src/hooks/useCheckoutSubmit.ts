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
              strCalle: `${formData.calle} ${formData.numeroExterior}${formData.numeroInterior ? ' Int. ' + formData.numeroInterior : ''}, ${formData.colonia}`,
              strCiudad: formData.ciudad,
              strEstado: formData.estado,
              strCP: formData.codigoPostal,
              strPais: "México",
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
   * PASO 3: Crear pedido con items
   */
  const crearPedido = async (intCliente: number, total: number) => {
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
                dblTotal
                strEstado
              }
            }
          `,
          variables: {
            data: {
              intCliente,
              dblTotal: total,
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
   * PASO 4: Procesar pago (MercadoPago u otro)
   */
  const procesarPago = async (
    intPedido: number,
    formData: CheckoutData,
    total: number
  ) => {
    try {
      // Aquí integrarías con MercadoPago o tu gateway de pago
      const response = await fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CrearPago($data: PagoInput!) {
              crearPago(data: $data) {
                intPago
                strEstado
                strMercadoPagoId
              }
            }
          `,
          variables: {
            data: {
              intPedido,
              strMetodoPago: formData.metodoPago,
              dblMonto: total,
              intCuotas: formData.mesesSinIntereses 
                ? parseInt(formData.mesesSinIntereses) 
                : null,
              jsonDetallesPago: JSON.stringify({
                numeroTarjeta: formData.numeroTarjeta?.slice(-4), // Solo últimos 4 dígitos
                nombreTarjeta: formData.nombreTarjeta,
                tipoTarjeta: formData.tipoTarjeta,
              }),
            },
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data.crearPago;
    } catch (error: any) {
      console.error("Error al procesar pago:", error);
      throw error;
    }
  };

  /**
   * FUNCIÓN PRINCIPAL: Procesar toda la compra
   */
  const finalizarCompra = async (formData: CheckoutData, total: number) => {
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
        // Asumiendo que tienes el ID en el contexto de auth
        intCliente = user?.intCliente || 0;
        
        if (!intCliente) {
          throw new Error("No se pudo obtener el ID del cliente");
        }
      }

      console.log("✅ Cliente ID:", intCliente);

      // PASO 2: Guardar dirección
      console.log("📍 Guardando dirección...");
      const intDireccion = await guardarDireccion(intCliente, formData);
      console.log("✅ Dirección guardada:", intDireccion);

      // PASO 3: Crear pedido
      console.log("🛒 Creando pedido...");
      const intPedido = await crearPedido(intCliente, total);
      console.log("✅ Pedido creado:", intPedido);

      // PASO 4: Procesar pago
      console.log("💳 Procesando pago...");
      const pago = await procesarPago(intPedido, formData, total);
      console.log("✅ Pago procesado:", pago);

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
