package com.example.sistemaponto.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.sistemaponto.entity.Professor;
import com.example.sistemaponto.service.ProfessorService;
import com.example.sistemaponto.dto.UsuarioRequestDTO;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasRole('ADMIN')")
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
  public Professor salvar(@Valid @RequestBody UsuarioRequestDTO dto) {
    return service.criar(dto);
  }

  @PutMapping("/{id}")
  public Professor atualizar(@PathVariable Long id,
      @Valid @RequestBody UsuarioRequestDTO dto) {
    return service.atualizar(id, dto);
  }

  @DeleteMapping("/{id}")
  public void excluir(@PathVariable Long id) {
    service.excluir(id);
  }
}
