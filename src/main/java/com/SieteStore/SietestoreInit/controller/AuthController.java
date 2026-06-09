package com.SieteStore.SietestoreInit.controller;

import com.SieteStore.SietestoreInit.model.Usuario;
import com.SieteStore.SietestoreInit.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Usuario usuario = usuarioRepository.findByCorreo(email).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(401).body("Correo no registrado");
        }

        if (!passwordEncoder.matches(password, usuario.getPasswordHash())) {
            return ResponseEntity.status(401).body("Contraseña incorrecta");
        }

        if (!usuario.getActivo()) {
            return ResponseEntity.status(403).body("Usuario inactivo");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", usuario.getIdUsuario());
        response.put("name", usuario.getNombre());
        response.put("email", usuario.getCorreo());
        String role = usuario.getRol().toLowerCase().equals("administrador") ? "admin" : "empleado";
        response.put("role", role);
        response.put("roleLabel", usuario.getRol().equals("ADMINISTRADOR") ? "Administrador" : "Empleado");

        return ResponseEntity.ok(response);
    }

    // 🔥 ENDPOINT PARA RESETEAR CONTRASEÑA A "123"
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        Usuario usuario = usuarioRepository.findByCorreo(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + email));

        // Hashear "123" y actualizar
        usuario.setPasswordHash(passwordEncoder.encode("123"));
        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Contraseña actualizada a '123' correctamente para " + email);
    }
}