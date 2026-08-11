package com.example.sistemaponto.controller;

import com.example.sistemaponto.entity.RegistroPonto;
import com.example.sistemaponto.enums.StatusPonto;
import com.example.sistemaponto.enums.TipoRegistro;
import com.example.sistemaponto.service.RegistroPontoService;
import com.example.sistemaponto.service.RelatorioService;
import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {
  private final RegistroPontoService registros;
  private final RelatorioService relatorios;
  public RelatorioController(RegistroPontoService registros, RelatorioService relatorios) {
    this.registros = registros; this.relatorios = relatorios;
  }

  @GetMapping("/{formato}")
  public ResponseEntity<byte[]> gerar(@PathVariable String formato,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
      @RequestParam(required = false) Long professorId,
      @RequestParam(required = false) Long turmaId,
      @RequestParam(required = false) StatusPonto status,
      @RequestParam(required = false) TipoRegistro tipo,
      @RequestParam(required = false) String busca,
      Principal principal) {
    List<RegistroPonto> lista = registros.filtrar(principal.getName(), inicio, fim, professorId, turmaId, status, tipo, busca);
    String titulo = "HoraControl - Relatório de Ponto";
    String data = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
    if ("pdf".equalsIgnoreCase(formato))
      return arquivo(relatorios.gerarPdf(lista, titulo), MediaType.APPLICATION_PDF, "relatorio-ponto-" + data + ".pdf");
    if ("excel".equalsIgnoreCase(formato) || "xlsx".equalsIgnoreCase(formato))
      return arquivo(relatorios.gerarExcel(lista, titulo), MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), "relatorio-ponto-" + data + ".xlsx");
    return ResponseEntity.badRequest().build();
  }

  private ResponseEntity<byte[]> arquivo(byte[] bytes, MediaType tipo, String nome) {
    return ResponseEntity.ok().contentType(tipo)
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nome + "\"")
        .body(bytes);
  }
}
