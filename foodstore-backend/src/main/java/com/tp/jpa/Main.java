package com.tp.jpa;

import com.tp.jpa.model.*;
import com.tp.jpa.model.enums.*;
import com.tp.jpa.repository.*;
import com.tp.jpa.util.JPAUtil;
import jakarta.persistence.EntityManager;

import java.time.LocalDate;
import java.util.*;

public class Main {

    // Repositorios
    static CategoriaRepository categoriaRepo = new CategoriaRepository();
    static ProductoRepository productoRepo = new ProductoRepository();
    static UsuarioRepository usuarioRepo = new UsuarioRepository();
    static PedidoRepository pedidoRepo = new PedidoRepository();
    static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        try {
            System.out.println("=================================");
            System.out.println("   FOOD STORE - Sistema de Gestion");
            System.out.println("=================================");

            boolean salir = false;
            while (!salir) {
                System.out.println("\n--- MENU PRINCIPAL ---");
                System.out.println("1. Gestionar Categorias");
                System.out.println("2. Gestionar Productos");
                System.out.println("3. Gestionar Usuarios");
                System.out.println("4. Gestionar Pedidos");
                System.out.println("5. Reportes");
                System.out.println("0. Salir");
                System.out.print("Opcion: ");

                String opcion = scanner.nextLine().trim();
                switch (opcion) {
                    case "1" -> menuCategorias();
                    case "2" -> menuProductos();
                    case "3" -> menuUsuarios();
                    case "4" -> menuPedidos();
                    case "5" -> menuReportes();
                    case "0" -> salir = true;
                    default -> System.out.println("Opcion invalida");
                }
            }

            System.out.println("Cerrando aplicacion...");
            JPAUtil.close();
            System.out.println("Hasta luego!");

        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            System.out.println("CAUSA: " + e.getCause());
            e.printStackTrace();
        }
    }

    // =====================
    // MENU CATEGORIAS
    // =====================
    static void menuCategorias() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTIONAR CATEGORIAS ---");
            System.out.println("1. Alta");
            System.out.println("2. Modificar");
            System.out.println("3. Baja logica");
            System.out.println("4. Listado");
            System.out.println("0. Volver");
            System.out.print("Opcion: ");

            String opcion = scanner.nextLine().trim();
            switch (opcion) {
                case "1" -> altaCategoria();
                case "2" -> modificarCategoria();
                case "3" -> bajaCategoria();
                case "4" -> listarCategorias();
                case "0" -> volver = true;
                default -> System.out.println("Opcion invalida");
            }
        }
    }

    static void altaCategoria() {
        System.out.println("\n-- Alta de Categoria --");
        System.out.print("Nombre (obligatorio): ");
        String nombre = scanner.nextLine().trim();
        if (nombre.isEmpty()) {
            System.out.println("Error: el nombre no puede estar vacio");
            return;
        }
        System.out.print("Descripcion (opcional): ");
        String descripcion = scanner.nextLine().trim();

        Categoria cat = new Categoria(nombre, descripcion);
        Categoria guardada = categoriaRepo.guardar(cat);
        System.out.println("Categoria creada con ID: " + guardada.getId());
    }

    static void modificarCategoria() {
        System.out.println("\n-- Modificar Categoria --");
        List<Categoria> categorias = categoriaRepo.listarActivos();
        if (categorias.isEmpty()) {
            System.out.println("No hay categorias activas");
            return;
        }
        listarCategorias();
        System.out.print("Ingresa el ID a modificar: ");
        Long id = parseLong(scanner.nextLine().trim());
        if (id == null) { System.out.println("ID invalido"); return; }

        Optional<Categoria> opt = categoriaRepo.buscarPorId(id);
        if (opt.isEmpty() || opt.get().isEliminado()) {
            System.out.println("Error: categoria no encontrada o dada de baja");
            return;
        }

        Categoria cat = opt.get();
        System.out.println("Valores actuales -> Nombre: " + cat.getNombre() +
                " | Descripcion: " + cat.getDescripcion());

        System.out.print("Nuevo nombre (Enter para conservar): ");
        String nombre = scanner.nextLine().trim();
        if (!nombre.isEmpty()) cat.setNombre(nombre);

        System.out.print("Nueva descripcion (Enter para conservar): ");
        String descripcion = scanner.nextLine().trim();
        if (!descripcion.isEmpty()) cat.setDescripcion(descripcion);

        categoriaRepo.guardar(cat);
        System.out.println("Categoria actualizada correctamente");
    }

    static void bajaCategoria() {
        System.out.println("\n-- Baja de Categoria --");
        System.out.print("Ingresa el ID: ");
        Long id = parseLong(scanner.nextLine().trim());
        if (id == null) { System.out.println("ID invalido"); return; }

        Optional<Categoria> opt = categoriaRepo.buscarPorId(id);
        if (opt.isEmpty()) {
            System.out.println("Error: categoria no encontrada");
            return;
        }
        boolean resultado = categoriaRepo.eliminarLogico(id);
        if (!resultado) {
            System.out.println("Error: categoria no encontrada o ya dada de baja");
        } else {
            System.out.println("Categoria '" + opt.get().getNombre() +
                    "' dada de baja correctamente");
        }
    }

    static void listarCategorias() {
        System.out.println("\n-- Listado de Categorias --");
        List<Categoria> categorias = categoriaRepo.listarActivos();
        if (categorias.isEmpty()) {
            System.out.println("No hay categorias activas");
            return;
        }
        categorias.forEach(c ->
                System.out.println("ID: " + c.getId() +
                        " | Nombre: " + c.getNombre() +
                        " | Descripcion: " + c.getDescripcion()));
    }

    // =====================
    // MENU PRODUCTOS
    // =====================
    static void menuProductos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTIONAR PRODUCTOS ---");
            System.out.println("1. Alta");
            System.out.println("2. Modificar");
            System.out.println("3. Baja logica");
            System.out.println("4. Listado");
            System.out.println("0. Volver");
            System.out.print("Opcion: ");

            String opcion = scanner.nextLine().trim();
            switch (opcion) {
                case "1" -> altaProducto();
                case "2" -> modificarProducto();
                case "3" -> bajaProducto();
                case "4" -> listarProductos();
                case "0" -> volver = true;
                default -> System.out.println("Opcion invalida");
            }
        }
    }

    static void altaProducto() {
        System.out.println("\n-- Alta de Producto --");
        List<Categoria> categorias = categoriaRepo.listarActivos();
        if (categorias.isEmpty()) {
            System.out.println("Error: no hay categorias activas. Cree una primero");
            return;
        }
        listarCategorias();
        System.out.print("Selecciona el ID de categoria: ");
        Long catId = parseLong(scanner.nextLine().trim());
        if (catId == null) { System.out.println("ID invalido"); return; }

        Optional<Categoria> optCat = categoriaRepo.buscarPorId(catId);
        if (optCat.isEmpty() || optCat.get().isEliminado()) {
            System.out.println("Error: categoria no encontrada");
            return;
        }

        System.out.print("Nombre (obligatorio): ");
        String nombre = scanner.nextLine().trim();
        if (nombre.isEmpty()) {
            System.out.println("Error: el nombre no puede estar vacio");
            return;
        }

        System.out.print("Descripcion: ");
        String descripcion = scanner.nextLine().trim();

        System.out.print("Precio (mayor a 0): ");
        Double precio = parseDouble(scanner.nextLine().trim());
        if (precio == null || precio <= 0) {
            System.out.println("Error: precio invalido");
            return;
        }

        System.out.print("Stock (mayor o igual a 0): ");
        Integer stock = parseInteger(scanner.nextLine().trim());
        if (stock == null || stock < 0) {
            System.out.println("Error: stock invalido");
            return;
        }

        System.out.print("Imagen (opcional): ");
        String imagen = scanner.nextLine().trim();

        System.out.print("Disponible? (S/N, default S): ");
        String dispInput = scanner.nextLine().trim();
        boolean disponible = !dispInput.equalsIgnoreCase("N");

        // Usar EntityManager directamente para evitar LazyInitializationException
        EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();
        try {
            em.getTransaction().begin();

            Producto producto = new Producto(nombre, precio, descripcion,
                    stock, imagen, disponible);
            em.persist(producto);

            Categoria categoria = em.find(Categoria.class, catId);
            categoria.getProductos().add(producto);

            em.getTransaction().commit();

            System.out.println("Producto creado con ID: " + producto.getId() +
                    " en categoria: " + categoria.getNombre());
        } catch (Exception e) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            System.out.println("Error al crear producto: " + e.getMessage());
        } finally {
            em.close();
        }
    }

    static void modificarProducto() {
        System.out.println("\n-- Modificar Producto --");
        List<Producto> productos = productoRepo.listarActivos();
        if (productos.isEmpty()) {
            System.out.println("No hay productos activos");
            return;
        }
        listarProductos();
        System.out.print("Ingresa el ID a modificar: ");
        Long id = parseLong(scanner.nextLine().trim());
        if (id == null) { System.out.println("ID invalido"); return; }

        Optional<Producto> opt = productoRepo.buscarPorId(id);
        if (opt.isEmpty() || opt.get().isEliminado()) {
            System.out.println("Error: producto no encontrado o dado de baja");
            return;
        }

        Producto p = opt.get();
        System.out.println("Valores actuales -> Nombre: " + p.getNombre() +
                " | Precio: " + p.getPrecio() +
                " | Stock: " + p.getStock());

        System.out.print("Nuevo nombre (Enter para conservar): ");
        String nombre = scanner.nextLine().trim();
        if (!nombre.isEmpty()) p.setNombre(nombre);

        System.out.print("Nuevo precio (Enter para conservar): ");
        String precioStr = scanner.nextLine().trim();
        if (!precioStr.isEmpty()) {
            Double precio = parseDouble(precioStr);
            if (precio == null || precio <= 0) {
                System.out.println("Error: precio invalido");
                return;
            }
            p.setPrecio(precio);
        }

        System.out.print("Nuevo stock (Enter para conservar): ");
        String stockStr = scanner.nextLine().trim();
        if (!stockStr.isEmpty()) {
            Integer stock = parseInteger(stockStr);
            if (stock == null || stock < 0) {
                System.out.println("Error: stock invalido");
                return;
            }
            p.setStock(stock);
        }

        productoRepo.guardar(p);
        System.out.println("Producto actualizado correctamente");
    }

    static void bajaProducto() {
        System.out.println("\n-- Baja de Producto --");
        System.out.print("Ingresa el ID: ");
        Long id = parseLong(scanner.nextLine().trim());
        if (id == null) { System.out.println("ID invalido"); return; }

        Optional<Producto> opt = productoRepo.buscarPorId(id);
        if (opt.isEmpty()) {
            System.out.println("Error: producto no encontrado");
            return;
        }
        boolean resultado = productoRepo.eliminarLogico(id);
        if (!resultado) {
            System.out.println("Error: producto no encontrado o ya dado de baja");
        } else {
            System.out.println("Producto '" + opt.get().getNombre() +
                    "' dado de baja correctamente");
        }
    }

    static void listarProductos() {
        System.out.println("\n-- Listado de Productos --");
        List<Producto> productos = productoRepo.listarActivos();
        if (productos.isEmpty()) {
            System.out.println("No hay productos activos");
            return;
        }
        productos.forEach(p ->
                System.out.println("ID: " + p.getId() +
                        " | Nombre: " + p.getNombre() +
                        " | Precio: $" + p.getPrecio() +
                        " | Stock: " + p.getStock() +
                        " | Disponible: " + (p.getDisponible() ? "Si" : "No")));
    }

    // =====================
    // MENU USUARIOS
    // =====================
    static void menuUsuarios() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTIONAR USUARIOS ---");
            System.out.println("1. Alta");
            System.out.println("2. Modificar");
            System.out.println("3. Baja logica");
            System.out.println("4. Listado");
            System.out.println("5. Buscar por mail");
            System.out.println("0. Volver");
            System.out.print("Opcion: ");

            String opcion = scanner.nextLine().trim();
            switch (opcion) {
                case "1" -> altaUsuario();
                case "2" -> modificarUsuario();
                case "3" -> bajaUsuario();
                case "4" -> listarUsuarios();
                case "5" -> buscarUsuarioPorMail();
                case "0" -> volver = true;
                default -> System.out.println("Opcion invalida");
            }
        }
    }

    static void altaUsuario() {
        System.out.println("\n-- Alta de Usuario --");
        System.out.print("Nombre: ");
        String nombre = scanner.nextLine().trim();
        System.out.print("Apellido: ");
        String apellido = scanner.nextLine().trim();
        System.out.print("Mail: ");
        String mail = scanner.nextLine().trim();

        if (usuarioRepo.buscarPorMail(mail).isPresent()) {
            System.out.println("Error: ya existe un usuario activo con ese mail");
            return;
        }

        System.out.print("Celular (opcional): ");
        String celular = scanner.nextLine().trim();
        System.out.print("Contrasena: ");
        String contrasena = scanner.nextLine().trim();

        System.out.println("Rol: 1. ADMIN  2. USUARIO");
        System.out.print("Selecciona: ");
        String rolInput = scanner.nextLine().trim();
        Rol rol = rolInput.equals("1") ? Rol.ADMIN : Rol.USUARIO;

        Usuario usuario = new Usuario(nombre, apellido, mail,
                celular, contrasena, rol);
        Usuario guardado = usuarioRepo.guardar(usuario);
        System.out.println("Usuario creado con ID: " + guardado.getId());
    }

    static void modificarUsuario() {
        System.out.println("\n-- Modificar Usuario --");
        listarUsuarios();
        System.out.print("Ingresa el ID a modificar: ");
        Long id = parseLong(scanner.nextLine().trim());
        if (id == null) { System.out.println("ID invalido"); return; }

        Optional<Usuario> opt = usuarioRepo.buscarPorId(id);
        if (opt.isEmpty() || opt.get().isEliminado()) {
            System.out.println("Error: usuario no encontrado o dado de baja");
            return;
        }

        Usuario u = opt.get();
        System.out.println("Valores actuales -> Nombre: " + u.getNombre() +
                " | Apellido: " + u.getApellido() +
                " | Mail: " + u.getMail());

        System.out.print("Nuevo nombre (Enter para conservar): ");
        String nombre = scanner.nextLine().trim();
        if (!nombre.isEmpty()) u.setNombre(nombre);

        System.out.print("Nuevo apellido (Enter para conservar): ");
        String apellido = scanner.nextLine().trim();
        if (!apellido.isEmpty()) u.setApellido(apellido);

        System.out.print("Nuevo celular (Enter para conservar): ");
        String celular = scanner.nextLine().trim();
        if (!celular.isEmpty()) u.setCelular(celular);

        System.out.print("Nueva contrasena (Enter para conservar): ");
        String contrasena = scanner.nextLine().trim();
        if (!contrasena.isEmpty()) u.setContrasena(contrasena);

        usuarioRepo.guardar(u);
        System.out.println("Usuario actualizado correctamente");
    }

    static void bajaUsuario() {
        System.out.println("\n-- Baja de Usuario --");
        System.out.print("Ingresa el ID: ");
        Long id = parseLong(scanner.nextLine().trim());
        if (id == null) { System.out.println("ID invalido"); return; }

        Optional<Usuario> opt = usuarioRepo.buscarPorId(id);
        if (opt.isEmpty()) {
            System.out.println("Error: usuario no encontrado");
            return;
        }
        boolean resultado = usuarioRepo.eliminarLogico(id);
        if (!resultado) {
            System.out.println("Error: usuario no encontrado o ya dado de baja");
        } else {
            Usuario u = opt.get();
            System.out.println("Usuario '" + u.getNombre() + " " +
                    u.getApellido() + "' dado de baja correctamente");
        }
    }

    static void listarUsuarios() {
        System.out.println("\n-- Listado de Usuarios --");
        List<Usuario> usuarios = usuarioRepo.listarActivos();
        if (usuarios.isEmpty()) {
            System.out.println("No hay usuarios activos");
            return;
        }
        usuarios.forEach(u ->
                System.out.println("ID: " + u.getId() +
                        " | Nombre: " + u.getNombre() + " " + u.getApellido() +
                        " | Mail: " + u.getMail() +
                        " | Rol: " + u.getRol()));
    }

    static void buscarUsuarioPorMail() {
        System.out.println("\n-- Buscar Usuario por Mail --");
        System.out.print("Ingresa el mail: ");
        String mail = scanner.nextLine().trim();

        Optional<Usuario> opt = usuarioRepo.buscarPorMail(mail);
        if (opt.isEmpty()) {
            System.out.println("No existe usuario activo con ese mail");
        } else {
            Usuario u = opt.get();
            System.out.println("Usuario encontrado:");
            System.out.println("ID: " + u.getId());
            System.out.println("Nombre: " + u.getNombre() + " " + u.getApellido());
            System.out.println("Mail: " + u.getMail());
            System.out.println("Celular: " + u.getCelular());
            System.out.println("Rol: " + u.getRol());
        }
    }

    // =====================
    // MENU PEDIDOS
    // =====================
    static void menuPedidos() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- GESTIONAR PEDIDOS ---");
            System.out.println("1. Alta de pedido");
            System.out.println("2. Cambiar estado");
            System.out.println("3. Baja logica");
            System.out.println("4. Listado");
            System.out.println("5. Pedidos por usuario");
            System.out.println("6. Pedidos por estado");
            System.out.println("0. Volver");
            System.out.print("Opcion: ");

            String opcion = scanner.nextLine().trim();
            switch (opcion) {
                case "1" -> altaPedido();
                case "2" -> cambiarEstadoPedido();
                case "3" -> bajaPedido();
                case "4" -> listarPedidos();
                case "5" -> pedidosPorUsuario();
                case "6" -> pedidosPorEstado();
                case "0" -> volver = true;
                default -> System.out.println("Opcion invalida");
            }
        }
    }

    static void altaPedido() {
        System.out.println("\n-- Alta de Pedido --");

        List<Usuario> usuarios = usuarioRepo.listarActivos();
        if (usuarios.isEmpty()) {
            System.out.println("Error: no hay usuarios activos");
            return;
        }
        listarUsuarios();
        System.out.print("Selecciona el ID del usuario: ");
        Long usuarioId = parseLong(scanner.nextLine().trim());
        if (usuarioId == null) { System.out.println("ID invalido"); return; }

        Optional<Usuario> optUsuario = usuarioRepo.buscarPorId(usuarioId);
        if (optUsuario.isEmpty() || optUsuario.get().isEliminado()) {
            System.out.println("Error: usuario no encontrado");
            return;
        }

        System.out.println("Forma de pago: 1. TARJETA  2. TRANSFERENCIA  3. EFECTIVO");
        System.out.print("Selecciona: ");
        String pagoInput = scanner.nextLine().trim();
        FormaPago formaPago = switch (pagoInput) {
            case "1" -> FormaPago.TARJETA;
            case "2" -> FormaPago.TRANSFERENCIA;
            default -> FormaPago.EFECTIVO;
        };

        // Lista temporal (productoId, cantidad)
        List<long[]> itemsTemp = new ArrayList<>();

        boolean agregarMas = true;
        while (agregarMas) {
            listarProductos();
            System.out.print("ID del producto a agregar: ");
            Long prodId = parseLong(scanner.nextLine().trim());
            if (prodId == null) { System.out.println("ID invalido"); continue; }

            Optional<Producto> optProd = productoRepo.buscarPorId(prodId);
            if (optProd.isEmpty() || optProd.get().isEliminado()) {
                System.out.println("Error: producto no encontrado");
                continue;
            }

            Producto prod = optProd.get();
            if (!prod.getDisponible()) {
                System.out.println("Error: producto no disponible");
                continue;
            }

            System.out.print("Cantidad: ");
            Integer cantidad = parseInteger(scanner.nextLine().trim());
            if (cantidad == null || cantidad <= 0) {
                System.out.println("Error: cantidad invalida");
                continue;
            }

            if (prod.getStock() < cantidad) {
                System.out.println("Error: stock insuficiente. Stock disponible: " +
                        prod.getStock());
                continue;
            }

            itemsTemp.add(new long[]{prodId, cantidad});
            System.out.println("Producto agregado: " + prod.getNombre() +
                    " x" + cantidad);

            System.out.print("Agregar otro producto? (S/N): ");
            agregarMas = scanner.nextLine().trim().equalsIgnoreCase("S");
        }

        if (itemsTemp.isEmpty()) {
            System.out.println("Error: el pedido debe tener al menos un producto");
            return;
        }

        // Transaccion unica
        EntityManager em = JPAUtil.getEntityManagerFactory().createEntityManager();
        try {
            em.getTransaction().begin();

            Usuario usuario = em.find(Usuario.class, usuarioId);
            Pedido pedido = new Pedido(LocalDate.now(), Estado.PENDIENTE, formaPago);

            for (long[] item : itemsTemp) {
                Long prodId = item[0];
                int cantidad = (int) item[1];

                Producto producto = em.find(Producto.class, prodId);
                pedido.addDetallePedido(cantidad, producto.getPrecio(), producto);
                producto.setStock(producto.getStock() - cantidad);
            }

            pedido.calcularTotal();
            em.persist(pedido);
            usuario.getPedidos().add(pedido);

            em.getTransaction().commit();

            System.out.println("\nPedido creado exitosamente!");
            System.out.println("ID: " + pedido.getId());
            System.out.println("Fecha: " + pedido.getFecha());
            System.out.println("Usuario: " + optUsuario.get().getNombre() +
                    " " + optUsuario.get().getApellido());
            System.out.println("Forma de pago: " + pedido.getFormaPago());
            System.out.println("Total: $" + pedido.getTotal());

        } catch (Exception e) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            System.out.println("Error al crear pedido: " + e.getMessage());
        } finally {
            em.close();
        }
    }

    static void cambiarEstadoPedido() {
        System.out.println("\n-- Cambiar Estado de Pedido --");
        System.out.print("Ingresa el ID del pedido: ");
        Long id = parseLong(scanner.nextLine().trim());
        if (id == null) { System.out.println("ID invalido"); return; }

        Optional<Pedido> opt = pedidoRepo.buscarPorId(id);
        if (opt.isEmpty() || opt.get().isEliminado()) {
            System.out.println("Error: pedido no encontrado o dado de baja");
            return;
        }

        Pedido pedido = opt.get();
        System.out.println("Estado actual: " + pedido.getEstado());
        System.out.println("1. PENDIENTE  2. CONFIRMADO  3. TERMINADO  4. CANCELADO");
        System.out.print("Nuevo estado: ");
        String input = scanner.nextLine().trim();

        Estado nuevoEstado = switch (input) {
            case "1" -> Estado.PENDIENTE;
            case "2" -> Estado.CONFIRMADO;
            case "3" -> Estado.TERMINADO;
            default -> Estado.CANCELADO;
        };

        pedido.setEstado(nuevoEstado);
        pedidoRepo.guardar(pedido);
        System.out.println("Estado actualizado a: " + nuevoEstado);
    }

    static void bajaPedido() {
        System.out.println("\n-- Baja de Pedido --");
        System.out.print("Ingresa el ID: ");
        Long id = parseLong(scanner.nextLine().trim());
        if (id == null) { System.out.println("ID invalido"); return; }

        Optional<Pedido> opt = pedidoRepo.buscarPorId(id);
        if (opt.isEmpty()) {
            System.out.println("Error: pedido no encontrado");
            return;
        }
        boolean resultado = pedidoRepo.eliminarLogico(id);
        if (!resultado) {
            System.out.println("Error: pedido no encontrado o ya dado de baja");
        } else {
            System.out.println("Pedido #" + id + " dado de baja. " +
                    "Total: $" + opt.get().getTotal());
        }
    }

    static void listarPedidos() {
        System.out.println("\n-- Listado de Pedidos --");
        List<Pedido> pedidos = pedidoRepo.listarActivos();
        if (pedidos.isEmpty()) {
            System.out.println("No hay pedidos activos");
            return;
        }
        pedidos.forEach(p ->
                System.out.println("ID: " + p.getId() +
                        " | Fecha: " + p.getFecha() +
                        " | Estado: " + p.getEstado() +
                        " | FormaPago: " + p.getFormaPago() +
                        " | Total: $" + p.getTotal()));
    }

    static void pedidosPorUsuario() {
        System.out.println("\n-- Pedidos por Usuario --");
        listarUsuarios();
        System.out.print("Selecciona el ID del usuario: ");
        Long id = parseLong(scanner.nextLine().trim());
        if (id == null) { System.out.println("ID invalido"); return; }

        List<Pedido> pedidos = pedidoRepo.buscarPorUsuario(id);
        if (pedidos.isEmpty()) {
            System.out.println("El usuario no tiene pedidos activos");
            return;
        }
        pedidos.forEach(p ->
                System.out.println("ID: " + p.getId() +
                        " | Fecha: " + p.getFecha() +
                        " | Estado: " + p.getEstado() +
                        " | Total: $" + p.getTotal()));
    }

    static void pedidosPorEstado() {
        System.out.println("\n-- Pedidos por Estado --");
        System.out.println("1. PENDIENTE  2. CONFIRMADO  3. TERMINADO  4. CANCELADO");
        System.out.print("Selecciona: ");
        String input = scanner.nextLine().trim();

        Estado estado = switch (input) {
            case "1" -> Estado.PENDIENTE;
            case "2" -> Estado.CONFIRMADO;
            case "3" -> Estado.TERMINADO;
            default -> Estado.CANCELADO;
        };

        List<Pedido> pedidos = pedidoRepo.buscarPorEstado(estado);
        if (pedidos.isEmpty()) {
            System.out.println("No hay pedidos con estado: " + estado);
            return;
        }
        pedidos.forEach(p ->
                System.out.println("ID: " + p.getId() +
                        " | Fecha: " + p.getFecha() +
                        " | Total: $" + p.getTotal()));
    }

    // =====================
    // MENU REPORTES
    // =====================
    static void menuReportes() {
        boolean volver = false;
        while (!volver) {
            System.out.println("\n--- REPORTES ---");
            System.out.println("1. Productos por categoria");
            System.out.println("2. Pedidos por usuario");
            System.out.println("3. Pedidos por estado");
            System.out.println("4. Total facturado");
            System.out.println("0. Volver");
            System.out.print("Opcion: ");

            String opcion = scanner.nextLine().trim();
            switch (opcion) {
                case "1" -> reporteProductosPorCategoria();
                case "2" -> pedidosPorUsuario();
                case "3" -> pedidosPorEstado();
                case "4" -> reporteTotalFacturado();
                case "0" -> volver = true;
                default -> System.out.println("Opcion invalida");
            }
        }
    }

    static void reporteProductosPorCategoria() {
        System.out.println("\n-- Productos por Categoria --");
        listarCategorias();
        System.out.print("Selecciona el ID de categoria: ");
        Long id = parseLong(scanner.nextLine().trim());
        if (id == null) { System.out.println("ID invalido"); return; }

        List<Producto> productos = productoRepo.buscarPorCategoria(id);
        if (productos.isEmpty()) {
            System.out.println("No hay productos activos en esa categoria");
            return;
        }
        productos.forEach(p ->
                System.out.println("ID: " + p.getId() +
                        " | Nombre: " + p.getNombre() +
                        " | Precio: $" + p.getPrecio() +
                        " | Stock: " + p.getStock()));
    }

    static void reporteTotalFacturado() {
        System.out.println("\n-- Total Facturado --");
        List<Pedido> pedidosTerminados =
                pedidoRepo.buscarPorEstado(Estado.TERMINADO);

        double total = pedidosTerminados.stream()
                .mapToDouble(p -> p.getTotal() != null ? p.getTotal() : 0.0)
                .sum();

        System.out.println("Total facturado: " +
                String.format(Locale.US, "$%.2f", total));
    }

    // =====================
    // UTILIDADES
    // =====================
    static Long parseLong(String input) {
        try { return Long.parseLong(input); }
        catch (NumberFormatException e) { return null; }
    }

    static Double parseDouble(String input) {
        try { return Double.parseDouble(input); }
        catch (NumberFormatException e) { return null; }
    }

    static Integer parseInteger(String input) {
        try { return Integer.parseInt(input); }
        catch (NumberFormatException e) { return null; }
    }
}