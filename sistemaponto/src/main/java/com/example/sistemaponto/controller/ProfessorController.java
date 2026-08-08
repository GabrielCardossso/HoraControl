package com.example.sistemaponto.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.sistemaponto.entity.Professor;
import com.example.sistemaponto.service.ProfessorService;

import java.util.List;

@RestController
@RequestMapping("/professor")
@CrossOrigin(origins = "*")
public class ProfessorController {

  @Autowired
  private ProfessorService service;

  @GetMapping
  public List<Professor> listar() {
    return service.listar();
  }

  @GetMapping("/{id}")
  public Professor buscar(@PathVariable Long id) {
    return service.buscar(id);
  }

  @PostMapping
  public Professor salvar(@RequestBody Professor professor) {
    return service.salvar(professor);
  }

  @PutMapping("/{id}")
  public Professor atualizar(@PathVariable Long id,
      @RequestBody Professor professor) {
    professor.setId(id);
    return service.salvar(professor);
  }

  @DeleteMapping("/{id}")
  public void excluir(@PathVariable Long id) {
    service.excluir(id);
  }
}