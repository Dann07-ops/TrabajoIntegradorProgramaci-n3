import { obtenerSesion, cerrarSesion, requiereAdmin } from "../../../utils/auth";
import type { Pedido } from "../../../types/index";
import pedidosData from "../../../data/pedidos.json";

requiereAdmin();

const sesion = obtenerSesion();

// Cargar pedidos desde localStorage o JSON
function cargarPedidos(): Pedido[] {
  const extra = localStorage.getItem("foodstore_pedidos");
  if (extra) return JSON.parse(extra) as Pedido[];
  return pedidosData as Pedido[];
}

function guardarPedidos(peds: Pedido[]): void {
  localStorage.setItem("foodstore_pedidos", JSON.stringify(peds));
}

let pedidos: Pedido[] = cargarPedidos();
let pedidoEditandoId: number | null = null;

// Mostrar nombre del usuario
const spanNombre = document.getElementById("usuario-nombre");
if (spanNombre && sesion) {
  spanNombre.textContent = `${sesion.nombre} ${sesion.apellido}`;
}

const estadoLabels: Record<string, string> = {
  pending: "⏳ Pendiente",
  processing: "🍳 En Preparación",
  completed: "✅ Entregado",
  cancelled: "❌ Cancelado",
};

// Renderizar pedidos
function renderPedidos(filtro: string): void {
  const lista = document.getElementById("lista-pedidos");
  if (!lista) return;

  const pedidosFiltrados =
    filtro === "todos"
      ? [...pedidos].sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        )
      : pedidos
          .filter((p) => p.estado === filtro)
          .sort(
            (a, b) =>
              new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );

  if (pedidosFiltrados.length === 0) {
    lista.innerHTML = `
      <div style="text-align:center; padding:2rem; color:#64748b;">
        No hay pedidos con ese estado
      </div>`;
    return;
  }

  lista.innerHTML = pedidosFiltrados
    .map(
      (p) => `
      <div class="pedido-card">
        <div class="pedido-info">
          <h3>Pedido #${p.id}</h3>
          <p>Cliente: ${p.usuarioNombre}</p>
          <p>📅 ${p.fecha}</p>
          <p>${p.detalles.length} producto(s)</p>
        </div>
        <div class="pedido-right">
          <span class="badge badge-${p.estado}">
            ${estadoLabels[p.estado]}
          </span>
          <p class="pedido-total">$${p.total.toLocaleString("es-AR")}</p>
          <button class="btn-cambiar-estado" data-id="${p.id}">
            Cambiar Estado
          </button>
        </div>
      </div>
    `
    )
    .join("");

  // Eventos botón cambiar estado
  lista.querySelectorAll(".btn-cambiar-estado").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const pedido = pedidos.find((p) => p.id === id);
      if (!pedido) return;

      pedidoEditandoId = id;

      const modalInfo = document.getElementById("modal-info");
      if (modalInfo) {
        modalInfo.textContent =
          `Pedido #${pedido.id} — Cliente: ${pedido.usuarioNombre} — ` +
          `Estado actual: ${estadoLabels[pedido.estado]}`;
      }

      // Preseleccionar estado actual
      const selectEstado = document.getElementById(
        "select-estado"
      ) as HTMLSelectElement;
      if (selectEstado) selectEstado.value = pedido.estado;

      abrirModal();
    });
  });
}

// Modal
function abrirModal(): void {
  document.getElementById("modal-overlay")?.classList.remove("hidden");
}

function cerrarModal(): void {
  document.getElementById("modal-overlay")?.classList.add("hidden");
  pedidoEditandoId = null;
}

document.getElementById("btn-cerrar-modal")?.addEventListener("click", cerrarModal);
document.getElementById("btn-cancelar")?.addEventListener("click", cerrarModal);

// Guardar nuevo estado
document.getElementById("btn-guardar-estado")?.addEventListener("click", () => {
  if (pedidoEditandoId === null) return;

  const nuevoEstado = (
    document.getElementById("select-estado") as HTMLSelectElement
  ).value as Pedido["estado"];

  const pedido = pedidos.find((p) => p.id === pedidoEditandoId);
  if (pedido) {
    pedido.estado = nuevoEstado;
    guardarPedidos(pedidos);

    const filtroActual = (
      document.getElementById("filtro-estado") as HTMLSelectElement
    ).value;
    renderPedidos(filtroActual);
  }

  cerrarModal();
});

// Filtro por estado
const filtroSelect = document.getElementById(
  "filtro-estado"
) as HTMLSelectElement;
filtroSelect?.addEventListener("change", () => {
  renderPedidos(filtroSelect.value);
});

// Cerrar sesión
document.getElementById("btn-cerrar-sesion")?.addEventListener("click", () => {
  cerrarSesion();
  window.location.href = "/src/pages/auth/login/login.html";
});

renderPedidos("todos");