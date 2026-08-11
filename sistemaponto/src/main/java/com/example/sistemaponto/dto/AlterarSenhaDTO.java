package com.example.sistemaponto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AlterarSenhaDTO {
  @NotBlank private String senhaAtual;
  @NotBlank @Size(min = 6) private String novaSenha;
  public String getSenhaAtual() { return senhaAtual; }
  public void setSenhaAtual(String senhaAtual) { this.senhaAtual = senhaAtual; }
  public String getNovaSenha() { return novaSenha; }
  public void setNovaSenha(String novaSenha) { this.novaSenha = novaSenha; }
}
