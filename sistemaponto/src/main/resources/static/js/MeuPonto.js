document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formFiltros");
  const periodo = document.getElementById("periodoRapido");
  const inicio = document.getElementById("inicio");
  const fim = document.getElementById("fim");
  const professor = document.getElementById("professorId");
  const turma = document.getElementById("turmaFiltro");
  const status = document.getElementById("statusFiltro");
  const busca = document.getElementById("busca");
  const tbody = document.getElementById("corpoRegistros");
  let registrosAtuais = [];
  let podeAjustar = false;
  const dataHora = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  function iso(d) {
    return d.toISOString().slice(0, 10);
  }
  function aplicarPeriodo() {
    const hoje = new Date();
    let ini = new Date(hoje);
    let final = hoje;
    if (periodo.value === "mes")
      ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    else if (periodo.value === "semana") {
      const dia = (hoje.getDay() + 6) % 7;
      ini.setDate(hoje.getDate() - dia);
    } else if (periodo.value === "30dias") ini.setDate(hoje.getDate() - 29);
    else if (periodo.value === "todos") {
      inicio.value = fim.value = "";
      return;
    } else if (periodo.value === "custom") return;
    inicio.value = iso(ini);
    fim.value = iso(final);
  }
  periodo.addEventListener("change", () => {
    aplicarPeriodo();
  });
  inicio.addEventListener("change", () => (periodo.value = "custom"));
  fim.addEventListener("change", () => (periodo.value = "custom"));

  async function opcoes() {
    try {
      const [tRes, pRes] = await Promise.all([
        hcFetch("/api/turmas"),
        hcFetch("/api/registros/professores/visiveis"),
      ]);
      const [turmas, professores] = await Promise.all([
        tRes.json(),
        pRes.json(),
      ]);
      turma.innerHTML =
        '<option value="">Todas</option>' +
        turmas
          .map(
            (t) =>
              `<option value="${t.id}">${esc(t.codigo)} - ${esc(t.nome)}</option>`,
          )
          .join("");
      professor.innerHTML =
        '<option value="">Todos permitidos</option>' +
        professores
          .map((p) => `<option value="${p.id}">${esc(p.nome)}</option>`)
          .join("");
      if (professores.length <= 1) professor.closest(".hc-field").hidden = true;
    } catch (e) {
      hcToast(e.message, "error");
    }
  }
  function query() {
    const q = new URLSearchParams();
    if (inicio.value) q.set("inicio", inicio.value);
    if (fim.value) q.set("fim", fim.value);
    if (professor.value) q.set("professorId", professor.value);
    if (turma.value) q.set("turmaId", turma.value);
    if (status.value) q.set("status", status.value);
    if (busca.value.trim()) q.set("busca", busca.value.trim());
    return q.toString();
  }
  async function carregar() {
    tbody.innerHTML =
      '<tr><td colspan="8" class="hc-empty">Carregando registros...</td></tr>';
    try {
      const res = await hcFetch(`/api/registros?${query()}`);
      render(await res.json());
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="8" class="hc-empty">${esc(e.message)}</td></tr>`;
    }
  }
  function render(registros) {
    registrosAtuais = registros;
    document.getElementById("totalRegistros").textContent = registros.length;
    const minutos = registros.reduce(
      (s, r) => s + hcMinutesFromRecord(r),
      0,
    );
    document.getElementById("totalHoras").textContent =
      hcFormatMinutes(minutos);
    if (!registros.length) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="hc-empty">Nenhum registro para os filtros selecionados.</td></tr>';
      return;
    }
    tbody.innerHTML = registros
      .map(
        (r) => {
          const acoes = [
            `<button class="hc-btn secondary" type="button" data-detalhes-registro="${r.id}"><i class="fi fi-rr-eye" aria-hidden="true"></i>Ver detalhes</button>`,
          ];
          if (podeAjustar && r.status === "FECHADO")
            acoes.push(
              `<button class="hc-btn secondary" type="button" data-ajustar="${r.id}"><i class="fi fi-rr-edit" aria-hidden="true"></i>Ajustar</button>`,
            );
          return `<tr><td data-label="Professor">${esc(r.professor.nome)}</td><td data-label="Turma/atividade"><strong>${esc(r.turma ? r.turma.codigo : "Extra")}</strong><br><span class="hc-muted">${esc(r.turma ? r.turma.nome : r.descricao || "Atividade extra")}</span></td><td data-label="Entrada">${dataHora.format(new Date(r.entrada))}</td><td data-label="Saída">${r.saida ? dataHora.format(new Date(r.saida)) : "—"}</td><td data-label="Horas">${hcFormatMinutes(hcMinutesFromRecord(r))}</td><td data-label="Status"><span class="hc-status ${r.status === "ABERTO" ? "open" : "closed"}">${r.status === "ABERTO" ? "Aberto" : "Fechado"}${r.ajustado ? " · ajustado" : ""}</span></td><td data-label="Observação">${esc(r.observacao || "Sem observação")}</td><td data-label="Ações"><div class="hc-row-actions">${acoes.join("")}</div></td></tr>`;
        },
      )
      .join("");
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hcSetFiltersActive("filtrosRegistros", temFiltros());
    hcCloseFilters("filtrosRegistros");
    carregar();
  });
  document.querySelectorAll("[data-limpar-registros]").forEach((button) =>
    button.addEventListener("click", () => {
      form.reset();
      periodo.value = "todos";
      aplicarPeriodo();
      hcSetFiltersActive("filtrosRegistros", false);
      hcCloseFilters("filtrosRegistros");
      carregar();
    }),
  );
  function temFiltros() {
    return Boolean(
      inicio.value ||
        fim.value ||
        professor.value ||
        turma.value ||
        status.value ||
        busca.value.trim(),
    );
  }
  document.addEventListener("hc:user-ready", (e) => {
    podeAjustar = e.detail.perfil !== "PROFESSOR";
    render(registrosAtuais);
  });
  const modal = document.getElementById("modalAjuste");
  const modalDetalhes = document.getElementById("modalDetalhesRegistro");
  let gatilhoDetalhes = null;

  function abrirDetalhes(registro, gatilho) {
    gatilhoDetalhes = gatilho;
    const atividade = registro.turma
      ? `${registro.turma.codigo} - ${registro.turma.nome}`
      : registro.descricao || "Atividade extra";
    document.getElementById("detalheProfessor").textContent =
      registro.professor?.nome || "—";
    document.getElementById("detalheAtividade").textContent = atividade;
    document.getElementById("detalheEntrada").textContent = dataHora.format(
      new Date(registro.entrada),
    );
    document.getElementById("detalheSaida").textContent = registro.saida
      ? dataHora.format(new Date(registro.saida))
      : "Em aberto";
    document.getElementById("detalheDuracao").textContent = hcFormatMinutes(
      hcMinutesFromRecord(registro),
    );
    document.getElementById("detalheStatus").textContent =
      registro.status === "ABERTO" ? "Aberto" : "Fechado";
    document.getElementById("detalheObservacao").textContent =
      registro.observacao || "Nenhuma observação informada.";

    const blocoAjuste = document.getElementById("detalheAjuste");
    const semAjuste = document.getElementById("detalheSemAjuste");
    blocoAjuste.hidden = !registro.ajustado;
    semAjuste.hidden = registro.ajustado;
    if (registro.ajustado) {
      document.getElementById("detalheJustificativa").textContent =
        registro.justificativaAjuste || "Justificativa não informada.";
      document.getElementById("detalheAlteradoPor").textContent =
        registro.alteradoPor?.nome || "Responsável não informado";
      document.getElementById("detalheDataAlteracao").textContent =
        registro.dataAlteracao
          ? dataHora.format(new Date(registro.dataAlteracao))
          : "Data não informada";
    }
    modalDetalhes.classList.add("open");
    document.body.classList.add("hc-modal-open");
    modalDetalhes.querySelector("[data-fechar-detalhes]").focus();
  }

  function fecharDetalhes() {
    modalDetalhes.classList.remove("open");
    if (!document.querySelector(".hc-modal.open"))
      document.body.classList.remove("hc-modal-open");
    gatilhoDetalhes?.focus();
  }

  document.addEventListener("click", (e) => {
    const botaoDetalhes = e.target.closest("[data-detalhes-registro]");
    if (botaoDetalhes) {
      const registro = registrosAtuais.find(
        (item) => item.id === Number(botaoDetalhes.dataset.detalhesRegistro),
      );
      if (registro) abrirDetalhes(registro, botaoDetalhes);
      return;
    }
    const id = e.target.closest("[data-ajustar]")?.dataset.ajustar;
    if (!id) return;
    const r = registrosAtuais.find((x) => x.id === Number(id));
    document.getElementById("ajusteId").value = id;
    document.getElementById("ajusteEntrada").value = r.entrada.slice(0, 16);
    document.getElementById("ajusteSaida").value = r.saida.slice(0, 16);
    document.getElementById("ajusteObservacao").value = r.observacao || "";
    document.getElementById("ajusteJustificativa").value = "";
    modal.classList.add("open");
  });
  document
    .querySelector("[data-fechar-detalhes]")
    .addEventListener("click", fecharDetalhes);
  modalDetalhes.addEventListener("click", (e) => {
    if (e.target === modalDetalhes) fecharDetalhes();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalDetalhes.classList.contains("open"))
      fecharDetalhes();
  });
  document
    .querySelector("[data-fechar-ajuste]")
    .addEventListener("click", () => modal.classList.remove("open"));
  document
    .getElementById("formAjuste")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("ajusteId").value;
      try {
        await hcFetch(`/api/registros/${id}/ajustar`, {
          method: "PUT",
          body: JSON.stringify({
            entrada: document.getElementById("ajusteEntrada").value,
            saida: document.getElementById("ajusteSaida").value,
            observacao: document.getElementById("ajusteObservacao").value,
            justificativa: document.getElementById("ajusteJustificativa").value,
          }),
        });
        hcToast("Registro ajustado e auditado.");
        modal.classList.remove("open");
        await carregar();
      } catch (err) {
        hcToast(err.message, "error");
      }
    });
  function esc(v) {
    const d = document.createElement("div");
    d.textContent = v ?? "";
    return d.innerHTML;
  }
  aplicarPeriodo();
  opcoes().then(carregar);
});
