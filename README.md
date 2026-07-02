# 🍔 Food Store - Sistema de Gestión de Pedidos de Comida

Trabajo Práctico Integrador - Programación 3  
Universidad Tecnológica Nacional (UTN)  
Alumno: Alderete Daniel

---

## 📋 Descripción

Food Store es una aplicación web full stack educativa que simula un ecommerce de comidas. Permite gestionar categorías, productos y pedidos con dos perfiles de usuario: Administrador y Cliente.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- TypeScript
- Vite
- HTML5 / CSS3
- localStorage (autenticación educativa)

### Backend
- Java 23
- JPA / Hibernate 6
- H2 Database (modo archivo)
- Gradle (Groovy)

---

## 📁 Estructura del Proyecto
TrabajoPracticoIntegrador/

├── final-prog3/          # Frontend (TypeScript + Vite)

└── foodstore-backend/    # Backend (Java + JPA + H2)

---

## 🚀 Instrucciones de Instalación y Ejecución

### Frontend

**Requisitos previos:**
- Node.js 18 o superior
- npm

**Pasos:**

1. Abrí una terminal y navegá a la carpeta del frontend:
```bash
cd final-prog3
```

2. Instalá las dependencias:
```bash
npm install
```

3. Iniciá el servidor de desarrollo:
```bash
npm run dev
```

4. Abrí el navegador en:

http://localhost:5173/

**Cuentas de prueba:**
- Admin: `admin@admin.com` / `123456`
- Cliente: `cliente@food.com` / `cliente123`

---

### Backend

**Requisitos previos:**
- JDK 23
- IntelliJ IDEA (recomendado)

**Pasos:**

1. Abrí la carpeta `foodstore-backend` en IntelliJ IDEA

2. Esperá que Gradle descargue las dependencias automáticamente

3. Ejecutá la clase principal:
src/main/java/com/tp/jpa/Main.java

4. La base de datos H2 se crea automáticamente en:
foodstore-backend/data/jpa_db.mv.db

**Menú de consola disponible:**
- Gestionar Categorías (ABM)
- Gestionar Productos (ABM)
- Gestionar Usuarios (ABM)
- Gestionar Pedidos (Alta, cambio de estado, baja)
- Reportes (productos por categoría, pedidos por usuario/estado, total facturado)

---

## 🎯 Funcionalidades Principales

### Rol Administrador
- ✅ Dashboard con estadísticas (categorías, productos, pedidos, ingresos)
- ✅ Gestión CRUD de categorías
- ✅ Gestión CRUD de productos con stock y disponibilidad
- ✅ Gestión de pedidos con cambio de estado
- ✅ Filtro de pedidos por estado

### Rol Cliente
- ✅ Registro e inicio de sesión
- ✅ Catálogo con filtros por categoría, búsqueda y ordenamiento
- ✅ Detalle de producto con selector de cantidad
- ✅ Carrito persistente con localStorage
- ✅ Confirmación de pedido con forma de pago y datos de contacto
- ✅ Historial de pedidos con detalle y estado actualizado

---

## 🔗 Enlaces

- 📹 Video demostración: [https://youtu.be/no9g4mBJHGs]
- 📄 Documentación PDF:  [Ver Documentación](./FOOD%20STORE.pdf)

---

## ⚠️ Consideraciones

Este proyecto es de carácter **educativo**. La autenticación mediante localStorage no es apta para entornos de producción. No implementa tokens JWT ni seguridad real del lado del servidor.
