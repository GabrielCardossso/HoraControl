package com.example.sistemaponto.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.sistemaponto.entity.Turma;
import com.example.sistemaponto.service.TurmaService;

import java.util.List;

@RestController
@RequestMapping("/api/turmas")
public class TurmaController {

  @Autowired
  private TurmaService service;

  @GetMapping
  public List<Turma> listar() {
    return service.listarAtivas();
  }

  @GetMapping("/todas")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  public List<Turma> listarTodas() {
    return service.listar();
  }

  @GetMapping("/{id}")
  public Turma buscar(@PathVariable Long id) {
    return service.buscar(id);
  }

  @PostMapping
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  public Turma salvar(@RequestBody Turma turma) {
    return service.salvar(turma);
  }

  @PutMapping("/{id}")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  public Turma atualizar(@PathVariable Long id,
      @RequestBody Turma turma) {
    turma.setId(id);
    return service.salvar(turma);
  }

  @DeleteMapping("/{id}")
  @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
  public void excluir(@PathVariable Long id) {
    service.excluir(id);
  }
}
