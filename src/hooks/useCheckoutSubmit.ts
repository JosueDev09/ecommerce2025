import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTienda } from "@/context/TiendaContext";
import { useRouter } from "next/navigation";
import { loadMercadoPago } from "@mercadopago/sdk-js";


// Declarar tipos globales para MercadoPago
declare global {
  interface Window {
    MercadoPago: any;
  }
}

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
  usandoTarjetaGuardada?: boolean;
  idTarjetaGuardada?: number; // ID de la tarjeta guardada seleccionada
}

export const useCheckoutSubmit = () => {
  const { user, isGuest, token } = useAuth();
  const { carrito, limpiarCarrito } = useTienda();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de loading por paso
  const [loaderStates, setLoaderStates] = useState({
    isProcessing: true,      // Procesando pago con MercadoPago
    isSavingOrder: true,      // Guardando pedido en la base de datos
    sendingMails: true,       // Enviando emails de confirmación
  });

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
   
      // 🔐 PASO 1: Tokenizar la tarjeta con MercadoPago SDK
      let strTokenTarjeta = "";
      
      if (formData.metodoPago === "tarjeta") {
        if (!formData.usandoTarjetaGuardada) {

        

          try {
            // Cargar SDK de MercadoPago
            await loadMercadoPago();
            
            const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
            
            if (!publicKey) {
              throw new Error("La clave pública de MercadoPago no está configurada. Verifica tu archivo .env.local");
            }
            
          
            const mp = new window.MercadoPago(publicKey);

            // Extraer mes y año de la fecha de expiración
            const [mes, anio] = formData.fechaExpiracion?.split("/") || ["", ""];
           
            
            // Limpiar número de tarjeta (quitar todo excepto dígitos)
            const numeroTarjeta = formData.numeroTarjeta?.replace(/\D/g, "");

          

            // Validar que el número tenga la longitud correcta
            if (!numeroTarjeta || numeroTarjeta.length < 13 || numeroTarjeta.length > 19) {
            
              throw new Error(`Número de tarjeta inválido. Longitud: ${numeroTarjeta?.length || 0} (debe ser 13-19 dígitos)`);
            }

        
            
            const cardData = {
              cardNumber: numeroTarjeta,
              cardholderName: formData.nombreTarjeta || "",
              cardExpirationMonth: mes,
              cardExpirationYear: anio,
              securityCode: formData.cvv || "",
              // identificationType: "RFC",
              // identificationNumber: "XAXX010101000"
            };
            
          

            const cardToken = await mp.createCardToken(cardData);

            strTokenTarjeta = cardToken.id;
            
          } catch (error: any) {
            console.error("❌ Error al tokenizar tarjeta:", error);
            console.error("❌ Detalles del error:", error.message);
            throw new Error("Error al procesar la tarjeta. Verifica los datos ingresados.");
          }
        } else {
          // ✨ CASO 2: TARJETA GUARDADA - Enviar placeholder para que backend use el token guardado
         
          
          if (!formData.idTarjetaGuardada) {
            throw new Error("No se proporcionó el ID de la tarjeta guardada");
          }
          
          // El backend buscará el token guardado usando intTarjetaGuardada
          strTokenTarjeta = "USAR_TOKEN_GUARDADO";
        
        }
      }
      
     

      // 📦 PASO 2: Construir items para MercadoPago desde el carrito
      const items = carrito.map((item) => ({
        strId: item.id.toString(),
        strTitulo: item.nombre,
        strDescripcion: item.nombre,
        strImagenURL: item.imagen || "",
        strCategoriaId: "others",
        intCantidad: item.cantidad,
        dblPrecioUnitario: item.tieneDescuento && item.precioDescuento 
          ? item.precioDescuento 
          : item.precio,
      }));

      // Construir datos de envío si aplica (formato backend)
      const shipments = formData.metodoEnvio !== "recoger" ? {
        cost: costoEnvio,
        mode: formData.metodoEnvio === "express" ? "express" : "standard",
        receiver_address: {
          strCodigoPostal: formData.codigoPostal,
          strCalle: formData.calle,
          strNumero: formData.numeroExterior,
          strPiso: formData.numeroInterior || "",
          strDepartamento: "",
          strCiudad: formData.ciudad,
          strEstado: formData.estado,
          strPais: "México",
        },
      } : null;

      // Datos del comprador (con formato backend en español)
      const payer = {
        strNombre: formData.nombre || "",
        strApellido: formData.apellido || "",
        strEmail: formData.email || "",
        objTelefono: {
          strNumero: formData.telefono || "",
        },
        objDireccion: formData.metodoEnvio !== "recoger" ? {
            intCliente: intCliente,
            strCalle: formData.calle || "",
            strNumeroExterior: formData.numeroExterior || "",
            strNumeroInterior: formData.numeroInterior || "",
            strColonia: formData.colonia || "",
            strCiudad: formData.ciudad || "",
            strEstado: formData.estado || "",
            strCP: formData.codigoPostal || "",
            strPais: "México",
            strReferencias: formData.referencias || ""
        } : undefined,
      };



      // Payload completo para enviar al backend (con formato str* que espera el backend)
      const payloadParaBackend = {
        intPedido,
        intCliente,
        intDireccion,
         strTokenTarjeta, // 🔐 Token generado por MercadoPago SDK - Comentado hasta que el backend lo soporte
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
          strCVV: formData.cvv || "",
         bolUsandoTarjetaGuardada: formData.usandoTarjetaGuardada || false,
         intTarjetaGuardada: formData.idTarjetaGuardada || null, // ✨ NUEVO: ID de tarjeta guardada
         intMesesSinIntereses: parseInt(formData.mesesSinIntereses || "1", 10),
        },
        montos: {
          dblSubtotal: subtotal,
          dblCostoEnvio: costoEnvio,
          dblTotal: total,
        },
        items,
        payer,
        shipments,
        metadata: JSON.stringify({
          pedido_id: intPedido,
          cliente_id: intCliente,
          metodo_envio: formData.metodoEnvio,
          metodo_pago: formData.metodoPago,
          meses_sin_intereses: formData.mesesSinIntereses || 1,
          token_tarjeta: strTokenTarjeta, // 🔐 Token de MercadoPago o "USAR_TOKEN_GUARDADO"
          id_tarjeta_guardada: formData.idTarjetaGuardada || null, // ID de tarjeta guardada si aplica
          usando_tarjeta_guardada: formData.usandoTarjetaGuardada || false,
        }),
      };

      

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
        // Traducir errores de MercadoPago a mensajes amigables
        const errorMsg = result.errors[0].message;
        let userFriendlyMessage = errorMsg;
        
        // Errores comunes de MercadoPago
        if (errorMsg.includes("diff_param_bins")) {
          userFriendlyMessage = "Error de configuración del pago. El backend está enviando información incorrecta de la tarjeta a MercadoPago. Por favor, contacta al administrador.";
          console.error("🔧 ERROR DE BACKEND: diff_param_bins - El backend no debe enviar issuer_id manualmente, MercadoPago lo detecta automáticamente desde el token.");
        } else if (errorMsg.includes("Invalid card_number_length")) {
          userFriendlyMessage = "El número de tarjeta es inválido. Debe tener entre 13 y 19 dígitos.";
        } else if (errorMsg.includes("cc_rejected_bad_filled")) {
          userFriendlyMessage = "Revisa los datos de tu tarjeta. Algunos campos contienen información incorrecta.";
        } else if (errorMsg.includes("cc_rejected_insufficient_amount")) {
          userFriendlyMessage = "Tu tarjeta no tiene fondos suficientes para realizar esta compra.";
        } else if (errorMsg.includes("cc_rejected_other_reason")) {
          userFriendlyMessage = "El pago fue rechazado. Por favor, contacta a tu banco para más información.";
        }
        
        throw new Error(userFriendlyMessage);
      }

      const pagoData = result.data.crearPreferenciaMercadoPago;
      
    
      
      // VALIDAR ESTADO DEL PAGO (normalizar a minúsculas para comparación)
      const estadoNormalizado = pagoData.strEstado?.toLowerCase();
      
      if (estadoNormalizado === "rejected" || estadoNormalizado === "rechazado" || 
          estadoNormalizado === "cancelled" || estadoNormalizado === "cancelado") {
    
        
        // Mensajes de error más descriptivos
        let errorMessage = "El pago fue rechazado. ";
        
        if (estadoNormalizado === "rejected" || estadoNormalizado === "rechazado") {
          errorMessage += "Por favor, verifica los datos de tu tarjeta (número, CVV, fecha de expiración) y asegúrate de tener fondos suficientes. Si el problema persiste, contacta a tu banco.";
        } else if (estadoNormalizado === "cancelled" || estadoNormalizado === "cancelado") {
          errorMessage += "La transacción fue cancelada.";
        }
        
        throw new Error(errorMessage);
      }
      
      // PAGO PENDIENTE
      if (estadoNormalizado === "pending" || estadoNormalizado === "pendiente" || 
          estadoNormalizado === "in_process" || estadoNormalizado === "en_proceso") {
        console.warn("⏳ Pago pendiente:", pagoData.strEstado);
      }
      
      // PAGO APROBADO
      if (estadoNormalizado === "approved" || estadoNormalizado === "aprobado") {
        console.log("✅ Pago aprobado exitosamente");
      }
      
      // CHECKOUT API: Si hay token, el pago se procesa directamente (sin redirect)
      // CHECKOUT PRO: Si hay strInitPoint, redirigir a MercadoPago
      if (pagoData.strInitPoint) {
        console.log("🔵 Checkout Pro - Redirigiendo a MercadoPago...");
        window.location.href = pagoData.strInitPoint;
        return pagoData;
      } else {
        console.log("✅ Checkout API - Pago procesado directamente");
        // El pago ya fue procesado en el backend con el token
        // Continuar con el flujo normal (envío de emails, etc.)
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
    
    // Inicializar estados de loading
    setLoaderStates({
      isProcessing: true,
      isSavingOrder: true,
      sendingMails: true,
    });

    try {
      // PASO 1: Obtener o crear cliente
      let intCliente: number;
      
      if (isGuest) {
    
        intCliente = await crearClienteInvitado(formData);
      } else {
        // Cliente ya existe, obtener su ID
        intCliente = user?.intCliente || 0;
        
        if (!intCliente) {
          throw new Error("No se pudo obtener el ID del cliente");
        }
      }

    

      // PASO 2: Guardar dirección (solo si no es "recoger en tienda")
      let intDireccion: number | null = null;
      
      if (formData.metodoEnvio !== "recoger") {
    
        intDireccion = await guardarDireccion(intCliente, formData);
   
      } else {
    
      }

      // PASO 3: Crear pedido con método de envío
    
      const intPedido = await crearPedido(intCliente, intDireccion, formData, subtotal, costoEnvio, total);
      

      // ✅ Pedido guardado - actualizar estado
      setLoaderStates(prev => ({ ...prev, isSavingOrder: false }));

      // PASO 4: Iniciar pago con MercadoPago
      
      const pago = await iniciarPagoMercadoPago(
        intPedido, 
        intCliente, 
        intDireccion, 
        formData, 
        subtotal, 
        costoEnvio, 
        total
      );
      
      // Si hay redirect (Checkout Pro), la función nunca llega aquí
      // porque window.location.href redirige la página
      
      // ✅ Pago procesado - actualizar estado (solo para Checkout API)
      setLoaderStates(prev => ({ ...prev, isProcessing: false }));
      

      // Simular envío de emails (normalmente esto lo haría el backend)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoaderStates(prev => ({ ...prev, sendingMails: false }));

      // ⚠️ NO LIMPIAR CARRITO AQUÍ - Se limpiará después en la página de confirmación
      // limpiarCarrito();

      // Redirigir a página de confirmación
      router.push(`/pedido/confirmacion/${intPedido}`);
     // 
      return {
        success: true,
        intPedido,
        intPago: pago?.intPago, // Usar optional chaining por si pago es undefined
      };
    } catch (error: any) {
      console.error("❌ Error al finalizar compra:", error);
      setError(error.message || "Error al procesar la compra");
      
      // Resetear estados de loading en caso de error
      setLoaderStates({
        isProcessing: false,
        isSavingOrder: false,
        sendingMails: false,
      });
      
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
    loaderStates,
    error,
  };
};
