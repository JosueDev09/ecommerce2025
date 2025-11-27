import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { detectCardType } from "@/utils/detectarTipoTarjeta";

export const useCheckoutForm = () => {
  const { user, isAuthenticated, isGuest } = useAuth();
  
  const [formData, setFormData] = useState({
    // Información de contacto
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    
    // Dirección de envío
    calle: "",
    numeroExterior: "",
    numeroInterior: "",
    colonia: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    referencias: "",
    
    // Método de envío
    metodoEnvio: "",
    
    // Método de pago
    metodoPago: "",
    
    // Tarjeta (si aplica)
    numeroTarjeta: "",
    nombreTarjeta: "",
    fechaExpiracion: "",
    cvv: "",
    tipoTarjeta: "", // credito o debito
    mesesSinIntereses: "",
  });

  const [cardType, setCardType] = useState<"visa" | "mastercard" | "amex" | "unknown">("unknown");
  const [esTarjetaElegibleMSI, setEsTarjetaElegibleMSI] = useState(false);

  // Auto-completar datos del usuario cuando esté disponible
  useEffect(() => {
    
    
    if (isAuthenticated && !isGuest && user) {
              
      setFormData(prev => ({
        ...prev,
        nombre: user.strNombre || "",
        email: user.strCorreo || user.strUsuario || "",
        telefono: user.strTelefono || "",
      }));
    }
  }, [user, isAuthenticated, isGuest]);

  // Efecto para re-validar MSI cuando cambia el tipo de tarjeta (crédito/débito)
  useEffect(() => {
    if (formData.tipoTarjeta === "debito") {
      setEsTarjetaElegibleMSI(false);
      setFormData(prev => ({ ...prev, mesesSinIntereses: "" }));
    } else if (formData.tipoTarjeta === "credito" && formData.numeroTarjeta) {
      const numeros = formData.numeroTarjeta.replace(/\s/g, "");
      if ((cardType === "visa" || cardType === "mastercard") && numeros.length >= 8) {
        setEsTarjetaElegibleMSI(true);
      }
    }
  }, [formData.tipoTarjeta, formData.numeroTarjeta, cardType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Formateo especial para número de tarjeta (agregar espacios cada 4 dígitos)
    if (name === "numeroTarjeta") {
      const numeros = value.replace(/\s/g, "").replace(/\D/g, "");
      
      // Limitar a 16 dígitos (o 19 para Amex)
      const maxDigitos = 19;
      const numeroLimitado = numeros.slice(0, maxDigitos);
      
      // Formatear con espacios cada 4 dígitos
      const formateado = numeroLimitado.match(/.{1,4}/g)?.join(" ") || numeroLimitado;
      
     
      
      setFormData(prev => ({ ...prev, [name]: formateado }));
      // Detectar tipo de tarjeta
      const tipoTarjeta = detectCardType(formateado);
      setCardType(tipoTarjeta);
      
      // Verificar si la tarjeta es elegible para MSI (Visa y Mastercard participantes)
      // Simulamos que tarjetas que empiezan con ciertos números son participantes
      const primerDigito = numeroLimitado.charAt(0);
      const segundoDigito = numeroLimitado.charAt(1);
      
      // Visa (empiezan con 4) y Mastercard (empiezan con 5) son elegibles
      // Simulamos que si el número es mayor a 8 dígitos, es participante
      // PERO solo si es tarjeta de CRÉDITO
      if ((tipoTarjeta === "visa" || tipoTarjeta === "mastercard") && 
          numeroLimitado.length >= 8 && 
          formData.tipoTarjeta === "credito") {
        setEsTarjetaElegibleMSI(true);
      } else {
        setEsTarjetaElegibleMSI(false);
        setFormData(prev => ({ ...prev, mesesSinIntereses: "" }));
      }
      return;
    }
    
    // Formateo para fecha de expiración (MM/AA)
    if (name === "fechaExpiracion") {
      const numeros = value.replace(/\D/g, "");
      let formateado = numeros;
      if (numeros.length >= 2) {
        formateado = numeros.slice(0, 2) + "/" + numeros.slice(2, 4);
      }
      setFormData(prev => ({ ...prev, [name]: formateado }));
      return;
    }
    
    // Formateo para CVV (solo números)
    if (name === "cvv") {
      const numeros = value.replace(/\D/g, "");
      setFormData(prev => ({ ...prev, [name]: numeros }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return {
    formData,
    setFormData,
    cardType,
    esTarjetaElegibleMSI,
    handleInputChange,
  };
};
