package com.example.sistemaponto.service;

import com.example.sistemaponto.entity.Turma;
import com.example.sistemaponto.exception.RegraNegocioException;
import com.example.sistemaponto.repository.CursoRepository;
import com.example.sistemaponto.repository.TurmaRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TurmaService {
  private final TurmaRepository repository;
  private final CursoRepository cursoRepository;

  public TurmaService(TurmaRepository repository, CursoRepository cursoRepository) {
    this.repository = repository;
    this.cursoRepository = cursoRepository;
  }

  public List<Turma> listar() {
    return repository.findAllByOrderByCodigoAsc();
  }

  public List<Turma> listarAtivas() {
    return repository.findByAtivoTrueOrderByCodigoAsc();
  }

  public Turma buscar(Long id) {
    return repository.findById(id).orElseThrow(() -> new RegraNegocioException("Turma não encontrada."));
  }

  @Transactional
  public Turma salvar(Turma turma) {
    if (turma.getCodigo() == null || turma.getCodigo().isBlank())
      throw new RegraNegocioException("O código da turma é obrigatório.");
    if (turma.getNome() == null || turma.getNome().isBlank())
      throw new RegraNegocioException("O nome da turma é obrigatório.");
    boolean duplicado = turma.getId() == null ? repository.existsByCodigoIgnoreCase(turma.getCodigo())
        : repository.existsByCodigoIgnoreCaseAndIdNot(turma.getCodigo(), turma.getId());
    if (duplicado)
      throw new RegraNegocioException("Já existe uma turma com este código.");
    if (turma.getValorHora() == null || turma.getValorHora().compareTo(BigDecimal.ZERO) < 0)
      throw new RegraNegocioException("O valor da hora deve ser zero ou positivo.");
    if (turma.getCurso() != null && turma.getCurso().getId() != null)
      turma.setCurso(cursoRepository.findById(turma.getCurso().getId())
          .orElseThrow(() -> new RegraNegocioException("Curso não encontrado.")));
    turma.setCodigo(turma.getCodigo().trim().toUpperCase());
    turma.setNome(turma.getNome().trim());
    return repository.save(turma);
  }

  @Transactional
  public void excluir(Long id) {
    Turma turma = buscar(id);
    turma.setAtivo(false);
    repository.save(turma);
  }
}
