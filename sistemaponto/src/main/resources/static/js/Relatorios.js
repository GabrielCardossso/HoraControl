document.addEventListener("DOMContentLoaded", () => {
  const inicio = document.getElementById("inicioRelatorio"),
    fim = document.getElementById("fimRelatorio"),
    professor = document.getElementById("professorRelatorio"),
    turma = document.getElementById("turmaRelatorio"),
    status = document.getElementById("statusRelatorio");
  const moeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
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
      '<tr><td colspan="7" class="hc-empty">Calculando...</td></tr>';
    try {
      const r = await hcFetch(`/api/registros?${query()}`),
        lista = await r.json();
      const horas = lista.reduce(
          (s, x) => s + Number(x.horasTrabalhadas || 0),
          0,
        ),
        valor = lista.reduce((s, x) => s + Number(x.valorCalculado || 0), 0);
      document.getElementById("previewRegistros").textContent = lista.length;
      document.getElementById("previewHoras").textContent =
        `${horas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} h`;
      document.getElementById("previewValor").textContent = moeda.format(valor);
      tb.innerHTML = lista.length
        ? lista
            .slice(0, 50)
            .map(
              (x) =>
                `<tr><td>${esc(x.professor.nome)}</td><td>${esc(x.turma ? `${x.turma.codigo} - ${x.turma.nome}` : x.descricao || "Extra")}</td><td>${data.format(new Date(x.entrada))}</td><td>${Number(x.horasTrabalhadas || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td><td>${moeda.format(Number(x.turma?.valorHora || 0))}</td><td>${moeda.format(Number(x.valorCalculado || 0))}</td><td>${esc(x.status)}</td></tr>`,
            )
            .join("")
        : '<tr><td colspan="7" class="hc-empty">Nenhum registro encontrado.</td></tr>';
    } catch (e) {
      hcToast(e.message, "error");
    }
  }
  async function baixar(formato, btn) {
    btn.disabled = true;
    try {
      const res = await hcFetch(`/api/relatorios/${formato}?${query()}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-horacontrol-${new Date().toISOString().slice(0, 10)}.${formato === "excel" ? "xlsx" : "pdf"}`;
      a.click();
      URL.revokeObjectURL(url);
      hcToast(`Relatório ${formato === "excel" ? "Excel" : "PDF"} gerado.`);
    } catch (e) {
      hcToast(e.message, "error");
    } finally {
      btn.disabled = false;
    }
  }
  document
    .getElementById("visualizarRelatorio")
    .addEventListener("click", preview);
  document
    .getElementById("baixarPdf")
    .addEventListener("click", (e) => baixar("pdf", e.currentTarget));
  document
    .getElementById("baixarExcel")
    .addEventListener("click", (e) => baixar("excel", e.currentTarget));
  opcoes().then(preview);
});
