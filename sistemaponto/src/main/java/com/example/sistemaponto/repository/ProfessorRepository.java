package com.example.sistemaponto.repository;

import com.example.sistemaponto.entity.Professor;

import java.util.Optional;
import java.util.List;
import com.example.sistemaponto.enums.Perfil;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorRepository
                extends JpaRepository<Professor, Long> {
        Optional<Professor> findByEmail(String email);
        Optional<Professor> findByEmailIgnoreCase(String email);
        boolean existsByEmailIgnoreCase(String email);
        boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
        List<Professor> findAllByOrderByNomeAsc();
        List<Professor> findByPerfilAndAtivoTrueOrderByNomeAsc(Perfil perfil);
}
