import { guardarSesion, estaLogueado } from "../../../utils/auth";
import type { Usuario, SesionUsuario } from "../../../types/index";
import usuariosData from "../../../data/usuarios.json";

// Si ya está logueado redirigir al home
if (estaLogueado()) {
  window.location.href = "/src/pages/store/home/home.html";
}

const usuarios: Usuario[] = usuariosData as Usuario[];

const btnRegistrar = document.getElementById("btn-registrar") as HTMLButtonElement;
const inputNombre = document.getElementById("nombre") as HTMLInputElement;
const inputApellido = document.getElementById("apellido") as HTMLInputElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputCelular = document.getElementById("celular") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;
const inputConfirmPassword = document.getElementById("confirm-password") as HTMLInputElement;
const errorMessage = document.getElementById("error-message") as HTMLDivElement;
const successMessage = document.getElementById("success-message") as HTMLDivElement;

function mostrarError(mensaje: string): void {
  errorMessage.textContent = mensaje;
  errorMessage.classList.remove("hidden");
  successMessage.classList.add("hidden");
}

function mostrarExito(mensaje: string): void {
  successMessage.textContent = mensaje;
  successMessage.classList.remove("hidden");
  errorMessage.classList.add("hidden");
}

btnRegistrar.addEventListener("click", () => {
  const nombre = inputNombre.value.trim();
  const apellido = inputApellido.value.trim();
  const email = inputEmail.value.trim();
  const celular = inputCelular.value.trim();
  const password = inputPassword.value.trim();
  const confirmPassword = inputConfirmPassword.value.trim();

  // Validaciones
  if (!nombre || !apellido || !email || !password || !confirmPassword) {
    mostrarError("Por favor completá todos los campos obligatorios");
    return;
  }

  if (password.length < 6) {
    mostrarError("La contraseña debe tener al menos 6 caracteres");
    return;
  }

  if (password !== confirmPassword) {
    mostrarError("Las contraseñas no coinciden");
    return;
  }

  // Verificar que el mail no esté en uso
  const mailExistente = usuarios.find((u) => u.mail === email);
  if (mailExistente) {
    mostrarError("Ya existe una cuenta con ese email");
    return;
  }

  // Crear nuevo usuario
  const nuevoId = Math.max(...usuarios.map((u) => u.id)) + 1;
  const nuevoUsuario: Usuario = {
    id: nuevoId,
    nombre,
    apellido,
    mail: email,
    celular,
    contrasena: password,
    rol: "USUARIO",
  };

  // Agregar al array y guardar en localStorage
  usuarios.push(nuevoUsuario);
  localStorage.setItem("foodstore_usuarios_extra", JSON.stringify(
    usuarios.filter(u => u.id >= nuevoId)
  ));

  // Loguear automáticamente
  const sesion: SesionUsuario = {
    id: nuevoUsuario.id,
    nombre: nuevoUsuario.nombre,
    apellido: nuevoUsuario.apellido,
    mail: nuevoUsuario.mail,
    rol: nuevoUsuario.rol,
  };

  guardarSesion(sesion);
  mostrarExito("Cuenta creada exitosamente. Redirigiendo...");

  setTimeout(() => {
    window.location.href = "/src/pages/store/home/home.html";
  }, 1500);
});

// También permitir registro con Enter
inputConfirmPassword.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnRegistrar.click();
});