package com.example.sistemaponto.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.sistemaponto.entity.Professor;
import com.example.sistemaponto.entity.RegistroPonto;
import com.example.sistemaponto.entity.Turma;
import com.example.sistemaponto.enums.StatusPonto;
import com.lowagie.text.pdf.PdfReader;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.Test;

class RelatorioServiceTest {
  private final RelatorioService service = new RelatorioService();

  @Test
  void geraPdfEExcelValidosComCalculos() throws Exception {
    Professor professor = new Professor(); professor.setNome("Professora Teste"); professor.setMatricula("P-01");
    Turma turma = new Turma(); turma.setCodigo("TDS-01"); turma.setNome("Desenvolvimento"); turma.setValorHora(new BigDecimal("60.00"));
    RegistroPonto registro = new RegistroPonto(); registro.setProfessor(professor); registro.setTurma(turma);
    registro.setEntrada(LocalDateTime.of(2026, 8, 10, 8, 0)); registro.setSaida(LocalDateTime.of(2026, 8, 10, 10, 30)); registro.setStatus(StatusPonto.FECHADO);
    List<RegistroPonto> registros = List.of(registro);

    assertThat(service.totalHoras(registros)).isEqualByComparingTo("2.50");
    assertThat(service.totalValor(registros)).isEqualByComparingTo("150.00");

    byte[] pdf = service.gerarPdf(registros, "Relatório de teste");
    PdfReader reader = new PdfReader(pdf);
    assertThat(reader.getNumberOfPages()).isEqualTo(1);
    reader.close();

    byte[] excel = service.gerarExcel(registros, "Relatório de teste");
    try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(excel))) {
      assertThat(workbook.getNumberOfSheets()).isEqualTo(2);
      assertThat(workbook.getSheet("Registros").getRow(1).getCell(0).getStringCellValue()).isEqualTo("Professora Teste");
      assertThat(workbook.getSheet("Registros").getRow(1).getCell(9).getNumericCellValue()).isEqualTo(150.0);
    }
  }
}
