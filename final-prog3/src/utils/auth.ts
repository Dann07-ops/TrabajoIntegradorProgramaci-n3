import type { SesionUsuario } from "../types/index";

const SESION_KEY = "foodstore_sesion";

// Guarda la sesión del usuario en localStorage
export function guardarSesion(usuario: SesionUsuario): void {
  localStorage.setItem(SESION_KEY, JSON.stringify(usuario));
}

// Obtiene la sesión actual del localStorage
export function obtenerSesion(): SesionUsuario | null {
  const data = localStorage.getItem(SESION_KEY);
  if (!data) return null;
  return JSON.parse(data) as SesionUsuario;
}

// Elimina la sesión del localStorage (logout)
export function cerrarSesion(): void {
  localStorage.removeItem(SESION_KEY);
}

// Verifica si hay una sesión activa
export function estaLogueado(): boolean {
  return obtenerSesion() !== null;
}

// Verifica si el usuario logueado es ADMIN
export function esAdmin(): boolean {
  const sesion = obtenerSesion();
  return sesion !== null && sesion.rol === "ADMIN";
}

// Protege una página: si no hay sesión redirige al login
export function requiereLogin(): void {
  if (!estaLogueado()) {
    window.location.href = "/src/pages/auth/login/login.html";
  }
}

// Protege una página: si no es admin redirige al home
export function requiereAdmin(): void {
  if (!esAdmin()) {
    window.location.href = "/src/pages/store/home/home.html";
  }
}