"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface PaymentCard {
  intTarjeta?: number;
  intCliente: number;
  strNumeroTarjeta: string; // Solo últimos 4 dígitos
  strNombreTarjeta: string;
  strTipoTarjeta: string; // visa, mastercard, amex
  strFechaExpiracion: string; // MM/YY
  datCreacion?: string;
}

export function usePaymentCards() {
  const { user, isGuest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // 🔄 Cargar tarjetas existentes del usuario
  useEffect(() => {
    if (user?.intCliente && !isGuest) {
      loadCards(user.intCliente);
    }
  }, [user, isGuest]);

  const loadCards = async (intCliente: number) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query ObtenerTarjetas($intCliente: Int!) {
              obtenerTarjetasCliente(intCliente: $intCliente) {
                intTarjeta
                strNumeroTarjeta
                strNombreTarjeta
                strTipoTarjeta
                strFechaExpiracion
                datCreacion
              }
            }
          `,
          variables: { intCliente },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.log("💳 No se encontraron tarjetas");
        setCards([]);
      } else if (result.data?.obtenerTarjetasCliente) {
        const loadedCards = result.data.obtenerTarjetasCliente;
        
        // Asegurar que sea un array
        const cardsArray = Array.isArray(loadedCards) 
          ? loadedCards 
          : [loadedCards].filter(Boolean);
        
        console.log("✅ Tarjetas cargadas:", cardsArray);
        setCards(cardsArray);
        
        // Seleccionar la primera tarjeta por defecto
        if (cardsArray.length > 0) {
          setSelectedCardId(cardsArray[0].intTarjeta);
        }
      }
    } catch (err) {
      console.log("💳 Sin tarjetas previas");
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const saveCard = async (
    cardData: Omit<PaymentCard, "intTarjeta" | "intCliente" | "datCreacion">,
    isNewCard: boolean = false
  ): Promise<PaymentCard | null> => {
    if (!user?.intCliente && !isGuest) {
      setError("No hay usuario autenticado");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const intCliente = user?.intCliente || 0;

      // Solo crear tarjetas nuevas, nunca actualizar por seguridad
      const mutation = `
        mutation CrearTarjeta($data: TarjetaInput!) {
          crearTarjeta(data: $data) {
            intTarjeta
            strNumeroTarjeta
            strNombreTarjeta
            strTipoTarjeta
            strFechaExpiracion
            datCreacion
          }
        }
      `;

      const variables = {
        data: {
          intCliente,
          strNumeroTarjeta: cardData.strNumeroTarjeta, // Solo últimos 4 dígitos
          strNombreTarjeta: cardData.strNombreTarjeta,
          strTipoTarjeta: cardData.strTipoTarjeta,
          strFechaExpiracion: cardData.strFechaExpiracion,
        },
      };

      const response = await fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Error al guardar tarjeta");
      }

      const savedCard = result.data?.crearTarjeta;
      
      if (savedCard) {
        console.log("✅ Tarjeta guardada:", savedCard);
        
        // Recargar todas las tarjetas
        if (user?.intCliente) {
          await loadCards(user.intCliente);
        }
        
        return savedCard;
      }

      return null;
    } catch (err: any) {
      console.error("❌ Error al guardar tarjeta:", err);
      setError(err.message || "Error al guardar la tarjeta");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const selectCard = (intTarjeta: number) => {
    setSelectedCardId(intTarjeta);
  };

  const getSelectedCard = (): PaymentCard | null => {
    return cards.find(card => card.intTarjeta === selectedCardId) || null;
  };

  const deleteCard = async (intTarjeta: number): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation EliminarTarjeta($intTarjeta: Int!) {
              eliminarTarjeta(intTarjeta: $intTarjeta)
            }
          `,
          variables: { intTarjeta },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Error al eliminar tarjeta");
      }

      // Recargar tarjetas
      if (user?.intCliente) {
        await loadCards(user.intCliente);
      }

      return true;
    } catch (err: any) {
      console.error("❌ Error al eliminar tarjeta:", err);
      setError(err.message || "Error al eliminar la tarjeta");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    cards,
    selectedCardId,
    selectCard,
    getSelectedCard,
    saveCard,
    deleteCard,
    hasCards: cards.length > 0,
  };
}
