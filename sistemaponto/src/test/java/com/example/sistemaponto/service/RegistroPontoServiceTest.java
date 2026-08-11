package com.example.sistemaponto.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

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
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RegistroPontoServiceTest {
  RegistroPontoRepository registros = mock(RegistroPontoRepository.class);
  ProfessorRepository professores = mock(ProfessorRepository.class);
  TurmaRepository turmas = mock(TurmaRepository.class);
  RegistroPontoService service = new RegistroPontoService(registros, professores, turmas);
  Professor professor;

  @BeforeEach void setup() {
    professor = new Professor(); professor.setId(1L); professor.setNome("Professor"); professor.setEmail("p@teste.com"); professor.setPerfil(Perfil.PROFESSOR); professor.setAtivo(true);
    when(professores.findByEmailIgnoreCase("p@teste.com")).thenReturn(Optional.of(professor));
  }

  @Test void impedeSegundoPontoAberto() {
    RegistroPonto aberto = new RegistroPonto(); aberto.setEntrada(java.time.LocalDateTime.now());
    when(registros.findByProfessorIdAndStatus(1L, StatusPonto.ABERTO)).thenReturn(Optional.of(aberto));
    AbrirPontoDTO dto = new AbrirPontoDTO(); dto.setTipo(TipoRegistro.ATIVIDADE_EXTRA);
    assertThatThrownBy(() -> service.abrir("p@teste.com", dto)).isInstanceOf(RegraNegocioException.class).hasMessageContaining("já possui");
  }

  @Test void fechaPontoEAtualizaStatus() {
    RegistroPonto registro = new RegistroPonto(); registro.setId(9L); registro.setProfessor(professor); registro.setEntrada(java.time.LocalDateTime.now().minusHours(1)); registro.setStatus(StatusPonto.ABERTO);
    when(registros.findById(9L)).thenReturn(Optional.of(registro)); when(registros.save(any())).thenAnswer(i -> i.getArgument(0));
    RegistroPonto fechado = service.fechar("p@teste.com", 9L);
    assertThat(fechado.getStatus()).isEqualTo(StatusPonto.FECHADO); assertThat(fechado.getSaida()).isNotNull();
  }

  @Test void exigeTurmaParaAulaNormal() {
    when(registros.findByProfessorIdAndStatus(1L, StatusPonto.ABERTO)).thenReturn(Optional.empty());
    AbrirPontoDTO dto = new AbrirPontoDTO(); dto.setTipo(TipoRegistro.AULA_NORMAL);
    assertThatThrownBy(() -> service.abrir("p@teste.com", dto)).hasMessageContaining("Selecione uma turma");
  }

  @Test void administradorAjustaComTrilhaDeAuditoria() {
    professor.setPerfil(Perfil.ADMIN);
    RegistroPonto registro = new RegistroPonto(); registro.setId(10L); registro.setProfessor(professor); registro.setStatus(StatusPonto.FECHADO);
    when(registros.findById(10L)).thenReturn(Optional.of(registro)); when(registros.save(any())).thenAnswer(i -> i.getArgument(0));
    AjustarPontoDTO dto = new AjustarPontoDTO(); dto.setEntrada(java.time.LocalDateTime.of(2026,8,10,8,0)); dto.setSaida(java.time.LocalDateTime.of(2026,8,10,10,0)); dto.setJustificativa("Correção autorizada");
    RegistroPonto ajustado = service.ajustar("p@teste.com", 10L, dto);
    assertThat(ajustado.isAjustado()).isTrue(); assertThat(ajustado.getAlteradoPor()).isEqualTo(professor); assertThat(ajustado.getJustificativaAjuste()).isEqualTo("Correção autorizada");
  }
}
