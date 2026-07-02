import { obtenerSesion, cerrarSesion, requiereAdmin } from "../../../utils/auth";
import type { Producto, Pedido, Categoria } from "../../../types/index";
import categoriasData from "../../../data/categorias.json";
import productosData from "../../../data/productos.json";
import pedidosData from "../../../data/pedidos.json";

// Proteger la página: solo admins
requiereAdmin();

const sesion = obtenerSesion();

// Cargar datos desde localStorage o JSON
function cargarCategorias(): Categoria[] {
  const guardado = localStorage.getItem("foodstore_categorias");
  if (guardado) return JSON.parse(guardado) as Categoria[];
  return categoriasData as Categoria[];
}

function cargarProductos(): Producto[] {
  const guardado = localStorage.getItem("foodstore_productos");
  if (guardado) return JSON.parse(guardado) as Producto[];
  return productosData as Producto[];
}

function cargarPedidos(): Pedido[] {
  const guardado = localStorage.getItem("foodstore_pedidos");
  if (guardado) return JSON.parse(guardado) as Pedido[];
  return pedidosData as Pedido[];
}

const categorias: Categoria[] = cargarCategorias();
const productos: Producto[] = cargarProductos();
const pedidos: Pedido[] = cargarPedidos();

// Mostrar nombre del usuario
const spanNombre = document.getElementById("usuario-nombre");
if (spanNombre && sesion) {
  spanNombre.textContent = `${sesion.nombre} ${sesion.apellido}`;
}

// Estadísticas tarjetas
const totalCategorias = document.getElementById("total-categorias");
const totalProductos = document.getElementById("total-productos");
const totalPedidos = document.getElementById("total-pedidos");
const totalDisponibles = document.getElementById("total-disponibles");
const ingresosTotales = document.getElementById("ingresos-totales");
const pedidosPendientes = document.getElementById("pedidos-pendientes");
const pedidosPreparacion = document.getElementById("pedidos-preparacion");
const pedidosCompletados = document.getElementById("pedidos-completados");

if (totalCategorias) totalCategorias.textContent = String(categorias.length);
if (totalProductos) totalProductos.textContent = String(productos.length);
if (totalPedidos) totalPedidos.textContent = String(pedidos.length);
if (totalDisponibles) {
  totalDisponibles.textContent = String(
    productos.filter((p) => p.disponible).length
  );
}

// Calcular ingresos totales (pedidos completados)
const totalFacturado = pedidos
  .filter((p) => p.estado === "completed")
  .reduce((sum, p) => sum + p.total, 0);

if (ingresosTotales) {
  ingresosTotales.textContent = `$${totalFacturado.toLocaleString("es-AR")}`;
}

if (pedidosPendientes) {
  pedidosPendientes.textContent = String(
    pedidos.filter((p) => p.estado === "pending").length
  );
}
if (pedidosPreparacion) {
  pedidosPreparacion.textContent = String(
    pedidos.filter((p) => p.estado === "processing").length
  );
}
if (pedidosCompletados) {
  pedidosCompletados.textContent = String(
    pedidos.filter((p) => p.estado === "completed").length
  );
}

// Cerrar sesión
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener("click", () => {
    cerrarSesion();
    window.location.href = "/src/pages/auth/login/login.html";
  });
}