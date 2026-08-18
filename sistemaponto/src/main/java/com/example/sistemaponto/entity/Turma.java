package com.example.sistemaponto.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.persistence.Column;

@Entity

public class Turma {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false, length = 60)
  private String codigo;

  @Column(nullable = false)
  private String nome;

  private String periodo;

  private String turno;

  private BigDecimal cargaHorariaPrevista;
  private LocalDate dataInicio;
  private LocalDate dataFim;

  @Column(nullable = false)
  private boolean ativo = true;

  @ManyToOne
  private Curso curso;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getNome() {
    return nome;
  }

  public String getCodigo() {
    return codigo;
  }

  public void setCodigo(String codigo) {
    this.codigo = codigo;
  }

  public void setNome(String nome) {
    this.nome = nome;
  }

  public String getPeriodo() {
    return periodo;
  }

  public void setPeriodo(String periodo) {
    this.periodo = periodo;
  }

  public String getTurno() {
    return turno;
  }

  public void setTurno(String turno) {
    this.turno = turno;
  }

  public Curso getCurso() {
    return curso;
  }

  public void setCurso(Curso curso) {
    this.curso = curso;
  }

  public BigDecimal getCargaHorariaPrevista() {
    return cargaHorariaPrevista;
  }

  public void setCargaHorariaPrevista(BigDecimal cargaHorariaPrevista) {
    this.cargaHorariaPrevista = cargaHorariaPrevista;
  }

  public LocalDate getDataInicio() {
    return dataInicio;
  }

  public void setDataInicio(LocalDate dataInicio) {
    this.dataInicio = dataInicio;
  }

  public LocalDate getDataFim() {
    return dataFim;
  }

  public void setDataFim(LocalDate dataFim) {
    this.dataFim = dataFim;
  }

  public boolean isAtivo() {
    return ativo;
  }

  public void setAtivo(boolean ativo) {
    this.ativo = ativo;
  }

}
