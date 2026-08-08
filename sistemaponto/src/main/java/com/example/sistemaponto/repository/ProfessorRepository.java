package com.example.sistemaponto.repository;

import com.example.sistemaponto.entity.Professor;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorRepository
                extends JpaRepository<Professor, Long> {
        Optional<Professor> findByEmail(String email);
}
