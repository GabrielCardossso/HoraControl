package com.example.sistemaponto.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import java.time.LocalDateTime;
import java.time.Duration;
import java.math.BigDecimal;
import java.math.RoundingMode;

import com.example.sistemaponto.enums.StatusPonto;
import com.example.sistemaponto.enums.TipoRegistro;

@Entity

public class RegistroPonto {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  private Professor professor;

  @ManyToOne
  private Turma turma;

  @Enumerated(EnumType.STRING)
  private TipoRegistro tipo = TipoRegistro.AULA_NORMAL;

  private String descricao;

  private LocalDateTime entrada;

  private LocalDateTime saida;

  @jakarta.persistence.Column(length = 1000)
  private String observacao;

  @Enumerated(EnumType.STRING)
  private StatusPonto status;

  private boolean ajustado;

  @jakarta.persistence.Column(length = 500)
  private String justificativaAjuste;

  @ManyToOne
  private Professor alteradoPor;

  private LocalDateTime dataAlteracao;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Professor getProfessor() {
    return professor;
  }

  public void setProfessor(Professor professor) {
    this.professor = professor;
  }

  public Turma getTurma() {
    return turma;
  }

  public void setTurma(Turma turma) {
    this.turma = turma;
  }

  public TipoRegistro getTipo() { return tipo; }
  public void setTipo(TipoRegistro tipo) { this.tipo = tipo; }
  public String getDescricao() { return descricao; }
  public void setDescricao(String descricao) { this.descricao = descricao; }

  public LocalDateTime getEntrada() {
    return entrada;
  }

  public void setEntrada(LocalDateTime entrada) {
    this.entrada = entrada;
  }

  public LocalDateTime getSaida() {
    return saida;
  }

  public void setSaida(LocalDateTime saida) {
    this.saida = saida;
  }

  public String getObservacao() {
    return observacao;
  }

  public void setObservacao(String observacao) {
    this.observacao = observacao;
  }

  public StatusPonto getStatus() {
    return status;
  }

  public void setStatus(StatusPonto status) {
    this.status = status;
  }

  public boolean isPontoCompleto() {
    return entrada != null && saida != null;
  }

  public boolean isAjustado() { return ajustado; }
  public void setAjustado(boolean ajustado) { this.ajustado = ajustado; }
  public String getJustificativaAjuste() { return justificativaAjuste; }
  public void setJustificativaAjuste(String justificativaAjuste) { this.justificativaAjuste = justificativaAjuste; }
  public Professor getAlteradoPor() { return alteradoPor; }
  public void setAlteradoPor(Professor alteradoPor) { this.alteradoPor = alteradoPor; }
  public LocalDateTime getDataAlteracao() { return dataAlteracao; }
  public void setDataAlteracao(LocalDateTime dataAlteracao) { this.dataAlteracao = dataAlteracao; }

  public long getMinutosTrabalhados() {
    return isPontoCompleto() ? Math.max(0, Duration.between(entrada, saida).toMinutes()) : 0;
  }

  public BigDecimal getHorasTrabalhadas() {
    return BigDecimal.valueOf(getMinutosTrabalhados()).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
  }

  public BigDecimal getValorCalculado() {
    if (turma == null || turma.getValorHora() == null) return BigDecimal.ZERO;
    return BigDecimal.valueOf(getMinutosTrabalhados())
        .multiply(turma.getValorHora())
        .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
  }

}
