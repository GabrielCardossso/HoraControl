document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formPonto");
  const tipo = document.getElementById("tipoRegistro");
  const turma = document.getElementById("turmaId");
  const descricao = document.getElementById("descricao");
  const observacao = document.getElementById("observacao");
  const btn = document.getElementById("btnPonto");
  let pontoAberto = null;

  const hoje = new Date();
  const dataRelogio = document.getElementById("dataRelogio");
  dataRelogio.textContent = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
  }).format(hoje);
  dataRelogio.dateTime = hoje.toISOString().slice(0, 10);
  const moeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const dataHora = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  tipo.addEventListener("change", () => {
    const extra = tipo.value === "ATIVIDADE_EXTRA";
    document.getElementById("campoDescricao").hidden = !extra;
    turma.required = !extra;
  });

  async function carregar() {
    try {
      const inicio = new Date();
      inicio.setDate(1);
      const [turmasRes, abertoRes, registrosRes] = await Promise.all([
        hcFetch("/api/turmas"),
        hcFetch("/api/registros/aberto"),
        hcFetch(`/api/registros?inicio=${inicio.toISOString().slice(0, 10)}`),
      ]);
      const turmas = await turmasRes.json();
      const abertoTexto = await abertoRes.text();
      pontoAberto = abertoTexto ? JSON.parse(abertoTexto) : null;
      const registros = await registrosRes.json();
      turma.innerHTML =
        '<option value="">Selecione uma turma</option>' +
        turmas
          .map(
            (t) =>
              `<option value="${t.id}">${esc(t.codigo)} - ${esc(t.nome)}</option>`,
          )
          .join("");
      renderPonto();
      renderResumo(registros);
      renderUltimos(registros.slice(0, 4));
    } catch (error) {
      hcToast(error.message, "error");
    }
  }

  function renderPonto() {
    const status = document.getElementById("statusPonto");
    if (pontoAberto) {
      status.textContent = "Em andamento";
      document.getElementById("horaEntrada").textContent =
        `Entrada: ${dataHora.format(new Date(pontoAberto.entrada))}`;
      btn.textContent = "Registrar saída";
      btn.className = "hc-btn danger";
      tipo.disabled =
        turma.disabled =
        descricao.disabled =
        observacao.disabled =
          true;
    } else {
      status.textContent = "Fechado";
      document.getElementById("horaEntrada").textContent =
        "Nenhum ponto aberto";
      btn.textContent = "Registrar entrada";
      btn.className = "hc-btn primary";
      tipo.disabled =
        turma.disabled =
        descricao.disabled =
        observacao.disabled =
          false;
    }
  }

  function renderResumo(registros) {
    const fechados = registros.filter((r) => r.status === "FECHADO");
    const horas = fechados.reduce(
      (s, r) => s + Number(r.horasTrabalhadas || 0),
      0,
    );
    const valor = fechados.reduce(
      (s, r) => s + Number(r.valorCalculado || 0),
      0,
    );
    document.getElementById("horasMes").textContent =
      `${horas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} h`;
    document.getElementById("valorMes").textContent = moeda.format(valor);
  }

  function renderUltimos(registros) {
    const el = document.getElementById("ultimosRegistros");
    if (!registros.length) {
      el.innerHTML = '<p class="hc-muted">Nenhum registro encontrado.</p>';
      return;
    }
    el.innerHTML = registros
      .map(
        (
          r,
        ) => `<div style="padding:13px;border:1px solid var(--hc-border);border-radius:12px">
      <strong>${esc(r.turma ? `${r.turma.codigo} - ${r.turma.nome}` : r.descricao || "Atividade extra")}</strong>
      <div class="hc-muted" style="margin-top:5px">${dataHora.format(new Date(r.entrada))} · <span class="hc-status ${r.status === "ABERTO" ? "open" : "closed"}">${r.status === "ABERTO" ? "Aberto" : "Fechado"}</span></div>
    </div>`,
      )
      .join("");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btn.disabled = true;
    try {
      if (pontoAberto) {
        const res = await hcFetch(`/api/registros/${pontoAberto.id}/fechar`, {
          method: "POST",
        });
        await res.json();
        hcToast("Saída registrada com sucesso.");
        pontoAberto = null;
      } else {
        const body = {
          tipo: tipo.value,
          turmaId: turma.value ? Number(turma.value) : null,
          descricao: descricao.value,
          observacao: observacao.value,
        };
        const res = await hcFetch("/api/registros/abrir", {
          method: "POST",
          body: JSON.stringify(body),
        });
        pontoAberto = await res.json();
        hcToast("Entrada registrada com sucesso.");
      }
      observacao.value = "";
      await carregar();
    } catch (error) {
      hcToast(error.message, "error");
    } finally {
      btn.disabled = false;
    }
  });

  function esc(value) {
    const d = document.createElement("div");
    d.textContent = value ?? "";
    return d.innerHTML;
  }
  carregar();
});
