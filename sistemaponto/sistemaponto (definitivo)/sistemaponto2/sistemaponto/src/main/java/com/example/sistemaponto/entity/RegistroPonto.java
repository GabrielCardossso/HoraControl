package com.example.sistemaponto.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import java.time.LocalDateTime;

import com.example.sistemaponto.enums.StatusPonto;

@Entity

public class RegistroPonto {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  private Professor professor;

  @ManyToOne
  private Turma turma;

  private LocalDateTime entrada;

  private LocalDateTime saida;

  private String observacao;

  @Enumerated(EnumType.STRING)
  private StatusPonto status;

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

}