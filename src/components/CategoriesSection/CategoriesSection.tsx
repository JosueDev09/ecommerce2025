"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";




export default function Categories() {
  const ref = useRef<HTMLDivElement>(null);
  const [categorias, setCategorias] = useState<{ intCategoria: number; strNombre: string; strImagen: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                obtenerCategorias {
                  intCategoria
                  strNombre
                  strImagen
                }
              }
            `,
          }),
        });
        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }
        const data = await response.json();
       // console.log('Fetched categories:', data.data.obtenerCategorias);
        setCategorias(data.data.obtenerCategorias);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategorias();

  }, []);

  // Reproducción automática
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % categorias.length;
        goTo(nextIndex);
        return nextIndex;
      });
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [isPaused]);


  // detectar qué slide está centrado
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const slideWidth = el.clientWidth * 0.75; // cada slide ocupa 75%
    const newIndex = Math.round(el.scrollLeft / (slideWidth + 24));
    setIndex(newIndex);
  };

  const goTo = (i: number) => {
    const el = containerRef.current;
    if (!el) return;
    const slideWidth = el.clientWidth * 0.75;
    el.scrollTo({
      left: i * (slideWidth + 24),
      behavior: "smooth"
    });
  };



  return (
    <section className="w-full bg-white py-12">

      <div className="w-full">
        {/* SCROLLER */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="
            flex gap-6 
            overflow-x-hidden scroll-smooth 
            px-6
            snap-x snap-mandatory
            scrollbar-none
          "
          style={{ height: "500px" }}
        >
          {categorias.map((s, i) => (
            <div
              key={i}
              className={`
                relative flex-shrink-0 
                snap-center 
                rounded-2xl overflow-hidden 
                shadow-lg
                transition-all duration-500
                ${i === index ? "blur-0 scale-100 opacity-100" : "blur-sm scale-95 opacity-60"}
              `}
              style={{
                width: "75vw",
                height: "100%",
                backgroundImage: `url(${s.strImagen})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

              <div className="absolute bottom-6 left-6 text-white">
                <button className="bg-white text-black font-semibold px-5 py-2 rounded-full">
                  Ver ahora
                </button>
                <p className="mt-2 text-sm opacity-90">
                  <b>{s.strNombre}</b> — {s.strNombre}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* DOTS - Debajo del carrusel */}
        <div className="flex justify-center items-center mt-6 gap-2">
          {categorias.map((_, i) => (
            <span 
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full cursor-pointer transition-all duration-300
                ${i === index ? "bg-black w-6 h-2" : "bg-black/30 w-2 h-2 hover:bg-black/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}