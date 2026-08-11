package com.example.sistemaponto.repository;

import com.example.sistemaponto.entity.Curso;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoRepository extends JpaRepository<Curso, Long> {
  List<Curso> findAllByOrderByNomeAsc();

  List<Curso> findByAtivoTrueOrderByNomeAsc();

  boolean existsByCodigoIgnoreCase(String codigo);

  boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, Long id);
}
