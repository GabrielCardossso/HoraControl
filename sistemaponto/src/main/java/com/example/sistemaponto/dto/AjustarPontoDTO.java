package com.example.sistemaponto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class AjustarPontoDTO {
  @NotNull private LocalDateTime entrada;
  @NotNull private LocalDateTime saida;
  @Size(max = 1000) private String observacao;
  @NotBlank @Size(max = 500) private String justificativa;
  public LocalDateTime getEntrada() { return entrada; }
  public void setEntrada(LocalDateTime entrada) { this.entrada = entrada; }
  public LocalDateTime getSaida() { return saida; }
  public void setSaida(LocalDateTime saida) { this.saida = saida; }
  public String getObservacao() { return observacao; }
  public void setObservacao(String observacao) { this.observacao = observacao; }
  public String getJustificativa() { return justificativa; }
  public void setJustificativa(String justificativa) { this.justificativa = justificativa; }
}
