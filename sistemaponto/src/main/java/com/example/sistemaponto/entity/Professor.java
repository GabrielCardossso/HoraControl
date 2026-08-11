package com.example.sistemaponto.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import com.example.sistemaponto.enums.Perfil;

import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

@Table(name = "professores")
@Entity
public class Professor {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String nome;

  @Column(unique = true, length = 50)
  private String matricula;

  @Column(unique = true, nullable = false)
  private String email;

  @Column(unique = true, length = 14)
  private String cpf;

  private String telefone;

  @Enumerated(EnumType.STRING)
  private Perfil perfil;

  @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
  @Column(nullable = false)
  private String senha;

  @Column(nullable = false)
  private boolean ativo = true;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "curso_responsavel_id")
  private Curso cursoResponsavel;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(name = "professor_turma", joinColumns = @JoinColumn(name = "professor_id"), inverseJoinColumns = @JoinColumn(name = "turma_id"))
  private Set<Turma> turmas = new LinkedHashSet<>();

  @Column(nullable = false)
  private LocalDateTime dataCriacao = LocalDateTime.now();

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public void setNome(String nome) {
    this.nome = nome;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public void setSenha(String senha) {
    this.senha = senha;
  }

  public String getNome() {
    return nome;
  }

  public String getEmail() {
    return email;
  }

  public String getSenha() {
    return senha;
  }

  public String getMatricula() {
    return matricula;
  }

  public void setMatricula(String matricula) {
    this.matricula = matricula;
  }

  public String getCpf() {
    return cpf;
  }

  public void setCpf(String cpf) {
    this.cpf = cpf;
  }

  public String getTelefone() {
    return telefone;
  }

  public void setTelefone(String telefone) {
    this.telefone = telefone;
  }

  public boolean isAtivo() {
    return ativo;
  }

  public void setAtivo(boolean ativo) {
    this.ativo = ativo;
  }

  public Curso getCursoResponsavel() {
    return cursoResponsavel;
  }

  public void setCursoResponsavel(Curso cursoResponsavel) {
    this.cursoResponsavel = cursoResponsavel;
  }

  public Set<Turma> getTurmas() {
    return turmas;
  }

  public void setTurmas(Set<Turma> turmas) {
    this.turmas = turmas == null ? new LinkedHashSet<>() : turmas;
  }

  public LocalDateTime getDataCriacao() {
    return dataCriacao;
  }

  public void setDataCriacao(LocalDateTime dataCriacao) {
    this.dataCriacao = dataCriacao;
  }

  public Perfil getPerfil() {
    return perfil;
  }

  public void setPerfil(Perfil perfil) {
    this.perfil = perfil;
  }

}
