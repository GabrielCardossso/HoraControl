package com.example.sistemaponto.dto;

public class RegistroDTO {

  private Long professorId;
  private Long turmaId;

  public RegistroDTO() {
  }

  public Long getProfessorId() {
    return professorId;
  }

  public void setProfessorId(Long professorId) {
    this.professorId = professorId;
  }

  public Long getTurmaId() {
    return turmaId;
  }

  public void setTurmaId(Long turmaId) {
    this.turmaId = turmaId;
  }
}