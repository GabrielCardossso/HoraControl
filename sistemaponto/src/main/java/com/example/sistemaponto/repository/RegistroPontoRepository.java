package com.example.sistemaponto.repository;

import com.example.sistemaponto.entity.RegistroPonto;
import com.example.sistemaponto.enums.StatusPonto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegistroPontoRepository
    extends JpaRepository<RegistroPonto, Long> {

  Optional<RegistroPonto> findByProfessorIdAndStatus(
      Long professorId,
      StatusPonto status);
}