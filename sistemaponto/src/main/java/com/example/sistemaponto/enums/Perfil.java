package com.example.sistemaponto.enums;

public enum Perfil {

  PROFESSOR,
  COORDENADOR_CURSO,
  COORDENADOR_NUCLEO,
  COORDENADOR_EIXO,
  ADMIN

  ;

  public boolean podeGerenciarUsuarios() {
    return this == ADMIN;
  }

  public boolean podeVerTodosRelatorios() {
    return this == ADMIN || this == COORDENADOR_EIXO || this == COORDENADOR_NUCLEO;
  }

  public boolean isCoordenacao() {
    return this != PROFESSOR;
  }
}
