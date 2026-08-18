document.addEventListener("DOMContentLoaded", () => {
  const inicio = document.getElementById("inicioRelatorio"),
    fim = document.getElementById("fimRelatorio"),
    professor = document.getElementById("professorRelatorio"),
    turma = document.getElementById("turmaRelatorio"),
    status = document.getElementById("statusRelatorio");
  const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
  const form = document.getElementById("formRelatorio");
  let parametrosAplicados = "";
  const esc = (v) => {
    const d = document.createElement("div");
    d.textContent = v ?? "";
    return d.innerHTML;
  };
  function query() {
    const q = new URLSearchParams();
    if (inicio.value) q.set("inicio", inicio.value);
    if (fim.value) q.set("fim", fim.value);
    if (professor.value) q.set("professorId", professor.value);
    if (turma.value) q.set("turmaId", turma.value);
    if (status.value) q.set("status", status.value);
    return q.toString();
  }
  async function opcoes() {
    try {
      const [t, p] = await Promise.all([
        hcFetch("/api/turmas"),
        hcFetch("/api/registros/professores/visiveis"),
      ]);
      const [ts, ps] = await Promise.all([t.json(), p.json()]);
      turma.innerHTML =
        '<option value="">Todas</option>' +
        ts
          .map(
            (x) =>
              `<option value="${x.id}">${esc(x.codigo)} - ${esc(x.nome)}</option>`,
          )
          .join("");
      professor.innerHTML =
        '<option value="">Todos permitidos</option>' +
        ps
          .map((x) => `<option value="${x.id}">${esc(x.nome)}</option>`)
          .join("");
      if (ps.length <= 1) professor.closest(".hc-field").hidden = true;
    } catch (e) {
      hcToast(e.message, "error");
    }
  }
  async function preview() {
    const tb = document.getElementById("previewTabela");
    tb.innerHTML =
      '<tr><td colspan="5" class="hc-empty">Calculando...</td></tr>';
    try {
      const r = await hcFetch(`/api/registros?${parametrosAplicados}`),
        lista = await r.json();
      const minutos = lista.reduce(
        (s, x) => s + hcMinutesFromRecord(x),
        0,
      );
      document.getElementById("previewRegistros").textContent = lista.length;
      document.getElementById("previewHoras").textContent =
        hcFormatMinutes(minutos);
      tb.innerHTML = lista.length
        ? lista
            .slice(0, 50)
            .map(
              (x) =>
                `<tr><td data-label="Professor">${esc(x.professor.nome)}</td><td data-label="Código/turma">${esc(x.turma ? `${x.turma.codigo} - ${x.turma.nome}` : x.descricao || "Extra")}</td><td data-label="Data">${data.format(new Date(x.entrada))}</td><td data-label="Horas">${hcFormatMinutes(hcMinutesFromRecord(x))}</td><td data-label="Status">${esc(x.status)}</td></tr>`,
            )
            .join("")
        : '<tr><td colspan="5" class="hc-empty">Nenhum registro encontrado.</td></tr>';
    } catch (e) {
      hcToast(e.message, "error");
    }
  }
  async function baixarPdf(btn) {
    btn.disabled = true;
    try {
      const res = await hcFetch(`/api/relatorios/pdf?${parametrosAplicados}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-horacontrol-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      hcToast("Relatório PDF gerado.");
    } catch (e) {
      hcToast(e.message, "error");
    } finally {
      btn.disabled = false;
    }
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    parametrosAplicados = query();
    hcSetFiltersActive("filtrosRelatorio", Boolean(parametrosAplicados));
    hcCloseFilters("filtrosRelatorio");
    preview();
  });
  document.querySelectorAll("[data-limpar-relatorio]").forEach((button) =>
    button.addEventListener("click", () => {
      form.reset();
      parametrosAplicados = "";
      hcSetFiltersActive("filtrosRelatorio", false);
      hcCloseFilters("filtrosRelatorio");
      preview();
    }),
  );
  document
    .getElementById("baixarPdf")
    .addEventListener("click", (e) => baixarPdf(e.currentTarget));
  opcoes().then(preview);
});
