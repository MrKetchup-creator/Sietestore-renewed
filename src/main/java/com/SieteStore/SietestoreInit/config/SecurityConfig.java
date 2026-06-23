package com.SieteStore.SietestoreInit.config;

import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // Desactivar CSRF para API REST
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll() // Permitir todas las rutas de la API
                .anyRequest().authenticated() // Cualquier otra ruta requiere autenticación
            )
            .formLogin(form -> form.disable()) // Desactivar el formulario de login por defecto
            .httpBasic(httpBasic -> httpBasic.disable()); // Desactivar autenticación básica
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
            configuration.setAllowedOrigins(Arrays.asList(
            "http://127.0.0.1:5501",
            "http://localhost:5501",
            "https://sietestore-app.web.app" // Origen de Firebase
            ));
            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT",
            "DELETE", "OPTIONS"));
            configuration.setAllowedHeaders(List.of("*"));
            configuration.setAllowCredentials(true);

            UrlBasedCorsConfigurationSource source = new
            UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", configuration);
            return source;
    }
}