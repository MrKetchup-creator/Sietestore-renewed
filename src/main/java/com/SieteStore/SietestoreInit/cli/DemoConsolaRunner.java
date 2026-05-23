/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.SieteStore.SietestoreInit.cli;

/**
 *
 * @author JEISON
 */
import com.SieteStore.SietestoreInit.model.Producto;
import com.SieteStore.SietestoreInit.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.List;
import java.util.Scanner;

@Component
public class DemoConsolaRunner implements CommandLineRunner {

    // Inyectamos el repositorio directamente, igual que en el Controller
    @Autowired
    private ProductoRepository productoRepository;

    @Override
    public void run(String... args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        boolean corriendo = true;

        System.out.println("\n=========================================================");
        System.out.println("  SISTEMA BACKEND INICIADO - MODO DEMO TECNICA (CONSOLA) ");
        System.out.println("=========================================================");

        while (corriendo) {
            System.out.println("\n--- MENU CRUD PRODUCTOS ---");
            System.out.println("1. Registrar nuevo Producto");
            System.out.println("2. Listar Catalogo (Solo Activos)");
            System.out.println("3. Agregar Stock a un Producto");
            System.out.println("4. Eliminar Producto (Borrado Logico)");
            System.out.println("5. Salir de la Demo");
            System.out.print("Seleccione una opcion: ");

            String opcion = scanner.nextLine();

            try {
                switch (opcion) {
                    case "1":
                        crearProducto(scanner);
                        break;
                    case "2":
                        listarProductos();
                        break;
                    case "3":
                        actualizarStock(scanner);
                        break;
                    case "4":
                        eliminarProducto(scanner);
                        break;
                    case "5":
                        corriendo = false;
                        System.out.println("Saliendo de la Demo Tecnica...");
                        break;
                    default:
                        System.out.println("[!] Opción no valida. Intente de nuevo.");
                }
            } catch (Exception e) {
                System.out.println("[X] Ocurrio un error en la operacion: " + e.getMessage());
            }
        }
    }

    private void crearProducto(Scanner scanner) {
        System.out.println("\n-- REGISTRO DE PRODUCTO --");
        Producto p = new Producto();
        
        System.out.print("Codigo de Referencia: ");
        p.setCodigoReferencia(scanner.nextLine());
        
        System.out.print("Nombre: ");
        p.setNombre(scanner.nextLine());
        
        System.out.print("Talla: ");
        p.setTalla(scanner.nextLine());
        
        System.out.print("Color: ");
        p.setColor(scanner.nextLine());
        
        System.out.print("Precio de Venta: ");
        p.setPrecioVenta(new BigDecimal(scanner.nextLine()));
        
        System.out.print("Stock Inicial: ");
        p.setStockActual(Integer.parseInt(scanner.nextLine()));
        
        System.out.print("Stock Minimo: ");
        p.setStockMinimo(Integer.parseInt(scanner.nextLine()));

        // Al guardar, Hibernate incluira automaticamente el id_categoria = 1
        productoRepository.save(p);
        System.out.println("[OK] Producto registrado correctamente en MySQL.");
    }
    
    
    private void listarProductos() {
        System.out.println("\n-- CATALOGO DE PRODUCTOS ACTIVOS --");
        // Reutilizamos la lógica de tu Controller
        List<Producto> productos = productoRepository.findByActivoTrue();
        
        if (productos.isEmpty()) {
            System.out.println("No hay productos registrados o activos.");
            return;
        }

        for (Producto p : productos) {
            System.out.printf("ID: %d | Ref: %s | Nombre: %s | Talla: %s | Precio: $%s | Stock: %d\n",
                    p.getIdProducto(), p.getCodigoReferencia(), p.getNombre(), 
                    p.getTalla(), p.getPrecioVenta(), p.getStockActual());
        }
    }

    private void actualizarStock(Scanner scanner) {
        System.out.print("\nIngrese el ID del producto a actualizar: ");
        Long id = Long.parseLong(scanner.nextLine());
        
        System.out.print("Ingrese la cantidad a sumar al stock: ");
        Integer cantidad = Integer.parseInt(scanner.nextLine());

        if (cantidad <= 0) {
            System.out.println("[!] La cantidad debe ser mayor a 0.");
            return;
        }

        // Simulamos la lógica de tu ProductoController
        productoRepository.findById(id).ifPresentOrElse(p -> {
            p.setStockActual(p.getStockActual() + cantidad);
            productoRepository.save(p);
            System.out.println("[OK] Stock actualizado. Nuevo stock: " + p.getStockActual());
        }, () -> System.out.println("[X] Producto no encontrado."));
    }

    private void eliminarProducto(Scanner scanner) {
        System.out.print("\nIngrese el ID del producto a eliminar logicamente: ");
        Long id = Long.parseLong(scanner.nextLine());

        productoRepository.findById(id).ifPresentOrElse(p -> {
            p.setActivo(false);
            productoRepository.save(p);
            System.out.println("[OK] Producto dado de baja (Borrado logico aplicado).");
        }, () -> System.out.println("[X] Producto no encontrado."));
    }
}