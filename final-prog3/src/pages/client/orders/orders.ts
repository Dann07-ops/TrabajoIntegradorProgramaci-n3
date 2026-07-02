import { obtenerSesion, cerrarSesion, requiereLogin } from "../../../utils/auth";
import { contarItems } from "../../../utils/carrito";
import type { Pedido } from "../../../types/index";
import pedidosData from "../../../data/pedidos.json";

// Proteger la página
requiereLogin();

const sesion = obtenerSesion();

// Cargar pedidos desde localStorage o JSON
function cargarPedidos(): Pedido[] {
  const guardados = localStorage.getItem("foodstore_pedidos");
  if (guardados) return JSON.parse(guardados) as Pedido[];
  return pedidosData as Pedido[];
}

const todosPedidos: Pedido[] = cargarPedidos();

// Filtrar solo pedidos del usuario logueado
const pedidos = todosPedidos.filter((p) => p.usuarioId === sesion?.id);

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

const estadoLabels: Record<string, string> = {
  pending: "⏳ Pendiente",
  processing: "🍳 En Preparación",
  completed: "✅ Entregado",
  cancelled: "❌ Cancelado",
};

const estadoMensajes: Record<string, string> = {
  pending: "Tu pedido está siendo procesado. Te notificaremos cuando sea confirmado.",
  processing: "¡Tu pedido está en preparación! Pronto estará listo.",
  completed: "¡Tu pedido fue entregado! Esperamos que lo hayas disfrutado.",
  cancelled: "Este pedido fue cancelado.",
};

// Abrir modal con detalle del pedido
function abrirModal(pedido: Pedido): void {
  const overlay = document.getElementById("modal-overlay");
  const titulo = document.getElementById("modal-titulo");
  const contenido = document.getElementById("modal-contenido");
  if (!overlay || !titulo || !contenido) return;

  titulo.textContent = `Pedido #${pedido.id}`;

  contenido.innerHTML = `
    <div class="modal-badge">
      <span class="badge badge-${pedido.estado}">
        ${estadoLabels[pedido.estado]}
      </span>
      <p style="font-size:0.8rem; color:#64748b; margin-top:0.3rem;">
        📅 ${pedido.fecha}
      </p>
    </div>

    <div class="modal-seccion">
      <h4>📍 Información de Entrega</h4>
      <p>Teléfono: ${pedido.celular || "No especificado"}</p>
      <p>Método de pago: 
        ${pedido.formaPago === "TARJETA" ? "💳" : 
          pedido.formaPago === "TRANSFERENCIA" ? "🏦" : "💵"} 
        ${pedido.formaPago}
      </p>
    </div>

    <div class="modal-seccion">
      <h4>🍔 Productos</h4>
      ${pedido.detalles
        .map(
          (d) => `
        <div class="modal-producto-item">
          <span>${d.productoNombre} (x${d.cantidad})</span>
          <span>$${d.subtotal.toLocaleString("es-AR")}</span>
        </div>
      `
        )
        .join("")}
      <div class="modal-total">
        <span>Total:</span>
        <span>$${pedido.total.toLocaleString("es-AR")}</span>
      </div>
    </div>

    <div class="modal-mensaje ${pedido.estado}">
      ${estadoMensajes[pedido.estado]}
    </div>
  `;

  overlay.classList.remove("hidden");
}

// Cerrar modal
function cerrarModal(): void {
  document.getElementById("modal-overlay")?.classList.add("hidden");
}

document.getElementById("btn-cerrar-modal")?.addEventListener("click", cerrarModal);
document.getElementById("modal-overlay")?.addEventListener("click", (e) => {
  if (e.target === document.getElementById("modal-overlay")) cerrarModal();
});

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
      <div class="pedidos-vacio">
        <p>No tenés pedidos aún</p>
        <a href="/src/pages/store/home/home.html" class="btn-primary">
          Ver productos
        </a>
      </div>`;
    return;
  }

  lista.innerHTML = pedidosFiltrados
    .map((p) => {
      const primerosTres = p.detalles.slice(0, 3);
      const resto = p.detalles.length - 3;
      return `
        <div class="pedido-card" data-id="${p.id}">
          <div class="pedido-card-header">
            <span class="pedido-numero">Pedido #${p.id}</span>
            <span class="badge badge-${p.estado}">
              ${estadoLabels[p.estado]}
            </span>
          </div>
          <p class="pedido-fecha">📅 ${p.fecha}</p>
          <p class="pedido-productos">
            ${primerosTres.map((d) => `› ${d.productoNombre} (x${d.cantidad})`).join(" ")}
            ${resto > 0 ? `<span style="color:#ff6b35"> +${resto} más</span>` : ""}
          </p>
          <div class="pedido-card-footer">
            <span class="pedido-cantidad">🔵 ${p.detalles.length} producto(s)</span>
            <span class="pedido-total">$${p.total.toLocaleString("es-AR")}</span>
          </div>
        </div>
      `;
    })
    .join("");

  // Click en pedido abre modal
  lista.querySelectorAll(".pedido-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = Number((card as HTMLElement).dataset.id);
      const pedido = pedidos.find((p) => p.id === id);
      if (pedido) abrirModal(pedido);
    });
  });
}

// Filtro por estado
const filtroSelect = document.getElementById("filtro-estado") as HTMLSelectElement;
filtroSelect?.addEventListener("change", () => {
  renderPedidos(filtroSelect.value);
});

// Cerrar sesión
document.getElementById("btn-cerrar-sesion")?.addEventListener("click", () => {
  cerrarSesion();
  window.location.href = "/src/pages/auth/login/login.html";
});

// Inicializar
renderPedidos("todos");