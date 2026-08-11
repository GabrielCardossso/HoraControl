package com.example.sistemaponto.dto;

import com.example.sistemaponto.enums.Perfil;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.LinkedHashSet;
import java.util.Set;

public class UsuarioRequestDTO {
  @NotBlank
  private String nome;
  private String matricula;
  private String cpf;
  @NotBlank
  @Email
  private String email;
  private String telefone;
  @NotNull
  private Perfil perfil;
  @Size(min = 6)
  private String senha;
  private boolean ativo = true;
  private Long cursoResponsavelId;
  private Set<Long> turmaIds = new LinkedHashSet<>();

  public String getNome() {
    return nome;
  }

  public void setNome(String nome) {
    this.nome = nome;
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

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getTelefone() {
    return telefone;
  }

  public void setTelefone(String telefone) {
    this.telefone = telefone;
  }

  public Perfil getPerfil() {
    return perfil;
  }

  public void setPerfil(Perfil perfil) {
    this.perfil = perfil;
  }

  public String getSenha() {
    return senha;
  }

  public void setSenha(String senha) {
    this.senha = senha;
  }

  public boolean isAtivo() {
    return ativo;
  }

  public void setAtivo(boolean ativo) {
    this.ativo = ativo;
  }

  public Long getCursoResponsavelId() {
    return cursoResponsavelId;
  }

  public void setCursoResponsavelId(Long cursoResponsavelId) {
    this.cursoResponsavelId = cursoResponsavelId;
  }

  public Set<Long> getTurmaIds() {
    return turmaIds;
  }

  public void setTurmaIds(Set<Long> turmaIds) {
    this.turmaIds = turmaIds;
  }
}
