package com.example.sistemaponto.dto;

import com.example.sistemaponto.enums.TipoRegistro;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AbrirPontoDTO {
  private Long turmaId;
  @NotNull private TipoRegistro tipo;
  @Size(max = 180) private String descricao;
  @Size(max = 1000) private String observacao;

  public Long getTurmaId() { return turmaId; }
  public void setTurmaId(Long turmaId) { this.turmaId = turmaId; }
  public TipoRegistro getTipo() { return tipo; }
  public void setTipo(TipoRegistro tipo) { this.tipo = tipo; }
  public String getDescricao() { return descricao; }
  public void setDescricao(String descricao) { this.descricao = descricao; }
  public String getObservacao() { return observacao; }
  public void setObservacao(String observacao) { this.observacao = observacao; }
}
