// products.js
// Catálogo de EcoPouch. Cada bolsa es intervenida a mano en Cali, así que
// no hay dos piezas idénticas: las fotos reales deben reemplazar el campo
// "art" (hoy usa una paleta ilustrada como marcador visual de cada pieza).

const ECOPOUCH_PRODUCTS = [
  {
    id: "tortuaventura",
    name: "Tortuaventura",
    tagline: "Estampado inspirado en las tortugas del Pacífico",
    price: 27000,
    salePrice: 13490,
    art: { from: "#465E21", to: "#96C040" },
    tag: "Más vendida"
  },
  {
    id: "verano-sin-ti",
    name: "Un Verano Sin Ti",
    tagline: "Paleta cálida para los días largos de sol",
    price: 16990,
    salePrice: 13500,
    art: { from: "#FE9005", to: "#E39F35" },
    tag: null
  },
  {
    id: "bag-girlbom",
    name: "Bag-Girlbom",
    tagline: "Trazos pop intervenidos a mano",
    price: 16990,
    salePrice: 13200,
    art: { from: "#F04E29", to: "#FE9005" },
    tag: null
  },
  {
    id: "brand-eco",
    name: "Brand Eco",
    tagline: "El clásico de la casa, minimalista y versátil",
    price: 20990,
    salePrice: 14500,
    art: { from: "#195125", to: "#465E21" },
    tag: "Edición firma"
  },
  {
    id: "ssj-bag",
    name: "SSJ-Bag",
    tagline: "Línea de trazo grueso, edición limitada",
    price: 13900,
    salePrice: null,
    art: { from: "#96C040", to: "#E39F35" },
    tag: null
  },
  {
    id: "ziro-bag",
    name: "Ziro-Bag",
    tagline: "Íconos geométricos en verde bosque",
    price: 22900,
    salePrice: null,
    art: { from: "#E39F35", to: "#F04E29" },
    tag: "Nueva"
  }
];
