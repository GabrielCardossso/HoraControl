package com.example.sistemaponto.repository;

import com.example.sistemaponto.entity.Turma;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TurmaRepository
        extends JpaRepository<Turma, Long> {
  List<Turma> findAllByOrderByCodigoAsc();
  List<Turma> findByAtivoTrueOrderByCodigoAsc();
  Optional<Turma> findByCodigoIgnoreCase(String codigo);
  boolean existsByCodigoIgnoreCase(String codigo);
  boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, Long id);
}
