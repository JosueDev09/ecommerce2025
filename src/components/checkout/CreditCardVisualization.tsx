"use client";

interface CreditCardVisualizationProps {
  formData: any;
  cardType: "visa" | "mastercard" | "amex" | "unknown";
}

export default function CreditCardVisualization({ formData, cardType }: CreditCardVisualizationProps) {
  return (
    <div className="relative max-w-sm mx-auto">
      <div className="w-full h-48 rounded-xl bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa] p-5 shadow-2xl relative overflow-hidden">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
        </div>

        {/* Chip de la tarjeta */}
        <div className="relative z-10">
          <div className="w-10 h-8 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded mb-3 shadow-md">
            <div className="grid grid-cols-2 gap-0.5 p-1 h-full">
              <div className="bg-yellow-600 rounded-sm"></div>
              <div className="bg-yellow-600 rounded-sm"></div>
              <div className="bg-yellow-600 rounded-sm"></div>
              <div className="bg-yellow-600 rounded-sm"></div>
            </div>
          </div>

          {/* Número de tarjeta */}
          <div className="text-white text-lg font-mono tracking-wider mb-4 mt-4">
            {formData.numeroTarjeta || "•••• •••• •••• ••••"}
          </div>

          {/* Nombre y fecha */}
          <div className="flex justify-between items-end">
            <div className="flex-1 min-w-0">
              <p className="text-white/60 text-[9px] uppercase mb-0.5 tracking-wide">Titular</p>
              <p className="text-white text-xs font-semibold uppercase tracking-wide truncate">
                {formData.nombreTarjeta || "NOMBRE APELLIDO"}
              </p>
            </div>
            <div className="text-right ml-4">
              <p className="text-white/60 text-[9px] uppercase mb-0.5 tracking-wide">Expira</p>
              <p className="text-white text-xs font-mono tracking-wide">
                {formData.fechaExpiracion || "MM/AA"}
              </p>
            </div>
          </div>

          {/* Logo dinámico según tipo de tarjeta */}
          <div className="absolute top-4 right-4">
            {cardType === "visa" && (
              <div className="text-white font-bold text-xl italic">VISA</div>
            )}
            {cardType === "mastercard" && (
              <div className="flex gap-0.5">
                <div className="w-7 h-7 rounded-full bg-red-500 opacity-80"></div>
                <div className="w-7 h-7 rounded-full bg-yellow-400 opacity-80 -ml-3"></div>
              </div>
            )}
            {cardType === "amex" && (
              <div className="text-white font-bold text-sm">
                <div>AMERICAN</div>
                <div className="text-xs">EXPRESS</div>
              </div>
            )}
            {cardType === "unknown" && (
              <div className="w-8 h-8 rounded border-2 border-white/30"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
