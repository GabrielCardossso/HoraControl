package com.example.sistemaponto.service;

import com.example.sistemaponto.entity.RegistroPonto;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

@Service
public class RelatorioService {
  private static final DateTimeFormatter DATA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

  public byte[] gerarExcel(List<RegistroPonto> registros, String titulo) {
    try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
      Sheet resumo = workbook.createSheet("Resumo");
      Sheet dados = workbook.createSheet("Registros");
      CellStyle tituloStyle = estiloTitulo(workbook);
      CellStyle cabecalho = estiloCabecalho(workbook);
      CellStyle moeda = workbook.createCellStyle();
      moeda.setDataFormat(workbook.createDataFormat().getFormat("R$ #,##0.00"));
      CellStyle decimal = workbook.createCellStyle();
      decimal.setDataFormat(workbook.createDataFormat().getFormat("0.00"));
      CellStyle dataHoraExcel = workbook.createCellStyle();
      dataHoraExcel.setDataFormat(workbook.createDataFormat().getFormat("dd/mm/yyyy hh:mm"));

      Row tituloRow = resumo.createRow(0);
      Cell tituloCell = tituloRow.createCell(0);
      tituloCell.setCellValue(titulo);
      tituloCell.setCellStyle(tituloStyle);
      resumo.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 3));
      resumo.setDisplayGridlines(false);
      dados.setDisplayGridlines(false);
      Row geradoRow = resumo.createRow(1);
      geradoRow.createCell(0).setCellValue("Gerado em");
      Cell geradoEm = geradoRow.createCell(1);
      geradoEm.setCellValue(LocalDateTime.now());
      geradoEm.setCellStyle(dataHoraExcel);
      String[] indicadores = { "Registros", "Registros fechados", "Total de horas", "Valor total estimado" };
      int ultimaLinha = Math.max(2, registros.size() + 1);
      String[] formulas = {
          "COUNTA('Registros'!A2:A" + ultimaLinha + ")",
          "COUNTIF('Registros'!K2:K" + ultimaLinha + ",\"FECHADO\")",
          "SUM('Registros'!H2:H" + ultimaLinha + ")",
          "SUM('Registros'!J2:J" + ultimaLinha + ")"
      };
      for (int i = 0; i < indicadores.length; i++) {
        Row row = resumo.createRow(i + 2);
        row.createCell(0).setCellValue(indicadores[i]);
        Cell valor = row.createCell(1);
        valor.setCellFormula(formulas[i]);
        if (i == 2)
          valor.setCellStyle(decimal);
        if (i == 3)
          valor.setCellStyle(moeda);
      }
      resumo.setColumnWidth(0, 28 * 256);
      resumo.setColumnWidth(1, 22 * 256);

      String[] colunas = { "Professor", "Matrícula", "Turma", "Código", "Tipo", "Entrada", "Saída",
          "Horas", "Valor-hora", "Valor calculado", "Status", "Observação" };
      Row header = dados.createRow(0);
      for (int i = 0; i < colunas.length; i++) {
        Cell cell = header.createCell(i);
        cell.setCellValue(colunas[i]);
        cell.setCellStyle(cabecalho);
      }
      int linha = 1;
      for (RegistroPonto r : registros) {
        Row row = dados.createRow(linha++);
        row.createCell(0).setCellValue(r.getProfessor().getNome());
        row.createCell(1).setCellValue(texto(r.getProfessor().getMatricula()));
        row.createCell(2).setCellValue(r.getTurma() == null ? texto(r.getDescricao()) : r.getTurma().getNome());
        row.createCell(3).setCellValue(r.getTurma() == null ? "" : texto(r.getTurma().getCodigo()));
        row.createCell(4).setCellValue(r.getTipo().name().replace('_', ' '));
        Cell entrada = row.createCell(5);
        entrada.setCellValue(r.getEntrada());
        entrada.setCellStyle(dataHoraExcel);
        Cell saida = row.createCell(6);
        if (r.getSaida() != null) {
          saida.setCellValue(r.getSaida());
          saida.setCellStyle(dataHoraExcel);
        }
        int excelRow = row.getRowNum() + 1;
        Cell horas = row.createCell(7);
        horas.setCellFormula("IF(G" + excelRow + "=\"\",0,ROUND((G" + excelRow + "-F" + excelRow + ")*24,2))");
        horas.setCellStyle(decimal);
        Cell valorHora = row.createCell(8);
        valorHora.setCellValue(r.getTurma() == null ? 0 : r.getTurma().getValorHora().doubleValue());
        valorHora.setCellStyle(moeda);
        Cell valor = row.createCell(9);
        valor.setCellFormula("ROUND(H" + excelRow + "*I" + excelRow + ",2)");
        valor.setCellStyle(moeda);
        row.createCell(10).setCellValue(r.getStatus().name());
        row.createCell(11).setCellValue(texto(r.getObservacao()));
      }
      dados.createFreezePane(0, 1);
      dados
          .setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0, Math.max(0, linha - 1), 0, colunas.length - 1));
      int[] larguras = { 26, 15, 25, 16, 18, 20, 20, 11, 16, 18, 13, 42 };
      for (int i = 0; i < larguras.length; i++)
        dados.setColumnWidth(i, larguras[i] * 256);
      workbook.getCreationHelper().createFormulaEvaluator().evaluateAll();
      workbook.setForceFormulaRecalculation(true);
      workbook.write(out);
      return out.toByteArray();
    } catch (Exception e) {
      throw new IllegalStateException("Não foi possível gerar o relatório Excel.", e);
    }
  }

  public byte[] gerarPdf(List<RegistroPonto> registros, String titulo) {
    try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
      Document document = new Document(PageSize.A4.rotate(), 28, 28, 32, 32);
      PdfWriter.getInstance(document, out);
      document.open();
      BaseFont base = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
      com.lowagie.text.Font titleFont = new com.lowagie.text.Font(base, 18, com.lowagie.text.Font.BOLD,
          new Color(44, 52, 96));
      com.lowagie.text.Font body = new com.lowagie.text.Font(base, 8, com.lowagie.text.Font.NORMAL, Color.DARK_GRAY);
      com.lowagie.text.Font headerFont = new com.lowagie.text.Font(base, 8, com.lowagie.text.Font.BOLD, Color.WHITE);
      document.add(new Paragraph(titulo, titleFont));
      document.add(new Paragraph("Registros: " + registros.size() + "   |   Total de horas: " + totalHoras(registros)
          + "   |   Valor estimado: R$ " + totalValor(registros),
          new com.lowagie.text.Font(base, 10, com.lowagie.text.Font.NORMAL, Color.DARK_GRAY)));
      document.add(new Paragraph("Gerado em " + LocalDateTime.now().format(DATA_HORA), body));
      document.add(Chunk.NEWLINE);

      PdfPTable table = new PdfPTable(new float[] { 2.2f, 1.4f, 1.2f, 1.5f, 1.5f, .8f, 1f, 1.1f, 2.1f });
      table.setWidthPercentage(100);
      String[] headers = { "Professor", "Turma", "Código", "Entrada", "Saída", "Horas", "Valor/h", "Total",
          "Observação" };
      for (String h : headers)
        table.addCell(celula(h, headerFont, new Color(75, 71, 153)));
      for (RegistroPonto r : registros) {
        table.addCell(celula(r.getProfessor().getNome(), body, Color.WHITE));
        table.addCell(
            celula(r.getTurma() == null ? texto(r.getDescricao()) : r.getTurma().getNome(), body, Color.WHITE));
        table.addCell(celula(r.getTurma() == null ? "-" : texto(r.getTurma().getCodigo()), body, Color.WHITE));
        table.addCell(celula(r.getEntrada().format(DATA_HORA), body, Color.WHITE));
        table.addCell(celula(r.getSaida() == null ? "Em aberto" : r.getSaida().format(DATA_HORA), body, Color.WHITE));
        table.addCell(celula(r.getHorasTrabalhadas().toPlainString(), body, Color.WHITE));
        table.addCell(celula("R$ " + (r.getTurma() == null ? "0.00" : r.getTurma().getValorHora()), body, Color.WHITE));
        table.addCell(celula("R$ " + r.getValorCalculado(), body, Color.WHITE));
        table.addCell(celula(texto(r.getObservacao()), body, Color.WHITE));
      }
      document.add(table);
      document.add(Chunk.NEWLINE);
      document.add(new Paragraph(
          "Valores são estimativas calculadas pelo valor-hora cadastrado na turma. Registros abertos não entram no total financeiro.",
          body));
      document.close();
      return out.toByteArray();
    } catch (Exception e) {
      throw new IllegalStateException("Não foi possível gerar o relatório PDF.", e);
    }
  }

  public BigDecimal totalHoras(List<RegistroPonto> registros) {
    long minutos = registros.stream().mapToLong(RegistroPonto::getMinutosTrabalhados).sum();
    return BigDecimal.valueOf(minutos).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
  }

  public BigDecimal totalValor(List<RegistroPonto> registros) {
    return registros.stream().map(RegistroPonto::getValorCalculado).reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private String texto(String valor) {
    return valor == null ? "" : valor;
  }

  private CellStyle estiloTitulo(Workbook wb) {
    CellStyle style = wb.createCellStyle();
    org.apache.poi.ss.usermodel.Font font = wb.createFont();
    font.setBold(true);
    font.setFontHeightInPoints((short) 18);
    font.setColor(IndexedColors.DARK_BLUE.getIndex());
    style.setFont(font);
    return style;
  }

  private CellStyle estiloCabecalho(Workbook wb) {
    CellStyle style = wb.createCellStyle();
    style.setFillForegroundColor(IndexedColors.INDIGO.getIndex());
    style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
    org.apache.poi.ss.usermodel.Font font = wb.createFont();
    font.setBold(true);
    font.setColor(IndexedColors.WHITE.getIndex());
    style.setFont(font);
    style.setAlignment(HorizontalAlignment.CENTER);
    return style;
  }

  private PdfPCell celula(String texto, com.lowagie.text.Font font, Color fundo) {
    PdfPCell cell = new PdfPCell(new Phrase(texto == null ? "" : texto, font));
    cell.setBackgroundColor(fundo);
    cell.setPadding(5);
    cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
    return cell;
  }
}
