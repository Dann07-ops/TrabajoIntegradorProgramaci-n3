import { guardarSesion, estaLogueado, esAdmin } from "../../../utils/auth";
import type { Usuario, SesionUsuario } from "../../../types/index";
import usuariosData from "../../../data/usuarios.json";

// Cargar usuarios desde JSON + los registrados en localStorage
function cargarUsuarios(): Usuario[] {
  const usuariosBase = usuariosData as Usuario[];
  const extra = localStorage.getItem("foodstore_usuarios_extra");
  if (extra) {
    const usuariosExtra = JSON.parse(extra) as Usuario[];
    return [...usuariosBase, ...usuariosExtra];
  }
  return usuariosBase;
}

const usuarios: Usuario[] = cargarUsuarios();

// Si ya hay sesión activa, redirigir según rol
if (estaLogueado()) {
  if (esAdmin()) {
    window.location.href = "/src/pages/admin/adminHome/adminHome.html";
  } else {
    window.location.href = "/src/pages/store/home/home.html";
  }
}

const btnLogin = document.getElementById("btn-login") as HTMLButtonElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;
const errorMessage = document.getElementById("error-message") as HTMLDivElement;

btnLogin.addEventListener("click", () => {
  const email = inputEmail.value.trim();
  const password = inputPassword.value.trim();

  // Validar campos vacíos
  if (!email || !password) {
    errorMessage.textContent = "Por favor completá todos los campos";
    errorMessage.classList.remove("hidden");
    return;
  }

  // Buscar usuario en JSON + localStorage
  const usuarioEncontrado = usuarios.find(
    (u) => u.mail === email && u.contrasena === password
  );

  if (!usuarioEncontrado) {
    errorMessage.textContent = "Email o contraseña incorrectos";
    errorMessage.classList.remove("hidden");
    return;
  }

  // Guardar sesión en localStorage
  const sesion: SesionUsuario = {
    id: usuarioEncontrado.id,
    nombre: usuarioEncontrado.nombre,
    apellido: usuarioEncontrado.apellido,
    mail: usuarioEncontrado.mail,
    rol: usuarioEncontrado.rol,
  };

  guardarSesion(sesion);

  // Redirigir según rol
  if (usuarioEncontrado.rol === "ADMIN") {
    window.location.href = "/src/pages/admin/adminHome/adminHome.html";
  } else {
    window.location.href = "/src/pages/store/home/home.html";
  }
});

// También permitir login con Enter
inputPassword.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    btnLogin.click();
  }
});