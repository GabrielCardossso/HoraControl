document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formPonto");
  const tipo = document.getElementById("tipoRegistro");
  const turma = document.getElementById("turmaId");
  const descricao = document.getElementById("descricao");
  const observacao = document.getElementById("observacao");
  const btn = document.getElementById("btnPonto");
  let pontoAberto = null;
  let quantidadeTurmas = 0;

  const hoje = new Date();
  const dataRelogio = document.getElementById("dataRelogio");
  dataRelogio.textContent = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
  }).format(hoje);
  dataRelogio.dateTime = hoje.toISOString().slice(0, 10);
  const dataHora = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  function atualizarTipo() {
    const extra = tipo.value === "ATIVIDADE_EXTRA";
    document.getElementById("campoDescricao").hidden = !extra;
    turma.required = !extra;
    if (!pontoAberto) {
      turma.disabled = !extra && quantidadeTurmas === 0;
      btn.disabled = !extra && quantidadeTurmas === 0;
    }
  }
  tipo.addEventListener("change", atualizarTipo);

  async function carregar() {
    try {
      const inicio = new Date();
      inicio.setDate(1);
      const [turmasRes, abertoRes, registrosRes] = await Promise.all([
        hcFetch("/api/registros/turmas-permitidas"),
        hcFetch("/api/registros/aberto"),
        hcFetch(`/api/registros?inicio=${inicio.toISOString().slice(0, 10)}`),
      ]);
      const turmas = await turmasRes.json();
      quantidadeTurmas = turmas.length;
      const abertoTexto = await abertoRes.text();
      pontoAberto = abertoTexto ? JSON.parse(abertoTexto) : null;
      const registros = await registrosRes.json();
      turma.innerHTML =
        `<option value="">${turmas.length ? "Selecione uma turma" : "Nenhuma turma vinculada ao seu cadastro"}</option>` +
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
      atualizarTipo();
    }
  }

  function renderResumo(registros) {
    const fechados = registros.filter((r) => r.status === "FECHADO");
    const minutos = fechados.reduce(
      (s, r) => s + hcMinutesFromRecord(r),
      0,
    );
    document.getElementById("horasMes").textContent =
      hcFormatMinutes(minutos);
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

  async function carregarPainelAdmin() {
    try {
      const [usuariosRes, cursosRes, turmasRes] = await Promise.all([
        hcFetch("/api/admin/usuarios"),
        hcFetch("/api/cursos/todos"),
        hcFetch("/api/turmas/todas"),
      ]);
      const [usuarios, cursos, turmas] = await Promise.all([
        usuariosRes.json(),
        cursosRes.json(),
        turmasRes.json(),
      ]);
      document.getElementById("adminUsuariosAtivos").textContent = usuarios.filter(
        (item) => item.ativo,
      ).length;
      document.getElementById("adminCursosAtivos").textContent = cursos.filter(
        (item) => item.ativo,
      ).length;
      document.getElementById("adminTurmasAtivas").textContent = turmas.filter(
        (item) => item.ativo,
      ).length;
    } catch (error) {
      const feedback = document.getElementById("adminPainelErro");
      feedback.hidden = false;
      feedback.textContent =
        "Não foi possível atualizar o resumo agora. Os atalhos continuam disponíveis.";
      hcToast(error.message, "error");
    }
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

  let painelInicializado = false;
  function configurarPainel(usuario) {
    if (painelInicializado) return;
    painelInicializado = true;
    const admin = usuario.perfil === "ADMIN";
    document.getElementById("painelAdmin").hidden = !admin;
    document.getElementById("painelProfessor").hidden = admin;
    if (admin) {
      document.getElementById("tituloPainel").textContent =
        "Painel administrativo";
      document.getElementById("descricaoPainel").textContent =
        "Acompanhe os cadastros e acesse os controles do sistema.";
      carregarPainelAdmin();
    } else {
      carregar();
    }
  }

  document.addEventListener("hc:user-ready", (e) => configurarPainel(e.detail));
  if (window.hcUser) configurarPainel(window.hcUser);

  function esc(value) {
    const d = document.createElement("div");
    d.textContent = value ?? "";
    return d.innerHTML;
  }
});
