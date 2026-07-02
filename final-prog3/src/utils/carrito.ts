import type { ItemCarrito, Producto } from "../types/index";

const CARRITO_KEY = "foodstore_carrito";

// Obtiene el carrito actual del localStorage
export function obtenerCarrito(): ItemCarrito[] {
  const data = localStorage.getItem(CARRITO_KEY);
  if (!data) return [];
  return JSON.parse(data) as ItemCarrito[];
}

// Guarda el carrito en localStorage
function guardarCarrito(carrito: ItemCarrito[]): void {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
}

// Agrega un producto al carrito o incrementa su cantidad
export function agregarAlCarrito(producto: Producto, cantidad: number): void {
  const carrito = obtenerCarrito();
  const itemExistente = carrito.find(
    (item) => item.producto.id === producto.id
  );

  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    carrito.push({ producto, cantidad });
  }

  guardarCarrito(carrito);
}

// Elimina un producto del carrito por su id
export function eliminarDelCarrito(productoId: number): void {
  const carrito = obtenerCarrito().filter(
    (item) => item.producto.id !== productoId
  );
  guardarCarrito(carrito);
}

// Modifica la cantidad de un producto en el carrito
export function modificarCantidad(productoId: number, cantidad: number): void {
  const carrito = obtenerCarrito();
  const item = carrito.find((item) => item.producto.id === productoId);
  if (item) {
    item.cantidad = cantidad;
    guardarCarrito(carrito);
  }
}

// Vacía completamente el carrito
export function vaciarCarrito(): void {
  localStorage.removeItem(CARRITO_KEY);
}

// Calcula el total del carrito
export function calcularTotal(): number {
  return obtenerCarrito().reduce(
    (total, item) => total + item.producto.precio * item.cantidad,
    0
  );
}

// Cuenta la cantidad total de items en el carrito
export function contarItems(): number {
  return obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
}