import { useState } from "react";
import { Menu, X } from "lucide-react";

// RUTA LOGO: src/assets/images/logo.svg (isotipo de EcoPouch)
// Reemplaza el archivo logo.svg dentro de esa carpeta por el logo real;
// esta importación no necesita cambiar.
import logo from "../assets/images/logo.svg";

const ENLACES = [
  { label: "Inicio", href: "#inicio", activo: true },
  { label: "Catálogo", href: "#catalogo" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "EcoCoins", href: "#ecocoins" },
  { label: "Emprendimientos", href: "#emprendimientos" },
];

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      {/* Logo + wordmark */}
      <a href="#inicio" className="flex items-center gap-2">
        <img src={logo} alt="EcoPouch" className="h-8 w-8" />
        <span className="text-white text-2xl font-playfair italic">EcoPouch</span>
      </a>

      {/* Pill central de navegación (solo escritorio, md+) */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2 py-2 items-center gap-1">
        {ENLACES.map((enlace) => (
          <a
            key={enlace.label}
            href={enlace.href}
            className={`px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/20 hover:text-white transition-colors ${
              enlace.activo ? "text-white" : "text-white/80"
            }`}
          >
            {enlace.label}
          </a>
        ))}
      </div>

      {/* Botón Contacto (solo escritorio, md+) */}
      <button className="hidden md:block bg-[#96C040] text-[#0B1B13] text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#82a835] transition-colors">
        Contacto
      </button>

      {/* Botón hamburguesa (solo móvil, oculto en md+) */}
      <button
        className="md:hidden text-white p-2"
        aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuAbierto}
        onClick={() => setMenuAbierto((abierto) => !abierto)}
      >
        {menuAbierto ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Menú desplegable móvil */}
      {menuAbierto && (
        <div className="md:hidden absolute top-full left-0 right-0 mx-4 mt-2 bg-[#0B1B13]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-1 z-[100]">
          {ENLACES.map((enlace) => (
            <a
              key={enlace.label}
              href={enlace.href}
              onClick={() => setMenuAbierto(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors ${
                enlace.activo ? "text-white" : "text-white/80"
              }`}
            >
              {enlace.label}
            </a>
          ))}
          <button className="mt-2 bg-[#96C040] text-[#0B1B13] text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#82a835] transition-colors">
            Contacto
          </button>
        </div>
      )}
    </nav>
  );
}
