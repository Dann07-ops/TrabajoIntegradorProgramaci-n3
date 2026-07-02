import { obtenerSesion, cerrarSesion, requiereLogin } from "../../../utils/auth";
import { agregarAlCarrito, contarItems } from "../../../utils/carrito";
import type { Producto } from "../../../types/index";
import productosData from "../../../data/productos.json";

// Proteger la página
requiereLogin();

const sesion = obtenerSesion();

// Cargar productos desde localStorage o JSON
function cargarProductos(): Producto[] {
  const guardado = localStorage.getItem("foodstore_productos");
  if (guardado) return JSON.parse(guardado) as Producto[];
  return productosData as Producto[];
}

const productos: Producto[] = cargarProductos();

// Mostrar nombre del usuario
const spanNombre = document.getElementById("usuario-nombre");
if (spanNombre && sesion) {
  spanNombre.textContent = `${sesion.nombre} ${sesion.apellido}`;
}

// Badge del carrito
function actualizarBadgeCarrito(): void {
  const badge = document.getElementById("carrito-badge");
  if (!badge) return;
  const total = contarItems();
  if (total > 0) {
    badge.textContent = String(total);
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

actualizarBadgeCarrito();

// Obtener id del producto desde la URL
const params = new URLSearchParams(window.location.search);
const idProducto = Number(params.get("id"));
const producto = productos.find((p) => p.id === idProducto);

const container = document.getElementById("detalle-container");

if (!container) {
  throw new Error("No se encontró el contenedor");
}

if (!producto) {
  container.innerHTML = `
    <div style="padding:2rem; text-align:center; color:#64748b;">
      Producto no encontrado.
      <br/>
      <a href="/src/pages/store/home/home.html"
         style="color:#ff6b35;">Volver al catálogo</a>
    </div>`;
} else {
  let cantidad = 1;

  container.innerHTML = `
    <img src="${producto.imagen}"
         alt="${producto.nombre}"
         class="detalle-imagen" />
    <div class="detalle-info">
      <p class="detalle-categoria">${producto.categoriaNombre}</p>
      <h1 class="detalle-nombre">${producto.nombre}</h1>
      <p class="detalle-precio">$${producto.precio.toLocaleString("es-AR")}</p>
      <span class="${producto.disponible ? "badge-disponible" : "badge-no-disponible"}">
        ${producto.disponible ? `Disponible (Stock: ${producto.stock})` : "No disponible"}
      </span>
      <p class="detalle-descripcion">${producto.descripcion}</p>

      ${
        producto.disponible && producto.stock > 0
          ? `
        <div class="cantidad-selector">
          <label>Cantidad:</label>
          <div class="cantidad-controls">
            <button class="btn-cantidad" id="btn-menos">−</button>
            <span class="cantidad-valor" id="cantidad-valor">1</span>
            <button class="btn-cantidad" id="btn-mas">+</button>
          </div>
        </div>
        <div id="mensaje" class="hidden"></div>
        <div class="detalle-acciones">
          <button id="btn-agregar" class="btn-primary">
            🛒 Agregar al Carrito
          </button>
          <button id="btn-volver" class="btn-secondary">← Volver</button>
        </div>
      `
          : `
        <div class="error-message">
          Este producto no está disponible actualmente
        </div>
        <button id="btn-volver" class="btn-secondary">← Volver</button>
      `
      }
    </div>
  `;

  // Botón volver
  document.getElementById("btn-volver")?.addEventListener("click", () => {
    window.history.back();
  });

  if (producto.disponible && producto.stock > 0) {
    const spanCantidad = document.getElementById("cantidad-valor");
    const mensajeDiv = document.getElementById("mensaje");

    // Botón menos
    document.getElementById("btn-menos")?.addEventListener("click", () => {
      if (cantidad > 1) {
        cantidad--;
        if (spanCantidad) spanCantidad.textContent = String(cantidad);
      }
    });

    // Botón más
    document.getElementById("btn-mas")?.addEventListener("click", () => {
      if (cantidad < producto.stock) {
        cantidad++;
        if (spanCantidad) spanCantidad.textContent = String(cantidad);
      } else {
        if (mensajeDiv) {
          mensajeDiv.textContent = `Stock máximo disponible: ${producto.stock}`;
          mensajeDiv.className = "error-message";
        }
      }
    });

    // Botón agregar al carrito
    document.getElementById("btn-agregar")?.addEventListener("click", () => {
      agregarAlCarrito(producto, cantidad);
      actualizarBadgeCarrito();
      if (mensajeDiv) {
        mensajeDiv.textContent = `✅ ${cantidad} x ${producto.nombre} agregado al carrito`;
        mensajeDiv.className = "mensaje-confirmacion";
      }
    });
  }
}

// Cerrar sesión
document.getElementById("btn-cerrar-sesion")?.addEventListener("click", () => {
  cerrarSesion();
  window.location.href = "/src/pages/auth/login/login.html";
});