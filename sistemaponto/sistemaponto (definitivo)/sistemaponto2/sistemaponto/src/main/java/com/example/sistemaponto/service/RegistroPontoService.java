package com.example.sistemaponto.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.sistemaponto.entity.Professor;
import com.example.sistemaponto.entity.RegistroPonto;
import com.example.sistemaponto.entity.Turma;
import com.example.sistemaponto.repository.ProfessorRepository;
import com.example.sistemaponto.repository.RegistroPontoRepository;
import com.example.sistemaponto.repository.TurmaRepository;

@Service
public class RegistroPontoService {

        @Autowired
        private RegistroPontoRepository registroRepository;

        @Autowired
        private ProfessorRepository professorRepository;

        @Autowired
        private TurmaRepository turmaRepository;

        public RegistroPonto abrir(Long professorId, Long turmaId) {

                Professor professor = professorRepository.findById(professorId)
                                .orElseThrow(() -> new RuntimeException("Professor não encontrado."));

                Turma turma = turmaRepository.findById(turmaId)
                                .orElseThrow(() -> new RuntimeException("Turma não encontrada."));

                RegistroPonto registro = new RegistroPonto();

                registro.setProfessor(professor);
                registro.setTurma(turma);
                registro.setEntrada(LocalDateTime.now());
                registro.setSaida(null);
                registro.setObservacao(null);
                registro.setStatus(com.example.sistemaponto.enums.StatusPonto.ABERTO);

                return registroRepository.save(registro);
        }

        public RegistroPonto fechar(Long id) {

                RegistroPonto registro = registroRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Registro não encontrado."));

                registro.setSaida(LocalDateTime.now());

                return registroRepository.save(registro);
        }

        public List<RegistroPonto> listar() {
                return registroRepository.findAll();
        }

        public RegistroPonto buscar(Long id) {
                return registroRepository.findById(id).orElse(null);
        }

        public void excluir(Long id) {
                registroRepository.deleteById(id);
        }
}