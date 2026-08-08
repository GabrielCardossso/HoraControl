package com.example.sistemaponto.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.sistemaponto.dto.RegistroDTO;
import com.example.sistemaponto.entity.RegistroPonto;
import com.example.sistemaponto.service.RegistroPontoService;

import java.util.List;

@RestController
@RequestMapping("/registro")
@CrossOrigin(origins = "*")
public class RegistroPontoController {

    @Autowired
    private RegistroPontoService service;

    @PostMapping("/abrir")
    public RegistroPonto abrir(@RequestBody RegistroDTO dto) {
        return service.abrir(dto.getProfessorId(), dto.getTurmaId());
    }

    @PostMapping("/fechar/{id}")
    public RegistroPonto fechar(@PathVariable Long id) {
        return service.fechar(id);
    }

    @GetMapping
    public List<RegistroPonto> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public RegistroPonto buscar(@PathVariable Long id) {
        return service.buscar(id);
    }
}