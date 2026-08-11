package com.example.sistemaponto.config;

import com.example.sistemaponto.repository.ProfessorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import com.example.sistemaponto.enums.Perfil;

import com.example.sistemaponto.entity.Professor;

@Component
public class DataLoader implements CommandLineRunner {

  private final ProfessorRepository professorRepository;
  private final PasswordEncoder passwordEncoder;
  private final String adminEmail;
  private final String adminPassword;

  public DataLoader(ProfessorRepository professorRepository,
      PasswordEncoder passwordEncoder,
      @Value("${horacontrol.admin.email}") String adminEmail,
      @Value("${horacontrol.admin.password}") String adminPassword) {
    this.professorRepository = professorRepository;
    this.passwordEncoder = passwordEncoder;
    this.adminEmail = adminEmail;
    this.adminPassword = adminPassword;

  }

  @Override
  public void run(String... args) {

    Professor professor = professorRepository.findByEmailIgnoreCase(adminEmail).orElseGet(Professor::new);

    if (professor.getId() == null) {
      professor.setNome("Administrador");
      professor.setEmail(adminEmail.toLowerCase());
      professor.setSenha(passwordEncoder.encode(adminPassword));
    }
    professor.setPerfil(Perfil.ADMIN);
    professor.setAtivo(true);
    professorRepository.save(professor);
  }
}
