package com.example.sistemaponto.service;

import com.example.sistemaponto.entity.Curso;
import com.example.sistemaponto.exception.RegraNegocioException;
import com.example.sistemaponto.repository.CursoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CursoService {
  private final CursoRepository repository;
  public CursoService(CursoRepository repository) { this.repository = repository; }
  public List<Curso> listar() { return repository.findAllByOrderByNomeAsc(); }
  public List<Curso> listarAtivos() { return repository.findByAtivoTrueOrderByNomeAsc(); }

  @Transactional
  public Curso salvar(Curso curso) {
    validar(curso, null);
    normalizar(curso);
    return repository.save(curso);
  }

  @Transactional
  public Curso atualizar(Long id, Curso dados) {
    Curso curso = repository.findById(id)
        .orElseThrow(() -> new RegraNegocioException("Curso não encontrado."));
    validar(dados, id);
    curso.setCodigo(dados.getCodigo());
    curso.setNome(dados.getNome());
    curso.setAtivo(dados.isAtivo());
    normalizar(curso);
    return repository.save(curso);
  }

  private void validar(Curso curso, Long id) {
    if (curso.getNome() == null || curso.getNome().isBlank())
      throw new RegraNegocioException("O nome do curso é obrigatório.");
    if (curso.getCodigo() == null || curso.getCodigo().isBlank())
      throw new RegraNegocioException("O código do curso é obrigatório.");
    boolean duplicado = id == null ? repository.existsByCodigoIgnoreCase(curso.getCodigo())
        : repository.existsByCodigoIgnoreCaseAndIdNot(curso.getCodigo(), id);
    if (duplicado)
      throw new RegraNegocioException("Já existe um curso com este código.");
  }

  private void normalizar(Curso curso) {
    curso.setCodigo(curso.getCodigo().trim().toUpperCase());
    curso.setNome(curso.getNome().trim());
  }
}
