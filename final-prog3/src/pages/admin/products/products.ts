import { obtenerSesion, cerrarSesion, requiereAdmin } from "../../../utils/auth";
import type { Producto, Categoria } from "../../../types/index";
import productosData from "../../../data/productos.json";
import categoriasData from "../../../data/categorias.json";

requiereAdmin();

const sesion = obtenerSesion();

// Cargar productos y categorías
function cargarProductos(): Producto[] {
  const extra = localStorage.getItem("foodstore_productos");
  if (extra) return JSON.parse(extra) as Producto[];
  return productosData as Producto[];
}

function cargarCategorias(): Categoria[] {
  const extra = localStorage.getItem("foodstore_categorias");
  if (extra) return JSON.parse(extra) as Categoria[];
  return categoriasData as Categoria[];
}

function guardarProductos(prods: Producto[]): void {
  localStorage.setItem("foodstore_productos", JSON.stringify(prods));
}

let productos: Producto[] = cargarProductos();
let categorias: Categoria[] = cargarCategorias();
let editandoId: number | null = null;

// Mostrar nombre del usuario
const spanNombre = document.getElementById("usuario-nombre");
if (spanNombre && sesion) {
  spanNombre.textContent = `${sesion.nombre} ${sesion.apellido}`;
}

// Cargar categorías en el select del modal
function cargarSelectCategorias(): void {
  const select = document.getElementById("input-categoria") as HTMLSelectElement;
  if (!select) return;
  select.innerHTML = categorias
    .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
    .join("");
}

// Renderizar tabla
function renderTabla(): void {
  const tbody = document.getElementById("tabla-productos");
  if (!tbody) return;

  tbody.innerHTML = productos
    .map(
      (p) => `
      <tr>
        <td>${p.id}</td>
        <td>
          <img src="${p.imagen || "https://via.placeholder.com/50"}" 
               alt="${p.nombre}" />
        </td>
        <td>${p.nombre}</td>
        <td>$${p.precio.toLocaleString("es-AR")}</td>
        <td>${p.categoriaNombre}</td>
        <td>${p.stock}</td>
        <td>
          <span class="${p.disponible ? "badge-disponible" : "badge-no-disponible"}">
            ${p.disponible ? "Disponible" : "No disponible"}
          </span>
        </td>
        <td>
          <button class="btn-editar" data-id="${p.id}">Editar</button>
          <button class="btn-eliminar" data-id="${p.id}">Eliminar</button>
        </td>
      </tr>
    `
    )
    .join("");

  // Eventos editar
  tbody.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const prod = productos.find((p) => p.id === id);
      if (!prod) return;
      editandoId = id;
      (document.getElementById("modal-titulo") as HTMLElement).textContent =
        "Editar Producto";
      (document.getElementById("input-nombre") as HTMLInputElement).value =
        prod.nombre;
      (document.getElementById(
        "input-descripcion"
      ) as HTMLInputElement).value = prod.descripcion;
      (document.getElementById("input-precio") as HTMLInputElement).value =
        String(prod.precio);
      (document.getElementById("input-stock") as HTMLInputElement).value =
        String(prod.stock);
      (document.getElementById("input-imagen") as HTMLInputElement).value =
        prod.imagen;
      (document.getElementById(
        "input-disponible"
      ) as HTMLSelectElement).value = String(prod.disponible);
      (document.getElementById(
        "input-categoria"
      ) as HTMLSelectElement).value = String(prod.categoriaId);
      abrirModal();
    });
  });

  // Eventos eliminar
  tbody.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number((btn as HTMLElement).dataset.id);
      if (confirm("¿Seguro que querés eliminar este producto?")) {
        productos = productos.filter((p) => p.id !== id);
        guardarProductos(productos);
        renderTabla();
      }
    });
  });
}

// Modal
function abrirModal(): void {
  cargarSelectCategorias();
  document.getElementById("modal-overlay")?.classList.remove("hidden");
}

function cerrarModal(): void {
  document.getElementById("modal-overlay")?.classList.add("hidden");
  (document.getElementById("input-nombre") as HTMLInputElement).value = "";
  (document.getElementById("input-descripcion") as HTMLInputElement).value = "";
  (document.getElementById("input-precio") as HTMLInputElement).value = "";
  (document.getElementById("input-stock") as HTMLInputElement).value = "";
  (document.getElementById("input-imagen") as HTMLInputElement).value = "";
  (document.getElementById("input-disponible") as HTMLSelectElement).value =
    "true";
  (document.getElementById("modal-error") as HTMLElement).classList.add(
    "hidden"
  );
  editandoId = null;
  (document.getElementById("modal-titulo") as HTMLElement).textContent =
    "Nuevo Producto";
}

document.getElementById("btn-nuevo-producto")?.addEventListener("click", () => {
  editandoId = null;
  abrirModal();
});

document.getElementById("btn-cerrar-modal")?.addEventListener("click", cerrarModal);
document.getElementById("btn-cancelar")?.addEventListener("click", cerrarModal);

// Guardar producto
document.getElementById("btn-guardar")?.addEventListener("click", () => {
  const nombre = (
    document.getElementById("input-nombre") as HTMLInputElement
  ).value.trim();
  const descripcion = (
    document.getElementById("input-descripcion") as HTMLInputElement
  ).value.trim();
  const precio = Number(
    (document.getElementById("input-precio") as HTMLInputElement).value
  );
  const stock = Number(
    (document.getElementById("input-stock") as HTMLInputElement).value
  );
  const imagen = (
    document.getElementById("input-imagen") as HTMLInputElement
  ).value.trim();
  const disponible =
    (document.getElementById("input-disponible") as HTMLSelectElement).value ===
    "true";
  const categoriaId = Number(
    (document.getElementById("input-categoria") as HTMLSelectElement).value
  );
  const errorDiv = document.getElementById("modal-error") as HTMLElement;

  if (!nombre) {
    errorDiv.textContent = "El nombre es obligatorio";
    errorDiv.classList.remove("hidden");
    return;
  }

  if (!precio || precio <= 0) {
    errorDiv.textContent = "El precio debe ser mayor a 0";
    errorDiv.classList.remove("hidden");
    return;
  }

  if (stock < 0) {
    errorDiv.textContent = "El stock no puede ser negativo";
    errorDiv.classList.remove("hidden");
    return;
  }

  const categoria = categorias.find((c) => c.id === categoriaId);
  const categoriaNombre = categoria ? categoria.nombre : "";

  if (editandoId !== null) {
    const prod = productos.find((p) => p.id === editandoId);
    if (prod) {
      prod.nombre = nombre;
      prod.descripcion = descripcion;
      prod.precio = precio;
      prod.stock = stock;
      prod.imagen = imagen;
      prod.disponible = disponible;
      prod.categoriaId = categoriaId;
      prod.categoriaNombre = categoriaNombre;
    }
  } else {
    const nuevoId = Math.max(...productos.map((p) => p.id)) + 1;
    productos.push({
      id: nuevoId,
      nombre,
      descripcion,
      precio,
      stock,
      imagen,
      disponible,
      categoriaId,
      categoriaNombre,
    });
  }

  guardarProductos(productos);
  renderTabla();
  cerrarModal();
});

// Cerrar sesión
document.getElementById("btn-cerrar-sesion")?.addEventListener("click", () => {
  cerrarSesion();
  window.location.href = "/src/pages/auth/login/login.html";
});

renderTabla();