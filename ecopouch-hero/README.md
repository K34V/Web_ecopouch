# EcoPouch — Hero interactivo

Hero de pantalla completa con un spotlight que sigue al cursor y revela una
segunda imagen (el detalle/estampado artesanal) sobre la foto base. Hecho con
React 18 + TypeScript + Vite + Tailwind CSS + lucide-react.

## Instalar y correr en local

```bash
npm install
npm run dev
```

Abre la URL que muestra la terminal (por defecto http://localhost:5173).

## Dónde reemplazar tus assets

### Imágenes del hero (ya las tienes)
Reemplaza estos 3 archivos por los tuyos, **con el mismo nombre y ruta**
(así no hay que tocar ningún componente):

| Archivo actual (placeholder)              | Qué es                                          |
|--------------------------------------------|--------------------------------------------------|
| `src/assets/images/hero-base.webp`         | Foto base del hero (la que se ve normalmente)    |
| `src/assets/images/hero-reveal.webp`       | Foto de detalle/estampado que revela el cursor   |
| `src/assets/images/logo.svg`               | Isotipo de EcoPouch para la barra de navegación  |

Cada uno de estos también está marcado con un comentario `RUTA BASE:` /
`RUTA REVEAL:` / `RUTA LOGO:` directamente en el código
(`src/components/Hero.tsx`, `src/components/RevealLayer.tsx` y
`src/components/Navbar.tsx`) para que los encuentres rápido.

### Fuentes propias
Por defecto el proyecto carga Inter y Playfair Display desde Google Fonts.
Si vas a usar tus propios archivos de fuente, sigue las instrucciones en
`src/assets/fonts/LEEME.md` y en el comentario al inicio de `src/index.css`.

## Build para producción

```bash
npm run build
```

Esto genera la carpeta `dist/`, lista para desplegar en GitHub Pages, Netlify
o Vercel.

## Despliegue en Netlify
- Build command: `npm run build`
- Publish directory: `dist`
