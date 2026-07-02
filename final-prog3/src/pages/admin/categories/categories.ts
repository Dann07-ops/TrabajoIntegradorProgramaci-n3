import { obtenerSesion, cerrarSesion, requiereAdmin } from "../../../utils/auth";
import type { Categoria } from "../../../types/index";
import categoriasData from "../../../data/categorias.json";

requiereAdmin();

const sesion = obtenerSesion();

// Cargar categorías desde localStorage o JSON
function cargarCategorias(): Categoria[] {
  const extra = localStorage.getItem("foodstore_categorias");
  if (extra) return JSON.parse(extra) as Categoria[];
  return categoriasData as Categoria[];
}

function guardarCategorias(cats: Categoria[]): void {
  localStorage.setItem("foodstore_categorias", JSON.stringify(cats));
}

let categorias: Categoria[] = cargarCategorias();
let editandoId: number | null = null;

// Mostrar nombre del usuario
const spanNombre = document.getElementById("usuario-nombre");
if (spanNombre && sesion) {
  spanNombre.textContent = `${sesion.nombre} ${sesion.apellido}`;
}

// Renderizar tabla
function renderTabla(): void {
  const tbody = document.getElementById("tabla-categorias");
  if (!tbody) return;

  tbody.innerHTML = categorias
    .map(
      (cat) => `
      <tr>
        <td>${cat.id}</td>
        <td>${cat.nombre}</td>
        <td>${cat.descripcion}</td>
        <td>
          <button class="btn-editar" data-id="${cat.id}">Editar</button>
          <button class="btn-eliminar" data-id="${cat.id}">Eliminar</button>
        </td>
      </tr>
    `
    )
    .join("");

  // Eventos editar
  tbody.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const cat = categorias.find((c) => c.id === id);
      if (!cat) return;
      editandoId = id;
      (document.getElementById("modal-titulo") as HTMLElement).textContent =
        "Editar Categoría";
      (document.getElementById("input-nombre") as HTMLInputElement).value =
        cat.nombre;
      (document.getElementById(
        "input-descripcion"
      ) as HTMLInputElement).value = cat.descripcion;
      abrirModal();
    });
  });

  // Eventos eliminar
  tbody.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number((btn as HTMLElement).dataset.id);
      if (confirm("¿Seguro que querés eliminar esta categoría?")) {
        categorias = categorias.filter((c) => c.id !== id);
        guardarCategorias(categorias);
        renderTabla();
      }
    });
  });
}

// Modal
function abrirModal(): void {
  document.getElementById("modal-overlay")?.classList.remove("hidden");
}

function cerrarModal(): void {
  document.getElementById("modal-overlay")?.classList.add("hidden");
  (document.getElementById("input-nombre") as HTMLInputElement).value = "";
  (document.getElementById("input-descripcion") as HTMLInputElement).value = "";
  (document.getElementById("modal-error") as HTMLElement).classList.add("hidden");
  editandoId = null;
  (document.getElementById("modal-titulo") as HTMLElement).textContent =
    "Nueva Categoría";
}

document.getElementById("btn-nueva-categoria")?.addEventListener("click", () => {
  editandoId = null;
  abrirModal();
});

document.getElementById("btn-cerrar-modal")?.addEventListener("click", cerrarModal);
document.getElementById("btn-cancelar")?.addEventListener("click", cerrarModal);

// Guardar categoría
document.getElementById("btn-guardar")?.addEventListener("click", () => {
  const nombre = (
    document.getElementById("input-nombre") as HTMLInputElement
  ).value.trim();
  const descripcion = (
    document.getElementById("input-descripcion") as HTMLInputElement
  ).value.trim();
  const errorDiv = document.getElementById("modal-error") as HTMLElement;

  if (!nombre) {
    errorDiv.textContent = "El nombre es obligatorio";
    errorDiv.classList.remove("hidden");
    return;
  }

  if (editandoId !== null) {
    // Editar
    const cat = categorias.find((c) => c.id === editandoId);
    if (cat) {
      cat.nombre = nombre;
      cat.descripcion = descripcion;
    }
  } else {
    // Nueva
    const nuevoId = Math.max(...categorias.map((c) => c.id)) + 1;
    categorias.push({
      id: nuevoId,
      nombre,
      descripcion,
      imagen: "",
    });
  }

  guardarCategorias(categorias);
  renderTabla();
  cerrarModal();
});

// Cerrar sesión
document.getElementById("btn-cerrar-sesion")?.addEventListener("click", () => {
  cerrarSesion();
  window.location.href = "/src/pages/auth/login/login.html";
});

renderTabla();