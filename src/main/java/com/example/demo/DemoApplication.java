package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
            
		SpringApplication.run(DemoApplication.class, args);
                
                    //Crear
                    IdentificarPalindromo identificador = new IdentificarPalindromo();

                    //Evaluar
                    String palabra = "hola";

                    //Verificar
                    boolean resultado = identificador.esPalindromo(palabra);

                    //Mostrar resultado
                    if (resultado) {
                        System.out.println("La palabra '" + palabra + "' SI es un palindromo");
                    } else {
                        System.out.println("La palabra '" + palabra + "' NO es un palindromo");
                    }
	}

}
