package com.example.sistemaponto.config;

import com.example.sistemaponto.repository.ProfessorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.sistemaponto.entity.Professor;

@Component
public class DataLoader implements CommandLineRunner {

  private final ProfessorRepository professorRepository;
  private final PasswordEncoder passwordEncoder;

  public DataLoader(ProfessorRepository professorRepository,
      PasswordEncoder passwordEncoder) {
    this.professorRepository = professorRepository;
    this.passwordEncoder = passwordEncoder;

  }

  @Override
  public void run(String... args) {

    if (professorRepository.findByEmail("admin@sistemaponto.com").isEmpty()) {

      Professor professor = new Professor();
      professor.setNome("Administrador");
      professor.setEmail("admin@sistemaponto.com");
      professor.setSenha(passwordEncoder.encode("123456"));

      professorRepository.save(professor);
    }
  }
}