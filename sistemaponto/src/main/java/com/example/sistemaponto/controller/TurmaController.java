package com.example.sistemaponto.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.sistemaponto.entity.Turma;
import com.example.sistemaponto.service.TurmaService;

import java.util.List;

@RestController
@RequestMapping("/turmas")
@CrossOrigin(origins = "*")
public class TurmaController {

  @Autowired
  private TurmaService service;

  @GetMapping
  public List<Turma> listar() {
    return service.listar();
  }

  @GetMapping("/{id}")
  public Turma buscar(@PathVariable Long id) {
    return service.buscar(id);
  }

  @PostMapping
  public Turma salvar(@RequestBody Turma turma) {
    return service.salvar(turma);
  }

  @PutMapping("/{id}")
  public Turma atualizar(@PathVariable Long id,
      @RequestBody Turma turma) {
    turma.setId(id);
    return service.salvar(turma);
  }

  @DeleteMapping("/{id}")
  public void excluir(@PathVariable Long id) {
    service.excluir(id);
  }
}