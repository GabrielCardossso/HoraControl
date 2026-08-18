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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class RelatorioService {
  private static final DateTimeFormatter DATA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

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
      document.add(new Paragraph(
          "Registros: " + registros.size() + "   |   Total de horas: " + formatarDuracao(totalMinutos(registros)),
          new com.lowagie.text.Font(base, 10, com.lowagie.text.Font.NORMAL, Color.DARK_GRAY)));
      document.add(new Paragraph("Gerado em " + LocalDateTime.now().format(DATA_HORA), body));
      document.add(Chunk.NEWLINE);

      PdfPTable table = new PdfPTable(new float[] { 2.2f, 1.7f, 1.2f, 1.6f, 1.6f, .8f, 2.5f });
      table.setWidthPercentage(100);
      String[] headers = { "Professor", "Turma", "Código", "Entrada", "Saída", "Horas", "Observação/ajuste" };
      for (String header : headers)
        table.addCell(celula(header, headerFont, new Color(75, 71, 153)));
      for (RegistroPonto registro : registros) {
        table.addCell(celula(registro.getProfessor().getNome(), body, Color.WHITE));
        table.addCell(celula(registro.getTurma() == null ? texto(registro.getDescricao())
            : registro.getTurma().getNome(), body, Color.WHITE));
        table.addCell(celula(registro.getTurma() == null ? "-" : texto(registro.getTurma().getCodigo()), body,
            Color.WHITE));
        table.addCell(celula(registro.getEntrada().format(DATA_HORA), body, Color.WHITE));
        table.addCell(celula(registro.getSaida() == null ? "Em aberto" : registro.getSaida().format(DATA_HORA), body,
            Color.WHITE));
        table.addCell(celula(formatarDuracao(registro.getMinutosTrabalhados()), body, Color.WHITE));
        table.addCell(celula(observacaoRelatorio(registro), body, Color.WHITE));
      }
      document.add(table);
      document.close();
      return out.toByteArray();
    } catch (Exception e) {
      throw new IllegalStateException("Não foi possível gerar o relatório PDF.", e);
    }
  }

  public BigDecimal totalHoras(List<RegistroPonto> registros) {
    long minutos = totalMinutos(registros);
    return BigDecimal.valueOf(minutos).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
  }

  public String formatarDuracao(long minutos) {
    long total = Math.max(0, minutos);
    return String.format("%02dh%02dm", total / 60, total % 60);
  }

  private long totalMinutos(List<RegistroPonto> registros) {
    return registros.stream().mapToLong(RegistroPonto::getMinutosTrabalhados).sum();
  }

  private String texto(String valor) {
    return valor == null ? "" : valor;
  }

  private String observacaoRelatorio(RegistroPonto registro) {
    String observacao = texto(registro.getObservacao());
    if (!registro.isAjustado())
      return observacao;
    String motivo = texto(registro.getJustificativaAjuste());
    return observacao + (observacao.isBlank() ? "" : " | ") + "Motivo do ajuste: " + motivo;
  }

  private PdfPCell celula(String texto, com.lowagie.text.Font font, Color fundo) {
    PdfPCell cell = new PdfPCell(new Phrase(texto == null ? "" : texto, font));
    cell.setBackgroundColor(fundo);
    cell.setPadding(5);
    cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
    return cell;
  }
}
