import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import RevealLayer from "./RevealLayer";

// RUTA BASE: src/assets/images/hero-base.webp
// Imagen principal del producto / hero. Reemplaza este archivo por tu foto
// real (misma ruta y nombre); esta importación no necesita cambiar.
import heroBase from "../assets/images/hero-base.webp";

// RUTA REVEAL: src/assets/images/hero-reveal.webp
// Imagen detallada / estampado que se revela al mover el cursor.
// Reemplaza este archivo por tu foto real; esta importación no necesita cambiar.
import heroReveal from "../assets/images/hero-reveal.webp";

export default function Hero() {
  // Posición cruda del mouse (sin suavizar) y posición suavizada (con lerp)
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number | undefined>(undefined);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const loop = () => {
      // Suavizado por interpolación lineal (lerp): el círculo "persigue"
      // al cursor real en vez de saltar bruscamente a su posición.
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
      setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1B13] tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <section
        id="inicio"
        className="relative w-full overflow-hidden h-screen bg-[#0B1B13]"
        style={{ height: "100dvh" }}
      >
        {/* Imagen base (z-10) — RUTA BASE: src/assets/images/hero-base.webp */}
        <div
          className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat hero-zoom"
          style={{ backgroundImage: `url(${heroBase})` }}
        />

        {/* Capa de revelado (z-30): sigue al cursor con un spotlight circular suave.
            RUTA REVEAL: src/assets/images/hero-reveal.webp */}
        <RevealLayer image={heroReveal} cursorX={cursorPos.x} cursorY={cursorPos.y} />

        {/* Titular (z-50) */}
        <h1 className="absolute top-[14%] left-0 right-0 z-50 flex flex-col items-center text-center px-5 pointer-events-none text-white leading-[0.95]">
          <span
            className="hero-anim hero-reveal block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl"
            style={{ letterSpacing: "-0.05em", animationDelay: "0.25s" }}
          >
            Arte sostenible que
          </span>
          <span
            className="hero-anim hero-reveal block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1"
            style={{ letterSpacing: "-0.08em", animationDelay: "0.42s" }}
          >
            cuenta una historia
          </span>
        </h1>

        {/* Párrafo inferior izquierdo (z-50, solo desde sm) */}
        <div
          className="hero-anim hero-fade hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[280px] z-50"
          style={{ animationDelay: "0.7s" }}
        >
          <p className="text-sm text-white/90 leading-relaxed">
            Cambiamos el plástico de un solo uso por arte textil. Cada bolsa 100% algodón
            intervenida a mano está pensada para acompañarte años, no minutos.
          </p>
        </div>

        {/* Bloque inferior derecho (z-50) */}
        <div
          className="hero-anim hero-fade absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[280px] z-50 flex flex-col items-start gap-4 sm:gap-5"
          style={{ animationDelay: "0.85s" }}
        >
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Explora nuestra colección de tulas artesanales y personalizadas para destacar tu
            emprendimiento con un sello ecológico único.
          </p>
          <button className="bg-[#F04E29] hover:bg-[#d83f1d] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#F04E29]/30">
            Ir al Catálogo
          </button>
        </div>
      </section>
    </div>
  );
}
