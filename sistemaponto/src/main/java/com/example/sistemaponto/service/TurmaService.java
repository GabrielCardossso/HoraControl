package com.example.sistemaponto.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.sistemaponto.entity.Turma;
import com.example.sistemaponto.repository.TurmaRepository;

@Service
public class TurmaService {

  @Autowired
  private TurmaRepository repository;

  public List<Turma> listar() {
    return repository.findAll();
  }

  public Turma buscar(Long id) {
    return repository.findById(id).orElse(null);
  }

  public Turma salvar(Turma turma) {
    return repository.save(turma);
  }

  public void excluir(Long id) {
    repository.deleteById(id);
  }
}