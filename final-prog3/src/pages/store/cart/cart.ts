import { obtenerSesion, cerrarSesion, requiereLogin } from "../../../utils/auth";
import {
  obtenerCarrito,
  eliminarDelCarrito,
  modificarCantidad,
  vaciarCarrito,
  calcularTotal,
  contarItems,
} from "../../../utils/carrito";
import type { Pedido, DetallePedido, Producto } from "../../../types/index";
import pedidosData from "../../../data/pedidos.json";
import productosData from "../../../data/productos.json";

requiereLogin();

const sesion = obtenerSesion();

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

// Actualizar resumen
function actualizarResumen(): void {
  const total = calcularTotal();
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  if (subtotalEl) subtotalEl.textContent = `$${total.toLocaleString("es-AR")}`;
  if (totalEl) totalEl.textContent = `$${total.toLocaleString("es-AR")}`;
}

// Renderizar carrito
function renderCarrito(): void {
  const lista = document.getElementById("lista-carrito");
  if (!lista) return;

  const carrito = obtenerCarrito();
  actualizarBadgeCarrito();
  actualizarResumen();

  if (carrito.length === 0) {
    lista.innerHTML = `
      <div class="carrito-vacio">
        <p>🛒 Tu carrito está vacío</p>
        <a href="/src/pages/store/home/home.html" class="btn-primary">
          Ver productos
        </a>
      </div>`;
    return;
  }

  lista.innerHTML = carrito
    .map(
      (item) => `
      <div class="carrito-item" data-id="${item.producto.id}">
        <img src="${item.producto.imagen}" alt="${item.producto.nombre}" />
        <div class="carrito-item-info">
          <p class="carrito-item-nombre">${item.producto.nombre}</p>
          <p class="carrito-item-descripcion">${item.producto.descripcion}</p>
          <p class="carrito-item-precio">
            $${item.producto.precio.toLocaleString("es-AR")} c/u
          </p>
        </div>
        <div class="carrito-item-controls">
          <div class="cantidad-controls">
            <button class="btn-cantidad btn-menos"
                    data-id="${item.producto.id}">−</button>
            <span class="cantidad-valor">${item.cantidad}</span>
            <button class="btn-cantidad btn-mas"
                    data-id="${item.producto.id}"
                    data-stock="${item.producto.stock}">+</button>
          </div>
          <p class="carrito-item-subtotal">
            $${(item.producto.precio * item.cantidad).toLocaleString("es-AR")}
          </p>
          <button class="btn-eliminar" data-id="${item.producto.id}">🗑️</button>
        </div>
      </div>
    `
    )
    .join("");

  // Eventos botones menos
  lista.querySelectorAll(".btn-menos").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const item = obtenerCarrito().find((i) => i.producto.id === id);
      if (item && item.cantidad > 1) {
        modificarCantidad(id, item.cantidad - 1);
      } else {
        eliminarDelCarrito(id);
      }
      renderCarrito();
    });
  });

  // Eventos botones más
  lista.querySelectorAll(".btn-mas").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number((btn as HTMLElement).dataset.id);
      const stock = Number((btn as HTMLElement).dataset.stock);
      const item = obtenerCarrito().find((i) => i.producto.id === id);
      if (item && item.cantidad < stock) {
        modificarCantidad(id, item.cantidad + 1);
        renderCarrito();
      }
    });
  });

  // Eventos botones eliminar
  lista.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number((btn as HTMLElement).dataset.id);
      eliminarDelCarrito(id);
      renderCarrito();
    });
  });
}

// Confirmar pedido
document.getElementById("btn-confirmar")?.addEventListener("click", () => {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) return;

  // Obtener forma de pago seleccionada
  const formaPagoInput = document.querySelector(
    'input[name="formaPago"]:checked'
  ) as HTMLInputElement;

  const errorPago = document.getElementById("error-pago");

  if (!formaPagoInput) {
    errorPago?.classList.remove("hidden");
    return;
  }

  errorPago?.classList.add("hidden");
  const formaPago = formaPagoInput.value as
    | "TARJETA"
    | "TRANSFERENCIA"
    | "EFECTIVO";

  // Obtener teléfono y dirección
  const telefono = (
    document.getElementById("input-telefono") as HTMLInputElement
  ).value.trim();
  const direccion = (
    document.getElementById("input-direccion") as HTMLInputElement
  ).value.trim();

  // Cargar pedidos existentes
  const pedidosGuardados = localStorage.getItem("foodstore_pedidos");
  const pedidos: Pedido[] = pedidosGuardados
    ? JSON.parse(pedidosGuardados)
    : (pedidosData as Pedido[]);

  const nuevoId =
    pedidos.length > 0 ? Math.max(...pedidos.map((p) => p.id)) + 1 : 1;

  const detalles: DetallePedido[] = carrito.map((item) => ({
    productoId: item.producto.id,
    productoNombre: item.producto.nombre,
    cantidad: item.cantidad,
    precioUnitario: item.producto.precio,
    subtotal: item.producto.precio * item.cantidad,
  }));

  const total = calcularTotal();
  const fecha = new Date().toISOString().split("T")[0];

  const nuevoPedido: Pedido = {
    id: nuevoId,
    usuarioId: sesion!.id,
    usuarioNombre: `${sesion!.nombre} ${sesion!.apellido}`,
    fecha,
    estado: "pending",
    formaPago,
    celular: telefono,
    direccion: direccion,
    detalles,
    total,
  };

  pedidos.push(nuevoPedido);
  localStorage.setItem("foodstore_pedidos", JSON.stringify(pedidos));

  // Descontar stock de productos
  const productosGuardados = localStorage.getItem("foodstore_productos");
  const productos: Producto[] = productosGuardados
    ? JSON.parse(productosGuardados)
    : (productosData as Producto[]);

  carrito.forEach((item) => {
    const producto = productos.find((p) => p.id === item.producto.id);
    if (producto) {
      producto.stock = Math.max(0, producto.stock - item.cantidad);
    }
  });

  localStorage.setItem("foodstore_productos", JSON.stringify(productos));

  // Mostrar modal de confirmación
  const detalle = document.getElementById("confirmacion-detalle");
  if (detalle) {
    const formaPagoLabel: Record<string, string> = {
      TARJETA: "💳 Tarjeta",
      TRANSFERENCIA: "🏦 Transferencia",
      EFECTIVO: "💵 Efectivo",
    };

    detalle.innerHTML = `
      <p><strong>Pedido #${nuevoId}</strong></p>
      <p>📅 Fecha: ${fecha}</p>
      <p>💰 Total: $${total.toLocaleString("es-AR")}</p>
      <p>💳 Forma de pago: ${formaPagoLabel[formaPago]}</p>
      ${telefono ? `<p>📞 Teléfono: ${telefono}</p>` : ""}
      ${direccion ? `<p>📍 Dirección: ${direccion}</p>` : ""}
      <p>📦 Productos: ${detalles.length} ítem(s)</p>
    `;
  }

  // Limpiar carrito
  vaciarCarrito();
  actualizarBadgeCarrito();

  document.getElementById("modal-confirmacion")?.classList.remove("hidden");
});

// Botones del modal de confirmación
document.getElementById("btn-ver-pedidos")?.addEventListener("click", () => {
  window.location.href = "/src/pages/client/orders/orders.html";
});

document
  .getElementById("btn-seguir-comprando")
  ?.addEventListener("click", () => {
    window.location.href = "/src/pages/store/home/home.html";
  });

// Vaciar carrito
document.getElementById("btn-vaciar")?.addEventListener("click", () => {
  if (confirm("¿Seguro que querés vaciar el carrito?")) {
    vaciarCarrito();
    renderCarrito();
  }
});

// Cerrar sesión
document.getElementById("btn-cerrar-sesion")?.addEventListener("click", () => {
  cerrarSesion();
  window.location.href = "/src/pages/auth/login/login.html";
});

renderCarrito();