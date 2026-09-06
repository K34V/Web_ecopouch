// app.js
// Lógica compartida de EcoPouch (index.html y catalogo.html):
// preloader, menú móvil, animaciones al hacer scroll, catálogo con
// búsqueda/filtros/vista rápida, carrito persistente y calculadora EcoCoins.

const WHATSAPP_NUMERO = "573215656425";
const CLAVE_CARRITO = "ecopouch_carrito";

// TODO: reemplazar por la cifra real de bolsas plásticas evitadas
// (por ejemplo: unidades vendidas x factor de reemplazo estimado).
const META_CONTADOR_BOLSAS = 3200;

const formatoCOP = (valor) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);

function buscarProducto(id) {
  return ECOPOUCH_PRODUCTS.find((p) => p.id === id);
}

/* ============================================================
   PRELOADER
   ============================================================ */

function ocultarPreloader() {
  const preloader = document.getElementById("preloader");
  if (preloader) preloader.classList.add("oculto");
}

document.addEventListener("DOMContentLoaded", () => {
  // Se muestra al menos 1.2s para que la animación se perciba,
  // sin bloquear el resto de la carga de la página.
  setTimeout(ocultarPreloader, 1200);
});

/* ============================================================
   MENÚ MÓVIL (capa de pantalla completa)
   ============================================================ */

const navPrincipal = document.getElementById("navPrincipal");
const botonMenu = document.getElementById("botonMenu");
const cerrarNavBoton = document.getElementById("cerrarNav");

function abrirNav() {
  if (!navPrincipal) return;
  navPrincipal.classList.add("activo");
  navPrincipal.setAttribute("aria-hidden", "false");
  botonMenu?.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden"; // evita scroll de fondo con el menú abierto
  cerrarCarrito(); // el menú y el carrito nunca se muestran a la vez
}

function cerrarNav() {
  if (!navPrincipal) return;
  navPrincipal.classList.remove("activo");
  navPrincipal.setAttribute("aria-hidden", "true");
  botonMenu?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

botonMenu?.addEventListener("click", abrirNav);
cerrarNavBoton?.addEventListener("click", cerrarNav);

// Obligatorio: al tocar cualquier enlace del menú, se cierra de inmediato
// para mostrar el contenido seleccionado sin estorbar la pantalla.
navPrincipal?.querySelectorAll("a").forEach((enlace) => {
  enlace.addEventListener("click", cerrarNav);
});

/* ============================================================
   ANIMACIONES AL HACER SCROLL (IntersectionObserver)
   ============================================================ */

const observadorRevelado = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observadorRevelado.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

function observarRevelado(raiz = document) {
  raiz.querySelectorAll(".reveal-up, .reveal-scale").forEach((el) => {
    if (!el.classList.contains("visible")) observadorRevelado.observe(el);
  });
}

/* ============================================================
   CARRITO
   ============================================================ */

function leerCarrito() {
  try {
    const datos = localStorage.getItem(CLAVE_CARRITO);
    return datos ? JSON.parse(datos) : {};
  } catch (e) {
    return {};
  }
}

function guardarCarrito(carritoActual) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carritoActual));
}

let carrito = leerCarrito();

function agregarAlCarrito(id) {
  carrito[id] = (carrito[id] || 0) + 1;
  guardarCarrito(carrito);
  actualizarBadge();
  renderCarrito();
  mostrarToast(`${buscarProducto(id).name} añadida al carrito 🌿`);
}

function cambiarCantidad(id, delta) {
  const nuevaCantidad = (carrito[id] || 0) + delta;
  if (nuevaCantidad <= 0) {
    delete carrito[id];
  } else {
    carrito[id] = nuevaCantidad;
  }
  guardarCarrito(carrito);
  actualizarBadge();
  renderCarrito();
}

function quitarDelCarrito(id) {
  delete carrito[id];
  guardarCarrito(carrito);
  actualizarBadge();
  renderCarrito();
}

function totalUnidades() {
  return Object.values(carrito).reduce((suma, cant) => suma + cant, 0);
}

function calcularSubtotal() {
  return Object.entries(carrito).reduce((suma, [id, cant]) => {
    const producto = buscarProducto(id);
    if (!producto) return suma;
    const precio = producto.salePrice != null ? producto.salePrice : producto.price;
    return suma + precio * cant;
  }, 0);
}

function actualizarBadge() {
  const badge = document.getElementById("badgeCarrito");
  if (badge) badge.textContent = totalUnidades();
}

function renderCarrito() {
  const lista = document.getElementById("listaCarrito");
  if (!lista) return;
  const ids = Object.keys(carrito);

  if (ids.length === 0) {
    lista.innerHTML = `<p class="carrito-vacio">Tu carrito está vacío por ahora.<br>¡Elige tu bolsa favorita! 🌱</p>`;
  } else {
    lista.innerHTML = ids.map((id) => {
      const producto = buscarProducto(id);
      if (!producto) return "";
      const precio = producto.salePrice != null ? producto.salePrice : producto.price;
      return `
        <div class="item-carrito">
          <!-- RUTA PRODUCTO: assets/images/bolsa-${id}.png -->
          <div class="item-carrito__arte" style="background:linear-gradient(150deg, ${producto.art.from}, ${producto.art.to});"></div>
          <div class="item-carrito__texto">
            <p class="item-carrito__nombre">${producto.name}</p>
            <p class="item-carrito__precio">${formatoCOP(precio)}</p>
            <div class="item-carrito__cantidad">
              <button aria-label="Restar unidad de ${producto.name}" data-accion="restar" data-id="${id}">−</button>
              <span>${carrito[id]}</span>
              <button aria-label="Sumar unidad de ${producto.name}" data-accion="sumar" data-id="${id}">+</button>
            </div>
          </div>
          <button class="item-carrito__quitar" aria-label="Eliminar ${producto.name} del carrito" data-accion="quitar" data-id="${id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
          </button>
        </div>`;
    }).join("");

    lista.querySelectorAll("[data-accion]").forEach((el) => {
      el.addEventListener("click", () => {
        const { accion, id } = el.dataset;
        if (accion === "sumar") cambiarCantidad(id, 1);
        if (accion === "restar") cambiarCantidad(id, -1);
        if (accion === "quitar") quitarDelCarrito(id);
      });
    });
  }

  const subtotalEl = document.getElementById("subtotalCarrito");
  if (subtotalEl) subtotalEl.textContent = formatoCOP(calcularSubtotal());
}

const overlayCarrito = document.getElementById("overlayCarrito");
const panelCarrito = document.getElementById("panelCarrito");

function abrirCarrito() {
  if (!panelCarrito) return;
  renderCarrito();
  overlayCarrito?.classList.add("visible");
  panelCarrito.classList.add("visible");
  cerrarNav(); // el carrito y el menú nunca se muestran a la vez
}

function cerrarCarrito() {
  overlayCarrito?.classList.remove("visible");
  panelCarrito?.classList.remove("visible");
}

document.getElementById("botonCarrito")?.addEventListener("click", abrirCarrito);
document.getElementById("cerrarCarrito")?.addEventListener("click", cerrarCarrito);
overlayCarrito?.addEventListener("click", cerrarCarrito);

/* ---------- Checkout ---------- */

function construirMensajeWhatsapp() {
  const ids = Object.keys(carrito);
  if (ids.length === 0) return null;

  const lineas = ids.map((id) => {
    const producto = buscarProducto(id);
    const precio = producto.salePrice != null ? producto.salePrice : producto.price;
    return `• ${producto.name} x${carrito[id]} — ${formatoCOP(precio * carrito[id])}`;
  });

  return [
    "¡Hola EcoPouch! 🌿 Quiero hacer este pedido:",
    "",
    ...lineas,
    "",
    `Subtotal: ${formatoCOP(calcularSubtotal())}`,
    "",
    "Quedo atento(a) para coordinar el pago y la entrega. ¡Gracias!"
  ].join("\n");
}

document.getElementById("botonPagoWhatsapp")?.addEventListener("click", () => {
  const mensaje = construirMensajeWhatsapp();
  if (!mensaje) {
    mostrarToast("Tu carrito está vacío todavía 🌱");
    return;
  }
  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank", "noopener");
});

document.getElementById("botonPagoOnline")?.addEventListener("click", () => {
  if (totalUnidades() === 0) {
    mostrarToast("Tu carrito está vacío todavía 🌱");
    return;
  }
  // TODO: integrar el checkout real de Wompi (Web Checkout / Widget) aquí,
  // usando la llave pública del comercio y el subtotal calculado arriba.
  mostrarToast("Conectando con la pasarela de pago segura...");
});

/* ---------- Toast ---------- */

let temporizadorToast = null;
function mostrarToast(texto) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = texto;
  toast.classList.add("visible");
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => toast.classList.remove("visible"), 2600);
}

/* ============================================================
   TARJETAS DE PRODUCTO (uso compartido Home / Catálogo)
   ============================================================ */

function crearArteSVG() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="#F9F8F3" stroke-width="1.5" class="tarjeta-producto__silueta">
      <path d="M6 8h12l1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L6 8Z"/>
      <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
    </svg>`;
}

function tarjetaProductoHTML(producto, index) {
  const tieneOferta = producto.salePrice != null;
  const descuento = tieneOferta ? Math.round(100 - (producto.salePrice / producto.price) * 100) : 0;
  const colorBadge = producto.badge === "NUEVO" ? "var(--naranja-vibrante)" : "var(--verde-lima)";
  const retrasoFloat = (index % 4) * 0.3;

  return `
    <article class="tarjeta-producto reveal-scale" data-id="${producto.id}" data-coleccion="${producto.coleccion}">
      <!-- RUTA PRODUCTO: assets/images/bolsa-${producto.id}.png -->
      <div class="tarjeta-producto__media float-groovy" style="animation-delay:${retrasoFloat}s;">
        <div class="tarjeta-producto__arte" style="background:linear-gradient(150deg, ${producto.art.from}, ${producto.art.to});">
          ${crearArteSVG()}
        </div>
        ${producto.badge ? `<span class="tarjeta-producto__badge" style="background:${colorBadge}; color:var(--verde-bosque);">${producto.badge}</span>` : ""}
        ${tieneOferta ? `<span class="tarjeta-producto__badge tarjeta-producto__badge--oferta">OFERTA -${descuento}%</span>` : ""}
        <button class="tarjeta-producto__vista-rapida" data-accion="vista-rapida" data-id="${producto.id}" aria-label="Vista rápida de ${producto.name}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
      <h3 class="tarjeta-producto__nombre">${producto.name}</h3>
      <p class="tarjeta-producto__tagline">${producto.tagline}</p>
      <div class="tarjeta-producto__precios">
        ${tieneOferta ? `<span class="precio-original">${formatoCOP(producto.price)}</span>` : ""}
        <span class="precio-oferta">${formatoCOP(tieneOferta ? producto.salePrice : producto.price)}</span>
      </div>
      <button class="tarjeta-producto__cta" data-accion="agregar" data-id="${producto.id}">
        Añadir al carrito
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </article>`;
}

function activarBotonesDeTarjetas(contenedor) {
  contenedor.querySelectorAll('[data-accion="agregar"]').forEach((boton) => {
    boton.addEventListener("click", () => agregarAlCarrito(boton.dataset.id));
  });
  contenedor.querySelectorAll('[data-accion="vista-rapida"]').forEach((boton) => {
    boton.addEventListener("click", () => abrirVistaRapida(boton.dataset.id));
  });
}

/* ---------- Home: productos destacados ---------- */

function renderDestacados() {
  const contenedor = document.getElementById("gridDestacados");
  if (!contenedor) return;
  const destacados = ECOPOUCH_PRODUCTS.filter((p) => p.destacado);
  contenedor.innerHTML = destacados.map((p, i) => tarjetaProductoHTML(p, i)).join("");
  activarBotonesDeTarjetas(contenedor);
  observarRevelado(contenedor);
}

/* ---------- Catálogo completo: búsqueda + filtros ---------- */

const gridCatalogo = document.getElementById("gridCatalogo");
const buscadorProductos = document.getElementById("buscadorProductos");
const filtrosColeccion = document.getElementById("filtrosColeccion");
const catalogoVacio = document.getElementById("catalogoVacio");

let filtroActivo = "Todas";

function renderFiltros() {
  if (!filtrosColeccion) return;
  const colecciones = ["Todas", ...new Set(ECOPOUCH_PRODUCTS.map((p) => p.coleccion))];
  filtrosColeccion.innerHTML = colecciones.map((c) => `
    <button class="filtro-chip ${c === filtroActivo ? "activo" : ""}" data-coleccion="${c}">${c}</button>
  `).join("");

  filtrosColeccion.querySelectorAll(".filtro-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      filtroActivo = chip.dataset.coleccion;
      renderFiltros();
      renderCatalogoCompleto();
    });
  });
}

function renderCatalogoCompleto() {
  if (!gridCatalogo) return;
  const termino = (buscadorProductos?.value || "").trim().toLowerCase();

  const productosFiltrados = ECOPOUCH_PRODUCTS.filter((p) => {
    const coincideColeccion = filtroActivo === "Todas" || p.coleccion === filtroActivo;
    const coincideBusqueda = p.name.toLowerCase().includes(termino) || p.tagline.toLowerCase().includes(termino);
    return coincideColeccion && coincideBusqueda;
  });

  gridCatalogo.innerHTML = productosFiltrados.map((p, i) => tarjetaProductoHTML(p, i)).join("");
  activarBotonesDeTarjetas(gridCatalogo);
  observarRevelado(gridCatalogo);

  if (catalogoVacio) catalogoVacio.hidden = productosFiltrados.length > 0;
}

buscadorProductos?.addEventListener("input", renderCatalogoCompleto);

/* ---------- Modal de Vista Rápida (catalogo.html) ---------- */

const overlayModal = document.getElementById("overlayModal");
let productoEnVistaRapida = null;

function abrirVistaRapida(id) {
  if (!overlayModal) return;
  const producto = buscarProducto(id);
  if (!producto) return;
  productoEnVistaRapida = id;

  const tieneOferta = producto.salePrice != null;
  document.getElementById("modalMedia").style.background = `linear-gradient(150deg, ${producto.art.from}, ${producto.art.to})`;
  document.getElementById("modalMedia").innerHTML = crearArteSVG().replace('class="tarjeta-producto__silueta"', 'style="width:34%; opacity:0.9;"');
  document.getElementById("modalNombre").textContent = producto.name;
  document.getElementById("modalTagline").textContent = producto.tagline;
  document.getElementById("modalPrecios").innerHTML = `
    ${tieneOferta ? `<span class="precio-original">${formatoCOP(producto.price)}</span>` : ""}
    <span class="precio-oferta">${formatoCOP(tieneOferta ? producto.salePrice : producto.price)}</span>`;

  overlayModal.classList.add("visible");
}

function cerrarVistaRapida() {
  overlayModal?.classList.remove("visible");
  productoEnVistaRapida = null;
}

document.getElementById("cerrarModal")?.addEventListener("click", cerrarVistaRapida);
overlayModal?.addEventListener("click", (e) => {
  if (e.target === overlayModal) cerrarVistaRapida();
});
document.getElementById("modalAgregar")?.addEventListener("click", () => {
  if (productoEnVistaRapida) {
    agregarAlCarrito(productoEnVistaRapida);
    cerrarVistaRapida();
  }
});

/* ============================================================
   CALCULADORA ECOCOINS (Home)
   ============================================================ */

const TASA_COINS_POR_BOLSA = 4; // coins ganados por cada bolsa evitada, por semana
const SEMANAS_POR_MES = 4;

function nivelDescuento(coins) {
  if (coins >= 300) return { texto: "Desbloqueas 15% de descuento + envío gratis" };
  if (coins >= 150) return { texto: "Desbloqueas 10% de descuento en tu próxima compra" };
  if (coins >= 50) return { texto: "Desbloqueas 5% de descuento en tu próxima compra" };
  return { texto: "Sigue sumando bolsas evitadas para desbloquear tu primer descuento" };
}

const sliderBolsas = document.getElementById("sliderBolsas");

function actualizarCalculadora() {
  if (!sliderBolsas) return;
  const bolsas = Number(sliderBolsas.value);
  const coins = bolsas * TASA_COINS_POR_BOLSA * SEMANAS_POR_MES;
  const nivel = nivelDescuento(coins);

  document.getElementById("valorBolsas").textContent = bolsas;
  document.getElementById("resultadoMonedas").textContent = coins;
  document.getElementById("resultadoDescuento").textContent = nivel.texto;
}

sliderBolsas?.addEventListener("input", actualizarCalculadora);

/* ============================================================
   CONTADOR ANIMADO (Home)
   ============================================================ */

function animarContador() {
  const elemento = document.getElementById("contadorBolsas");
  if (!elemento) return;
  const duracion = 1600;
  const inicio = performance.now();

  function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    const valorActual = Math.floor(progreso * META_CONTADOR_BOLSAS);
    elemento.textContent = valorActual.toLocaleString("es-CO");
    if (progreso < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

const contadorEl = document.getElementById("contadorBolsas");
if (contadorEl) {
  const observadorContador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        animarContador();
        observadorContador.disconnect();
      }
    });
  });
  observadorContador.observe(contadorEl);
}

/* ============================================================
   INICIO
   ============================================================ */

renderDestacados();       // no-op si no existe #gridDestacados (catalogo.html)
renderFiltros();          // no-op si no existe #filtrosColeccion (index.html)
renderCatalogoCompleto(); // no-op si no existe #gridCatalogo (index.html)
actualizarBadge();
actualizarCalculadora();  // no-op si no existe #sliderBolsas (catalogo.html)
observarRevelado();       // activa reveal-up / reveal-scale ya presentes en el HTML estático
