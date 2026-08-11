package com.example.sistemaponto.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(RegraNegocioException.class)
  public ResponseEntity<Map<String, Object>> regra(RegraNegocioException ex) {
    return resposta(HttpStatus.BAD_REQUEST, ex.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> validacao(MethodArgumentNotValidException ex) {
    String mensagem = ex.getBindingResult().getFieldErrors().stream()
        .findFirst().map(e -> e.getField() + ": " + e.getDefaultMessage())
        .orElse("Dados inválidos.");
    return resposta(HttpStatus.BAD_REQUEST, mensagem);
  }

  private ResponseEntity<Map<String, Object>> resposta(HttpStatus status, String mensagem) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", status.value());
    body.put("mensagem", mensagem);
    return ResponseEntity.status(status).body(body);
  }
}
