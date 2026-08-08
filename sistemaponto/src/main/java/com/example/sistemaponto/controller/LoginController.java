package com.example.sistemaponto.controller;

import com.example.sistemaponto.dto.LoginDTO;
import com.example.sistemaponto.entity.Professor;
import com.example.sistemaponto.repository.ProfessorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*") // Permite que seu front-end acesse
public class LoginController {

  @Autowired
  private ProfessorRepository professorRepository;

  @Autowired
  private PasswordEncoder passwordEncoder; // Injeta o encoder configurado

  @PostMapping("/login")
  public ResponseEntity<?> entrar(@RequestBody LoginDTO dto) {
    // 1. Busca o professor pelo e-mail
    Optional<Professor> professorOpt = professorRepository.findByEmail(dto.getEmail());

    if (professorOpt.isEmpty()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário ou senha inválidos.");
    }

    Professor professor = professorOpt.get();

    // 2. Compara a senha digitada com a senha criptografada do banco
    // O método matches faz essa mágica com segurança
    boolean senhaValida = passwordEncoder.matches(dto.getSenha(), professor.getSenha());

    if (!senhaValida) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário ou senha inválidos.");
    }

    // 3. Se tudo estiver certo, retorna os dados do professor (exceto a senha por
    // segurança)
    return ResponseEntity.ok(professor);
  }
}
