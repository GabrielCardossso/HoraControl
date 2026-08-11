package com.example.sistemaponto.controller;

import com.example.sistemaponto.dto.AlterarSenhaDTO;
import com.example.sistemaponto.entity.Professor;
import com.example.sistemaponto.service.ProfessorService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conta")
public class ContaController {
  private final ProfessorService service;
  public ContaController(ProfessorService service) { this.service = service; }
  @GetMapping public Professor atual(Principal principal) { return service.buscarPorEmail(principal.getName()); }
  @PostMapping("/senha") public Map<String, String> senha(@Valid @RequestBody AlterarSenhaDTO dto, Principal principal) {
    service.alterarSenha(principal.getName(), dto);
    return Map.of("mensagem", "Senha alterada com sucesso.");
  }
}
