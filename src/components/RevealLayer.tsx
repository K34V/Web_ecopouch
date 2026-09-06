import { useEffect, useRef, useState } from "react";

// Radio del círculo de revelado, en píxeles.
const SPOTLIGHT_R = 260;

interface RevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
}

/**
 * Muestra `image` (la foto de detalle/estampado) solo dentro de un círculo
 * suave que sigue al cursor, usando un canvas oculto para generar la máscara
 * (mask-image) que se aplica a la capa visible.
 */
export default function RevealLayer({ image, cursorX, cursorY }: RevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maskUrl, setMaskUrl] = useState("");

  // Ajusta el tamaño del canvas oculto al del viewport (montaje + resize)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ajustarTamano = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    ajustarTamano();
    window.addEventListener("resize", ajustarTamano);
    return () => window.removeEventListener("resize", ajustarTamano);
  }, []);

  // Dibuja el gradiente radial ("spotlight") en la posición actual del cursor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradiente = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R);
    gradiente.addColorStop(0, "rgba(255,255,255,1)");
    gradiente.addColorStop(0.4, "rgba(255,255,255,1)");
    gradiente.addColorStop(0.6, "rgba(255,255,255,0.75)");
    gradiente.addColorStop(0.75, "rgba(255,255,255,0.4)");
    gradiente.addColorStop(0.88, "rgba(255,255,255,0.12)");
    gradiente.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradiente;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    setMaskUrl(canvas.toDataURL());
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Canvas oculto: nunca es visible, solo genera la máscara */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: "none" }} />

      {/* RUTA REVEAL: src/assets/images/hero-reveal.webp
          (imagen de detalle/estampado que se revela al mover el cursor).
          Reemplaza ese archivo por tu foto real; esta capa no necesita cambios. */}
      <div
        className="absolute inset-0 z-30 bg-center bg-cover bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${image})`,
          WebkitMaskImage: maskUrl ? `url(${maskUrl})` : undefined,
          maskImage: maskUrl ? `url(${maskUrl})` : undefined,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      />
    </>
  );
}
