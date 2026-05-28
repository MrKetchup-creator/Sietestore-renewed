/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.demo;


public class IdentificarPalindromo {
    
    //Metodo verificar si es Palindromo
    public boolean esPalindromo(String palabra) {

        //Convertir a minusculas y quitar espacios
        palabra = palabra.toLowerCase().replace(" ", "");

        //Invertir
        String invertida = new StringBuilder(palabra).reverse().toString();

        // Comparar
        return palabra.equals(invertida);
    }
}
