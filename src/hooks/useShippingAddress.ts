"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface ShippingAddress {
  intDireccion?: number;
  intCliente: number;
  strCalle: string;
  strNumeroExterior: string;
  strNumeroInterior?: string;
  strColonia: string;
  strCP: string;
  strCiudad: string;
  strEstado: string;
  strPais?: string;
  strReferencias?: string;
}

export function useShippingAddress() {
  const { user, isGuest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // 🔄 Cargar direcciones existentes del usuario
  useEffect(() => {
    if (user?.intCliente && !isGuest) {
      loadAddresses(user.intCliente);
    }
  }, [user, isGuest]);

  const loadAddresses = async (intCliente: number) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query ObtenerDirecciones($intCliente: Int!) {
              obtenerDireccionesCliente(intCliente: $intCliente) {
                intDireccion
                strCalle
                strNumeroExterior
                strNumeroInterior
                strColonia
                strCP
                strCiudad
                strEstado
                strPais
                strReferencias
              }
            }
          `,
          variables: { intCliente },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.log("📍 No se encontraron direcciones");
        setAddresses([]);
      } else if (result.data?.obtenerDireccionesCliente) {
        const loadedAddresses = result.data.obtenerDireccionesCliente;
        
        // Asegurar que sea un array
        const addressArray = Array.isArray(loadedAddresses) 
          ? loadedAddresses 
          : [loadedAddresses].filter(Boolean); // Convertir objeto único a array
        
        console.log("✅ Direcciones cargadas:", addressArray);
        setAddresses(addressArray);
        
        // Seleccionar la primera dirección por defecto
        if (addressArray.length > 0) {
          setSelectedAddressId(addressArray[0].intDireccion);
        }
      }
    } catch (err) {
      console.log("📍 Sin direcciones previas");
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async (addressData: Omit<ShippingAddress, "intDireccion" | "intCliente">, isNewAddress: boolean = false): Promise<ShippingAddress | null> => {
    if (!user?.intCliente && !isGuest) {
      setError("No hay usuario autenticado");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const intCliente = user?.intCliente || 0;

      // Si es una nueva dirección, siempre crear
      // Si está actualizando una existente, actualizar
      const mutation = !isNewAddress && selectedAddressId
        ? `
          mutation ActualizarDireccion($intDireccion: Int!, $data: DireccionInput!) {
            actualizarDireccion(intDireccion: $intDireccion, data: $data) {
              intDireccion
              strCalle
              strNumeroExterior
              strNumeroInterior
              strColonia
              strCP
              strCiudad
              strEstado
              strPais
              strReferencias
            }
          }
        `
        : `
          mutation CrearDireccion($data: DireccionInput!) {
            crearDireccion(data: $data) {
              intDireccion
              strCalle
              strNumeroExterior
              strNumeroInterior
              strColonia
              strCP
              strCiudad
              strEstado
              strPais
              strReferencias
            }
          }
        `;

      const variables = !isNewAddress && selectedAddressId
        ? {
            intDireccion: selectedAddressId,
            data: {
              intCliente,
              ...addressData,
            },
          }
        : {
            data: {
              intCliente,
              ...addressData,
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
        throw new Error(result.errors[0]?.message || "Error al guardar dirección");
      }

      const savedAddress = result.data?.crearDireccion || result.data?.actualizarDireccion;
      
      if (savedAddress) {
        console.log("✅ Dirección guardada:", savedAddress);
        
        // Recargar todas las direcciones
        if (user?.intCliente) {
          await loadAddresses(user.intCliente);
        }
        
        return savedAddress;
      }

      return null;
    } catch (err: any) {
      console.error("❌ Error al guardar dirección:", err);
      setError(err.message || "Error al guardar la dirección");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const selectAddress = (intDireccion: number) => {
    setSelectedAddressId(intDireccion);
  };

  const getSelectedAddress = (): ShippingAddress | null => {
    return addresses.find(addr => addr.intDireccion === selectedAddressId) || null;
  };

  return {
    loading,
    error,
    addresses,
    selectedAddressId,
    selectAddress,
    getSelectedAddress,
    saveAddress,
    hasAddresses: addresses.length > 0,
  };
}
