import { obtenerSesion, cerrarSesion, requiereLogin } from "../../../utils/auth";
import { contarItems } from "../../../utils/carrito";
import type { Producto, Categoria } from "../../../types/index";
import productosData from "../../../data/productos.json";
import categoriasData from "../../../data/categorias.json";

// Proteger la página
requiereLogin();

const sesion = obtenerSesion();

// Cargar datos desde localStorage o JSON
function cargarProductos(): Producto[] {
  const guardado = localStorage.getItem("foodstore_productos");
  if (guardado) return JSON.parse(guardado) as Producto[];
  return productosData as Producto[];
}

function cargarCategorias(): Categoria[] {
  const guardado = localStorage.getItem("foodstore_categorias");
  if (guardado) return JSON.parse(guardado) as Categoria[];
  return categoriasData as Categoria[];
}

const productos: Producto[] = cargarProductos();
const categorias: Categoria[] = cargarCategorias();

let categoriaActiva: number | null = null;

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

// Renderizar categorías en el sidebar
function renderCategorias(): void {
  const lista = document.getElementById("lista-categorias");
  if (!lista) return;

  lista.innerHTML = `
    <li>
      <a href="#" class="${categoriaActiva === null ? "active" : ""}"
        data-id="todos">Todos los productos</a>
    </li>
    ${categorias
      .map(
        (cat) => `
      <li>
        <a href="#" class="${categoriaActiva === cat.id ? "active" : ""}"
          data-id="${cat.id}">— ${cat.nombre}</a>
      </li>
    `
      )
      .join("")}
  `;

  // Eventos de click en categorías
  lista.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = (e.currentTarget as HTMLElement).dataset.id;
      categoriaActiva = id === "todos" ? null : Number(id);
      renderCategorias();
      renderProductos();
    });
  });
}

// Filtrar y ordenar productos
function getProductosFiltrados(): Producto[] {
  const busqueda = (
    document.getElementById("input-busqueda") as HTMLInputElement
  ).value.toLowerCase();
  const orden = (document.getElementById("select-orden") as HTMLSelectElement)
    .value;
  const disponibilidad = (
    document.getElementById("select-disponibilidad") as HTMLSelectElement
  ).value;

  let resultado = [...productos];

  // Filtro por categoría
  if (categoriaActiva !== null) {
    resultado = resultado.filter((p) => p.categoriaId === categoriaActiva);
  }

  // Filtro por búsqueda
  if (busqueda) {
    resultado = resultado.filter(
      (p) =>
        p.nombre.toLowerCase().includes(busqueda) ||
        p.descripcion.toLowerCase().includes(busqueda)
    );
  }

  // Filtro por disponibilidad
  if (disponibilidad === "disponibles") {
    resultado = resultado.filter((p) => p.disponible);
  }

  // Ordenamiento
  if (orden === "nombre-asc") {
    resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } else if (orden === "nombre-desc") {
    resultado.sort((a, b) => b.nombre.localeCompare(a.nombre));
  } else if (orden === "precio-asc") {
    resultado.sort((a, b) => a.precio - b.precio);
  } else if (orden === "precio-desc") {
    resultado.sort((a, b) => b.precio - a.precio);
  }

  return resultado;
}

// Renderizar grid de productos
function renderProductos(): void {
  const grid = document.getElementById("grid-productos");
  const contador = document.getElementById("contador-productos");
  if (!grid) return;

  const productosFiltrados = getProductosFiltrados();

  if (contador) {
    contador.textContent = `${productosFiltrados.length} producto(s) encontrado(s)`;
  }

  if (productosFiltrados.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; color:#64748b;">
        No se encontraron productos
      </div>`;
    return;
  }

  grid.innerHTML = productosFiltrados
    .map(
      (p) => `
      <div class="producto-card" data-id="${p.id}">
        <img src="${p.imagen}" alt="${p.nombre}" />
        <div class="producto-card-body">
          <p class="producto-categoria">${p.categoriaNombre}</p>
          <p class="producto-nombre">${p.nombre}</p>
          <p class="producto-descripcion">${p.descripcion}</p>
          <div class="producto-footer">
            <span class="producto-precio">$${p.precio.toLocaleString("es-AR")}</span>
            <span class="${p.disponible ? "badge-disponible" : "badge-no-disponible"}">
              ${p.disponible ? "Disponible" : "No disponible"}
            </span>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  // Click en producto → ir al detalle
  grid.querySelectorAll(".producto-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = (card as HTMLElement).dataset.id;
      window.location.href = `/src/pages/store/productDetail/productDetail.html?id=${id}`;
    });
  });
}

// Eventos de búsqueda y filtros
document
  .getElementById("input-busqueda")
  ?.addEventListener("input", renderProductos);
document
  .getElementById("select-orden")
  ?.addEventListener("change", renderProductos);
document
  .getElementById("select-disponibilidad")
  ?.addEventListener("change", renderProductos);

// Cerrar sesión
document.getElementById("btn-cerrar-sesion")?.addEventListener("click", () => {
  cerrarSesion();
  window.location.href = "/src/pages/auth/login/login.html";
});

// Inicializar
renderCategorias();
renderProductos();