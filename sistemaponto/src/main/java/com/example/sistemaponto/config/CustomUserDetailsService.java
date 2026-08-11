package com.example.sistemaponto.config;

import com.example.sistemaponto.entity.Professor;
import com.example.sistemaponto.repository.ProfessorRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
  private final ProfessorRepository repository;

  public CustomUserDetailsService(ProfessorRepository repository) {
    this.repository = repository;
  }

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    Professor professor = repository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado."));
    String perfil = professor.getPerfil() == null ? "PROFESSOR" : professor.getPerfil().name();
    return User.withUsername(professor.getEmail())
        .password(professor.getSenha())
        .roles(perfil)
        .disabled(!professor.isAtivo())
        .build();
  }
}
