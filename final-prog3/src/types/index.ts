export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  contrasena: string;
  rol: "ADMIN" | "USUARIO";
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
  disponible: boolean;
  categoriaId: number;
  categoriaNombre: string;
}

export interface DetallePedido {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  fecha: string;
  estado: "pending" | "processing" | "completed" | "cancelled";
  formaPago: "TARJETA" | "TRANSFERENCIA" | "EFECTIVO";
  celular: string;
  direccion?: string;
  detalles: DetallePedido[];
  total: number;
 
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export interface SesionUsuario {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  rol: "ADMIN" | "USUARIO";
}

