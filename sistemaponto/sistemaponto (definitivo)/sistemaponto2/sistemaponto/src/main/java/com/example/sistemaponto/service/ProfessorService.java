package com.example.sistemaponto.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.sistemaponto.entity.Professor;
import com.example.sistemaponto.repository.ProfessorRepository;

@Service
public class ProfessorService {

  @Autowired
  private ProfessorRepository repository;

  public List<Professor> listar() {
    return repository.findAll();
  }

  public Professor buscar(Long id) {
    return repository.findById(id).orElse(null);
  }

  public Professor salvar(Professor professor) {
    return repository.save(professor);
  }

  public void excluir(Long id) {
    repository.deleteById(id);
  }
}