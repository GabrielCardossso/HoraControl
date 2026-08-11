package com.example.sistemaponto.service;

import com.example.sistemaponto.dto.AlterarSenhaDTO;
import com.example.sistemaponto.dto.UsuarioRequestDTO;
import com.example.sistemaponto.entity.Professor;
import com.example.sistemaponto.entity.Turma;
import com.example.sistemaponto.enums.Perfil;
import com.example.sistemaponto.exception.RegraNegocioException;
import com.example.sistemaponto.repository.CursoRepository;
import com.example.sistemaponto.repository.ProfessorRepository;
import com.example.sistemaponto.repository.TurmaRepository;
import java.util.LinkedHashSet;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfessorService {
  private final ProfessorRepository repository;
  private final CursoRepository cursoRepository;
  private final TurmaRepository turmaRepository;
  private final PasswordEncoder passwordEncoder;

  public ProfessorService(ProfessorRepository repository, CursoRepository cursoRepository,
      TurmaRepository turmaRepository, PasswordEncoder passwordEncoder) {
    this.repository = repository;
    this.cursoRepository = cursoRepository;
    this.turmaRepository = turmaRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public List<Professor> listar() { return repository.findAllByOrderByNomeAsc(); }

  public Professor buscar(Long id) {
    return repository.findById(id).orElseThrow(() -> new RegraNegocioException("Usuário não encontrado."));
  }

  public Professor buscarPorEmail(String email) {
    return repository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new RegraNegocioException("Usuário não encontrado."));
  }

  @Transactional
  public Professor criar(UsuarioRequestDTO dto) {
    if (repository.existsByEmailIgnoreCase(dto.getEmail()))
      throw new RegraNegocioException("Já existe uma conta com este e-mail.");
    if (dto.getSenha() == null || dto.getSenha().length() < 6)
      throw new RegraNegocioException("Informe uma senha inicial com pelo menos 6 caracteres.");
    Professor usuario = new Professor();
    aplicar(usuario, dto);
    usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
    return repository.save(usuario);
  }

  @Transactional
  public Professor atualizar(Long id, UsuarioRequestDTO dto) {
    Professor usuario = buscar(id);
    if (repository.existsByEmailIgnoreCaseAndIdNot(dto.getEmail(), id))
      throw new RegraNegocioException("Já existe outra conta com este e-mail.");
    aplicar(usuario, dto);
    if (dto.getSenha() != null && !dto.getSenha().isBlank())
      usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
    return repository.save(usuario);
  }

  private void aplicar(Professor usuario, UsuarioRequestDTO dto) {
    usuario.setNome(dto.getNome().trim());
    usuario.setMatricula(limpar(dto.getMatricula()));
    usuario.setCpf(limpar(dto.getCpf()));
    usuario.setEmail(dto.getEmail().trim().toLowerCase());
    usuario.setTelefone(limpar(dto.getTelefone()));
    usuario.setPerfil(dto.getPerfil() == null ? Perfil.PROFESSOR : dto.getPerfil());
    usuario.setAtivo(dto.isAtivo());
    usuario.setCursoResponsavel(dto.getCursoResponsavelId() == null ? null : cursoRepository
        .findById(dto.getCursoResponsavelId()).orElseThrow(() -> new RegraNegocioException("Curso não encontrado.")));
    LinkedHashSet<Turma> turmas = new LinkedHashSet<>();
    if (dto.getTurmaIds() != null) dto.getTurmaIds().forEach(id -> turmas.add(turmaRepository.findById(id)
        .orElseThrow(() -> new RegraNegocioException("Turma não encontrada: " + id))));
    usuario.setTurmas(turmas);
  }

  @Transactional
  public void alterarSenha(String email, AlterarSenhaDTO dto) {
    Professor usuario = buscarPorEmail(email);
    if (!passwordEncoder.matches(dto.getSenhaAtual(), usuario.getSenha()))
      throw new RegraNegocioException("A senha atual está incorreta.");
    usuario.setSenha(passwordEncoder.encode(dto.getNovaSenha()));
    repository.save(usuario);
  }

  public Professor salvar(Professor professor) { return repository.save(professor); }

  @Transactional
  public void excluir(Long id) {
    Professor usuario = buscar(id);
    usuario.setAtivo(false);
    repository.save(usuario);
  }

  private String limpar(String valor) {
    return valor == null || valor.isBlank() ? null : valor.trim();
  }
}
