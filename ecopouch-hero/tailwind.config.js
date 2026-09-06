/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta EcoPouch, disponible como bg-ecopouch-verde, etc. además
        // de los valores arbitrarios bg-[#...] usados directamente en el hero.
        ecopouch: {
          "verde-lima": "#96C040",
          "verde-bosque": "#195125",
          "verde-musgo": "#465E21",
          "naranja-coral": "#F04E29",
          "naranja-vibrante": "#FE9005",
          "ambar": "#E39F35",
          "fondo-oscuro": "#0B1B13",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        playfair: ["'Playfair Display'", "serif"],
      },
    },
  },
  plugins: [],
};
