import { useState } from "react";

export function aplicarPromocion() {

      const [promoCode, setPromoCode] = useState("");
      const [discount, setDiscount] = useState(0);
      const [promoApplied, setPromoApplied] = useState(false);
      const [showPromoSuccess, setShowPromoSuccess] = useState(false);
      const [showPromoError, setShowPromoError] = useState(false);

    const applyPromo = async () => {
                try {
                const response = await fetch("http://localhost:3000/api/graphql", {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                    query: `
                        query ($strCodigo: String!) {
                        obtenerDescuentoCodigo(strCodigo: $strCodigo) {
                            intDescuentoCodigo
                            strCodigo
                            intPorcentajeDescuento
                            datFechaInicio
                            datFechaFin
                            bolActivo                                
                        }
                        }
                    `,
                    variables: { strCodigo: promoCode },
                    }),
                });
                const result = await response.json();

                if (result.errors) {
                    setPromoApplied(false);
                    setDiscount(0);
                    setShowPromoError(true);
                    setShowPromoSuccess(false);
                    setTimeout(() => setShowPromoError(false), 3000);
                    return;
                }

                const descuento = result.data.obtenerDescuentoCodigo;
                setDiscount(descuento.intPorcentajeDescuento / 100);
                setPromoApplied(true);
                setShowPromoSuccess(true);
                setShowPromoError(false);
                setTimeout(() => setShowPromoSuccess(false), 3000);
                } catch (error) {
                console.error("Error al aplicar código de descuento:", error);
                setPromoApplied(false);
                setDiscount(0);
                setShowPromoError(true);
                setShowPromoSuccess(false);
                setTimeout(() => setShowPromoError(false), 3000);
                }
            };


            return {
                promoCode,
                setPromoCode,
                discount,
                promoApplied,
                showPromoSuccess,
                showPromoError,
                applyPromo,
            }
    

}