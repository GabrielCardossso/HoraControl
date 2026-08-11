package com.example.sistemaponto.controller;

import com.example.sistemaponto.entity.Curso;
import com.example.sistemaponto.service.CursoService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cursos")
public class CursoController {
  private final CursoService service;
  public CursoController(CursoService service) { this.service = service; }
  @GetMapping public List<Curso> listar() { return service.listarAtivos(); }
  @GetMapping("/todos") @PreAuthorize("hasRole('ADMIN')") public List<Curso> todos() { return service.listar(); }
  @PostMapping @PreAuthorize("hasRole('ADMIN')") public Curso salvar(@RequestBody Curso curso) { return service.salvar(curso); }
  @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public Curso atualizar(@PathVariable Long id, @RequestBody Curso curso) {
    curso.setId(id); return service.salvar(curso);
  }
}
