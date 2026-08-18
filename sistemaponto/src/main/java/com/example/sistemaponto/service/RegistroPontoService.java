package com.example.sistemaponto.service;

import com.example.sistemaponto.dto.AbrirPontoDTO;
import com.example.sistemaponto.dto.AjustarPontoDTO;
import com.example.sistemaponto.entity.Professor;
import com.example.sistemaponto.entity.RegistroPonto;
import com.example.sistemaponto.entity.Turma;
import com.example.sistemaponto.enums.Perfil;
import com.example.sistemaponto.enums.StatusPonto;
import com.example.sistemaponto.enums.TipoRegistro;
import com.example.sistemaponto.exception.RegraNegocioException;
import com.example.sistemaponto.repository.ProfessorRepository;
import com.example.sistemaponto.repository.RegistroPontoRepository;
import com.example.sistemaponto.repository.TurmaRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.LinkedHashMap;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistroPontoService {
  private final RegistroPontoRepository registroRepository;
  private final ProfessorRepository professorRepository;
  private final TurmaRepository turmaRepository;

  public RegistroPontoService(RegistroPontoRepository registroRepository,
      ProfessorRepository professorRepository, TurmaRepository turmaRepository) {
    this.registroRepository = registroRepository;
    this.professorRepository = professorRepository;
    this.turmaRepository = turmaRepository;
  }

  @Transactional
  public RegistroPonto abrir(String email, AbrirPontoDTO dto) {
    Professor professor = usuario(email);
    registroRepository.findByProfessorIdAndStatus(professor.getId(), StatusPonto.ABERTO)
        .ifPresent(r -> {
          throw new RegraNegocioException("Você já possui um ponto aberto desde " + r.getEntrada() + ".");
        });

    Turma turma = null;
    if (dto.getTurmaId() != null) {
      turma = turmaRepository.findById(dto.getTurmaId())
          .orElseThrow(() -> new RegraNegocioException("Turma não encontrada."));
      if (!turma.isAtivo())
        throw new RegraNegocioException("Esta turma está inativa.");
      Long turmaSelecionadaId = turma.getId();
      if (professor.getPerfil() == Perfil.PROFESSOR
          && professor.getTurmas().stream().noneMatch(t -> t.getId().equals(turmaSelecionadaId)))
        throw new RegraNegocioException("Esta turma não está vinculada ao seu cadastro.");
    }
    if (dto.getTipo() == TipoRegistro.AULA_NORMAL && turma == null)
      throw new RegraNegocioException("Selecione uma turma para registrar uma aula.");

    RegistroPonto registro = new RegistroPonto();
    registro.setProfessor(professor);
    registro.setTurma(turma);
    registro.setTipo(dto.getTipo());
    registro.setDescricao(limpar(dto.getDescricao()));
    registro.setObservacao(limpar(dto.getObservacao()));
    registro.setEntrada(LocalDateTime.now());
    registro.setStatus(StatusPonto.ABERTO);
    return registroRepository.save(registro);
  }

  @Transactional
  public RegistroPonto fechar(String email, Long id) {
    Professor solicitante = usuario(email);
    RegistroPonto registro = buscarObrigatorio(id);
    if (!podeGerenciar(solicitante, registro))
      throw new RegraNegocioException("Você não pode fechar o ponto de outro usuário.");
    if (registro.getStatus() == StatusPonto.FECHADO)
      throw new RegraNegocioException("Este ponto já está fechado.");
    registro.setSaida(LocalDateTime.now());
    registro.setStatus(StatusPonto.FECHADO);
    return registroRepository.save(registro);
  }

  public RegistroPonto pontoAberto(String email) {
    Professor professor = usuario(email);
    return registroRepository.findByProfessorIdAndStatus(professor.getId(), StatusPonto.ABERTO).orElse(null);
  }

  @Transactional
  public RegistroPonto ajustar(String email, Long id, AjustarPontoDTO dto) {
    Professor solicitante = usuario(email);
    if (solicitante.getPerfil() == null || !solicitante.getPerfil().isCoordenacao())
      throw new RegraNegocioException("Somente a coordenação ou a administração pode ajustar registros.");
    RegistroPonto registro = buscarObrigatorio(id);
    if (!podeGerenciar(solicitante, registro))
      throw new RegraNegocioException("Você não pode ajustar este registro.");
    if (!dto.getSaida().isAfter(dto.getEntrada()))
      throw new RegraNegocioException("A saída deve ser posterior à entrada.");
    registro.setEntrada(dto.getEntrada());
    registro.setSaida(dto.getSaida());
    registro.setStatus(StatusPonto.FECHADO);
    registro.setObservacao(limpar(dto.getObservacao()));
    registro.setAjustado(true);
    registro.setJustificativaAjuste(dto.getJustificativa().trim());
    registro.setAlteradoPor(solicitante);
    registro.setDataAlteracao(LocalDateTime.now());
    return registroRepository.save(registro);
  }

  public List<RegistroPonto> filtrar(String email, LocalDate inicio, LocalDate fim, Long professorId,
      Long turmaId, StatusPonto status, TipoRegistro tipo, String busca) {
    Professor solicitante = usuario(email);
    Stream<RegistroPonto> fluxo = visiveis(solicitante).stream();
    if (inicio != null)
      fluxo = fluxo.filter(r -> !r.getEntrada().toLocalDate().isBefore(inicio));
    if (fim != null)
      fluxo = fluxo.filter(r -> !r.getEntrada().toLocalDate().isAfter(fim));
    if (professorId != null)
      fluxo = fluxo.filter(r -> r.getProfessor().getId().equals(professorId));
    if (turmaId != null)
      fluxo = fluxo.filter(r -> r.getTurma() != null && r.getTurma().getId().equals(turmaId));
    if (status != null)
      fluxo = fluxo.filter(r -> r.getStatus() == status);
    if (tipo != null)
      fluxo = fluxo.filter(r -> r.getTipo() == tipo);
    if (busca != null && !busca.isBlank()) {
      String termo = busca.toLowerCase(Locale.ROOT);
      fluxo = fluxo.filter(r -> contem(r.getDescricao(), termo) || contem(r.getObservacao(), termo)
          || (r.getTurma() != null
              && (contem(r.getTurma().getNome(), termo) || contem(r.getTurma().getCodigo(), termo)))
          || contem(r.getProfessor().getNome(), termo));
    }
    return fluxo.toList();
  }

  public List<RegistroPonto> visiveis(Professor solicitante) {
    if (solicitante.getPerfil() != null && solicitante.getPerfil().podeVerTodosRelatorios())
      return registroRepository.findAllByOrderByEntradaDesc();
    if (solicitante.getPerfil() == Perfil.COORDENADOR_CURSO && solicitante.getCursoResponsavel() != null) {
      Long cursoId = solicitante.getCursoResponsavel().getId();
      return registroRepository.findAllByOrderByEntradaDesc().stream()
          .filter(r -> r.getTurma() != null && r.getTurma().getCurso() != null
              && r.getTurma().getCurso().getId().equals(cursoId))
          .toList();
    }
    return registroRepository.findByProfessorIdOrderByEntradaDesc(solicitante.getId());
  }

  public Professor usuario(String email) {
    return professorRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new RegraNegocioException("Usuário autenticado não encontrado."));
  }

  public List<Professor> professoresVisiveis(String email) {
    Professor solicitante = usuario(email);
    if (solicitante.getPerfil() != null && solicitante.getPerfil().podeVerTodosRelatorios())
      return professorRepository.findAllByOrderByNomeAsc().stream().filter(Professor::isAtivo).toList();
    if (solicitante.getPerfil() == Perfil.COORDENADOR_CURSO && solicitante.getCursoResponsavel() != null) {
      Long cursoId = solicitante.getCursoResponsavel().getId();
      return professorRepository.findAllByOrderByNomeAsc().stream().filter(Professor::isAtivo)
          .filter(
              p -> p.getTurmas().stream().anyMatch(t -> t.getCurso() != null && t.getCurso().getId().equals(cursoId)))
          .toList();
    }
    LinkedHashMap<Long, Professor> mapa = new LinkedHashMap<>();
    mapa.put(solicitante.getId(), solicitante);
    visiveis(solicitante).forEach(r -> mapa.put(r.getProfessor().getId(), r.getProfessor()));
    return mapa.values().stream().sorted(java.util.Comparator.comparing(Professor::getNome)).toList();
  }

  @Transactional(readOnly = true)
  public List<Turma> turmasPermitidas(String email) {
    Professor solicitante = usuario(email);
    if (solicitante.getPerfil() != Perfil.PROFESSOR)
      return turmaRepository.findByAtivoTrueOrderByCodigoAsc();
    return solicitante.getTurmas().stream()
        .filter(Turma::isAtivo)
        .sorted(java.util.Comparator.comparing(Turma::getCodigo, String.CASE_INSENSITIVE_ORDER))
        .toList();
  }

  public RegistroPonto buscar(Long id, String email) {
    Professor solicitante = usuario(email);
    RegistroPonto registro = buscarObrigatorio(id);
    if (!podeGerenciar(solicitante, registro))
      throw new RegraNegocioException("Acesso negado a este registro.");
    return registro;
  }

  private RegistroPonto buscarObrigatorio(Long id) {
    return registroRepository.findById(id).orElseThrow(() -> new RegraNegocioException("Registro não encontrado."));
  }

  private boolean podeGerenciar(Professor usuario, RegistroPonto registro) {
    if (usuario.getId().equals(registro.getProfessor().getId()))
      return true;
    if (usuario.getPerfil() != null && usuario.getPerfil().podeVerTodosRelatorios())
      return true;
    return usuario.getPerfil() == Perfil.COORDENADOR_CURSO && usuario.getCursoResponsavel() != null
        && registro.getTurma() != null && registro.getTurma().getCurso() != null
        && usuario.getCursoResponsavel().getId().equals(registro.getTurma().getCurso().getId());
  }

  private boolean contem(String valor, String termo) {
    return valor != null && valor.toLowerCase(Locale.ROOT).contains(termo);
  }

  private String limpar(String valor) {
    return valor == null || valor.isBlank() ? null : valor.trim();
  }
}
