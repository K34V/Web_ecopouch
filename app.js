// app.js
// Lógica de EcoPouch: catálogo, carrito persistente, calculadora EcoCoins
// y generación del mensaje de pedido por WhatsApp.

const WHATSAPP_NUMERO = "573202284029";
const CLAVE_CARRITO = "ecopouch_carrito";

// TODO: reemplazar por la cifra real de bolsas plásticas evitadas
// (por ejemplo: unidades vendidas x factor de reemplazo estimado).
const META_CONTADOR_BOLSAS = 3200;

const formatoCOP = (valor) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);

function buscarProducto(id) {
  return ECOPOUCH_PRODUCTS.find((p) => p.id === id);
}

function leerCarrito() {
  try {
    const datos = localStorage.getItem(CLAVE_CARRITO);
    return datos ? JSON.parse(datos) : {};
  } catch (e) {
    return {};
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

let carrito = leerCarrito();

/* ---------- Render de tarjetas de producto ---------- */

function crearArteSVG(producto) {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="#F9F8F3" stroke-width="1.5" class="tarjeta-producto__silueta">
      <path d="M6 8h12l1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L6 8Z"/>
      <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
    </svg>`;
}

function renderCatalogo() {
  const contenedor = document.getElementById("carruselProductos");
  contenedor.innerHTML = ECOPOUCH_PRODUCTS.map((producto) => {
    const tieneOferta = producto.salePrice != null;
    const descuento = tieneOferta
      ? Math.round(100 - (producto.salePrice / producto.price) * 100)
      : 0;

    return `
      <article class="tarjeta-producto" role="listitem">
        <div class="tarjeta-producto__media">
          <div class="tarjeta-producto__arte" style="background:linear-gradient(150deg, ${producto.art.from}, ${producto.art.to});">
            ${crearArteSVG(producto)}
          </div>
          ${producto.badge ? `<span class="tarjeta-producto__badge" style="background:${producto.badge === "NUEVO" ? "var(--naranja-vibrante)" : "var(--verde-lima)"}; color:${producto.badge === "NUEVO" ? "var(--verde-bosque)" : "var(--verde-bosque)"};">${producto.badge}</span>` : ""}
          ${tieneOferta ? `<span class="tarjeta-producto__badge tarjeta-producto__badge--oferta">OFERTA -${descuento}%</span>` : ""}
        </div>
        <h3 class="tarjeta-producto__nombre">${producto.name}</h3>
        <p class="tarjeta-producto__tagline">${producto.tagline}</p>
        <div class="tarjeta-producto__precios">
          ${tieneOferta ? `<span class="precio-original">${formatoCOP(producto.price)}</span>` : ""}
          <span class="precio-oferta">${formatoCOP(tieneOferta ? producto.salePrice : producto.price)}</span>
        </div>
        <button class="tarjeta-producto__cta" data-id="${producto.id}">
          Añadir al carrito
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </article>`;
  }).join("");

  contenedor.querySelectorAll(".tarjeta-producto__cta").forEach((boton) => {
    boton.addEventListener("click", () => agregarAlCarrito(boton.dataset.id));
  });
}

/* ---------- Carrito ---------- */

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
  document.getElementById("badgeCarrito").textContent = totalUnidades();
}

function renderCarrito() {
  const lista = document.getElementById("listaCarrito");
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

  document.getElementById("subtotalCarrito").textContent = formatoCOP(calcularSubtotal());
}

/* ---------- Apertura / cierre del panel ---------- */

const overlayCarrito = document.getElementById("overlayCarrito");
const panelCarrito = document.getElementById("panelCarrito");

function abrirCarrito() {
  renderCarrito();
  overlayCarrito.classList.add("visible");
  panelCarrito.classList.add("visible");
}

function cerrarCarrito() {
  overlayCarrito.classList.remove("visible");
  panelCarrito.classList.remove("visible");
}

document.getElementById("botonCarrito").addEventListener("click", abrirCarrito);
document.getElementById("cerrarCarrito").addEventListener("click", cerrarCarrito);
overlayCarrito.addEventListener("click", cerrarCarrito);

/* ---------- Menú móvil ---------- */

const navPrincipal = document.getElementById("navPrincipal");
const botonMenu = document.getElementById("botonMenu");

botonMenu.addEventListener("click", () => {
  const abierto = navPrincipal.classList.toggle("abierto");
  botonMenu.setAttribute("aria-expanded", abierto ? "true" : "false");
});

navPrincipal.querySelectorAll("a").forEach((enlace) => {
  enlace.addEventListener("click", () => {
    navPrincipal.classList.remove("abierto");
    botonMenu.setAttribute("aria-expanded", "false");
  });
});

/* ---------- Checkout ---------- */

function construirMensajeWhatsapp() {
  const ids = Object.keys(carrito);
  if (ids.length === 0) return null;

  const lineas = ids.map((id) => {
    const producto = buscarProducto(id);
    const precio = producto.salePrice != null ? producto.salePrice : producto.price;
    return `• ${producto.name} x${carrito[id]} — ${formatoCOP(precio * carrito[id])}`;
  });

  const mensaje = [
    "¡Hola EcoPouch! 🌿 Quiero hacer este pedido:",
    "",
    ...lineas,
    "",
    `Subtotal: ${formatoCOP(calcularSubtotal())}`,
    "",
    "Quedo atento(a) para coordinar el pago y la entrega. ¡Gracias!"
  ].join("\n");

  return mensaje;
}

document.getElementById("botonPagoWhatsapp").addEventListener("click", () => {
  const mensaje = construirMensajeWhatsapp();
  if (!mensaje) {
    mostrarToast("Tu carrito está vacío todavía 🌱");
    return;
  }
  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank", "noopener");
});

document.getElementById("botonPagoOnline").addEventListener("click", () => {
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
  toast.textContent = texto;
  toast.classList.add("visible");
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => toast.classList.remove("visible"), 2600);
}

/* ---------- Calculadora EcoCoins ---------- */

const TASA_COINS_POR_BOLSA = 4; // coins ganados por cada bolsa evitada, por semana
const SEMANAS_POR_MES = 4;

function nivelDescuento(coins) {
  if (coins >= 300) return { porcentaje: 15, texto: "Desbloqueas 15% de descuento + envío gratis" };
  if (coins >= 150) return { porcentaje: 10, texto: "Desbloqueas 10% de descuento en tu próxima compra" };
  if (coins >= 50) return { porcentaje: 5, texto: "Desbloqueas 5% de descuento en tu próxima compra" };
  return { porcentaje: 0, texto: "Sigue sumando bolsas evitadas para desbloquear tu primer descuento" };
}

const sliderBolsas = document.getElementById("sliderBolsas");

function actualizarCalculadora() {
  const bolsas = Number(sliderBolsas.value);
  const coins = bolsas * TASA_COINS_POR_BOLSA * SEMANAS_POR_MES;
  const nivel = nivelDescuento(coins);

  document.getElementById("valorBolsas").textContent = bolsas;
  document.getElementById("resultadoMonedas").textContent = coins;
  document.getElementById("resultadoDescuento").textContent = nivel.texto;
}

sliderBolsas.addEventListener("input", actualizarCalculadora);

/* ---------- Contador animado ---------- */

function animarContador() {
  const elemento = document.getElementById("contadorBolsas");
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

const observadorContador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      animarContador();
      observadorContador.disconnect();
    }
  });
});
observadorContador.observe(document.getElementById("contadorBolsas"));

/* ---------- Inicio ---------- */

renderCatalogo();
actualizarBadge();
actualizarCalculadora();
