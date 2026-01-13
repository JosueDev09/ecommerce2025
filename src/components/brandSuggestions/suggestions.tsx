"use client"

import { motion, useScroll, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { useRef, useState } from "react";


const marcasSugeridas = [
  "YoungLA",
  "ALO Yoga",
];

export default function BrandSuggestions() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref });
    const yRange = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const [strMarca , setMarca] = useState("");   
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault();
        try {   

            //console.log("Enviando sugerencia de marca:", strMarca);
           const response = await fetch('http://localhost:3000/api/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                      mutation crearSugerenciaMarca($data: SugerenciaMarcaInput!) {
                        crearSugerenciaMarca(data:$data) {
                            strMarca
                        }
                    }
                    `,
                     variables: { data: { 
                        strMarca: strMarca } },
                }),
            });

            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }
            const data = await response.json();
            //console.log("Sugerencia enviada con éxito:", data);

            setMarca(""); // Limpiar el campo de entrada después de enviar
            setShowSuccess(true); // Mostrar el mensaje de éxito
            setTimeout(() => setShowSuccess(false), 3000); // Ocultar el mensaje después de 3 segundos
        } catch (error) {
            console.error("Error al enviar la sugerencia:", error);
        }

    };

    return (
         <section
            ref={ref}
            className="relative w-full py-20 md:py-32 bg-black overflow-hidden"
            >

        {showSuccess && (
            <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-8 right-8 z-[9999] bg-black/95 backdrop-blur-xl border border-white/20 shadow-2xl p-6 min-w-[320px]"
            >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 border border-white/30 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                <p className="font-[family-name:var(--font-playfair)] text-white text-base mb-1 tracking-tight">
                    Sugerencia enviada
                </p>
                <p className="font-[family-name:var(--font-inter)] text-xs text-white/60 tracking-wide">
                    La sugerencia ha sido enviada exitosamente
                </p>
                </div>
                <button 
                onClick={() => setShowSuccess(false)} 
                className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>
            {/* Línea de progreso */}
            <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3, ease: "linear" }}
                className="absolute bottom-0 left-0 h-[1px] bg-white/30"
            />
            </motion.div>
        )}
      <div className="relative max-w-7xl mx-auto px-6">
        {/* 🔹 Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-8"
          >
            <span className="text-white/50 font-[family-name:var(--font-inter)] text-xs tracking-[0.2em] uppercase">
              Sugerencias.
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-[family-name:var(--font-playfair)] text-white mb-6 leading-tight tracking-tight">
            Te gustaria realizar una sugerencia?{" "} <br/>
            
          </h2>
          <p className="text-white/60 font-[family-name:var(--font-inter)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Descubre las marcas que nuestra comunidad desea ver en ESYMBEL.
          </p>
        </motion.div>

         <div className="border-b border-white/10 pb-12 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-white mb-3 tracking-tight">
                 Agrega una sugerencia
                </h3>
                <p className="font-[family-name:var(--font-inter)] text-white/60 text-sm tracking-wide">
                  Aqui puede agregar la sugerencia de una marca que le gustaria que incluyamos en nuestra tienda.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        value={strMarca}
                        onChange={(e) => setMarca(e.target.value)}
                        placeholder="Nombre de la marca"
                        required
                        className="w-full px-0 py-3 bg-transparent border-b border-white/20 text-white text-sm tracking-wide focus:outline-none focus:border-white/60 placeholder:text-white/30"
                    />

                    {/* SUGERENCIAS */}
                    {strMarca.length === 0 && (
                        <div className="flex flex-wrap gap-2">
                        {marcasSugeridas.map((marca) => (
                            <button
                            key={marca}
                            type="button"
                            onClick={() => setMarca(marca)}
                            className="px-3 py-1.5 text-xs border border-white/20 text-white/80 rounded-full hover:border-white hover:text-white transition-all"
                            >
                            {marca}
                            </button>
                        ))}
                        </div>
                    )}
                        <button
                         type="submit"
                         className="px-6 py-3 bg-white text-black font-[family-name:var(--font-inter)] text-xs tracking-[0.15em] uppercase font-medium hover:bg-white/90 transition-all duration-300 whitespace-nowrap"
                        >
                         Agregar
                        </button>
                    </form>

            </div>
          </div>

  
      
      </div>
    </section>    
    
    );


}